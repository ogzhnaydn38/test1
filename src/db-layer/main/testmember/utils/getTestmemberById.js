const { HttpServerError } = require("common");

let { Testmember } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getTestmemberById = async (testmemberId) => {
  try {
    const testmember = Array.isArray(testmemberId)
      ? await Testmember.findAll({
          where: {
            id: { [Op.in]: testmemberId },
          },
        })
      : await Testmember.findByPk(testmemberId);
    if (!testmember) {
      return null;
    }
    return Array.isArray(testmemberId)
      ? (testmember.map = (item) => item.getData())
      : testmember.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingTestmemberById",
      err,
    );
  }
};

module.exports = getTestmemberById;
