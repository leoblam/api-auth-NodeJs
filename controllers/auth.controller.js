// Import du modele d'authentification
const authModel = require("../models/auth.model");

// Import de la validation des donnees
const { validationResult } = require("express-validator");

// Import du modele de hashage bcrypt
const bcrypt = require("bcryptjs");

// Import du module jwt pour les tokens
const jwt = require("jsonwebtoken");

// Import du module cloudinary pour la gestion d'image
const cloudinary = require("cloudinary").v2;

// Import du module cloudinary pour la gestion d'image
const crypto = require("crypto");

// Import du module cloudinary pour la gestion d'image
const nodemailer = require("nodemailer");
const { reset } = require("nodemon");
// Declaration de la variable de nodemailer
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Declaration de variable pour generer un token avec crypto
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
// Declaration de variable pour generer un token password avec crypto
const generateVerificationTokenPassword = () => {
  return crypto.randomBytes(32).toString("hex");
};
// Fonction de verication email
const sendVerificationEmail = async (to, verificationToken) => {
  // Variable qui va contenir le lien de verification
  const verificationLink = `http://localhost:5000/verify?token=${verificationToken}`;
  const mailOptions = {
    from: "from@test.com",
    to,
    subject: "Mail de verification de compte de notre site",
    text: `Merci de verifier votre Email en cliquant sur ce <a href=${verificationLink}>lien</a><br> Votre token : ${verificationToken}
    <br>Ce lien expirera dans 24 heure et supprimera votre compte par la meme occasion.
    <br>Si le lien ne marche pas cliquez sur celui ci <a href=${verificationLink}>${verificationLink}</a>`,
    html: `<p>Merci de verifier votre Email en cliquant sur ce <a href=${verificationLink}>lien</a><br> Votre token : ${verificationToken}
    <br>Ce lien expirera dans 24 heure et supprimera votre compte par la meme occasion.
    <br>Si le lien ne marche pas cliquez sur celui ci <a href=${verificationLink}>${verificationLink}</a></p>`,
  };
  await transporter.sendMail(mailOptions);
};
// Fonction de verification pour reinitialisation du mot de passe
const sendResetPassword = async (to, resetPasswordToken) => {
  // Variable qui va contenir le lien de reinitialisation
  const resetPasswordLink = `http://localhost:5000/verify?token=${resetPasswordToken}`;
  const mailOptions = {
    from: "from@test.com",
    to,
    subject: "Reinitialisation de votre mot de passe",
    text: `Merci de cliquer sur ce <a href=${resetPasswordLink}>lien</a>, pour reinitialiser votre mot de passe<br> Votre token : ${resetPasswordToken}
    <br>Ce lien expirera dans 24 heures, si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message.
    <br>Si le lien ne fonctionne pas, cliquez sur celui-ci <a href=${resetPasswordLink}>${resetPasswordLink}</a>`,
    html: `<p>Merci de cliquer sur ce <a href=${resetPasswordLink}>lien</a>, pour reinitialiser votre mot de passe<br> Votre token : ${resetPasswordToken}
    <br>Ce lien expirera dans 24 heures, si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message.
    <br>Si le lien ne fonctionne pas, cliquez sur celui-ci <a href=${resetPasswordLink}>${resetPasswordLink}</a></p>`,
  };
  await transporter.sendMail(mailOptions);
};
// Fonction pour l'inscription
module.exports.register = async (req, res) => {
  // Validation des données d'entrée
  try {
    // Recupération des erreurs de validations
    const errors = validationResult(req);
    // Vérification si il y a des erreurs de validation
    if (!errors.isEmpty()) {
      // Renvoi des erreurs de validation
      return res.status(400).json({ errors: errors.array() });
    }
    // Récupération des données du formulaire
    const {
      lastname,
      firstname,
      birthday,
      address,
      zipcode,
      city,
      phone,
      email,
      password,
    } = req.body;

    // Vérifier si une image est téléchargée
    if (!req.cloudinaryUrl || !req.file) {
      return res
        .status(400)
        .json({ message: "Veuillez télécharger une image" });
    }

    // Vérification de l'email si il existe deja dans la base de données
    const existingAuth = await authModel.findOne({ email });
    // Renvoie une erreur si l'email existe deja
    if (existingAuth) {
      if (req.file && req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(400).json({
        message:
          "Votre email existe deja en base de données. Veuillez en choisir un autre",
      });
    }

    // Utilisation de l'url cloudinary et du public_id provenant du middleware
    const avatarUrl = req.cloudinaryUrl;
    const avatarPublicId = req.file.public_id;
    // Création d'un nouvel utilisateur
    const auth = await authModel.create({
      lastname,
      firstname,
      birthday,
      address,
      zipcode,
      city,
      phone,
      email,
      password,
      avatarUrl,
      avatarPublicId,
    });
    // Generation de la verification de token securise
    const verificationToken = generateVerificationToken();
    // Associer a l'utilisateur et sauvegarder le token en base de donnee
    auth.emailVerificationToken = verificationToken;
    // Definition de l'heure d'expiration du token
    auth.emailVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    await auth.save();

    // Envoyer la verification d'email
    await sendVerificationEmail(auth.email, verificationToken);

    // Renvoie une reponse positive si l'utilisateur est bien enregistré
    const userMail = auth.email;
    res.status(201).json({
      message:
        "Utilisateur crée avec succès ! Merci de bien cliquer sur le lien envoye sur votre mail verifier votre compte !",
    });
  } catch (err) {
    // Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
    console.error(err);
    // Supprimer l'image télécharger si elle existe
    if (req.file && req.file.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id);
    }
    return res.status(500).json({
      message: "Erreur lors de l'enregistrement de l'utilisateur",
    });
  }
};

