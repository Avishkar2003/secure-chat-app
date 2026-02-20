const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT, // Encrypted content (blob)
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('text', 'image', 'video', 'file', 'audio', 'pdf'),
        defaultValue: 'text'
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = Message;
