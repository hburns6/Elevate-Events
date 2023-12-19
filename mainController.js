const Event = require('../models/event');

exports.home = (req, res) => {
  res.render('index');
};

exports.about = (req, res) => {
  res.render('about');
}

exports.contact = (req, res) => {
  res.render('contact');
}










