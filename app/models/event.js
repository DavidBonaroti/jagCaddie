const mongoose = require('mongoose'),
Schema = mongoose.Schema;


// create Schema
const eventSchema = new Schema({
  name: String,
  slug: {
    type: String,
    unique: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  course: String,
  slope: Number,
  rating: Number,
  score: Number,
  front: Number,
  back: Number
});

// middleware
// make sure that slug is created from name

eventSchema.pre('save', function(next) {
  this.slug = slugify(this.name);
  next();
})

// create model
const eventModel = mongoose.model('Event', eventSchema);

// export model
module.exports = eventModel;


//function to slugify
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}
