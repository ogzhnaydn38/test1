const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const testMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  name: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const testmemberMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  userId: { type: "keyword", index: true },
  objectId: { type: "keyword", index: true },
  roleName: { type: "keyword", index: true },
  suspended: { type: "boolean", null_value: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("test", testMapping);
    await new ElasticIndexer("test").updateMapping(testMapping);
    ElasticIndexer.addMapping("testmember", testmemberMapping);
    await new ElasticIndexer("testmember").updateMapping(testmemberMapping);
  } catch (err) {
    hexaLogger.insertError(
      "UpdateElasticIndexMappingsError",
      { function: "updateElasticIndexMappings" },
      "elastic-index.js->updateElasticIndexMappings",
      err,
    );
  }
};

module.exports = updateElasticIndexMappings;
