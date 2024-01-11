const productModel = require("../models/product.model");

// Fonction pour la creation d'un produit (accessible uniquement par ladministrateur)

module.exports.createProduct = async (req, res) => {
  try {
    // Verifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      //retour d'un message d'erreur
      return res.status(403).json({
        message:
          "Ajoutez un produit est une action reservee aux administrateurs",
      });
    }
    // Recuperation des donnes du formulaire
    const { title, description, price } = req.body;
    // Creation d'un nouveau produit
    const newProduct = await productModel.create({
      title,
      description,
      price,
    });
    // renvoie une reponse positive si le produit est bien enregistre
    res
      .status(201)
      .json({ message: "Produit cree avec succes", product: newProduct });
  } catch (error) {
    console.error("Erreur lors de la creation du produit :", error.message);
    res.status(500).json({ message: "Erreur lors de la creation du produit" });
  }
};
