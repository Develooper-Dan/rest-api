const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model{}

  User.init({
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notEmpty: { msg: "Please enter your first name." },
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notEmpty: { msg: "Please enter your first name." },
      }
    },
    emailAddress : {
      type: Sequelize.STRING,
      unique: { msg: "It seems there's already a user registered with this emailadress" },
      allowNull: false,
      validate: {
        is: {
          args: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          msg: "This is not a valid emailadress. Please check if you spelled it correctly."
        }
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate:{
        notEmpty: { msg: "Please enter a password" },
      }
    }
  }, {sequelize});

  return User;
}
