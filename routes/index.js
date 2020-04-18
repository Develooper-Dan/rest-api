// Route handler module
const express = require('express');
const router = express.Router();
const {User, Course} = require('../models').models;
const bcryptjs = require('bcryptjs');
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

router.get("/users", asyncHandler (async(req, res) =>{
  const users = await User.findAll();
  res.json(users)
}));

router.post("/users", asyncHandler (async(req, res, next) =>{
  try {
    await User.create(req.body);
    res.status(201).location('/').end();
  } catch(error){
      if (error.name === 'SequelizeValidationError'){
        error.status = 400;
        next(error)
        // console.log(error);
        // const errors= error.errors
        // res.sendStatus(400).end();
      }
    }
}));

router.get("/courses", asyncHandler (async(req, res) =>{
  const courses = await Course.findAll({
    include: {
      model: User
    }
  });
  res.json(courses)
}));

router.get("/courses/:id", asyncHandler (async(req, res) =>{
  const courses = await Course.findAll({
    where: {
      id: req.params.id
    },
    include: {
      model: User
    }
  });
  res.json(courses)
}));

router.post("/courses", asyncHandler (async(req, res, next) =>{
  try {
    const course = await Course.create(req.body);
    console.log(course);
    res.status(201).location(`/courses/${course.id}`).end();
  } catch(error){
      if (error.name === 'SequelizeValidationError'){
        error.status = 400;
        next(error)
        // console.log(error);
        // const errors= error.errors
        // res.sendStatus(400).end();
      }
    }
}));

module.exports = router;
