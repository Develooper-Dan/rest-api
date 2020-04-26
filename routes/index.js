// Route handler module
const express = require('express');
const router = express.Router();
const {User, Course} = require('../models').models;
const bcrypt = require('bcryptjs');
const auth = require('basic-auth');
/* Handler function to wrap each route which does async requests to the db.
Catches any errors and forwards them to the error handler. With high regards to teamtreehouse.com where the
idea for this function and in parts the code were part of a lecture.*/
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      next(error)
    }
  }
}
// Middleware for authenticating a user for certain routes, using basic auth
async function authentication (req, res, next){
    if(auth(req)){
      const userEmail = auth(req).name;
      const user = await User.findOne(
        { where: {
            emailAddress: userEmail
          }
        });
//Comparing the hashed password on the request to the one in the database
      if (user && bcrypt.compareSync(auth(req).pass, user.password)){
          console.log("Authentication successful");
          req.user = user;
          next();
      } else {
          res.status(401).json({
            message: "Authentication failed. Please check if your email and password are correct",
          });
        }
    } else {
        res.status(401).json({
          message: "Authentication needed. Please enter your email and password.",
        });
      }
}
// Returns the authenticated user, omitting sensitive or unneceassary information in the response
router.get("/users", asyncHandler(authentication), (req, res) =>{
  const authUser = {
    id: req.user.id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    emailAddress: req.user.emailAddress
  }
  res.json(authUser)
});
//Creates a new user entry in the db
router.post("/users", asyncHandler (async(req, res, next) =>{
    //validating the user input before saving just in case the password is omitted
    const newUser = User.build(req.body);
    await newUser.validate();
    const hash = bcrypt.hashSync(newUser.password);
    newUser.password =  hash
    await newUser.save();
    res.status(201).location('/').end();
}));
// Returns a list of courses, omitting sensitive or unneceassary information in the response
router.get("/courses", asyncHandler (async(req, res) =>{
  const courses = await Course.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    include: {
      model: User,
      attributes: { exclude: [,'password','createdAt', 'updatedAt'] }
    }
  });
  res.json(courses)
}));
//Lets the authenticated user create a new course
router.post("/courses", asyncHandler(authentication), asyncHandler (async(req, res, next) =>{
    req.body.userId = req.user.id;
    const course = await Course.create(req.body);
    res.status(201).location(`/courses/${course.id}`).end();
}));
// Returns a course with matching id, omitting sensitive or unneceassary information in the response. Throws an error if no course is found.
router.get("/courses/:id", asyncHandler (async(req, res) =>{
  const course = await Course.findOne({
    where: {
      id: req.params.id
    },
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    include: {
      model: User,
      attributes: { exclude: [,'password','createdAt', 'updatedAt'] }
    }
  });
  if(!course){
    throw new Error("No entry found")
  }
  res.json(course)
}));
/*Lets the authenticated user update the data of a course he owns. Returns a "bad request" if the json send is empty, contains invalid keynames or
tries to set title and/or description to an empty string
*/
router.put("/courses/:id", asyncHandler(authentication), asyncHandler (async(req, res, next) =>{
    const course = await Course.findByPk(req.params.id);
    if(!course){
      throw new Error("No entry found")
    };
    if(course.userId === req.user.id){
      //checks if the request body is empty
      if(!Object.keys(req.body).length){
        res.status(400).json({message: "The request contained no data to be updated"})
      };
      //this part checks if the keys send by the user are actually matching to the ones on the course instance the user tries to update
      let invalidKeys = [];
      Object.keys(req.body).forEach(key => {
          if(!Object.keys(course.dataValues).includes(key)){
            invalidKeys.push(key);
          };
      });
      if (invalidKeys.length){
        res.status(400).json({message: `The request contained following invalid attributes: ${invalidKeys.join(", ")}`})
      }
      //finally updating if the data is ok
      await course.update(req.body);
      res.status(204).end();
    } else {
      res.status(403).json({message: "You're not the registered owner of this course"})
    }
}));
//If the user is authenticated, he may delete the matching cours entry
router.delete("/courses/:id", asyncHandler(authentication), asyncHandler (async(req, res, next) =>{
    const course = await Course.findByPk(req.params.id);
    if(!course){
      throw new Error("No entry found")
    }
    if(course.userId === req.user.id){
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({message: "You're not the registered owner of this course"})
    }
}));

module.exports = router;
