const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authentificate");
const cloudinaryUpload = require("../middleware/cloudinaryUpload");

// Route pour l'upload
router.post("/register", cloudinaryUpload, authController.register);
// Route pour l'inscription
router.post("/register", authController.register);
// Route pour connection
router.post("/login", authController.login);
// Route pour la modification du profil
router.put("/update/:id", cloudinaryUpload, authController.update);
// Route pour supprimer un utilisateur
router.delete("/delete/:id", authController.delete);
// Route pour recuperer tous les utilisateurs
router.get(
  "/all-users",
  authMiddleware.authentificate,
  authController.getAllUsers
);
// Route pour recuperer un  utilisateurvia son id
router.get("/user/:id", authMiddleware.authentificate, authController.getUser);

// Route pour le profil utilisateur
router.get("/profil/:id", authController.profil);

// Route pour le mot de passe oublie

// Route protegee
router.get(
  "/dashboard",
  authMiddleware.authentificate,
  authController.dashboard
);
// Admin :
//  Route pour completer les informations
//  Route pour voir mes informations
//  Route pour modifier mes information
//  Route pour supprimer mon compte

// Admin 2
//  Route pour voir tous les utilisateurs
//  Route pour supprimer un utilisateur
//  Route pour modifier un utilisateur

// User
//  Route pour completer les informations
//  Route pour voir mes informations
//  Route pour modifier mes information
//  Route pour supprimer mon compte

module.exports = router;
