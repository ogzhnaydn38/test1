const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");

const Test1ServiceManager = require("../../service-manager/Test1ServiceManager");

/* Base Class For the Crud Routes Of DbObject Testmember */
class TestmemberManager extends Test1ServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "testmember";
    this.modelName = "Testmember";
    this.routeResourcePath = "";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = TestmemberManager;
