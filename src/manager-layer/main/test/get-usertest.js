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
    jsonObj.userChild = this.userChild;
    jsonObj.userCourses = this.userCourses;
    jsonObj.account = this.account;
    jsonObj.testId = this.testId;
  }

  readRestParameters(request) {
    this.userChild = request.body?.userChild;
    this.userCourses = request.body?.userCourses;
    this.account = request.body?.account;
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

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async executeAggregatedCruds() {
    this.userChild = await this.executeAggregatedCrudUserChild();
    this.userCourses = await this.executeAggregatedCrudUserCourses();
    this.updateAccount = await this.executeAggregatedCrudUpdateAccount();
    this.deleteOldAccount = await this.executeAggregatedCrudDeleteOldAccount();
  }

  async executeAggregatedCrudUserChild() {
    // Aggregated Create Operation on Testmember
    const { createTestmember } = require("dbLayer");
    const params = {
      childName: this.userChild.name,
    };
    return await createTestmember(params);
  }

  async executeAggregatedCrudUserCourses() {
    // Aggregated Create Operation on Testmember
    const { createTestmember } = require("dbLayer");
    const sourceData =
      this.userCourses && Array.isArray(this.userCourses)
        ? this.userCourses
        : [];
    const userCourses = [];
    for (const crudItem of sourceData) {
      const params = {
        courseName: crudItem.courseName,
      };
      userCourses.push(await createTestmember(params));
    }
    return userCourses;
  }

  async executeAggregatedCrudUpdateAccount() {
    // Aggregated Update Operation on Testmember
    const { updateTestmemberByQuery } = require("dbLayer");
    const params = {
      balance: this.account.balance,
    };
    const userQuery = { accountId: this.account.id };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);
    return await updateTestmemberByQuery(params, query);
  }

  async executeAggregatedCrudDeleteOldAccount() {
    // Aggregated Delete Operation on Testmember
    const { deleteTestmemberByQuery } = require("dbLayer");
    const userQuery = { id: this.account.oldAccountId };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);
    return await deleteTestmemberByQuery(query);
  }

  async addToOutput() {
    this.output.userChild = this.userChild;
    this.output.userCourses = this.userCourses;
    this.output.updateAccount = this.updateAccount;
    this.output.deleteOldAccount = this.deleteOldAccount;
  }
}

module.exports = GetUsertestManager;
