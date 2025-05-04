const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { Test, Testmember } = require("models");
const { Op } = require("sequelize");

const getTestAggById = async (testId) => {
  try {
    const forWhereClause = false;
    const includes = [];
    const test = Array.isArray(testId)
      ? await Test.findAll({
          where: {
            id: { [Op.in]: testId },
          },
          include: includes,
        })
      : await Test.findByPk(testId, { include: includes });

    if (!test) {
      return null;
    }

    const testData =
      Array.isArray(testId) && testId.length > 0
        ? test.map((item) => item.getData())
        : test.getData();
    await Test.getCqrsJoins(testData);
    return testData;
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenRequestingTestAggById", err);
  }
};

module.exports = getTestAggById;
