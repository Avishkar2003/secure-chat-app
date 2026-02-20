const sequelize = require('../config/database');
const User = require('./User');
const Chat = require('./Chat');
const Message = require('./Message');

// Associations

// 1. User <-> Chat (Many-to-Many for group members)
User.belongsToMany(Chat, { through: 'UserChats', as: 'chats' });
Chat.belongsToMany(User, { through: 'UserChats', as: 'members' });

// 2. Chat <-> Message (One-to-Many)
Chat.hasMany(Message, { foreignKey: 'chat_id' });
Message.belongsTo(Chat, { foreignKey: 'chat_id' });

// 3. User <-> Message (One-to-Many, as Sender)
User.hasMany(Message, { foreignKey: 'sender_id' });
Message.belongsTo(User, { foreignKey: 'sender_id' });

module.exports = {
    sequelize,
    User,
    Chat,
    Message
};
