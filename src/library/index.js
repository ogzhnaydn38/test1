module.exports = {
  sortVersions: require("./functions/sortVersions.js"),
  capitalizeFirstLetter: require("./functions/capitalizeFirstLetter.js"),
  getDayOfWeek: require("./functions/getDayOfWeek.js"),
  requestArrived: require("./hooks/requestArrived.js"),
  helloWorld: require("./edge/helloWorld.js"),
  sendMail: require("./edge/sendMail.js"),
  ...require("./templates"),
};
