const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class TestmemberQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("testmember", [], Op.and, Op.eq, input, wClause);
  }
}
class TestmemberQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("testmember", []);
  }
}

module.exports = {
  TestmemberQueryCache,
  TestmemberQueryCacheInvalidator,
};
