const { HttpServerError, BadRequestError } = require("common");

const { Test } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getTestByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const test = await Test.findOne({ where: query });
    if (!test) return null;
    return test.getData();
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenRequestingTestByQuery", err);
  }
};

module.exports = getTestByQuery;
