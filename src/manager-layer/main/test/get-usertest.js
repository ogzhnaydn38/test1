const TestManager = require("./TestManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbGetUsertest } = require("dbLayer");

class GetUsertestManager extends TestManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getUsertest",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "test";
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.testId = this.testId;
  }

  readRestParameters(request) {
    this.testId = request.params?.testId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  async setVariables() {}

  checkParameters() {
    if (this.testId == null) {
      throw new BadRequestError("errMsg_testIdisRequired");
    }

    // ID
    if (
      this.testId &&
      !isValidObjectId(this.testId) &&
      !isValidUUID(this.testId)
    ) {
      throw new BadRequestError("errMsg_testIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.test?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetUsertest function to get the usertest and return the result to the controller
    const usertest = await dbGetUsertest(this);

    return usertest;
  }

  async getRouteQuery() {
    return { $and: [{ id: this.testId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetUsertestManager;
