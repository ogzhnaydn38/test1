const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//
const Testmember = sequelize.define(
  "testmember",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      //
      type: DataTypes.UUID,
      allowNull: false,
    },
    objectId: {
      //
      type: DataTypes.UUID,
      allowNull: false,
    },
    roleName: {
      //
      type: DataTypes.STRING,
      allowNull: false,
    },
    suspended: {
      //
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

module.exports = Testmember;
