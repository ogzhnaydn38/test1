const { HttpServerError } = require("common");

const { Test } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const updateTestByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;
    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };
    [rowsCount, rows] = await Test.update(dataClause, options);
    const testIdList = rows.map((item) => item.id);
    return testIdList;
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenUpdatingTestByIdList", err);
  }
};

module.exports = updateTestByIdList;
