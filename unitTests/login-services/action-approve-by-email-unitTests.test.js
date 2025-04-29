require("module-alias/register");
const { expect } = require("chai");
const sinon = require("sinon");
const {
  ForbiddenError,
  NotAuthenticatedError,
  NotFoundError,
  ErrorCodes,
} = require("common");
const {
  ActionApproveByEmail,
} = require("../../src/login-services/action-approve-by-email");

describe("ActionApproveByEmail Service", function () {
  let req, actionApproveInstance;

  afterEach(() => sinon.restore());

  beforeEach(() => {
    req = {
      body: {
        userId: "5f50c31a0b6c3f3c7074b9b1",
        sessionId: "5f50c31a0b6c3f3c7074b9b2",
        actionId: "action123",
        actionName: "Approve Transaction",
        actionDescription: "Transaction Approval",
        secretCode: "ABC123",
      },
      session: {},
      auth: { setSessionToEntityCache: sinon.stub().resolves() },
    };

    actionApproveInstance = new ActionApproveByEmail(req);
  });

  describe("startActionApprove", () => {
    it("should throw ForbiddenError if user's email is not verified", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ emailVerified: false });
      try {
        await actionApproveInstance.startActionApprove();
        expect.fail("Expected ForbiddenError");
      } catch (err) {
        expect(err).to.be.instanceOf(ForbiddenError);
        expect(err.message).to.equal(
          "errMsg_ActionApproveRequiresEmailVerification",
        );
      }
    });

    it("should reset codeIndex to 1 if greater than 10", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ emailVerified: true, email: "user@example.com" });
      sinon
        .stub(actionApproveInstance, "getActionApproveEmailEntityCache")
        .resolves({ codeIndex: 11, timeStamp: 0 });
      sinon
        .stub(actionApproveInstance, "setActionApproveEmailEntityCache")
        .resolves();
      sinon
        .stub(actionApproveInstance, "publishVerificationStartEvent")
        .resolves();
      sinon.stub(actionApproveInstance, "createSecretCode").returns("NEWCODE");

      const result = await actionApproveInstance.startActionApprove();
      expect(result.codeIndex).to.equal(1);
    });

    it("should successfully create a new action approval request", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ emailVerified: true, email: "user@example.com" });
      sinon
        .stub(actionApproveInstance, "getActionApproveEmailEntityCache")
        .resolves(null);
      sinon
        .stub(actionApproveInstance, "setActionApproveEmailEntityCache")
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
    it("should throw ForbiddenError if actionId is missing", async () => {
      req.body.actionId = null;
      actionApproveInstance = new ActionApproveByEmail(req);
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ emailVerified: true });
      sinon
        .stub(actionApproveInstance, "getActionApproveEmailEntityCache")
        .resolves(null);

      try {
        await actionApproveInstance.completeActionApprove();
        expect.fail("Expected ForbiddenError");
      } catch (err) {
        expect(err).to.be.instanceOf(ForbiddenError);
        expect(err.message).to.equal(
          "errMsg_ActionApproveEmailCodeIsNotFoundInStore",
        );
      }
    });

    it("should throw ForbiddenError if secretCode is expired", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ emailVerified: true });
      sinon
        .stub(actionApproveInstance, "getActionApproveEmailEntityCache")
        .resolves({
          secretCode: "ABC123",
          timeStamp: Date.now() - 999999999,
        });

      try {
        await actionApproveInstance.completeActionApprove();
        expect.fail("Expected ForbiddenError");
      } catch (err) {
        expect(err).to.be.instanceOf(ForbiddenError);
        expect(err.message).to.equal("errMsg_UserEmailCodeHasExpired");
      }
    });

    it("should throw ForbiddenError if secretCode is incorrect", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ emailVerified: true });
      sinon
        .stub(actionApproveInstance, "getActionApproveEmailEntityCache")
        .resolves({
          secretCode: "ABC123",
          timeStamp: Date.now(),
        });

      req.body.secretCode = "WRONGCODE";

      try {
        await actionApproveInstance.completeActionApprove();
        expect.fail("Expected ForbiddenError");
      } catch (err) {
        expect(err).to.be.instanceOf(ForbiddenError);
        expect(err.message).to.equal("errMsg_UserEmailCodeIsNotAuthorized");
      }
    });

    it("should successfully complete action approval with correct code", async () => {
      sinon
        .stub(actionApproveInstance, "findUserById")
        .resolves({ emailVerified: true });
      sinon
        .stub(actionApproveInstance, "getActionApproveEmailEntityCache")
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
