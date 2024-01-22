const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authentificate");
const cloudinaryUpload = require("../middleware/cloudinaryUpload");

// // Route pour l'upload
// router.post("/api/upload", cloudinaryUpload, authController.upload);
// Route pour l'inscription
router.post("/api/register", cloudinaryUpload, authController.register);
// Route pour verifier l'email
router.get("/api/verify-email/:token", authController.verifyEmail);
// Route pour envoyer l'email de reinitialisation de mot de passe
router.post("/api/forgot-password", authController.forgotPassword);
// Route pour reinitialiser le mdp
router.put("/api/update-password/:token", authController.updatePassword);
// Route pour connection
router.post("/api/login", authController.login);

// Route pour la modification du profil
router.put(
  "/api/update/:id",
  cloudinaryUpload,
  authMiddleware.verifToken,
  authController.update
);
// Route pour supprimer son compte utilisateur
router.delete(
  "/api/delete/:id",
  authMiddleware.verifToken,
  authController.delete
);
// Route pour voir son profil utilisateur
router.get("/api/profil/:id", authMiddleware.verifToken, authController.profil);

// Route pour recuperer tous les utilisateurs
router.get(
  "/api/all-users",
  authMiddleware.authentificate,
  authController.getAllUsers
);
// Route pour recuperer un utilisateur via son id admin
router.get(
  "/api/user/:id",
  authMiddleware.authentificate,
  authController.getUser
);
// Route pour modifier le profil d'un utilisateur admin
router.get(
  "/api/update-user/:id",
  authMiddleware.authentificate,
  cloudinaryUpload,
  authController.updateUser
);
// Route pour supprimer un utilisateur admin
router.delete(
  "/api/delete-user/:id",
  authMiddleware.authentificate,
  authController.deleteUser
);

// Route pour modifier un utilisateur admin
router.put(
  "/api/update-user/:id",
  authMiddleware.authentificate,
  authController.deleteUser
);
// Fonction pour acceder a une route protegee
router.get(
  "/api/dashboard",
  authMiddleware.authentificate,
  authController.dashboard
);

module.exports = router;
