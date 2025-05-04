const { HttpServerError } = require("common");

let { Test } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getTestById = async (testId) => {
  try {
    const test = Array.isArray(testId)
      ? await Test.findAll({
          where: {
            id: { [Op.in]: testId },
          },
        })
      : await Test.findByPk(testId);
    if (!test) {
      return null;
    }
    return Array.isArray(testId)
      ? (test.map = (item) => item.getData())
      : test.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError("errMsg_dbErrorWhenRequestingTestById", err);
  }
};

module.exports = getTestById;
