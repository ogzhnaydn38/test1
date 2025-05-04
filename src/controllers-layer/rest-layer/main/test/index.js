const express = require("express");

// Test Db Object Rest Api Router
const testRouter = express.Router();

// add Test controllers

// get-test controller
testRouter.get("/tests/:testId", require("./get-test"));
// get-usertest controller
testRouter.get("/usertests/:testId", require("./get-usertest"));

module.exports = testRouter;
