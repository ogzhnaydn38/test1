const { sequelize } = require("common");
const { Op } = require("sequelize");
const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");

const { Test, Testmember } = require("models");

const { DBGetSequelizeCommand } = require("dbCommand");

class DbGetUsertestCommand extends DBGetSequelizeCommand {
  constructor(input) {
    super(input, Test);
    this.commandName = "dbGetUsertest";
    this.nullResult = false;
    this.objectName = "test";
    this.serviceLabel = "tickatme-test1-service";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  async getCqrsJoins(data) {
    if (Test.getCqrsJoins) await Test.getCqrsJoins(data);
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async checkEntityOwnership(entity) {
    return true;
  }

  async transposeResult() {
    // transpose dbData
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbGetUsertest = (input) => {
  input.id = input.testId;
  const dbGetCommand = new DbGetUsertestCommand(input);
  return dbGetCommand.execute();
};

module.exports = dbGetUsertest;
