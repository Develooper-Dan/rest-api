// Route handler module
const express = require('express');
const router = express.Router();
const {User, Course} = require('../models').models;
const bcrypt = require('bcryptjs');
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
    const hash = bcrypt.hashSync(req.body.password);
    const newUser = {
      ...req.body,
      password: hash
    }
    await User.create(newUser);
    res.status(201).location('/').end();
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
  const course = await Course.findOne({
    where: {
      id: req.params.id
    },
    include: {
      model: User
    }
  });
  res.json(course)
}));

router.post("/courses", asyncHandler (async(req, res, next) =>{
    const course = await Course.create(req.body);
    res.status(201).location(`/courses/${course.id}`).end();
}));

router.put("/courses/:id", asyncHandler (async(req, res, next) =>{
    const course = await Course.findByPk(req.params.id);
    await course.update(req.body);
    res.status(204).end();
}));

router.delete("/courses/:id", asyncHandler (async(req, res, next) =>{
    const course = await Course.findByPk(req.params.id);
    await course.destroy();
    res.status(204).end();
}));

module.exports = router;
