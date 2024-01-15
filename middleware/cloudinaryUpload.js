// Import du package multer
const multer = require("multer");

// Import du package cloudinary
const cloudinary = require("cludinary").v2;

// Configuration de multer pour stocker les images dans un dossier specifique
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const cloudinaryUpload = async (req, res, next) => {
  try {
    console.log("Debut du middleware cloudinaryUpload");
    // Utilisation de Multer pour gerer le fichier depuis la requete
    upload.single("image")(req, res, async (err) => {
      console.log("Multer a termine de gerer le fichier");
    });
    // Gestion des erreurs avec Multer
    if (err) {
      console.error("Erreur lors du televersement avec Multer:", err);
      return res
        .status(500)
        .json({ message: "erreur lors du televersement avec Multer" });
    }
    // Verification de l'existence du fichier dans la requete
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Veuillez choisir une image a telecharger" });
    }
    try {
      console.log("Debut du televersement sur cloudinary");
      // Utilisation de cloudinary pour televersert l'image
      cloudinary.uploader
        .upload_stream(async (error, result) => {
          // Gestion des erreurs Cloudinary
          if (error) {
            console.error("Erreur lors du televersement avec Multer:", error);
            return res
              .status(500)
              .json({ message: "Erreur lors du televersement avec Multer" });
          }
          console.log(" Televersement sur Cloudinary reussi");
          // Ajout de l'url de l'image cloudinary a la requete
          req.cloudinaryUrl = result.secure_url;
          // Ajout du public_id de l'image a la requete
          req.file.public_id = result.public_id;
          // Passe a la prochaine etape du Middleware ou a la route
          next();
        })
        .end(req.file.buffer);
      console.log("Fin du middleware cloudinaryUpload");
    } catch (cloudinaryError) {
      console.error("Erreur lors de l'upload sur cloudinary", cloudinaryError);
      return res
        .status(500)
        .json({ message: "Erreur lors de l'upload sur cloudinary" });
    }
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la requete
    console.error("Erreur lors de l'upload", error.message);
    return res.status(500).json({ message: "Erreur lors de l'uplaod" });
  }
};

module.exports = upload;
