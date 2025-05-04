const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { Testmember } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getIdListOfTestmemberByField = async (fieldName, fieldValue, isArray) => {
  try {
    let isValidField = false;

    const testmemberProperties = [
      "id",
      "userId",
      "objectId",
      "roleName",
      "suspended",
    ];

    isValidField = testmemberProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof Testmember[fieldName];

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

    let testmemberIdList = await Testmember.findAll(options);

    if (!testmemberIdList || testmemberIdList.length === 0) {
      throw new NotFoundError(
        `Testmember with the specified criteria not found`,
      );
    }

    testmemberIdList = testmemberIdList.map((item) => item.id);
    return testmemberIdList;
  } catch (err) {
    hexaLogger.insertError(
      "DatabaseError",
      { function: "getIdListOfTestmemberByField", fieldValue: fieldValue },
      "getIdListOfTestmemberByField.js->getIdListOfTestmemberByField",
      err,
      null,
    );
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingTestmemberIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfTestmemberByField;
