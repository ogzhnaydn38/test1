const testFunctions = require("./test");
const testmemberFunctions = require("./testmember");

module.exports = {
  // main Database
  // Test Db Object
  dbGetTest: testFunctions.dbGetTest,
  dbGetUsertest: testFunctions.dbGetUsertest,
  createTest: testFunctions.createTest,
  getIdListOfTestByField: testFunctions.getIdListOfTestByField,
  getTestById: testFunctions.getTestById,
  getTestAggById: testFunctions.getTestAggById,
  getTestListByQuery: testFunctions.getTestListByQuery,
  getTestStatsByQuery: testFunctions.getTestStatsByQuery,
  getTestByQuery: testFunctions.getTestByQuery,
  updateTestById: testFunctions.updateTestById,
  updateTestByIdList: testFunctions.updateTestByIdList,
  deleteTestById: testFunctions.deleteTestById,
  // Testmember Db Object
  createTestmember: testmemberFunctions.createTestmember,
  getIdListOfTestmemberByField:
    testmemberFunctions.getIdListOfTestmemberByField,
  getTestmemberById: testmemberFunctions.getTestmemberById,
  getTestmemberAggById: testmemberFunctions.getTestmemberAggById,
  getTestmemberListByQuery: testmemberFunctions.getTestmemberListByQuery,
  getTestmemberStatsByQuery: testmemberFunctions.getTestmemberStatsByQuery,
  getTestmemberByQuery: testmemberFunctions.getTestmemberByQuery,
  updateTestmemberById: testmemberFunctions.updateTestmemberById,
  updateTestmemberByIdList: testmemberFunctions.updateTestmemberByIdList,
  deleteTestmemberById: testmemberFunctions.deleteTestmemberById,
};
