const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Achievement = sequelize.define("Achievement", {
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  label1: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  counter1: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label2: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  counter2: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label3: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  counter3: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});
module.exports = Achievement;
