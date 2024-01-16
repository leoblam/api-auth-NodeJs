// Import du modele d'authentification
const authModel = require("../models/auth.model");

// Import de la validation des donnees
const { validationResult } = require("express-validator");

// Import du modele de hashage bcrypt
const bcrypt = require("bcryptjs");

// Import du module jwt pour les tokens
const jwt = require("jsonwebtoken");

// Import du module cloudinary pour la gestion d'image
const cloudinary = require("cloudinary").v2;

// Fonction pour l'inscription
module.exports.register = async (req, res) => {
  // Validation des donnes d'entree
  try {
    // Recuperation des erreurs de validations
    const errors = validationResult(req);
    // Verification si il y a des erreurs de validations
    if (!errors.isEmpty()) {
      // Renvoi des erreurs de validation
      return res.status(400).json({ errors: errors.array() });
    }
    // Recuperation des donnes du formulaire
    const {
      lastname,
      firstname,
      birthday,
      address,
      zipcode,
      city,
      phone,
      email,
      password,
    } = req.body;
    // Verifier si une image est telechargee
    if (!req.cloudinaryUrl || !req.file) {
      return res.status(400).json({ message: "Veuilez telecharger une image" });
    }
    // Verification de l'email si il existe deja en bdd
    const existingUser = await authModel.findOne({ email });
    // Renvoie erreur si email deja existant
    if (existingUser) {
      return res.status(400).json({
        message:
          "Votre email existe deja dans notre base de donnee. Veuillez en choisir un autre",
      });
    }
    // Utilisation de l'url de cloudinary et du public_id provenant du middleware
    const avatarUrl = req.cloudinaryUrl;
    const avatarPublicId = req.file.public_id;

    // Creation d'un nouvel utilisateur
    const user = authModel.create({
      lastname,
      firstname,
      birthday,
      address,
      zipcode,
      city,
      phone,
      email,
      password,
      avatarUrl,
      avatarPublicId,
    });
    // Renvoie une reponse positive si l'utilisateuir est bien enregiste
    return res.status(201).json({
      message: "Utilisateur cree avec success",
      user,
    });
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur lors de l'enregistrement de l'utilisateur" });
  }
};

// Fonction pour la connexion
module.exports.login = async (req, res) => {
  try {
    // Recuperation des erreurs de validations
    const errors = validationResult(req);
    // Verification si il y a des erreurs de validation
    if (!errors.isEmpty()) {
      // Renvoie des erreurs de validation
      return res.status(400).json({ errors: errors.array() });
    }
    // Recuperation des donnees du formulaire
    const { email, password } = req.body;

    // Verification si l'utilisateur existe deja dans la base de donnees
    const user = await authModel.findOne({ email });
    // Si l'utilisateur n'existe pas, renvoie une erreur

    if (!user) {
      console.log("Utilisateur non trouve.");
      return res.status(400).json({
        message: "Email invalide",
      });
    }
    // Verification du mot de passe
    const isPasswordValid = await bcrypt.compare(
      password, // mdp entre par l'utilisateur
      user.password // mdp hache en bdd
    );
    // Si le mot de passe est incorrect, renvoie une erreur
    if (!isPasswordValid) {
      console.log("Mot de passe incorrect");
      return res.status(400).json({
        message: "Mot de passe incorrect",
      });
    }
    // Renvoie d'un message de succes
    console.log("Vous etes bien connecte");
    // Creation du token jwt
    const payload = {
      user: {
        id: user._id,
        email: user.email,
      },
    };
    // Definition de la variable pour le token
    const secretKey = process.env.JWT_SECRET;
    // Definition de la date d'expiration du token
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    // Renvoie un message de reussite et le token
    res.status(200).json({ message: "Connexion reussi !", token });
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la connexion de l'utilisateur
    console.error("Erreur lors de la connextion", error.message);
    return res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Fonctipon pour la modification du profil
module.exports.update = async (req, res) => {
  try {
    // Recuperation des erreurs de validations
    const errors = validationResult(req);
    // Verification si il y a des erreurs de validations
    if (!errors.isEmpty()) {
      // Renvoi des erreurs de validation
      return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.params.id;
    // Recuperation des donnees du formulaire
    const {
      lastname,
      firstname,
      birthday,
      address,
      zipcode,
      city,
      phone,
      email,
    } = req.body;
    // Verifier si l'utilisateur existe avant la mise a jour
    const existingUser = await authModel.findById(userId);
    // Condition si lutilisateur n'existe pas en bdd
    if (!existingUser) {
      console.error("Erreur utilisateur non trouve.");
      return res
        .status(404)
        .json({ message: "Erreur utilisateur non trouve." });
    }

    // Verifier si une nouvelle image est telecharge et mettre a jour le chemin de l'image
    if (req.file) {
      // Suprimmer l'ancien avatar si il y en a une
      if (existingUser.avatarPublicId) {
        await cloudinary.uploader.destroy(existingUser.avatarPublicId);
      }
      // // Affecte un nouveau chemin et un nouvel ID a la nouvelle image
      existingUser.avatarUrl = req.cloudinaryUrl;
      existingUser.avatarPublicId = req.file.public_id;

      existingUser.lastname = lastname;
      existingUser.firstname = firstname;
      existingUser.birthday = birthday;
      existingUser.address = address;
      existingUser.zipcode = zipcode;
      existingUser.city = city;
      existingUser.phone = phone;
      // Mettre a jour l'email uniquement si fourni dans la requete
      if (email) {
        existingUser.email = email;
      }
      // Sauvegarder les modifications
      await existingUser.save();
      // Log de reussite
      console.log("Profil mis a jour avec succes.");
      return res.status(200).json({
        message: "Profil mis a jour avec succes.",
        user: existingUser,
      });
    }
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la mise a jour du profil.
    console.error("Erreur lors de la mise a jour du profil.", error.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise a jour du profil." });
  }
};
// Fonction pour supprimer un utilisateur.
module.exports.delete = async (req, res) => {
  try {
    // Declaration de la de la variable qui va rechercher l'id utilisateur pour le mettre en params url
    const userId = req.params.id;
    const existingUser = await authModel.findById(userId);
    // Condition si l'utilisateur n'existe pas
    if (!existingUser) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    if (existingUser.avatarPublicId) {
      await cloudinary.uploader.destroy(existingUser.avatarPublicId);
    }
    // Supression de l'utilisateur
    await authModel.findByIdAndDelete(userId);
    console.log("Utilisateur supprime avec succes", userId);
    return res
      .status(200)
      .json({ message: "Utilisateur supprime avec succes" });
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la mise a jour du profil.
    console.error("Erreur lors de la suppression du profil.", error.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de la suppression du profil." });
  }
};

// Fonction pour recuperer tous les utilisateurs
module.exports.getAllUsers = async (req, res) => {
  try {
    // Verifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      //retour d'un message d'erreur
      return res.status(403).json({
        message:
          "Afficher tous les utilisateurs est une action reservee aux administrateurs",
      });
    }
    // Recuperation de tous les utilisateurs
    const user = await authModel.find();
    // Reponse de succes
    res.status(200).json({ message: "liste des utilisateurs", user });
  } catch (error) {
    console.error(
      "Erreur lors de la recuperation des utilisateurs :",
      error.message
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la recuperation des utilisateurs" });
  }
};
