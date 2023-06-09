const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cloudinary = require("cloudinary");
const upload = require("../middleware/upload");

require("../middleware/cloudinary");

const { UserModel } = require("../models/user.mdole");

const user = Router();

user.post("/register", upload.single("profile_photo"), async (req, res) => {
  let { name, email, password } = req.body;
  try {
    bcrypt.hash(password, (saltRounds = 5), async function (err, hash) {
      try {
        let { secure_url } = await cloudinary.v2.uploader.upload(req.file.path);
        if (!secure_url)
          secure_url =
            "https://www.vhv.rs/dpng/d/15-155087_dummy-image-of-user-hd-png-download.png";
        let newUser = await UserModel.create({
          photo: secure_url,
          name,
          email,
          password: hash,
        });
        res.status(200).send({ msg: "Registration successfull", newUser });
      } catch (err) {
        console.log(err.message);
        res.status(400).send({ msg: "User already present please login" });
      }
    });
  } catch (err) {
    console.log(err.message);
    if (
      err.message ==
      'E11000 duplicate key error collection: relationships.users index: email_1 dup key: { email: "ravi@gmail.com" }'
    )
      res.status(400).send({ msg: err.message, keyValue: err.keyValue });
    else res.status(400).send({ msg: err.message });
  }
});

user.post("/login", async (req, res) => {
  let { email, password } = req.body;
  try {
    const { password: hashedPassword, _id } = await UserModel.findOne({
      email,
    });
    let userData = await UserModel.find({
      _id,
    });
    bcrypt.compare(password, hashedPassword, function (err, result) {
      if (result) {
        var token = jwt.sign({ user_id: _id }, "blue");

        res.status(200).send({ msg: "Login successfull", token, userData });
      } else res.status(400).send({ msg: "Wrong Password" });
    });
  } catch (err) {
    console.log(err);
    console.log(err.message);
    res.status(400).send({ msg: "Wrong credential" });
  }
});

user.patch("/update/:id", upload.single("profile_photo"), async (req, res) => {
  let { id } = req.params;
  let payload = req.body;
  if (req.file) {
    let { secure_url } = await cloudinary.v2.uploader.upload(req.file.path);
    if (!secure_url)
      secure_url =
        "https://www.vhv.rs/dpng/d/15-155087_dummy-image-of-user-hd-png-download.png";
    payload.photo = secure_url;
  }
  try {
    let result = await UserModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: payload,
      },
      {
        new: true,
        useFindAndModify: true,
      }
    );
    res.status(200).send(result);
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ msg: err.message });
  }
});

user.get("/profile/:user_id", async (req, res) => {
  let { user_id } = req.params;
  try {
    let result = await UserModel.findOne({
      _id: user_id,
    });
    res.status(200).send({ msg: "Profile data", result });
  } catch (err) {
    console.log(err.message);
    res.status(400).send({ msg: "Something went wrong" });
  }
});

module.exports = { user };
