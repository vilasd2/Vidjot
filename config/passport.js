const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user module
const User = mongoose.model('users');

module.exports = function (passport) { // compare the entered password with the password stored in mongo DB
    passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
        // check if there is person with given email
        User.findOne({
            email: email
        })
            .then(user => {
                if (!user) {  // email did not found
                    return done(null, false, { message: 'No User Found' }); //done() function takes 3 params:error,user,message                                                         
                }

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {  // this user comes from above promise, line no 14, here password is non encrypted and user.password is encrypted
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, { message: 'Password Incorrect' });
                    }

                });
            });


    }));

    // to maintain sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}