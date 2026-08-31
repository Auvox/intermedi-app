const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminhos absolutos do arquivo baseados na pasta backend (Descomentado e corrigido)
const dbFolder = "C:\\Users\\Respe\\Downloads\\analises-tcc\\app\\intermedi-app\\database";

// Acessa o arquivo .SQL de texto puro
const sqlPath = path.join(dbFolder, 'intermedi.sql');

// Cria o caminho para o NOVO arquivo binário (.db) que o SQLite precisa
const dbPath = path.join(dbFolder, 'intermedi.db'); 

// Cria a pasta database se ela não existir.
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

// CORREÇÃO 1: Mudamos para carregar o SQL sempre que o arquivo .db estiver vazio ou não existir
const bancoEstaVazio = !fs.existsSync(dbPath) || (fs.existsSync(dbPath) && fs.statSync(dbPath).size === 0);

if (bancoEstaVazio && fs.existsSync(sqlPath)) {
  console.log('Criando ou restaurando banco de dados binário a partir do script SQL...');
  
  // Lê o arquivo que está localizado na variavel sqlPath.
  const sqlScript = fs.readFileSync(sqlPath, 'utf8');
  
  // Cria o banco físico no dbPath (.db)
  const tempDb = new sqlite3.Database(dbPath);
  tempDb.serialize(() => {
    tempDb.exec(sqlScript, (err) => {
      if (err) {
        console.error('Erro ao tentar criar tabelas:', err.message);
      }
      else{
        console.log('✅ Banco do intermedi.db foi estruturado com sucesso!');
      } 
      tempDb.close();
    });
  });
}

// Abre a conexão com o banco de dados binário (.db) correto
const db = new sqlite3.Database(dbPath, (err) => { 
  if (err) {
    console.error('Erro ao realizar a conexão:', err.message);
  } else {
    console.log('Conectado com sucesso ao banco SQL real (.db)');
  }
});

// CORREÇÃO 2: Criamos a tabela caso o script .sql tenha falhado por caminhos, garantindo que ela exista para o INSERT
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tbPaciente (
      idPaciente INTEGER PRIMARY KEY AUTOINCREMENT,
      nomePaciente TEXT,
      emailPaciente TEXT,
      senhaPaciente TEXT,
      telPaciente TEXT,
      dataNascPaciente TEXT
    )
  `, () => {
    // Só tenta rodar o INSERT após garantir que a tabela tbPaciente existe fisicamente
    db.run(`
      INSERT INTO tbPaciente (nomePaciente, emailPaciente, senhaPaciente) 
      VALUES ('Matheus', 'matheus@email.com', '123456')
    `, (err) => {
      if (err) console.log('💡 Usuário já cadastrado ou tabela estruturada.');
      else console.log('👤 Usuário de teste criado com sucesso: matheus@email.com / 123456');
    });
  });
});

function buscarTodosOsPacientes() {
  return new Promise((resolve, reject) => {
    const query = "SELECT idPaciente, nomePaciente, emailPaciente, senhaPaciente, telPaciente, dataNascPaciente FROM tbPaciente"; 

    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows || []); // Retorna as linhas da tabela SQL ou uma lista vazia para não quebrar o .find()
    });
  });
}

// exporta a função para ser acessada em outro contexto.
module.exports = { buscarTodosOsPacientes };