// Fonction pour la vérification email
module.exports.verifyEmail = async (req, res) => {
  try {
    // Récupération du token pour le mettre en paramètre d'url
    const { token } = req.params;

    // Trouver l'utilisateur avec le token associé
    const user = await authModel.findOne({ emailVerificationToken: token });

    if (!user) {
      console.log("Token reçu :", token);

      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si le token n'a pas expiré
    if (
      user.emailVerificationTokenExpires &&
      user.emailVerificationTokenExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Le token à expiré" });
    }

    // Mettre à jour isEmailVerified à true et sauvegarder
    user.isEmailVerified = true;
    // Effacer le token après vérification
    user.emailVerificationToken = undefined;
    // Effacer la date d'expiration
    user.emailVerificationTokenExpires = undefined;
    // Sauvegarder
    await user.save();

    // Message de réussite
    res.status(200).json({ message: "Email verifié avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la verification de l'email : ",
      error.message
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la vérification de l'email" });
  }
};

// Fonction pour la demande de reinitialisation de mot de passe par email
module.exports.forgotPassword = async (req, res) => {
  try {
    // Variable de l'email que l"on va devoir enter dans postman pour recevoir l'email
    const { email } = req.body;
    // Rechercher l'utilisateur par email
    const user = await authModel.findOne({ email });
    // Condition si aucun utilisateur est trouve en bdd
    if (!user) {
      return res
        .status(400)
        .json({ message: "Aucun compte n'est associe a cet email." });
    }
    // generer un token de reinitialisation de mdp securise
    const resetPasswordToken = generateVerificationTokenPassword();
    // generer un token de reinitialisation
    user.resetPasswordToken = resetPasswordToken;
    // generer une date au token d'expiration
    user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    //Envoyer un email avec le lien de reinitialisation de mot de passe
    await sendResetPassword(user.email, resetPasswordToken);
    // Message de reussite
    res.status(200).json({
      message: `Si l'email est lie a un compte de notre boutique un mail vous a ete envoye`,
    });
  } catch (err) {
    console.error(
      "Erreur lors de la reinitialisation du mot de passe : ",
      err.message
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la reinitialisation du mot de passe." });
  }
};

// Fonction pour la reinitialisation
module.exports.updatePassword = async (req, res) => {
  try {
    // Recuperation du otkken pour le mettre en params url
    const { token } = req.params;
    // Ajout de deux nouveaux champs dans la requete
    const { newPassword, confirmNewPassword } = req.body;
    //Verifier si les champs de mot de passe correspondent
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: "Les mots de passe entres ne correspondent pas",
      });
    }
    // trouver l"utilisateur par le token de reinitialisation de mot de passe
    const user = await authModel.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });
    // Verifier si le token est valide
    if (!user) {
      return res.status(400).json({
        message: "Token de reinitialisation invalide ou expire.",
      });
    }
    // Mettre a jour le mdp
    user.password = newPassword;
    // detruire le token et l"expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    // Enregister les modifications
    await user.save();
    // Envoyer reponse de succes
    res.status(200).json({
      message: `Mot de passe reinitialiser avec succes`,
    });
  } catch (err) {
    console.error("Erreur lors de la reinitialisation du mot de passe. :", err);
    return res.status(500).json({
      message: "Erreur lors de la reinitialisation du mot de passe.",
    });
  }
};
// Fonction pour la connexion
module.exports.login = async (req, res) => {
  try {
    // Recuperation des erreurs de validations
    const errors = validationResult(req);
    // Verification si il y a des erreurs de validation
    if (!errors.isEmpty()) {
      // Renvoie des erreurs de validation
      return res.status(400).json({ errors: errors.array() });
    }
    // Recuperation des donnees du formulaire
    const { email, password } = req.body;

    // Verification si l'utilisateur existe deja dans la base de donnees
    const user = await authModel.findOne({ email });
    // Si l'utilisateur n'existe pas, renvoie une erreur

    if (!user) {
      console.log("Utilisateur non trouve.");
      return res.status(400).json({
        message: "Email invalide",
      });
    }
    // Verification du mot de passe
    const isPasswordValid = await bcrypt.compare(
      password, // mdp entre par l'utilisateur
      user.password // mdp hache en bdd
    );
    // Si le mot de passe est incorrect, renvoie une erreur
    if (!isPasswordValid) {
      console.log("Mot de passe incorrect");
      return res.status(400).json({
        message: "Mot de passe incorrect",
      });
    }
    // Renvoie d'un message de succes
    console.log("Vous etes bien connecte");
    // Creation du token jwt
    const payload = {
      user: {
        id: user._id,
        email: user.email,
      },
    };
    // Definition de la variable pour le token
    const secretKey = process.env.JWT_SECRET;
    // Definition de la date d'expiration du token
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    // Renvoie un message de reussite et le token
    res.status(200).json({ message: "Connexion reussi !", token });
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la connexion de l'utilisateur
    console.error("Erreur lors de la connextion", error.message);
    return res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Fonctipon pour la modification du profil
module.exports.update = async (req, res) => {
  try {
    // Recuperation des erreurs de validations
    const errors = validationResult(req);
    // Verification si il y a des erreurs de validations
    if (!errors.isEmpty()) {
      // Renvoi des erreurs de validation
      return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.params.id;
    // Recuperation des donnees du formulaire
    const {
      lastname,
      firstname,
      birthday,
      address,
      zipcode,
      city,
      phone,
      email,
      newPassword,
    } = req.body;
    // Verifier si l'utilisateur existe avant la mise a jour
    const existingUser = await authModel.findById(userId);
    // Condition si lutilisateur n'existe pas en bdd
    if (!existingUser) {
      console.error("Erreur utilisateur non trouve.");
      return res
        .status(404)
        .json({ message: "Erreur utilisateur non trouve." });
    }

    // Verifier si une nouvelle image est telecharge et mettre a jour le chemin de l'image
    if (req.file) {
      // Suprimmer l'ancien avatar si il y en a une
      if (existingUser.avatarPublicId) {
        await cloudinary.uploader.destroy(existingUser.avatarPublicId);
      }
      // // Affecte un nouveau chemin et un nouvel ID a la nouvelle image
      existingUser.avatarUrl = req.cloudinaryUrl;
      existingUser.avatarPublicId = req.file.public_id;

      existingUser.lastname = lastname;
      existingUser.firstname = firstname;
      existingUser.birthday = birthday;
      existingUser.address = address;
      existingUser.zipcode = zipcode;
      existingUser.city = city;
      existingUser.phone = phone;
      // Mettre a jour l'email uniquement si fourni dans la requete
      if (email) {
        existingUser.email = email;
      }
      // Mettre a jour le mot de passe uniquement si fourni dans la requête
      if (newPassword) {
        existingUser.password = newPassword;
      }
      // Sauvegarder les modifications
      await existingUser.save();
      // Log de reussite
      console.log("Profil mis a jour avec succes.");
      return res.status(200).json({
        message: "Profil mis a jour avec succes.",
        user: existingUser,
      });
    }
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la mise a jour du profil.
    console.error("Erreur lors de la mise a jour du profil.", error.message);
    // Supprimer l'image telechargee si elle existe
    if (req.file && req.file.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id);
    }
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise a jour du profil." });
  }
};

// Fonction pour supprimer un utilisateur.
module.exports.delete = async (req, res) => {
  try {
    // Declaration de la de la variable qui va rechercher l'id utilisateur pour le mettre en params url
    const userId = req.params.id;
    const existingUser = await authModel.findById(userId);
    // Condition si l'utilisateur n'existe pas
    if (!existingUser) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    if (existingUser.avatarPublicId) {
      await cloudinary.uploader.destroy(existingUser.avatarPublicId);
    }
    // Supression de l'utilisateur
    await authModel.findByIdAndDelete(userId);
    console.log("Utilisateur supprime avec succes", userId);
    return res
      .status(200)
      .json({ message: "Utilisateur supprime avec succes" });
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la mise a jour du profil.
    console.error("Erreur lors de la suppression du profil.", error.message);
    return res
      .status(500)
      .json({ message: "Erreur lors de la suppression du profil." });
  }
};

// Fonction pour recuperer tous les utilisateurs
module.exports.getAllUsers = async (req, res) => {
  try {
    // Verifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      //retour d'un message d'erreur
      return res.status(403).json({
        message:
          "Afficher tous les utilisateurs est une action reservee aux administrateurs",
      });
    }
    // Recuperation de tous les utilisateurs
    const user = await authModel.find();
    // Reponse de succes
    res.status(200).json({ message: "liste des utilisateurs", user });
  } catch (error) {
    console.error(
      "Erreur lors de la recuperation des utilisateurs :",
      error.message
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la recuperation des utilisateurs" });
  }
};

// Fonction pour recuperer utilisateur via son ID
module.exports.getUser = async (req, res) => {
  try {
    // Verifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      //retour d'un message d'erreur
      return res.status(403).json({
        message:
          "Afficher un utilisateur via son ID est une action reservee aux administrateurs",
      });
    }
    // Declaration de la variable qui va recherche l'id de l'utilisateur
    const userId = req.params.id;
    // Recuperation de tous les utilisateurs
    const user = await authModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    // Reponse de succes
    res.status(200).json({ message: "Utilisateur :", userId, user });
    console.log("Utilisateur :", userId);
  } catch (error) {
    console.error(
      "Erreur lors de la recuperation de l'utilisateurs :",
      error.message
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la recuperation des utilisateurs" });
  }
};

// Fonction pour recuperer son profil
module.exports.profil = async (req, res) => {
  try {
    // Declaration de la variable qui va recherche l'id de l'utilisateur
    const userId = req.params.id;
    // Recuperation de tous les utilisateurs
    const user = await authModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouve" });
    }
    // Reponse de succes
    res.status(200).json({
      message: `Profil :`,
      user,
    });
    console.log(`Bonjour,  ${user.firstname}, voici votre profil :
    Nom de famille :  ${user.lastname}
    Prenom :  ${user.firstname}
    Date de naissance :  ${user.birthday}
    Adresse :  ${user.address}, ${user.zipcode}, ${user.city}
    Numero de telephone :  ${user.phone}
    Email :  ${user.email}
    Mot de passe :  ${user.password}`);
  } catch (error) {
    console.error(
      "Erreur lors de la recuperation de l'utilisateurs :",
      error.message
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la recuperation des utilisateurs" });
  }
};
// fonction dashboard
module.exports.dashboard = async (req, res) => {
  try {
    // Verifier si l'utilisateur est un admin
    if (req.user.role === "admin") {
      // Definition de req.isAdmin sera egal a true pour les admins
      req.isAdmin = true;
      // Envoyer une réponse de succès
      const user = req.user.firstname;
      return res.status(200).json({ message: "Bienvenue Admin", user });
    } else {
      // Envoyer une réponse pour les utilisateurs non admin
      const user = req.user.firstname;
      return res.status(403).json({
        message:
          "Action non autorisée, seuls les admin peuvent acceder à cette page",
        user,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Fonction pour supprimer un utilisateur admin
module.exports.deleteUser = async (req, res) => {
  try {
    // Verifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      // Retour d'un message d'erreur
      return res.status(403).json({
        message: "Action non autorisée. Seul un admin peut supprimer un profil",
      });
    }
    // Déclaration de la variable qui va rechercher l'id utilisateur pour le mettre en params url
    const userId = req.params.id;

    // Déclaration de variable qui va vérifier si l'utilisateur existe
    const existingUser = await authModel.findById(userId);

    // Suppresion de l'avatar de cloudinary si celui ci existe
    if (existingUser.avatarPublicId) {
      await cloudinary.uploader.destroy(existingUser.avatarPublicId);
    }

    // Supprimer l'utilisateur de la base de données
    await authModel.findByIdAndDelete(userId);

    // Message de réussite

    console.log("Utilisateur supprimé avec succès");
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error(error);
    console.log("Erreur lors de la suppression de l'utilisateur");
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
};

// Fonction pour modifier un utilisateur via admin
module.exports.updateUser = async (req, res) => {
  try {
    // Verifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
      // Retour d'un message d'erreur
      return res.status(403).json({
        message: "Action non autorisée. Seul un admin peut modifier un profil",
      });
    }
    // Recuperation des erreurs de validations
    const errors = validationResult(req);
    // Verification si il y a des erreurs de validations
    if (!errors.isEmpty()) {
      // Renvoi des erreurs de validation
      return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.params.id;
    // Recuperation des donnees du formulaire
    const {
      lastname,
      firstname,
      birthday,
      address,
      zipcode,
      city,
      phone,
      email,
    } = req.body;
    // Verifier si l'utilisateur existe avant la mise a jour
    const existingUser = await authModel.findById(userId);
    // Condition si lutilisateur n'existe pas en bdd
    if (!existingUser) {
      console.error("Erreur utilisateur non trouve.");
      return res
        .status(404)
        .json({ message: "Erreur utilisateur non trouve." });
    }

    // Verifier si une nouvelle image est telecharge et mettre a jour le chemin de l'image
    if (req.file) {
      // Suprimmer l'ancien avatar si il y en a une
      if (existingUser.avatarPublicId) {
        await cloudinary.uploader.destroy(existingUser.avatarPublicId);
      }
      // // Affecte un nouveau chemin et un nouvel ID a la nouvelle image
      existingUser.avatarUrl = req.cloudinaryUrl;
      existingUser.avatarPublicId = req.file.public_id;

      existingUser.lastname = lastname;
      existingUser.firstname = firstname;
      existingUser.birthday = birthday;
      existingUser.address = address;
      existingUser.zipcode = zipcode;
      existingUser.city = city;
      existingUser.phone = phone;
      // Mettre a jour l'email uniquement si fourni dans la requete
      if (email) {
        existingUser.email = email;
      }
      // Sauvegarder les modifications
      await existingUser.save();
      // Log de reussite
      console.log("Profil mis a jour avec succes.");
      return res.status(200).json({
        message: "Profil mis a jour avec succes.",
        user: existingUser,
      });
    }
  } catch (error) {
    // Renvoie une erreur si il y a un probleme lors de la mise a jour du profil.
    console.error("Erreur lors de la mise a jour du profil.", error.message);
    // Supprimer l'image telechargee si elle existe
    if (req.file && req.file.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id);
    }
    return res
      .status(500)
      .json({ message: "Erreur lors de la mise a jour du profil." });
  }
};
