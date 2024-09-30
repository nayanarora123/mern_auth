const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/Users');
const bcrypt = require('bcryptjs');

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
        const tmpPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tmpPassword, 10);
        user = await new User({
          username: profile.emails[0].value,
          googleId: profile.id,
          password: hashedPassword
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