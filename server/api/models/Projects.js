const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Projects = sequelize.define("Projects", {
  project_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  project_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  keyFeatures: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  executionTime: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  turnOver: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  project_desc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pictures: { type: DataTypes.JSON, allowNull: false },
});
module.exports = Projects;
