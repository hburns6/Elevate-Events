const model = require('../models/event');
const Rsvp = require('../models/rsvp');
const { fileUpload } = require('../middleware/fileUpload');


exports.index = (req, res, next) => {
  model.find()
  .then(events => res.render('./event/event', {events}))
  .catch(err=>next(err));
};


exports.new = (req, res) => {
  res.render('./event/new');
};


exports.create = (req, res, next) => {
  let event = new model(req.body);
  event.save()
  .then(event => res.redirect('/events'))
  .catch(err => {
    if(err.name === 'ValidationError' ) {
      err.status = 400;
    }
    next(err);
  });
};


exports.show = async (req, res, next) => {
  try {
    const id = req.params.id;
    const event = await model.findById(id).populate('hostName');
    if (event) {
      const rsvpCount = await Rsvp.countDocuments({ event: id, status: 'YES' });
      return res.render('./event/show', { event, rsvpCount });
    } else {
      let err = new Error('Cannot find an event with id ' + id);
      err.status = 404;
      next(err);
    }
  } catch (err) {
    next(err);
  }
};


exports.edit = async (req, res, next) => {
  let id = req.params.id;

  model.findById(id)
  .then(event => {
      if (event) {
          return res.render('./event/edit', {event});
      } else {
          let err = new Error('Cannot find a event with id ' + id);
          err.status = 404;
          next(err);
      }
  })
  .catch(err=>next(err));
};

exports.update = (req, res, next) => {
  let event = res.body;
  let id = req.params.id;
  
  model.findByIdAndUpdate(id, event, {useFindAndModify: false, runValidators: true})
  .then(event=> {
      if(event) {
          res.redirect('/events/'+id);
      } else {
          let err = new Error('Cannot find a event with id ' + id);
              err.status = 404;
              next(err);
         }
  })
  .catch(err=>next(err));
};


exports.delete = (req, res, next) => {
  let id = req.params.id;
  model.findById(id)
    .then(event => {
      if (!event) {
        let err = new Error('Cannot find an event with id ' + id);
        err.status = 404;
        return next(err);
      }
      // Delete all rsvps associated with the event
      return Rsvp.deleteMany({ event: id });
    })
    .then(() => {
      // Delete the event
      return model.findByIdAndDelete(id, { useFindAndModify: false });
    })
    .then(event => {
      req.flash('success', 'You have successfully deleted an event');
      res.redirect('/events');
    })
    .catch(err => next(err));
};




