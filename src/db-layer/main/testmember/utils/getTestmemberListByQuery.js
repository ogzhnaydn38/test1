const { HttpServerError, BadRequestError } = require("common");

const { Testmember } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getTestmemberListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const testmember = await Testmember.findAll({ where: query });
    if (!testmember) return [];
    return testmember.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingTestmemberListByQuery",
      err,
    );
  }
};

module.exports = getTestmemberListByQuery;
