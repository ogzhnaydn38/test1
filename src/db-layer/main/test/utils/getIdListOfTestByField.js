const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Test } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getIdListOfTestByField = async (fieldName, fieldValue, isArray) => {
  try {
    let isValidField = false;

    const testProperties = ["id", "name"];

    isValidField = testProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof Test[fieldName];

    if (typeof fieldValue !== expectedType) {
      throw new BadRequestError(
        `Invalid field value type for ${fieldName}. Expected ${expectedType}.`,
      );
    }

    const options = {
      where: isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] }, isActive: true }
        : { [fieldName]: fieldValue, isActive: true },
      attributes: ["id"],
    };

    let testIdList = await Test.findAll(options);

    if (!testIdList || testIdList.length === 0) {
      throw new NotFoundError(`Test with the specified criteria not found`);
    }

    testIdList = testIdList.map((item) => item.id);
    return testIdList;
  } catch (err) {
    hexaLogger.insertError(
      "DatabaseError",
      { function: "getIdListOfTestByField", fieldValue: fieldValue },
      "getIdListOfTestByField.js->getIdListOfTestByField",
      err,
      null,
    );
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingTestIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfTestByField;
