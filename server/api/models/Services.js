const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Services = sequelize.define("Services", {
  service_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  service_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pictures: { type: DataTypes.JSON, allowNull: false },
});
module.exports = Services;
