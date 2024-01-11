// Import du package multer
const multer = require("multer");

// Coinfiguration de multer pour stocker les images dans un dossier specifique
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // le dossier ou les images serront stocke ici
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
