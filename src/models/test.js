const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//
const Test = sequelize.define(
  "test",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      //
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      // isActive property will be set to false when deleted
      // so that the document will be archived
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
  },
  {
    indexes: [],
  },
);

module.exports = Test;
