const express = require("express");
const { check } = require("express-validator");

const favoriteController = require("../controllers/favorite-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:uid", favoriteController.getItemByUserId);

router.post(
  "/add",
  checkAuth,
  [
    check("title").not().isEmpty(),
    check("image").not().isEmpty(),
    check("price").not().isEmpty(),
  ],
  favoriteController.addItem
);

router.delete("/:fid", checkAuth, favoriteController.deleteItem);

module.exports = router;
