import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import mongoose from "mongoose";
import methodOverride from "method-override";
import morgan from "morgan";
import session from "express-session";
// server.js
import isSignedIn from "./middleware/is-signed-in.js";
import passUserToView from "./middleware/pass-user-to-view.js";

import authController from "./controllers/auth.js";
import wordbooksController from "./controllers/wordbooks.js";
import wordsController from "./controllers/words.js";
import { User } from "./models/models.js";

const port = process.env.PORT ? process.env.PORT : "3000";

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", async (req, res) => {
   // already login
  if(req.session.user){
    const { _id } = req.session.user;
    const user = await User.findById(_id);
    res.render("home.ejs",{wordbooks:user.wordbooks})
  }else{
    res.render("index.ejs")
  }
});

app.use(passUserToView);
app.use("/auth", authController);
app.use(isSignedIn);
app.use("/wordbooks", wordbooksController);
app.use("/words", wordsController);


app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
