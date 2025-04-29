const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const updateElasticIndexMappings = async () => {
  try {
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
