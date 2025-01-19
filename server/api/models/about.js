const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const About = sequelize.define("About", {
  about_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  subdescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  our_values1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  our_values2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  our_values3: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  our_values4: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  about_image1: { type: DataTypes.JSON, allowNull: false },
  about_image2: { type: DataTypes.JSON, allowNull: false },
});
module.exports = About;
