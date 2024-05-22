const mongoose = require('mongoose');

const User = mongoose.model('User', {
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
  type: String,
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = User;