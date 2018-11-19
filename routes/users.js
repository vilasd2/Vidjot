const express = require('express');
const bcrypt = require('bcryptjs'); // it uses hashing and salt mechanism to encrypt the passwords
const passport = require('passport');
const mongoose = require('mongoose');
const router = express.Router();

// load User module
require('../models/User');
const User = mongoose.model('users'); //users is collection
// User login route
router.get('/login', (req, res) => {
    res.render('users/login');
});


// User register route
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Login form POST
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {     // local is name of stratergy
        successRedirect: '/ideas',
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next);
});



// Register form POST
router.post('/register', (req, res) => {

    // do the validation on data entered by user and encrypt the password
    let errors = [];

    if (req.body.password != req.body.password2) {
        errors.push({ text: 'Passwords do not match' });
    }

    if (req.body.password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }

    // if there is some error
    if (errors.length > 0) {
        res.render('users/register', {       // Also pass the values entered by the user so that form does not clear
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2

        })
    }
    else { // no error, process data and encrypt password
        // Db should not have duplicate emails, so
        User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {         // if email exists
                    req.flash('error_msg', 'Email already registered, please try with different email');
                    res.redirect('register');
                }
                else {  // do rest of stuff

                    const newUser = new User({  // make an object of user
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password,
                    });

                    bcrypt.genSalt(10, (err, salt) => {           // 10 : number of rounds. Read  
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash; // set the encrypted password to the variable 

                            newUser.save()      // call save method and it will return a promise
                                .then(user => {      // passing new user
                                    req.flash('success_msg', 'You are now registered and can login now');
                                    res.redirect('login');
                                })
                                .catch(err => {
                                    console.log(err);
                                    return;
                                })
                        })
                    })
                }
            });



    }
})

// Logout user
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})
module.exports = router;