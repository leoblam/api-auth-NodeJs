const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/authentificate");
const cloudinaryUpload = require("../middleware/cloudinaryUpload");

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
