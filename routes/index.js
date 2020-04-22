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

async function authentication (req, res, next){
    if(auth(req)){
      const userEmail = auth(req).name;
      const user = await User.findOne(
        { where: {
            emailAddress: userEmail
          }
        });

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

router.get("/users", asyncHandler(authentication), (req, res) =>{
  const authUser = {
    id: req.user.id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    emailAddress: req.user.emailAddress
  }
  res.json(authUser)
});

router.post("/users", asyncHandler (async(req, res, next) =>{

    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const existingUser = await User.findOne(
      { where: {
          emailAddress: req.body.emailAddress
        }
      });

    if(!emailRegex.test(req.body.emailAddress)){
      res.status(400).json({message: "This is not a valid emailadress. Please check if you spelled it correctly."})
    } else if (existingUser) {
      res.status(400).json({message: "It seems there's already a user registered with this emailadress"})
    } else {
        const hash = bcrypt.hashSync(req.body.password);
        const newUser = {
          ...req.body,
          password: hash
        }
        await User.create(newUser);
        res.status(201).location('/').end();
    };
}));

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

router.post("/courses", asyncHandler(authentication), asyncHandler (async(req, res, next) =>{
    req.body.userId = req.user.id;
    const course = await Course.create(req.body);
    res.status(201).location(`/courses/${course.id}`).end();
}));

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

router.put("/courses/:id", asyncHandler(authentication), asyncHandler (async(req, res, next) =>{
    const course = await Course.findByPk(req.params.id);
    if(!course){
      throw new Error("No entry found")
    };
    if(course.userId === req.user.id){
      await course.update(req.body);
      res.status(204).end();
    } else {
      res.status(403).json({message: "You're not the registered owner of this course"})
    }
}));

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
