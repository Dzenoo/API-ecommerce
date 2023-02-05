const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  customer: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Favorite", favoriteSchema);
