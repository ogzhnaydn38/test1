const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { Test, Testmember } = require("models");
const { Op } = require("sequelize");

const getTestmemberAggById = async (testmemberId) => {
  try {
    const forWhereClause = false;
    const includes = [];
    const testmember = Array.isArray(testmemberId)
      ? await Testmember.findAll({
          where: {
            id: { [Op.in]: testmemberId },
          },
          include: includes,
        })
      : await Testmember.findByPk(testmemberId, { include: includes });

    if (!testmember) {
      return null;
    }

    const testmemberData =
      Array.isArray(testmemberId) && testmemberId.length > 0
        ? testmember.map((item) => item.getData())
        : testmember.getData();
    await Testmember.getCqrsJoins(testmemberData);
    return testmemberData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingTestmemberAggById",
      err,
    );
  }
};

module.exports = getTestmemberAggById;
