const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        set(value) {
            this.setDataValue('email', value === '' ? null : value);
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        set(value) {
            // Convert empty string to null so unique constraint doesn't fire
            this.setDataValue('phone', value === '' ? null : value);
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: true // If using OTP only, might not need this, but good for hybrid
    },
    profile_picture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    public_key: {
        type: DataTypes.TEXT, // For Signal Protocol Identity Key
        allowNull: true
    },
    last_seen: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_online: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = User;
