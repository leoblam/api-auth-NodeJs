// Import du module supertest
const request = require("supertest");
// Import du module mongoose
const mongoose = require("mongoose");
// Import de son l'application
const app = require("../server.js");
// Import de path
const path = require("path");
// Connection a la base de donnees avant l'execution des tests
beforeAll(async () => {
  // Utilisation de la methode connect de mongoose pour etablir la connexion a la base de donnee
  await mongoose.connect(process.env.MONGO_URI);
  // Attente d'une seconde pour assurer la connexion a la base de donnees
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
// Fermeture de la connection a la base de donnes apres l'execuition des tests
afterAll(async () => {
  // Utilisation de la methode close de mongoose pour fermer la connexion a la base de donnees
  await mongoose.connection.close();
});
// Bloc de test pour la route d'inscriptions
describe("Register route testing", () => {
  // Test specifique pour la creation d'un utilisateur
  it("Should return 201 if the new user is create ", async () => {
    // Utilisation de supertest pour envoyer une requete
    const response = await request(app)
      .post("/api/register")
      // Remplissage du champs du formulaire
      .field("lastname", "Doe")
      .field("firstname", "John")
      .field("birthday", "23/01/1995")
      .field("address", "9 Rue des ecoles")
      .field("zipcode", "60200")
      .field("city", "Compiegne")
      .field("phone", "0606060606")
      .field("email", "john102@doe.com")
      .field("password", "qwerty123")
      // Attache un fichier a la requete (exemple image)
      .attach("image", path.resolve(__dirname, "../images/cat.png"));
    // Affichage de la reponse recue dans la console
    console.log("Response received", response.body);
    // Assertion verifiant que le status de la reponse est 201
    expect(response.status).toBe(201);
    // Assertion verifiant que la propriete message contient le message attendu
    expect(response.body).toHaveProperty(
      "message",
      "Utilisateur crée avec succès ! Merci de bien cliquer sur le lien envoye sur votre mail verifier votre compte !"
    );
  });
});
