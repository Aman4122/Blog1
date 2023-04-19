const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect("mongodb+srv://amanrajput:amanrajput@cluster0.nzezv7u.mongodb.net/test");

module.exports = { connection };
