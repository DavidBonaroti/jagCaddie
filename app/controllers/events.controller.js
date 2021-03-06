const Event = require('../models/event');


module.exports = {
  showEvents: showEvents,
  showSingle: showSingle,
  seedEvents: seedEvents,
  showCreate: showCreate,
  processCreate: processCreate,
  showEdit: showEdit,
  processEdit: processEdit,
  deleteEvent: deleteEvent,
  showHandicap: showHandicap
}

//show events
function showEvents(req, res) {
  //get all events
  Event.find({}, (err, events) => {
    if(err) {
      res.status(404);
      res.send('Events not Found');
    }

    //convert date format from MongoDB format to UI format
    let dates = [];

    for (i = 0; i < events.length; i++) {
      let dateString = events[i].createdAt;
      let date = new Date(dateString);

      let formattedDate = date.toDateString();

      dates.push(formattedDate);
    };

    // return a view with data
    res.render('pages/events', {
      events: events,
      dates: dates,
      success: req.flash('success')
    });
  });
}

//show single events
function showSingle(req, res) {
  // get single events
  Event.findOne({ slug: req.params.slug }, (err, event) => {
    if(err) {
      res.status(404);
      res.send('Events not Found');
    }
    //return event with data
    res.render('pages/single', {
      event: event,
      success: req.flash('success')
    });
   });
}

// seed database
function seedEvents(req, res) {

  //create some events
  const events = [
    { name: 'Basketball', description: 'Michael Jordon'},
    { name: 'Swimming', description: 'Michael Phelps'},
    { name: 'Golf', description: 'Michael Thompson'},
    { name: 'Soccer', description: 'Michael McBride'}
  ];

  //use event model to insert/save
  Event.remove({}, () => {
    for (event of events) {
      var newEvent = new Event(event);
      newEvent.save();
    }
  });

  //seed success
  res.send('Database seeded!');
}



//show create form
function showCreate(req, res) {
  res.render('pages/create', {
    errors: req.flash('errors')
  });
}

//process create form
function processCreate(req, res) {
  //validate info
  req.checkBody('name', 'Name is required.').notEmpty();
  req.checkBody('description', 'Description is also required.').notEmpty();
  req.checkBody('course', 'Course is also required.').notEmpty();
  req.checkBody('slope', 'Slope is also required.').notEmpty();
  req.checkBody('rating', 'Rating is also required.').notEmpty();
  req.checkBody('score', 'Score is also required.').notEmpty();
  req.checkBody('front', 'Front is also required.').notEmpty();
  req.checkBody('front', 'Front is also required.').notEmpty();

  //if errors, redirect and save errors to flash
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(err => err.msg));
    return res.redirect('/events/create');
  }

  //create new event
  const event = new Event({
    name: req.body.name,
    description: req.body.description,
    course: req.body.course,
    slope: req.body.slope,
    rating: req.body.rating,
    score: req.body.score,
    front: req.body.front,
    back: req.body.back
  });

  // save event
  event.save((err) => {
    if (err)
      throw err;

    //set succesful flash message
    req.flash('success', 'Succesfully Created Event!');

    //redirect to new event page
    res.redirect(`/events/${event.slug}`);
  });
}

//show edit form

function showEdit(req, res) {
  Event.findOne({ slug: req.params.slug }, (err, event) => {
    res.render('pages/edit', {
      event: event,
      errors: req.flash('errors')
    });
  });
}

//process the edit form

function processEdit(req, res) {
  //validate info
  req.checkBody('name', 'Name is required.').notEmpty();
  req.checkBody('description', 'Description is also required.').notEmpty();

  //if errors, redirect and save errors to flash
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(err => err.msg));
    return res.redirect(`/events/${req.params.slug}/edit`);
  }

  //find current events
  Event.findOne({ slug: req.params.slug }, (err, event) => {

  //updating events
    event.name = req.body.name;
    event.description = req.body.description;


  //error in update
    event.save((err) => {
      if(err)
        throw(err);
  //success flash messsage
  //redirect to full events page
      req.flash('success', 'Succesfully updated event.');
      res.redirect('/events');
    });
  });
}



// delete event
function deleteEvent(req, res) {
  Event.remove({ slug: req.params.slug }, (err) => {
    //set flash data
    //redirect back to events page
    req.flash('success', 'Event deleted!');
    res.redirect('/events');
  });
}


//calculate score
function showHandicap(req, res) {
  //get all events
  Event.find({}, (err, events) => {
    if(err) {
      res.status(404);
      res.send('Events not Found');
    }

    //loop through scores to calculate handicap differential

    let scores = [];

    for (let i = 0; i < events.length; i++) {
      let result = 0;
      result += events[i].score;
      result -= events[i].rating;
      result *= 113;
      result = (result / (events[i].slope));
      scores.push(result);
    }

    //application selects lowest handicap differential based on no. of rounds
    //5-10 rounds, lowest differential x .96
    //11-19 rounds, avg lowest 3-5 differentials x .96
    //>=20 rounds, avg lowest 10 differentials x .96
    let data = 0;
    //5-10
    if (scores.length < 10) {

      data = Math.min.apply(null, scores);
      data *= .93;
      data = Math.round(data);
    //11-19
    } else if (scores.length >= 10 && scores.length <= 19) {

      let lowestThree = scores.sort(function(a, b) {
        return a-b;
      }).slice(0, 3);
      let sumThree = 0;
      for (let j = 0; j < lowestThree.length; j++ ) {
        sumThree += lowestThree[j];
      }
      data = sumThree / lowestThree.length;
      data *= .93;
      data = Math.round(data);
      return data;
    //20+
    } else if (scores.length > 19) {

      let lowestTen = scores.sort(function(a, b) {
        return a-b;
      }).slice(0, 10);
      let sumTen = 0;
      for (let k = 0; k < lowestTen.length; k++ ) {
        sumTen += lowestTen[k];
      }
      data = sumTen / lowestTen.length;
      data *= .93;
      data = Math.round(data);

    }
    // return a view with data
    res.render('pages/handicap', {
      data: data
    });
  });
}
