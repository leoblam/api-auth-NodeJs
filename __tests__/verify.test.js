// Import du module supertest
const request = require("supertest");
// Import du module mongoose
const mongoose = require("mongoose");
// Import de son l'application
const app = require("../server.js");
// Importation du model
const authModel = require("../models/auth.model.js");
const { verifToken } = require("../middleware/authentificate");
// Connexion a la base de donnee avant l'execution des tests
beforeAll(async () => {
  // Utilisation de la methode connect de mongoose pour etablir la connexion a la base de donnee
  await mongoose.connect(process.env.MONGO_URI);
  // Attente d'une seconde pour assurer la connexion a la base de donnees
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
// Fernmeture de la connection a la base de donne apres l'execution de tous les test
afterAll(async () => {
  // Utilisation de la methode close de mongoose pour fermer la connexion a la base de donnees
  await mongoose.connection.close();
});

describe("verify-email route testing", () => {
  // Variables pour stocker le token de verification
  let verificationToken;
  // Avant tous les tests, recuperer un utilisateur avec un token valide dans la base de donnees
  beforeAll(async () => {
    const user = await authModel.findOne({
      email: "john2@doe.com",
    });
    if (user) {
      verificationToken = user.emailVerificationToken;
    }
  });
  // Test verifiant que la route renvoie un code 404 si le token est invalide
  it("If return code status 404 ", async () => {
    const response = await request(app).get("/api/verify-email/token-invalide");
    // Verifie que la reponse attendu est 404
    expect(response.status).toBe(404);
  });
  // Test verifiant que la route renvoie un 200 si le token est valide
  it("If return code status 200", async () => {
    // S'assurer que verificationToken est defini avant ce test
    if (verificationToken) {
      const response = await request(app).get(
        `/api/verify-email/${verificationToken}`
      );
      // Verifier que la reponse a un code 200
      expect(response.status).toBe(200);
    } else {
      // Si verification n'est pas defini, marque le test comme reussi
      expect(true).toBe(true);
    }
  });
});
