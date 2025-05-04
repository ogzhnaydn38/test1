const { HttpServerError, BadRequestError } = require("common");

const { Test } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getTestListByQuery = async (query) => {
  try {
    const test = await Test.findAll({ where: query });
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    if (!test) return [];
    return test.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingTestListByQuery",
      err,
    );
  }
};

module.exports = getTestListByQuery;
