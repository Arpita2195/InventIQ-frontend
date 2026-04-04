const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize empty users file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
}

const users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

const saveUsers = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
};

const findUser = (email) => {
  return users.find(user => user.email === email);
};

const createUser = (userData) => {
  const user = {
    _id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers();
  return user;
};

module.exports = {
  findUser,
  createUser,
  users
};
