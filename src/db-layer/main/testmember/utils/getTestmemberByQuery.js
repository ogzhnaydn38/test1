const { HttpServerError, BadRequestError } = require("common");

const { Testmember } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getTestmemberByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    const testmember = await Testmember.findOne({ where: query });
    if (!testmember) return null;
    return testmember.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingTestmemberByQuery",
      err,
    );
  }
};

module.exports = getTestmemberByQuery;
