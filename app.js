const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const cors = require("cors");

const favoriteRoutes = require("./routes/favorite_routes.js");
const productRoutes = require("./routes/product_routes.js");
const userRoutes = require("./routes/user_routes");
const orderRoutes = require("./routes/order_routes");
const HttpError = require("./models/http-error.js");
const fileDelete = require("./middleware/file-delete");

const app = express();

app.use(bodyParser.json());
app.use(cors());

// app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Pristupi Api sa bilo kojeg servera, send Request
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ); // Da navedemo koji headers mogu imati ovi requests od browsera
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE"); // Koje http metode se mogu koristiti u frontendu

  next();
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fileDelete(req.file.location);

    // fs.unlink(req.file.path, (err) => {
    //   console.log(err);
    // });
  }

  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || process.env.PORT);
  res.json({ message: error.message || "An unknown error" });
});

mongoose.set("strictQuery", false);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8suhkcc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then((req, res, next) => {
    app.listen(8000);
  })
  .catch((err) => {
    console.log(err);
  });
