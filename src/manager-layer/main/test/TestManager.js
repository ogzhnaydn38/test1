const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");

const Test1ServiceManager = require("../../service-manager/Test1ServiceManager");

/* Base Class For the Crud Routes Of DbObject Test */
class TestManager extends Test1ServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "test";
    this.modelName = "Test";
    this.routeResourcePath = "";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = TestManager;
