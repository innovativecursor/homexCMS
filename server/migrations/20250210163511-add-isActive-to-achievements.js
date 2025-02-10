"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Achievements", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Add default value if needed
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Achievements", "isActive");
  },
};
