'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define associations here
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Automatically creates a unique index
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      indexes: [
        {
          unique: true, // Ensure email uniqueness
          fields: ['email'], // Apply the index to the email column
        },
        {
          fields: ['createdAt'], // Add an index on the createdAt column for better query performance on time-based searches
        },
      ],
    }
  );
  return User;
};
