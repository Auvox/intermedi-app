const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para subir até a pasta 'database' que está na raiz do projeto
const dbPath = path.resolve(__dirname, '../../database/intermedi.sql'); 

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Erro ao realizar a conexão:', err.message);
  } else {
    console.log('Conectado com sucesso ao banco SQL');
  }
});

function buscarTodosOsPacientes() {
  return new Promise((resolve, reject) => {
    const query = "SELECT idPaciente, nomePaciente, emailPaciente, senhaPaciente, telPaciente, dataNascPaciente FROM tbPaciente"; 

    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows); // Retorna as linhas da tabela SQL
    });
  });
}

// exporta a função para ser acessada em outro contexto.
module.exports = { buscarTodosOsPacientes };