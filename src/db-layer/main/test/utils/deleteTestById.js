const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { Test } = require("models");
const { ElasticIndexer } = require("serviceCommon");

const deleteTestById = async (id) => {
  try {
    if (typeof id === "object") {
      id = id.id;
    }
    if (!id)
      throw new BadRequestError("ID is required in utility update function");
    const existingDoc = await Test.findOne({ where: { id, isActive: true } });
    if (!existingDoc) {
      throw new NotFoundError(`Record with ID ${id} not found.`);
    }
    dataClause = { isActive: false };
    await existingDoc.update(dataClause);

    const elasticIndexer = new ElasticIndexer("test");
    await elasticIndexer.deleteData(existingDoc.id);

    return existingDoc.getData();
  } catch (err) {
    throw new HttpServerError(
      "An unexpected error occurred during the update operation.",
      err,
    );
  }
};

module.exports = deleteTestById;
