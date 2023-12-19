const express = require('express');
const router = express.Router();
const fileUpload = require('../middleware/fileUpload');
const eventController = require('../controllers/eventController');
const {isLoggedIn, isHost} = require('../middlewares/auth');
const {validateId, validateEvent, validateResult} = require('../middlewares/validator');

// GET all events
router.get('/', eventController.index);

// GET a form for creating a new event
router.get('/new', isLoggedIn, eventController.new);

// POST a new event
router.post('/', isLoggedIn, eventController.create);

// PUT/UPDATE an existing event by ID
router.put('/:id', validateId, isLoggedIn, isHost, eventController.update);

// DELETE an existing event by ID
router.delete('/:id', validateId, isLoggedIn, isHost, eventController.delete);

// GET a specific event by ID
router.get('/:id', validateId, eventController.show);

// GET a form for editing an existing event
router.get('/:id/edit', validateId, isLoggedIn, isHost, eventController.edit);



module.exports = router;