"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Projects", "project_desc", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Projects", "project_desc", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
