const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/Users');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        done(null, user);
      } else {
        // Create a new user
        user = await new User({
          username: profile.displayName,
          googleId: profile.id
        }).save();
        done(null, user);
      }
    } catch (error) {
      done(error, null);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
// Deserialize user
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});