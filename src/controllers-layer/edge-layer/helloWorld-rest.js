const { NotAuthenticatedError } = require("common");
const { helloWorld } = require("edgeFunctions");

const helloWorldRestController = async (req, res, next) => {
  try {
    const statusCode = 200;
    const result = await helloWorld(req);
    result.statusCode = result.status ?? statusCode;
    res.status(result.statusCode).send(result);
  } catch (err) {
    console.error("Error running routeService for helloWorld: ", err);
    return next(err);
  }
};

module.exports = helloWorldRestController;
