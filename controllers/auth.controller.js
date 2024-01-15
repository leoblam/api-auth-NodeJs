// Import du modele d'authentification
const authModel = require("../models/auth.model");

// Import du modele utilisateur
const authModel = require("../models/user.model");

// Import de la validation des donnees
const { validationResult } = require("express-validator");

// Import du modele de hashage bcrypt
const bcrypt = require("bcryptjs");

// Import du module jwt pour les tokens
const jwt = require("jsonwebtoken");
const { connexion } = require("mongoose");

//Import du module Validator pour la validation des emails
const validator = require("validator");

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
    const { email, password } = req.body;
    // Verification de la longueur du mot de passe avec une condition
    if (password.length < 6) {
      // Verification de la longueur du mot de passe (6 caracteres minimum) et renvoie une erreur si le mot de passe est trop court
      return res.status(400).json({
        message: "Le mot de passe doit contenur au moins 6 caracteres.",
      });
    }
    //Verification de la validite email avec validator
    if (!validator.isEmail(email)) {
      //Renvoie une erreur si l'email n'est pas valide
      return res.status(400).json({ message: "L'email est invalide" });
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
    // Creation d'un nouvel utilisateur
    const user = authModel.create({ email, password });
    // Renvoie une reponse positive si l'utilisateuir est bien enregiste
    return res.status(201).json({
      message: "Utilisateur creer avec success",
      user,
    });
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
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
