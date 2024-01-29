// Import de mongoose pour la gestion avec la base de donnees
const mongoose = require("mongoose");

// Definistion du schema de l'utilisateur
const productSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
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
    type: String,
    required: [true, "Veuillez renseigner le prix de votre produit."],
  },
  imageUrl: {
    type: String,
  },
  imagePublicId: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Export du modele, du schema et mis dans la variable Product
const Product = mongoose.model("Product", productSchema);

// Export de la variable Product
module.exports = Product;
