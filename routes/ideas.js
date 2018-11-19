const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../helpers/auth'); // require inside a function

// Load Idea model
require('../models/Idea');
const Idea = mongoose.model('ideas'); // ideas is name of collection


// Idea index page
router.get('/', ensureAuthenticated, (req, res) => {
    Idea.find({ user: req.user.id })      // fetch all the ideas of respective logged in user
        .sort({ date: 'desc' })      // sort based on date in descending order
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });

});

// ensure every action if it is authenticated
// Add Idea form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});

// Displaying Edit Idea form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {  // need to edit sepcific idea with id
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            if (idea.user != req.user.id) { // C1 - check this id in comments file
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/ideas');
            }
            else {
                res.render('ideas/edit', {
                    idea: idea
                });
            }

        })

});


// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add some details' });
    }

    if (errors.length > 0) { // if there is some error, show the same form with the same entered details
        res.render('/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });

    } else { // pass details to mongodb
        const newUser = {           // make an object of user
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }

        new Idea(newUser) // after storing details, it will return promise
            .save()
            .then(idea => {
                req.flash('success_msg', 'Video idea added.');
                res.redirect('/ideas'); // go to ideas page
            });

    }
});

// Edit_form process
router.put('/:id', ensureAuthenticated, (req, res) => { // put req implemented using method-overriding
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {      // will return promise having old data and set it to updated data
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save() // will return promise having updated idea
                .then(idea => {
                    req.flash('success_msg', 'Video idea updated.');
                    res.redirect('/ideas');
                });
        });
});


// Delete an Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Idea.deleteOne({ _id: req.params.id })  // id is inside url remove()is depricated..instead use deleteOne()
        .then(() => {
            req.flash('success_msg', 'Video idea removed.');
            res.redirect('/ideas');
        })
})




module.exports = router;