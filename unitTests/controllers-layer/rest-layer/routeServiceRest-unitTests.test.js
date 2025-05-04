const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export GetTestRestController also from file get-test.js
describe("GetTestRestController", () => {
  let GetTestRestController, getTest;
  let GetTestManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for GetTestManager constructor
    GetTestManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ GetTestRestController, getTest } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/test/get-test.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          GetTestManager: GetTestManagerStub,
        },
        "../../RestController": class {
          constructor(name, routeName, _req, _res, _next) {
            this.name = name;
            this.routeName = routeName;
            this._req = _req;
            this._res = _res;
            this._next = _next;
            this.processRequest = processRequestStub;
          }
        },
      },
    ));
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("GetTestRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new GetTestRestController(req, res, next);

      expect(controller.name).to.equal("getTest");
      expect(controller.routeName).to.equal("get-test");
      expect(controller.dataName).to.equal("test");
      expect(controller.crudType).to.equal("get");
      expect(controller.status).to.equal(200);
      expect(controller.httpMethod).to.equal("GET");
    });

    it("should create GetTestManager in createApiManager()", () => {
      const controller = new GetTestRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(GetTestManagerStub.calledOnceWithExactly(req, "rest")).to.be.true;
    });
  });

  describe("getTest function", () => {
    it("should create instance and call processRequest", async () => {
      await getTest(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
