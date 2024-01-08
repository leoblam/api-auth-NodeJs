// Import de mongoose pour la gestion avec la base de donnees
const mongoose = require("mongoose");

// Import de bcrypt pour le hashage du mot de passe
const bcrypt = require("bcrypt");

// Import de validator pour la validation de l'email
const validator = require("validator");

// Definistion du schema de l'utilisateur
const userSchema = new mongoose.Schema({
  lastname: {
    type: String,
    required: [true, "Veuillez renseigner votre nom de famille."],
  },
  firstname: {
    type: String,
    required: [true, "Veuillez renseigner votre prenom."],
  },
  email: {
    type: String,
    required: [true, "Veuillez renseigner un mot de passe."],
    unique: true,
    lowercase: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: "Adresse Email invalide.",
    },
  },
  password: {
    type: String,
    required: [true, "Veuillez renseigner votre mot de passe."],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Hashage du mot d epasse avant de sauvegarder l'utilisateur
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (error) {
    return next(error);
  }
});
// Methode pour comparer le mot de passe
