const { HexaLogTypes, hexaLogger } = require("serviceCommon");

const { GetUsertestManager } = require("managers");

const RestController = require("../../RestController");

class GetUsertestRestController extends RestController {
  constructor(req, res, next) {
    super("getUsertest", "get-usertest", req, res, next);
    this.dataName = "test";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetUsertestManager(this._req, "rest");
  }
}

const getUsertest = async (req, res, next) => {
  const getUsertestRestController = new GetUsertestRestController(
    req,
    res,
    next,
  );
  await getUsertestRestController.processRequest();
};

module.exports = getUsertest;
