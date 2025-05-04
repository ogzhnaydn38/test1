const { getTestById } = require("dbLayer");
const { getTestmemberById } = require("dbLayer");
const Test = require("models");
const Testmember = require("models");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");
const { Op } = require("sequelize");

const indexTestData = async () => {
  const testIndexer = new ElasticIndexer("test", { isSilent: true });
  console.log("Starting to update indexes for Test");

  const idListData = await Test.findAll({
    attributes: ["id"],
  });
  const idList = idListData ? idListData.map((item) => item.id) : [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getTestById(chunk);
    if (dataList.length) {
      await testIndexer.indexBulkData(dataList);
      await testIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexTestmemberData = async () => {
  const testmemberIndexer = new ElasticIndexer("testmember", {
    isSilent: true,
  });
  console.log("Starting to update indexes for Testmember");

  const idListData = await Testmember.findAll({
    attributes: ["id"],
  });
  const idList = idListData ? idListData.map((item) => item.id) : [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getTestmemberById(chunk);
    if (dataList.length) {
      await testmemberIndexer.indexBulkData(dataList);
      await testmemberIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const syncElasticIndexData = async () => {
  const startTime = new Date();
  console.log("syncElasticIndexData started", startTime);

  try {
    const dataCount = await indexTestData();
    console.log("Test agregated data is indexed, total tests:", dataCount);
  } catch (err) {
    console.log("Elastic Index Error When Syncing Test data", err.toString());
    hexaLogger.insertError(
      "ElasticIndexInitError",
      { function: "indexTestData" },
      "syncElasticIndexData.js->indexTestData",
      err,
    );
  }

  try {
    const dataCount = await indexTestmemberData();
    console.log(
      "Testmember agregated data is indexed, total testmembers:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing Testmember data",
      err.toString(),
    );
    hexaLogger.insertError(
      "ElasticIndexInitError",
      { function: "indexTestmemberData" },
      "syncElasticIndexData.js->indexTestmemberData",
      err,
    );
  }

  const elapsedTime = new Date() - startTime;
  console.log("initElasticIndexData ended -> elapsedTime:", elapsedTime);
};

module.exports = syncElasticIndexData;
