// Import de mongoose pour la gestion avec la base de donnees
const mongoose = require("mongoose");

// Definistion du schema de l'utilisateur
const productSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [null],
  },
  title: {
    type: String,
    required: [true, "Veuillez renseigner le titre de votre produit."],
  },
  description: {
    type: String,
    required: [true, "Veuillez ajouter la  description de votre produit."],
  },
  price: {
    type: Number,
    required: [true, "Veuillez renseigner le prix de votre produit."],
  },
  imageUrl: {
    type: String,
  },
  imagePublicId: {
    type: String,
    default: mull,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Export du modele, du schema et mis dan sla vaqriable User
const Product = mongoose.model("Product", productSchema);

// Export de la variable User
module.exports = Product;
