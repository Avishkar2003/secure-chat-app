const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    is_group: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    name: {
        type: DataTypes.STRING, // For groups
        allowNull: true
    },
    group_admin_id: {
        type: DataTypes.INTEGER, // User ID of admin
        allowNull: true
    },
    invite_link: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = Chat;
