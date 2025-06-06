const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("Test1ServiceManager", () => {
  let Test1ServiceManager;
  let ApiManagerMock;

  beforeEach(() => {
    ApiManagerMock = class {
      constructor(req, opts) {
        this.request = req;
        this.options = opts;
        this.auth = req.auth;
      }

      parametersToJson(jsonObj) {
        jsonObj._base = true;
      }
    };

    Test1ServiceManager = proxyquire(
      "../../../src/manager-layer/service-manager/Test1ServiceManager",
      {
        "./ApiManager": ApiManagerMock,
      },
    );
  });

  describe("userHasRole()", () => {
    it("should return true if userHasRole returns true", () => {
      const req = {
        auth: {
          userHasRole: sinon.stub().withArgs("admin").returns(true),
        },
      };
      const manager = new Test1ServiceManager(req, {});
      expect(manager.userHasRole("admin")).to.be.true;
    });

    it("should return false if no auth", () => {
      const manager = new Test1ServiceManager({}, {});
      expect(manager.userHasRole("admin")).to.be.false;
    });
  });
});
