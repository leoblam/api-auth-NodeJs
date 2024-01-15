// Import de mongoose pour la gestion avec la base de donnees
const mongoose = require("mongoose");

// Import de bcrypt pour le hashage du mot de passe
const bcrypt = require("bcryptjs");

// Import de validator pour la validation de l'email
const validator = require("validator");

// Definistion du schema de l'utilisateur
const authSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
authSchema.pre("save", async function (next) {
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
authSchema.method.comparePassword = async function (paramPassword) {
  try {
    return await bcrypt.compare(paramPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Export du modele, du schema et mis dans la vaqriable Auth
const Auth = mongoose.model("Auth", authSchema);

// Export de la variable Auth
module.exports = Auth;
