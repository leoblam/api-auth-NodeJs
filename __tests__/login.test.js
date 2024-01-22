// Importation de mongoose
const mongoose = require("mongoose");
// importation de supertest
const request = require("supertest");
// importation de l'application
const app = require("../server.js");
// Import JWT
const jwt = require("jsonwebtoken");
// Import bcrypt
const bcrypt = require("bcryptjs");
// Importation du model
const authModel = require("../models/auth.model");

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
// Bloc de test pour la route de connexion
describe("Login route testing", () => {
  // Test spécifique pour vérifier que la route renvoie un jwt en cas de connexion réussie
  it("Should return a token if login succeds", async () => {
    // On suppose que nous avons un utilisateur en base de données
    const existingUser = {
      _id: new mongoose.Types.ObjectId(),
      email: "john2@doe.com",
      // Hachage du mot de passe pour simnuler le stockage en bdd
      password: await bcrypt.hash("qwerty123", 10),
    };
    // Simulation de la methode findOne pour renvoyer l'utilisateur existant lorsqu'elle est appelé
    jest.spyOn(authModel, "findOne").mockResolvedValue(existingUser);
    // Effectuer la requête de connexion a la route /api/login
    const response = await request(app).post("/api/login").send({
      email: "john2@doe.com",
      // Fournir le mot de passe en clair pour la comparaison
      password: "qwerty123",
    });
    // Verifier que la reponse est reussie
    expect(response.status).toBe(200);
    // Vérifier que la réponse contient un token
    expect(response.body).toHaveProperty("token");
    // Décoder le token pour verifier son contenu
    const decodedToken = jwt.verify(
      response.body.token,
      process.env.JWT_SECRET
    );
    // Verifier que le token contient les information attendues
    expect(decodedToken).toHaveProperty("user");
    expect(decodedToken.user).toHaveProperty(
      "id",
      existingUser._id.toHexString()
    );
    expect(decodedToken.user).toHaveProperty("email", existingUser.email);
  });
});
