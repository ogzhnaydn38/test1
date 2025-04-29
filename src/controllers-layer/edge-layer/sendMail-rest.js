const { NotAuthenticatedError } = require("common");
const { sendMail } = require("edgeFunctions");

const sendMailRestController = async (req, res, next) => {
  try {
    const statusCode = 201;
    const result = await sendMail(req);
    result.statusCode = result.status ?? statusCode;
    res.status(result.statusCode).send(result);
  } catch (err) {
    console.error("Error running routeService for sendMail: ", err);
    return next(err);
  }
};

module.exports = sendMailRestController;
