const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const { v4: uuid } = require("uuid");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  secretKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const MIME_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 600000,
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),

  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE[file.mimetype];
    let error = isValid ? null : new Error("Netacan mime type");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
