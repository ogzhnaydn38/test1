const utils = require("./utils");

module.exports = {
  dbGetTest: require("./dbGetTest"),
  dbGetUsertest: require("./dbGetUsertest"),
  createTest: utils.createTest,
  getIdListOfTestByField: utils.getIdListOfTestByField,
  getTestById: utils.getTestById,
  getTestAggById: utils.getTestAggById,
  getTestListByQuery: utils.getTestListByQuery,
  getTestStatsByQuery: utils.getTestStatsByQuery,
  getTestByQuery: utils.getTestByQuery,
  updateTestById: utils.updateTestById,
  updateTestByIdList: utils.updateTestByIdList,
  deleteTestById: utils.deleteTestById,
};
