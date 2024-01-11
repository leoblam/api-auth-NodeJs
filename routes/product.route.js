const router = require("express").Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middleware/authentificate");
const upload = require("../middleware/upload");

//Route pour la creation d'un produit en tant au'admin en prenant en compte authMiddleware.authentificate
router.post(
  "/create-product",
  authMiddleware.authentificate,
  upload.single("image"),
  productController.createProduct
);

module.exports = router;
