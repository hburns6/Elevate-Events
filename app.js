//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoute');
const multer = require('multer');
const mongoose = require('mongoose');
const {fileUpload} = require('./middleware/fileUpload');
const Event = require('./models/event');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const User = require('./models/user');
const Rsvp = require('./models/rsvp');
const {isLoggedIn, isHost, isNotHost} = require('./middlewares/auth');
const {validateId, validateEvent, validateRsvp, validateResult} = require('./middlewares/validator');


//create app
const app = express();

//configure app
let port = 3001;
let host = 'localhost';
let url = 'mongodb+srv://demo:demo1234@cluster0.cwlbbas.mongodb.net/nbda-project3';
app.set('view engine', 'ejs');

//connect mongodb
mongoose.connect(url)
.then(()=> {
    //start the server
    app.listen(port, host, ()=>{
    console.log('Server is running on port', port);
});
})
.catch(err=>console.log(err.message))

//mount middlware
app.use(
  session({
      secret: "ajfeirf90aeu9eroejfoefj",
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({mongoUrl: 'mongodb+srv://demo:demo1234@cluster0.cwlbbas.mongodb.net/nbda-project3'}),
      cookie: {maxAge: 60*60*1000}
      })
);
app.use(flash());

app.use((req, res, next) => {
  //console.log(req.session);
  res.locals.user = req.session.user||null;
  res.locals.errorMessages = req.flash('error');
  res.locals.successMessages = req.flash('success');
  next();
});




app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));




//set up routes
app.get('/', (req, res)=>{
    res.render('index');
});


  
  app.post('/events', isLoggedIn, fileUpload, validateEvent, validateResult, async (req, res) => {
    // Extract fields from the multipart/form-data request
    const { title, startDate, endDate, location, category, details } = req.body;
    const { filename } = req.file;
  
    try {
      // Fetch the User object associated with the currently logged-in user
      const user = await User.findById(req.session.user); // Assuming 'req.session.user' contains the ObjectId of the logged-in user
  
      // Create a new event object with the extracted and populated fields
      const newEvent = new Event({
        hostName: user, // Set the 'hostName' field to the User object
        title,
        startDate,
        endDate,
        location,
        category,
        details,
        image: filename
      });
  
      // Save the new event to the database
      await newEvent.save();
      
  
      // Redirect to the events page
      req.flash('success', 'You have successfully created an event');
      return res.redirect('/events');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error saving event to database');
    }
  });
  


app.put('/events/:id', validateId, isLoggedIn, isHost, validateEvent, fileUpload, validateResult, async (req, res, next) => {
    const id = req.params.id;
    // Extract fields from the multipart/form-data request
    const { hostName, title, startDate, endDate, location, category, details } = req.body;
    const { filename } = req.file;
  
    // Populate any missing fields with default values
    const populatedFields = Object.assign({}, {
      hostName: '',
      title: '',
      startDate: '',
      endDate: '',
      location: '',
      category: '',
      details: '',
      image: ''
    }, {
      hostName,
      title,
      startDate,
      endDate,
      location,
      category,
      details,
      image: filename
    });
  
    // Remove the _id field from the updatedEvent object
    const updatedEvent = new Event(populatedFields);
    delete updatedEvent._doc._id;
  
    Event.findByIdAndUpdate(id, updatedEvent, { new: true })
      .then(event => {
        if (!event) {
          const error = new Error(`Event with ID ${id} not found.`);
          error.status = 404;
          throw error;
        }
        req.flash('success', 'You have successfully edited an event');
        return res.redirect(`/events/${event.id}`);
      })
      .catch(error => next(error));
  });

  app.post('/events/:id/rsvp', validateId, isLoggedIn, isNotHost, validateRsvp, validateResult, async (req, res) => {
    const eventId = req.params.id;
    const userId = req.session.user;
    const status = req.body.status;
    
    // Find the RSVP object for the current user and event
    let rsvp = await Rsvp.findOne({ user: userId, event: eventId });
    
   
      if (rsvp) {
        // If an RSVP object already exists, update its status
        rsvp.status = status;
        await rsvp.save();
      } else {
        // Otherwise, create a new RSVP object
        rsvp = await Rsvp.create({
          user: userId,
          event: eventId,
          status: status,
        });
      }
    
      req.flash('success', 'You have successfully RSVP to the event');
      return res.redirect(`/users/profile`);
  });
  
  
  
  
  
  

app.use('/events', eventRoutes);

app.use('/', mainRoutes);

app.use('/users', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);

    

});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.render('error', {error: err});

});


