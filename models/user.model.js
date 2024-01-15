// Import de mongoose pour la gestion avec la base de donnees
const mongoose = require("mongoose");

// Definistion du schema de l'utilisateur
const userSchema = new mongoose.Schema({
  lastname: {
    type: String,
    required: [true, "Veuillez renseigner votre nom de fanille."],
  },
  firstname: {
    type: String,
    required: [true, "Veuillez renseigner votre prenom."],
  },
  birthday: {
    type: String,
    required: [true, "Veuillez renseigner votre date de naissance."],
  },
  adress: {
    type: String,
    required: [true, "Veuillez renseigner votre adresse."],
  },
  zipcode: {
    type: String,
    required: [true, "Veuillez renseigner votre code postal."],
  },
  city: {
    type: String,
    required: [true, "Veuillez renseigner votre ville."],
  },
  phone: {
    type: Number,
    required: [true, "Veuillez renseigner votre numero de telephone."],
  },
  avatar: {
    type: String,
  },
  avatarPublicId: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Export du modele, du schema et mis dans la variable Product
const User = mongoose.model("User", userSchema);

// Export de la variable Product
module.exports = User;
