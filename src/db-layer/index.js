const mainFunctions = require("./main");

module.exports = {
  // main Database
  // Test Db Object
  dbGetTest: mainFunctions.dbGetTest,
  dbGetUsertest: mainFunctions.dbGetUsertest,
  createTest: mainFunctions.createTest,
  getIdListOfTestByField: mainFunctions.getIdListOfTestByField,
  getTestById: mainFunctions.getTestById,
  getTestAggById: mainFunctions.getTestAggById,
  getTestListByQuery: mainFunctions.getTestListByQuery,
  getTestStatsByQuery: mainFunctions.getTestStatsByQuery,
  getTestByQuery: mainFunctions.getTestByQuery,
  updateTestById: mainFunctions.updateTestById,
  updateTestByIdList: mainFunctions.updateTestByIdList,
  deleteTestById: mainFunctions.deleteTestById,
  // Testmember Db Object
  createTestmember: mainFunctions.createTestmember,
  getIdListOfTestmemberByField: mainFunctions.getIdListOfTestmemberByField,
  getTestmemberById: mainFunctions.getTestmemberById,
  getTestmemberAggById: mainFunctions.getTestmemberAggById,
  getTestmemberListByQuery: mainFunctions.getTestmemberListByQuery,
  getTestmemberStatsByQuery: mainFunctions.getTestmemberStatsByQuery,
  getTestmemberByQuery: mainFunctions.getTestmemberByQuery,
  updateTestmemberById: mainFunctions.updateTestmemberById,
  updateTestmemberByIdList: mainFunctions.updateTestmemberByIdList,
  deleteTestmemberById: mainFunctions.deleteTestmemberById,
};
