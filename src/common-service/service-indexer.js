const { ElasticIndexer, hexaLogger } = require("common");

const ServicePublisher = require("./service-publisher");

const MAPPINGS = {};

class ServiceIndexer extends ElasticIndexer {
  constructor(indexName, session) {
    const serviceIndexName = "tickatme_" + indexName.toLowerCase();
    super(serviceIndexName, { mapping: MAPPINGS[indexName] });
    this.session = session;
  }

  static addMapping(indexName, mapping) {
    MAPPINGS[indexName] = mapping;
  }

  async logResult(logType, subject, params, location, data) {
    return hexaLogger.insertLog(logType, 1, subject, params, location, data);
  }

  async publishEvent(eventName, data) {
    const publisher = new ServicePublisher(eventName, data, this.session);
    return publisher.publish();
  }
}

module.exports = ServiceIndexer;
