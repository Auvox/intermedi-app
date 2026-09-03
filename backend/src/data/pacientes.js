const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbFolder = "C:\\Users\\Respe\\Downloads\\analises-tcc\\app\\intermedi-app\\database";
const sqlPath = path.join(dbFolder, 'intermedi.sql');
const dbPath = path.join(dbFolder, 'intermedi.db');

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

// Inicializa a conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao realizar a conexão:', err.message);
  } else {
    console.log('Conectado com sucesso ao banco SQL real (.db)');
  }
});

// Executa a criação e povoamento inicial
db.serialize(() => {
  // 1. Tabela de Remédios
  db.run(`
    CREATE TABLE IF NOT EXISTS tbCadastroRemedio (
      idRemedio INTEGER PRIMARY KEY AUTOINCREMENT,
      nomeRemedio VARCHAR(150) NOT NULL,
      descRemedio TEXT,
      dosagemRemedio VARCHAR(100),
      fabricanteRemedio VARCHAR(150),
      createdAtRemedio TEXT DEFAULT CURRENT_TIMESTAMP,
      fkIdGerente INTEGER
    )
  `);

  // 2. Tabela de Endereços
  db.run(`
    CREATE TABLE IF NOT EXISTS tbEndereco (
       idEndereco INTEGER PRIMARY KEY AUTOINCREMENT,
       logradouroEndereco VARCHAR(150),
       numeroEndereco VARCHAR(20),
       bairroEndereco VARCHAR(100),
       cidadeEndereco VARCHAR(100),
       ufEndereco CHAR(2),
       cepEndereco VARCHAR(10),
       complementoEndereco VARCHAR(150)
    )
  `);

  // 3. Tabela de Pacientes (Criada após tbEndereco para garantir integridade da FK)
  db.run(`
    CREATE TABLE IF NOT EXISTS tbPaciente (
      idPaciente INTEGER PRIMARY KEY AUTOINCREMENT,
      nomePaciente VARCHAR(150),
      emailPaciente VARCHAR(60),
      senhaPaciente VARCHAR(255),
      cpfPaciente VARCHAR(14) UNIQUE,
      telPaciente VARCHAR(20),
      dataNascPaciente TEXT,
      fkIdEndereco INTEGER,
      fkIdRemedioFrequente INTEGER,
      FOREIGN KEY (fkIdEndereco) REFERENCES tbEndereco(idEndereco),
      FOREIGN KEY (fkIdRemedioFrequente) REFERENCES tbCadastroRemedio(idRemedio)
    )
  `);

  // 4. Povoa a tabela de remédios para testes
  const insertRemedios = `
    INSERT OR IGNORE INTO tbCadastroRemedio (idRemedio, nomeRemedio, descRemedio, dosagemRemedio, fabricanteRemedio) 
    VALUES 
      (1, 'Dipirona Sódica', 'Analgésico e antipirético', '500mg', 'Medley'),
      (2, 'Paracetamol', 'Analgésico e antipirético', '750mg', 'EMS'),
      (3, 'Amoxicilina', 'Antibiótico', '500mg', 'Eurofarma')
  `;
  db.run(insertRemedios);
});

function buscarTodosOsPacientes() {
  return new Promise((resolve, reject) => {
    const query = "SELECT idPaciente, nomePaciente, emailPaciente, senhaPaciente, telPaciente, dataNascPaciente FROM tbPaciente";

    db.all(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function buscarIdRemedioPorNome(nomeRemedio) {
  return new Promise((resolve, reject) => {
    if (!nomeRemedio) return resolve(null);

    const query = "SELECT idRemedio FROM tbCadastroRemedio WHERE LOWER(nomeRemedio) = LOWER(?)";
    db.get(query, [nomeRemedio.trim()], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.idRemedio : null);
    });
  });
}

async function cadastrarPaciente(dados) {
  const fkIdRemedioFrequente = await buscarIdRemedioPorNome(dados.remedioFrequente);

  return new Promise((resolve, reject) => {
    // 1. Cadastra o endereço primeiro
    const queryEndereco = `
      INSERT INTO tbEndereco (
        logradouroEndereco, 
        numeroEndereco, 
        bairroEndereco, 
        cidadeEndereco, 
        ufEndereco, 
        cepEndereco,
        complementoEndereco
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const paramsEndereco = [
      dados.ruaEndereco || null,
      dados.numeroEndereco || null,
      dados.bairroEndereco || null,
      dados.cidadeEndereco || null,
      dados.ufEndereco || null,
      dados.cepEndereco || null,
      dados.complementoEndereco || null
    ];

    db.run(queryEndereco, paramsEndereco, function (err) {
      if (err) return reject(err);

      // Captura o ID do endereço recém-criado
      const fkIdEndereco = this.lastID;

      // 2. Cadastra o paciente com as duas chaves estrangeiras (Endereço e Remédio)
      const queryPaciente = `
        INSERT INTO tbPaciente (
          nomePaciente, 
          cpfPaciente, 
          telPaciente, 
          emailPaciente, 
          senhaPaciente, 
          dataNascPaciente, 
          fkIdEndereco,
          fkIdRemedioFrequente
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const paramsPaciente = [
        dados.nomePaciente,
        dados.cpfPaciente,
        dados.telPaciente || null,
        dados.emailPaciente,
        dados.senhaPaciente,
        dados.dataNascPaciente || '2000-01-01',
        fkIdEndereco,
        fkIdRemedioFrequente
      ];

      db.run(queryPaciente, paramsPaciente, function (err) {
        if (err) {
          reject(err);
        } else {
          // Resolve com ambos os IDs gerados
          resolve({ idPaciente: this.lastID, idEndereco: fkIdEndereco });
        }
      });
    });
  });
}

module.exports = {
  buscarTodosOsPacientes,
  cadastrarPaciente
};