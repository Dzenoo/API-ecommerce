const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 600000,
  storage: multerS3({
    s3: s3,
    bucket: "ecommerce-mern-build",
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "META_DATA" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type !");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
