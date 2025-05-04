const { HttpServerError } = require("common");

const { Testmember } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const updateTestmemberByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;
    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };
    [rowsCount, rows] = await Testmember.update(dataClause, options);
    const testmemberIdList = rows.map((item) => item.id);
    return testmemberIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingTestmemberByIdList",
      err,
    );
  }
};

module.exports = updateTestmemberByIdList;
