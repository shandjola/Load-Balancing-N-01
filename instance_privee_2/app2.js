const express = require('express');
const path = require('path');

const app = express();
const port = 5001;
const serverIP = '172.16.10.208'; //Mettre ici l'adresse IP public de l'instance privée concernée

// Servir le fichier index.html
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(port, () => {
console.log(`Serveur 3 privé, port: ${port}, IP: ${serverIP}`);
});