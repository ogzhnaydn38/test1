const utils = require("./utils");

module.exports = {
  createTestmember: utils.createTestmember,
  getIdListOfTestmemberByField: utils.getIdListOfTestmemberByField,
  getTestmemberById: utils.getTestmemberById,
  getTestmemberAggById: utils.getTestmemberAggById,
  getTestmemberListByQuery: utils.getTestmemberListByQuery,
  getTestmemberStatsByQuery: utils.getTestmemberStatsByQuery,
  getTestmemberByQuery: utils.getTestmemberByQuery,
  updateTestmemberById: utils.updateTestmemberById,
  updateTestmemberByIdList: utils.updateTestmemberByIdList,
  deleteTestmemberById: utils.deleteTestmemberById,
};
