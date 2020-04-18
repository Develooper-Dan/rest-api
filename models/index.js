//Setting up the database and connecting sequelize to it
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  // logging: false
});

const User = require('./user.js')(sequelize);
const Course = require('./course.js')(sequelize);

//As suggested by the Sequelize manual to test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const db = {
  sequelize,
  Sequelize,
  models: {}
};

db.models.User = User;
db.models.Course = Course;

// Model associations
User.hasMany(Course, {foreignKey: 'userId'});
Course.belongsTo(User, {foreignKey: 'userId'});

sequelize.sync();


module.exports = db;
