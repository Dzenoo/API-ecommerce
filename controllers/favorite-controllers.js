const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

const User = require("../models/user");
const Favorite = require("../models/favorite");

exports.getItemByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userFavs;
  try {
    userFavs = await User.findById(userId).populate("favorites");
  } catch (err) {
    const error = new HttpError(
      "Fetching favs failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    favorites: userFavs.favorites.map((fav) => fav.toObject({ getters: true })),
  });
};

// Add item to favorites
exports.addItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, image, price } = req.body;

  const createdFav = new Favorite({
    title,
    image,
    price,
    customer: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Adding to fav failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find user for this id, please try again.",
      500
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdFav.save({ session: sess });
    user.favorites.push(createdFav);
    await user.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();
  } catch (err) {
    const error = new HttpError("Adding to fav failed.", 500);
    return next(error);
  }

  res.status(201).json({ fav: createdFav });
};

exports.deleteItem = async (req, res, next) => {
  const favoriteId = req.params.fid;

  let favorite;
  try {
    favorite = await Favorite.findById(favoriteId).populate("customer");
  } catch (err) {
    const error = new HttpError("Could not favorite, please try again.", 500);
    return next(error);
  }

  if (!favorite) {
    const error = new HttpError("Could not find favorite for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await favorite.remove({ session: sess });
    favorite.customer.favorites.pull(favorite);
    await favorite.customer.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();
  } catch (err) {
    const error = new HttpError("Could not delete fav, please try again.", 500);
    return next(error);
  }

  res.json({ message: "Favorite deleted..." });
};
