const ApiManager = require("./ApiManager");

class Test1ServiceManager extends ApiManager {
  constructor(request, options) {
    super(request, options);
  }

  getMembershipOfTest = async (userId, objectId) => {
    // Get the membership of the user for the %= membership.mainObjectName  object from db

    const { getTestmemberByQuery } = require("dbLayer");
    const { convertUserQueryToSequelizeQuery } = require("common");

    const statusCheck = { suspended: false };
    const query = {
      $and: [
        statusCheck,
        { userId: userId, objectId: objectId, isActive: true },
      ],
    };

    const dbQuery = convertUserQueryToSequelizeQuery(query);
    const membership = await getTestmemberByQuery(dbQuery);
    return membership;
  };

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }

  userHasRole(roleName) {
    if (!this.auth) return false;
    return this.auth.userHasRole(roleName);
  }
}

module.exports = Test1ServiceManager;
