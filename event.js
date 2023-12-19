const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {type: String, required: [true, 'title is required']},
    category: {type: String, required: [true, 'category is required'], 
    enum: ['Weddings', 'Corporate Retreat', 'Charity Events', 'Sports Events', 'Trade Shows']},
    hostName: {type: Schema.Types.ObjectId, ref:'User'},
    startDate: {type: Date, required: [true, 'start date is required']},
    endDate: {type: Date, required: [true, 'end date is required']},
    details: {type: String, required: [true, 'details is required'], 
    minLength: [10, 'content should have at least 10 characters']},
    location: {type: String, required: [true, 'Location is required']},
    image: {type: String, required: [true, 'image is required']},
},

{timestamps: true}
);

eventSchema.virtual('rsvpCount').get(function() {
    return this.rsvps.filter(rsvp => rsvp.status === 'YES').length;
  });

module.exports = mongoose.model('Event', eventSchema);