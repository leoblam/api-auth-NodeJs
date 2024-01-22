// Importation du module mongoose
const mongoose = require("mongoose");
// Chargement des variables d'environement
require("dotenv").config();
// Connexion a la base de donnee avant l'execution de tous les tests
beforeAll(async () => {
  // Utilisation de la methode connect de mongoose pour etablir la connexion a la base de donnee
  await mongoose.connect(process.env.MONGO_URI);
});
// Fernmeture de la concction a la base de donne apres l'execution de tous les test
afterAll(async () => {
  // Utilisation de la methode close de mongoose pour fermer la connexion a la base de donnees
  await mongoose.connection.close();
});
// Test verifiant que la connection a la base de donnees est bien etablie
test("Should connect to the database", async () => {
  // La propriete readyState de l'objet mongoose.connection est evalue a 1 lorsque la connection sera etablie
  const isConnected = mongoose.connection.readyState === 1;
  // Assertion verifiant que la connexion a la base de donnees\
  expect(isConnected).toBeTruthy();
});
