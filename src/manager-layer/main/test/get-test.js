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
const { dbGetTest } = require("dbLayer");

class GetTestManager extends TestManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getTest",
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

  async setLayer1Variables() {
    // stored layer1 validations

    this.dayOfDate = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][new Date().getDay()];
    this.dayOfWeek = LIB.getDayOfWeek();
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.test?._owner === this.session.userId;
  }

  async checkMembershipForTestMembership() {
    const userId = this.session.userId;
    const objectId = this.test.objectId;

    this.testMembership = await this.getMembershipOfTest(userId, objectId);

    if (this.testMembership == null) {
      throw new ForbiddenError("errMsg_testMembershipForUserNotFound");
    }
    if (!this.testMembership.roleName == "admin") {
      throw new ForbiddenError("errMsg_userShouldBeAdminToViewTheProject");
    }
  }

  async checkLayer3AuthValidations() {
    //check 401 validations

    await this.checkMembershipForTestMembership();
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetTest function to get the test and return the result to the controller
    const test = await dbGetTest(this);

    return test;
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

module.exports = GetTestManager;
