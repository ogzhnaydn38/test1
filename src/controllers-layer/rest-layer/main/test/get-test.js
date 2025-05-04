const { HexaLogTypes, hexaLogger } = require("serviceCommon");

const { GetTestManager } = require("managers");

const RestController = require("../../RestController");

class GetTestRestController extends RestController {
  constructor(req, res, next) {
    super("getTest", "get-test", req, res, next);
    this.dataName = "test";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetTestManager(this._req, "rest");
  }
}

const getTest = async (req, res, next) => {
  const getTestRestController = new GetTestRestController(req, res, next);
  await getTestRestController.processRequest();
};

module.exports = getTest;
