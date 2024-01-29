const router = require("express").Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middleware/authenticate");
const cloudinaryUpload = require("../middleware/cloudinaryUpload");

//Route pour la creation d'un produit en tant au'admin en prenant en compte authMiddleware.authenticate
router.post(
  "/api/create-product",
  authMiddleware.authenticate,
  cloudinaryUpload,
  productController.createProduct
);

// Route pour recuperer tous les produits
router.get("/api/all-products", productController.getAllProducts);

// Route pour recuperer un seul produit avec son id
router.get("/api/product/:id", productController.getProductById);

//Route pour supprimer un produit (accessible uniquement par l'administration)
router.delete(
  "/api/delete-product/:id",
  authMiddleware.authenticate,
  productController.deleteProduct
);

//Route pour modifier un produit (accessible uniquement par l'administration)
router.put(
  "/api/update-product/:id",
  authMiddleware.authenticate,
  cloudinaryUpload,
  productController.updateProduct
);

module.exports = router;
