const express = require('express');
const router = express.Router();
const controller = require('../controllers/mainController');

// Home page route
router.get('/', controller.home);

// About page route
router.get('/about', controller.about);

// Contact page route
router.get('/contact', controller.contact);

module.exports = router;

