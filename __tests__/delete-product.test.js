// Import du module mongoose
const mongoose = require("mongoose");
// Import du module superTest
const request = require("supertest");
// Import de l'application
const app = require("../server");
// Import de jwt
const jwt = require("jsonwebtoken");
// Import model
const productModel = require("../models/product.model");

// Fonction utilitaire pour generer un token d'authentification
function generateAuthToken(userId) {
  const secretKey = process.env.JWT_SECRET;
  const expiresIn = "1h";

  // Utilisation de la bibliothèque jwt pour générer le token
  return jwt.sign({ user: { id: userId } }, secretKey, { expiresIn });
}

// Connexion à la base de données avant l'execution des tests
beforeAll(async () => {
  // Utilisation de la méthode connect de mongoose
  await mongoose.connect(process.env.MONGO_URI);
  // Attente d'une seconde pour assurer la connection à la base de données
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après execution des test
afterAll(async () => {
  // Utilisation de la methode close de moongose pour fermer la connexion
  await mongoose.connection.close();
});

// Bloc de test pour récuperer tout les utilisateurs
describe("Delete User API", () => {
  it("Should allow deleting user profil for admin", async () => {
    // Id de l'utilisateur admin dans la base de données
    const adminUserId = "65b1119e9d2129adc4b7f8bd";

    // Id de l"user a vérifier
    const productIdToDelete = "65b11c50cfad91457a91b5f7";

    const authToken = generateAuthToken(adminUserId);

    // Faire la demande pour recuperer tout les users
    const response = await request(app)
      .delete(`/api/delete-product/${productIdToDelete}`)
      .set("Authorization", `Bearer ${authToken}`);

    // Log de la réponse
    console.log(response.body);

    // S'assurer que la demande est réussie
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Produit supprime avec succes"
    );

    // S'assurer que les information de l'utilisateur ont bien été mis à jour !
    const deleteProduct = await productModel.findById(productIdToDelete);
    expect(deleteProduct).toBeNull();
  });
});
