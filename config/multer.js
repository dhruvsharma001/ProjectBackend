//middleware for handling multipart/form-data, primarily used for file uploads.
const multer = require('multer');
// Multer Disk Storage Configuration:
// Defines the disk storage engine to be used by multer for storing uploaded files.
// Specifies the destination folder and the filename for the uploaded CSV file.
const Products_ListingStorage = multer.diskStorage({
  destination: process.env.MULTER_CSV_DESTINATION,
  filename: function (req, file, cb) {
    cb(null, 'Products_Payload.csv');
  },
});
// function (fileFilter) to filter the type of files allowed for upload.
let fileFilter = function (req, file, cb) {
  var allowedMimes = ['text/csv'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      {
        success: false,
        message: 'Invalid file type. Only text/csv files are allowed.',
      },
      false
    );
  }
};
const uploadProducts_Listing = multer({
  storage: Products_ListingStorage,
  limits: { fileSize: 2000000 },
  fileFilter: fileFilter,
}).single('csv');

module.exports = {
  uploadProducts_Listing,
};
