// Import du modele utilisateur
const authModel = require("../models/auth.model");

//import du JWT
const jwt = require("jsonwebtoken");

// Fonction pour la gestion du role
module.exports.authentificate = async (req, res, next) => {
  try {
    // Definition de la variable pour l'autorisation
    const authHeader = req.header("Authorization");
    // Condition qui verifie la variable et qui ajoute un Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message:
          "Vous devez etre connecte en tant qu'administrateur pour acceder a cette ressource",
      });
    }
    // Extraction du token sans le prefixe 'Bearer'
    const token = authHeader.split(" ")[1]; //split a l'espace a partir du premier espace

    // Ajout de la variable pour decoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Declaration d'une variable qui va recuperer l'id de l'utilisateur et lui assigner un token
    const user = await authModel.findById(decoded.user.id);

    // Renvoie un message si il n'y a pas d'utilisateur
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouve" });
    }
    // Le else n'est pas souhaitable caren local tout vas fonctionner mais au deploiement il y aura une erreur "req.user is not a function"
    req.user = user;
    next();
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la connexion de l'utilisateur
    console.error("Erreur lors de l'authentification", error.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de l'authentification" });
  }
};
