const router = require("express").Router();
const authController = require("../controllers/auth.controller");

// Route pour l'inscription
router.post("/register", authController.register);

// Route pour connection
router.post("/login", authController.login);

// router.post("/athentificate", authController.athentificate);

module.exports = router;
