const {body} = require('express-validator');
const {validationResult} = require("express-validator");
const moment = require('moment');

exports.validateId = (req, res, next) => {
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
       return next();
    } else {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }
}

exports.validateSignUp = [body('firstName', 'first name cant be empty').notEmpty().trim().escape(),
body('lastName', 'last name cant be empty').notEmpty().trim().escape(),
body('email').isEmail().trim().escape().normalizeEmail(),
body('password', 'password must be at least 8 char and at most 64 char').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email', 'email must be valid').isEmail().trim().escape().normalizeEmail(),
body('password', 'password must be at least 8 char and at most 64 char').isLength({min: 8, max: 64})];

exports.validateResult = (req,res,next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}

// Custom validator function to check if the end date comes after the start date
const isEndDateAfterStartDate = (value, { req }) => {
    const startDate = moment(req.body.startDate);
    const endDate = moment(value);
    return endDate.isAfter(startDate);
  };

  var currentDate = new Date();
  currentDate = currentDate.toDateString;

exports.validateEvent = [body('title', 'title is not valid').notEmpty().trim().escape(),
body('details', 'Content must be at least 10 char and valid').notEmpty().isLength({min: 10}).trim().escape(),
body('category', 'category is not valid').notEmpty().trim().isIn(['Weddings', 'Corporate Retreat', 'Charity Events', 'Sports Events', 'Trade Shows']).escape(),
body('startDate', 'Start date is not valid').notEmpty().trim().isISO8601().custom((value) => {
    const now = moment();
    const start = moment(value);
    if (!start.isValid()) {
      throw new Error('Start date is not valid');
    }
    if (start.isBefore(now, 'day')) {
      throw new Error('Start date must be after today');
    }
    return true;
  }),
body('endDate', 'end date is not valid').notEmpty().trim().custom(isEndDateAfterStartDate).isISO8601(),
body('location', 'location is not valid').notEmpty().trim().escape()
];

exports.validateRsvp = [body('status', 'status is not valid').isIn(['YES', 'NO', 'MAYBE'])]

