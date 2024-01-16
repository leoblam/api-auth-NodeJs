const productModel = require("../models/product.model");
const cloudinary = require("cloudinary").v2;

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
    // Verification si une image est telechargee
    if (!req.cloudinaryUrl || !req.file) {
      return res
        .status(400)
        .json({ message: "Veuillez telecharger une image" });
    }
    // Declaration de variable pour recuperer l'id de l'utilisateur qui va poster un produit
    const userId = req.user._id;

    // Utilisation de l'url de cloudinary et du public_id provenant du middleware
    const imageUrl = req.cloudinaryUrl;
    const imagePublicId = req.file.public_id;

    // Creation d'un nouveau produit
    const newProduct = await productModel.create({
      title,
      description,
      price,
      imageUrl,
      imagePublicId,
      createdBy: userId,
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
// Fonction pour recuperer tous les produits
module.exports.getAllProducts = async (req, res) => {
  try {
    // Recuperation de tous les produits
    const product = await productModel.find();
    // Reponse de succes
    res.status(200).json({ message: "liste des produits", product });
  } catch (error) {
    console.error(
      "Erreur lors de la recuperation des produits :",
      error.message
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la recuperation des produits" });
  }
};

// Fonction pour recuperer un seul produit avec son id
module.exports.getProductById = async (req, res) => {
  try {
    // Declaration de la variable qui va recherche l'id du produit
    const productId = req.params.id;
    //Recuperation du produit par son id
    const product = await productModel.findById(productId);
    // Condition si le produit est introuvable
    if (!product) {
      res.status(400).json({ message: "Produit non trouve" });
    }
    res.status(200).json({ message: "Produit recupere avec succes", product });
  } catch (error) {
    console.error("Erreur lors de la recuperation du produit :", error.message);
    res
      .status(500)
      .json({ message: "Erreur lors de la recuperation du produit" });
  }
};

// suppression d'un produit uniquement par administrateur via son id
module.exports.deleteProduct = async (req, res) => {
  try {
    // Verifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      //retour d'un message d'erreur
      return res.status(403).json({
        message:
          "Supprimer un produit est une action reservee aux administrateurs",
      });
    }
    // Recuperation de l'id du produit pour le mettre en parametre d'url
    const productId = req.params.id;
    // Recuperation de l'id du produit par rapport au modele
    const product = await productModel.findById(productId);
    // Condition si le produit n'existe pas
    if (!product) {
      return res.status(404).json({ message: "Produit non trouve" });
    }
    // Rechercher l'id de l'image cloudinary
    const imagePublicId = product.imagePublicId;
    // Supression su produit
    const deletedProduct = await productModel.findByIdAndDelete(productId);
    // Verifier si deletedProduct existe
    if (!deletedProduct) {
      return res.status(404).json({ message: "Produit non trouve" });
    }
    console.log("Image Public ID : ", imagePublicId);
    console.log("Produit supprime avec succes");

    // Suppression de l'image dans cloudinary
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId);
      console.log("Image supprime avec succes");
    }
    // Message de supression reussi
    return res.status(200).json({ message: "Produit supprime avec succes" });
  } catch (error) {
    // Message de supression non reussi
    console.error("Erreur lors de la suppression du produit :", error.message);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du produit" });
  }
};

// Modification d'un produit uniquement par administrateur via son id
module.exports.updateProduct = async (req, res) => {
  try {
    // Verifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      //retour d'un message d'erreur
      return res.status(403).json({
        message:
          "Modifier un produit est une action reservee aux administrateurs",
      });
    }
    // Definition de la variable pour recuperer l'id du produit en paramnetre d'url
    const productId = req.params.id;
    // Definition de la variable pour verifier si le produit existe en bdd
    const existingProduct = await productModel.findById(productId);
    // Condition si le produit est introuvable
    if (!existingProduct) {
      return res.status(404).json({ message: "Produit non trouve" });
    }
    // Mettre a jour les proprietes du produit avec les donnees du corps de la requete
    existingProduct.title = req.body.title || existingProduct.title;
    existingProduct.description =
      req.body.description || existingProduct.description;
    existingProduct.price = req.body.price || existingProduct.price;
    // Verifier si une nouvelle image est telecharge et mettre a jour le chemin de l'image
    if (req.file) {
      // Suprimmer l'ancienne image si il y en a une
      if (existingProduct.imagePublicId) {
        await cloudinary.uploader.destroy(existingProduct.imagePublicId);
      }
      // Affecte un nouveau chemin et un nouvel ID a la nouvelle image
      existingProduct.imageUrl = req.cloudinaryUrl;
      existingProduct.imagePublicId = req.file.public_id;
    }
    // Enregistrer les modifications dans la bdd
    const updatedProduct = await existingProduct.save();

    // renvoie une reponse positive si le produit est bien enregistre
    res.status(201).json({
      message: "Produit modifie avec succes",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Erreur lors de la modification du produit :", error.message);
    res
      .status(500)
      .json({ message: "Erreur lors de la modification du produit" });
  }
};
