
const Event = require('../models/event');

//check if user is guest
exports.isGuest = (req, res, next)=> {
    if(!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
}

//check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if(req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login');
    }

}

//check if user is author 
exports.isHost = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id)
    .then(event => {
        if(event) {
            if(event.hostName._id == req.session.user._id) {
                return next();
            } else {
                let err = new Error("You are not authorized to access this resource");
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
}

exports.isNotHost = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id)
    .then(event => {
        if(event) {
            if(event.hostName._id == req.session.user._id) {
                let err = new Error("You cannot RSVP to your own event");
                err.status = 401;
                return next(err);
            } else {
                return next();
            }
        } else {
            let err = new Error('Cannot find a event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
}