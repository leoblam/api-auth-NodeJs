// Import de mongoose pour la gestion avec la base de donnees
const mongoose = require("mongoose");

// Definistion du schema de l'utilisateur
const productSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  imageURL: {
    type: string,
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
