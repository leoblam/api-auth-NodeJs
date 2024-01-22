const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authentificate");
const cloudinaryUpload = require("../middleware/cloudinaryUpload");

// Route pour l'upload
router.post("/register", cloudinaryUpload, authController.register);
// Route pour l'inscription
router.post("/register", authController.register);
// Route pour verifier l'email
router.get("/verify-email/:token", authController.verifyEmail);
// Route pour envoyer l'email de reinitialisation de mot de passe
router.post("/forgot-password", authController.forgotPassword);
// Route pour reinitialiser le mdp
router.put("/update-password/:token", authController.updatePassword);
// Route pour connection
router.post("/login", authController.login);

// Route pour la modification du profil
router.put(
  "/update/:id",
  cloudinaryUpload,
  authMiddleware.verifToken,
  authController.update
);
// Route pour supprimer son compte utilisateur
router.delete("/delete/:id", authMiddleware.verifToken, authController.delete);
// Route pour voir son profil utilisateur
router.get("/profil/:id", authMiddleware.verifToken, authController.profil);

// Route pour recuperer tous les utilisateurs
router.get(
  "/all-users",
  authMiddleware.authentificate,
  authController.getAllUsers
);
// Route pour recuperer un utilisateur via son id admin
router.get("/user/:id", authMiddleware.authentificate, authController.getUser);
// Route pour modifier le profil d'un utilisateur admin
router.get(
  "/update-user/:id",
  authMiddleware.authentificate,
  cloudinaryUpload,
  authController.updateUser
);
// Route pour supprimer un utilisateur admin
router.delete(
  "/delete-user/:id",
  authMiddleware.authentificate,
  authController.deleteUser
);

// Route pour modifier un utilisateur admin
router.put(
  "/update-user/:id",
  authMiddleware.authentificate,
  authController.deleteUser
);
// Fonction pour acceder a une route protegee
router.get(
  "/dashboard",
  authMiddleware.authentificate,
  authController.dashboard
);
// Route pour le mot de passe oublie

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
