const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Testimonial = sequelize.define("Testimonial", {
  testimonial_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reviewer_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reviewer_location: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  client_rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pictures: { type: DataTypes.JSON, allowNull: true },
});
module.exports = Testimonial;
