const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require("bcryptjs");
require("dotenv/config");

const indexRouter = require("./routes/index");
const User = require("./models/user");

const mongoDb = process.env.MONGODB_URL;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },

    async (email, password, done) => {
      try {
        const user = await User.findOne(
          { email: email },
          "firstName lastName email profilePicture password"
        );

        if (!user) {
          return done(null, false, {
            message: "Incorrect Email or Password",
          });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return done(null, false, {
            message: "Incorrect Email or Password",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy allows ony requests with valid tokens
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY,
    },

    async (jwt_payload, done) => {
      try {
        const user = await User.findById(
          jwt_payload._id,
          "firstName lastName email password"
        );

        if (user) {
          return done(null, user);
        }
      } catch (error) {
        return done(error, false, {
          message: "Token not matched",
        });
      }
    }
  )
);

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
