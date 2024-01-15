const router = require("express").Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middleware/authentificate");
const upload = require("../middleware/cloudinaryUpload");

//Route pour la creation d'un produit en tant au'admin en prenant en compte authMiddleware.authentificate
router.post(
  "/create-product",
  authMiddleware.authentificate,
  cloudinaryUpload,
  productController.createProduct
);

// Route pour recuperer tous les produits
router.get("/all-products", productController.getAllProducts);

// Route pour recuperer un seul produit avec son id
router.get("/product/:id", productController.getProductById);

//Route pour supprimer un produit (accessible uniquement par l'administration)
router.delete(
  "/delete-product/:id",
  authMiddleware.authentificate,
  cloudinaryUpload,
  productController.deleteProduct
);

//Route pour modifier un produit (accessible uniquement par l'administration)
router.put(
  "/update-product/:id",
  authMiddleware.authentificate,
  cloudinaryUpload,
  productController.updateProduct
);

module.exports = router;
