const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Staff = sequelize.define("Staff", {
  staff_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },

  staff_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  staff_position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pictures: { type: DataTypes.JSON, allowNull: false },
});
module.exports = Staff;
