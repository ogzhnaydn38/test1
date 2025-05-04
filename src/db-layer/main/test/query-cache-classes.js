const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class TestQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("test", [], Op.and, Op.eq, input, wClause);
  }
}
class TestQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("test", []);
  }
}

module.exports = {
  TestQueryCache,
  TestQueryCacheInvalidator,
};
