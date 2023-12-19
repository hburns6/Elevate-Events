const model = require('../models/user');
const Event = require('../models/event');
const Rsvp = require('../models/rsvp');

exports.new = (req, res)=>{ 
        return res.render('./user/new');   
};

exports.create = (req, res, next) => {
    let user = new model(req.body);
    user.save()
        .then(user => {
            req.flash('success', 'You have successfully created an account. Please log in.');
            return res.redirect('/users/login');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('/users/new');
            }

            if (err.code === 11000) {
                req.flash('error', 'Email has already been used');
                return res.redirect('/users/new');
            }

            next(err);
        });
}

    
    


exports.getUserLogin = (req, res, next) => { 
        return res.render('./user/login');
    } 
    


    exports.login = (req, res, next) => {
        let email = req.body.email;
        if(email) {
          email =  email.toLowerCase();
       }
        let password = req.body.password;
        model.findOne({ email: email })
          .then(user => {
            if (!user) {
              req.flash('error', 'Wrong email address');
              return res.redirect('/users/login');
            } else {
              user.comparePassword(password)
                .then(result => {
                  if (result) {
                    req.session.user = {
                      _id: user._id,
                      firstName: user.firstName,
                      lastName: user.lastName
                    }; // Store user's _id, firstName, and lastName in the session
                    req.flash('success', 'You have successfully logged in');
                    return res.redirect('/');
                  } else {
                    req.flash('error', 'Wrong password');
                    return res.redirect('/users/login');
                  }
                })
                .catch(err => next(err));
            }
          })
          .catch(err => next(err));
      }
    

    


      exports.profile = async (req, res, next) => {
        const id = req.session.user;
        
        try {
          const user = await model.findById(id);
          const events = await Event.find({ hostName: id }).populate('hostName');
          const rsvps = await Rsvp.find({ user: id }).populate('event');
          
          res.render('./user/profile', { user, events, rsvps });
        } catch (err) {
          next(err);
        }
      };
      


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };