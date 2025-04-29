const { expect } = require("chai");
const sinon = require("sinon");
const { ForbiddenError, NotFoundError, ErrorCodes } = require("common");
const { User } = require("models");
const {
  ActionApproveByMobile,
} = require("../../src/login-services/action-approve-by-mobile");

describe("ActionApproveByMobile Service", function () {
  let req, res, next, actionApproveInstance;

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    req = {
      body: {
        userId: "user123",
        sessionId: "session123",
        approveBy: "mobile",
        actionId: "action123",
        actionName: "Approve Transaction",
        actionDescription: "Transaction Approval",
        secretCode: "ABC123",
      },
      session: {},
    };
    res = {
      send: sinon.spy(),
      status: sinon.stub().returns({ json: sinon.spy() }),
    };
    next = sinon.spy();
    actionApproveInstance = new ActionApproveByMobile(req);
  });

  describe("startActionApprove", () => {
    it("should throw ForbiddenError if user's mobile is not verified", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ mobileVerified: false });
      try {
        await actionApproveInstance.startActionApprove();
        expect.fail("Expected ForbiddenError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(ForbiddenError);
        expect(err.message).to.equal(
          "errMsg_ActionApproveRequiresMobileVerification",
        );
      }
    });

    it("should successfully create a new mobile action approval request", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ mobileVerified: true, mobile: "1234567890" });
      sinon
        .stub(actionApproveInstance, "getActionApproveMobileEntityCache")
        .resolves(null);
      sinon
        .stub(actionApproveInstance, "setActionApproveMobileEntityCache")
        .resolves();
      sinon
        .stub(actionApproveInstance, "publishVerificationStartEvent")
        .resolves();
      sinon.stub(actionApproveInstance, "createSecretCode").returns("ABC123");

      const result = await actionApproveInstance.startActionApprove();

      expect(result).to.have.property("secretCode", "ABC123");
      expect(result).to.have.property("isApproved", false);
    });
  });

  describe("completeActionApprove", () => {
    it("should throw ForbiddenError if action approval request is missing", async () => {
      req.body.actionId = null;
      actionApproveInstance = new ActionApproveByMobile(req);
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ mobileVerified: true });
      sinon
        .stub(actionApproveInstance, "getActionApproveMobileEntityCache")
        .resolves(null);

      try {
        await actionApproveInstance.completeActionApprove();
        expect.fail("Expected ForbiddenError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(ForbiddenError);
        expect(err.message).to.equal(
          "errMsg_ActionApproveMobileCodeIsNotFoundInStore",
        );
      }
    });

    it("should throw ForbiddenError if secretCode is expired", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ mobileVerified: true });
      sinon
        .stub(actionApproveInstance, "getActionApproveMobileEntityCache")
        .resolves({
          secretCode: "ABC123",
          timeStamp: Date.now() - 999999999,
        });

      try {
        await actionApproveInstance.completeActionApprove();
        expect.fail("Expected ForbiddenError");
      } catch (err) {
        expect(err).to.be.instanceOf(ForbiddenError);
        expect(err.message).to.equal("errMsg_UserMobileCodeHasExpired");
      }
    });

    it("should throw ForbiddenError if mobile code is incorrect", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ mobileVerified: true });
      sinon
        .stub(actionApproveInstance, "getActionApproveMobileEntityCache")
        .resolves({
          secretCode: "ABC123",
          timeStamp: Date.now(),
        });

      req.body.secretCode = "XYZ789";

      try {
        await actionApproveInstance.completeActionApprove();
        expect.fail("Expected ForbiddenError but got no error");
      } catch (err) {
        expect(err).to.be.instanceOf(ForbiddenError);
        expect(err.message).to.equal("errMsg_UserMobileCodeIsNotAuthorized");
      }
    });

    it("should successfully complete action approval when the correct mobile code is provided", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ mobileVerified: true });
      sinon
        .stub(actionApproveInstance, "getActionApproveMobileEntityCache")
        .resolves({
          secretCode: "ABC123",
          timeStamp: Date.now(),
          isApproved: false,
        });
      sinon
        .stub(actionApproveInstance, "deleteActionApproveFromEntityCache")
        .resolves();
      sinon
        .stub(actionApproveInstance, "publishVerificationCompleteEvent")
        .resolves();

      const result = await actionApproveInstance.completeActionApprove();

      expect(result).to.have.property("isApproved", true);
    });
  });
});
