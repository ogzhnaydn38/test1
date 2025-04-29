const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");
const initDataFolder = path.join(__dirname, "../../", "init-data");
const { Op } = require("sequelize");
const { isValidObjectId, isValidUUID } = require("common");
const { hexaLogger } = require("common");

const readDataFile = async (dataFile) => {
  const filePath = path.join(initDataFolder, dataFile);
  const dataArray = require(filePath);
  return dataArray;
};

const getInitFilesOfObject = (objectName) => {
  if (fs.existsSync(initDataFolder)) {
    const fileList = fs.readdirSync(initDataFolder);
    return fileList.filter((fName) => {
      const ext = path.extname(fName).toLowerCase();
      const objName = path.parse(fName).name.split("-")[0];
      return ext == ".json" && objName == objectName;
    });
  }
  return [];
};

const initDb = async () => {
  console.log("initDb started -> initDataFolder:", initDataFolder);

  const startTime = new Date();
  const counts = {};

  const elapsedTime = new Date() - startTime;
  console.log("initDb ended -> elapsedTime:", elapsedTime);
};

const initElasticIndexAggregations = async () => {
  const startTime = new Date();
  console.log("initElasticIndexAggregations started", startTime);

  const elapsedTime = new Date() - startTime;
  console.log(
    "initElasticIndexAggregations ended -> elapsedTime:",
    elapsedTime,
  );
};

module.exports = { initDb, initElasticIndexAggregations };
