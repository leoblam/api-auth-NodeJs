// Chargement des variables d'environement
require("dotenv").config();

// Import des modules necessaires
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import de routes pour l'authentification
const authRoutes = require("./routes/auth.route");

//Import des routes pour la creation de produit
const productRoutes = require("./routes/product.route");

// Import de la configuraton de la base de donnees
const connectDB = require("./config/db");

// Import de Cloudinary
const cloudinary = require("cloudinary").v2;

// Initialisation de l'application Express
const app = express();

// Middleware pour traiter les requetes JSON
app.use(express.json());

// Middlware pour parser les corps de requetes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utilisation des routes pour l'authentification
app.use("/api", authRoutes);

// Utilisation des routes pour la creation des produits
app.use("/api", productRoutes);

// Configuration de cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Configuration des options cors
const corsOptions = {
  credentials: true,
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  prefLightContinue: false,
};
// Middleware pour gerer les cors
app.use(cors(corsOptions));

// Definition du port de demarrage du serveur
const PORT = process.env.PORT || 5200;

// Fonction pour demarrer le serveur
const start = async () => {
  try {
    // Connexion a la base de donnees
    await connectDB();
    // Demarrage du serveur sur le port specifie
    app.listen(PORT, () =>
      console.log(`Le serveur a demarre sur le port ${PORT}`)
    );
  } catch {
    console.log("error");
  }
};
// Appel de la fonction pour demarrer le serveur
start();
