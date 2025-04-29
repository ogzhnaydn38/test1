const { KafkaPublisher } = require("common");
const { hexaLogger } = require("common");

class ServicePublisher extends KafkaPublisher {
  constructor(topic, data, session) {
    const publishedData = JSON.parse(JSON.stringify(data));
    publishedData.session = session;
    //console.log('sessionId in Service Publisher:',publishedData.session?.sessionId);
    super(topic, publishedData);
  }
}

module.exports = ServicePublisher;
