CREATE DATABASE INTERMEDI;
--DROP DATABASE INTERMEDI
GO
USE INTERMEDI;
GO

CREATE TABLE tbEndereco (
    idEndereco INT IDENTITY(1,1) PRIMARY KEY,
    logradouroEndereco VARCHAR(150),
    numeroEndereco VARCHAR(20),
    bairroEndereco VARCHAR(100),
    cidadeEndereco VARCHAR(100),
    estadoEndereco VARCHAR(100),
    ufEndereco CHAR(2),
    cepEndereco VARCHAR(10),
    complementoEndereco VARCHAR(150),
	--idFarmacia INT FOREIGN KEY (idFarmacia) REFERENCES idFarmacia(idFarmacia),
	--idEndereco INT FOREIGN KEY (idEndereco) REFERENCES idEndereco(idEndereco)
);

-- DROP TABLE tbEndereco

CREATE TABLE tbFarmacia (
    idFarmacia INT IDENTITY(1,1) PRIMARY KEY,
    nomeFarmacia VARCHAR(150) NOT NULL,
    cnesFarmacia VARCHAR(50),
    -- adicionado aqui:
    senhaFarmacia VARCHAR(255) NOT NULL,
    telFarmacia VARCHAR(20),
    fkIdEndereco INT FOREIGN KEY (fkIdEndereco) REFERENCES tbEndereco(idEndereco)
);

-- DROP TABLE tbFarmacia

CREATE TABLE tbAdmin (
    idAdmin INT IDENTITY(1,1) PRIMARY KEY,
    nomeAdmin VARCHAR(150) NOT NULL,
    emailAdmin VARCHAR(150) NOT NULL UNIQUE,
    senhaAdmin VARCHAR(255) NOT NULL
);

-- DROP TABLE tbAdmin

CREATE TABLE tbFuncionario (
    idFuncionario INT IDENTITY(1,1) PRIMARY KEY,
    nomeFuncionario VARCHAR(150) NOT NULL,
    cpfFuncionario VARCHAR(14) NOT NULL UNIQUE,
    emailFuncionario VARCHAR(150) NOT NULL UNIQUE,
    senhaFuncionario VARCHAR(255) NOT NULL,
    telFuncionario VARCHAR(20),
    cargoFuncionario VARCHAR(100),
    createAtFuncionario DATETIME DEFAULT CURRENT_TIMESTAMP,
    fkIdEndereco INT FOREIGN KEY (fkIdEndereco) REFERENCES tbEndereco(idEndereco),
	fkIdFarmacia INT FOREIGN KEY (fkIdFarmacia) REFERENCES tbFarmacia(idFarmacia)
);

-- DROP TABLE tbFuncionario

CREATE TABLE tbGerente (
    idGerente INT IDENTITY(1,1) PRIMARY KEY,
    nomeGerente VARCHAR(150) NOT NULL,
    emailGerente VARCHAR(150) NOT NULL UNIQUE,
    senhaGerente VARCHAR(255) NOT NULL,
    createdAtGerente DATETIME DEFAULT CURRENT_TIMESTAMP,
    fkIdFuncionario INT FOREIGN KEY (fkIdFuncionario) REFERENCES tbFuncionario(idFuncionario)
);

-- DROP TABLE tbGerente

CREATE TABLE tbCadastroGerenteFarmacia (
    idCadastroGerenteFarmacia INT IDENTITY(1,1) PRIMARY KEY,
    fkIdFarmacia INT FOREIGN KEY (fkIdFarmacia) REFERENCES tbFarmacia(idFarmacia),
	fkIdGerente INT FOREIGN KEY (fkIdGerente) REFERENCES tbGerente(idGerente)
);

-- DROP TABLE tbCadastroGerenteFarmacia

CREATE TABLE tbCategoria (
    idCategoria INT IDENTITY(1,1) PRIMARY KEY,
    nomeCategoria VARCHAR(150) NOT NULL,
    descCategoria TEXT
);

-- DROP TABLE tbCategoria

CREATE TABLE tbCadastroRemedio (
    idRemedio INT IDENTITY(1,1) PRIMARY KEY,
    nomeRemedio VARCHAR(150) NOT NULL,
    descRemedio TEXT,
    dosagemRemedio VARCHAR(100),
    fabricanteRemedio VARCHAR(150),
    createdAtRemedio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fkIdGerente INT FOREIGN KEY (fkIdGerente) REFERENCES tbGerente(idGerente)
);

-- DROP TABLE tbCadastrosRemedio

CREATE TABLE tbEstoque (
    idEstoque INT IDENTITY(1,1) PRIMARY KEY,
    quantEstoque INT NOT NULL,
    dataValidadeEstoque DATE,
    loteEstoque VARCHAR(50),
    fkIdRemedio INT FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio),
    fkIdFarmacia INT FOREIGN KEY (fkIdFarmacia) REFERENCES tbFarmacia(idFarmacia)
);

-- DROP TABLE tbEstoque

CREATE TABLE tbRemedioCategoria (
    idRemedioCategoria INT IDENTITY(1,1) PRIMARY KEY,
    fkIdRemedio INT FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio),
	fkIdCategoria INT FOREIGN KEY (fkIdCategoria) REFERENCES tbCategoria(idCategoria)
);

-- DROP TABLE tbRemedioCategoria

CREATE TABLE tbComposicao (
    idComposicao INT IDENTITY(1,1) PRIMARY KEY,
    quantidadeComposicao DECIMAL(10,2),
    descricaoComposicao TEXT,
    principioAtivoComposicao VARCHAR(150),
    unidadeComposicao VARCHAR(50),
    fkIdRemedio INT FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio)
);

-- DROP TABLE tbComposicao

CREATE TABLE tbPaciente (
    idPaciente INT IDENTITY(1,1) PRIMARY KEY,
    nomePaciente VARCHAR(150) NOT NULL,
    -- alterado aqui:
    emailPaciente VARCHAR(60) NOT NULL,
    senhaPaciente VARCHAR(255) NOT NULL,
    cpfPaciente VARCHAR(14) NOT NULL UNIQUE,
    telPaciente VARCHAR(20),
    dataNascPaciente DATE NOT NULL,
    createdAtPaciente DATETIME DEFAULT CURRENT_TIMESTAMP,
    fkIdEndereco INT FOREIGN KEY (fkIdEndereco) REFERENCES tbEndereco(idEndereco)
);

-- DROP TABLE tbPaciente

CREATE TABLE tbChamado (
    idChamado INT IDENTITY(1,1) PRIMARY KEY,
    tituloChamado VARCHAR(200) NOT NULL,
    descChamado TEXT,
    statusChamado VARCHAR(50),
    prioridadeChamado VARCHAR(50),
    dataAberturaChamado DATETIME DEFAULT CURRENT_TIMESTAMP,
    dataFechamentoChamado DATETIME,
    fkIdRemedio INT FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio),
	fkIdFuncionario INT FOREIGN KEY (fkIdFuncionario) REFERENCES tbFuncionario(idFuncionario),
    fkIdFarmaciaSolicitante INT FOREIGN KEY (fkIdFarmaciaSolicitante) REFERENCES tbFarmacia(idFarmacia)
);

-- DROP TABLE tbChamado

CREATE TABLE tbLog (
    idLog INT IDENTITY(1,1) PRIMARY KEY,
    tabelaAfetadaLog VARCHAR(100),
    tipoOperacaoLog VARCHAR(50),
    descLog TEXT,
    dataLog DATETIME DEFAULT CURRENT_TIMESTAMP,
    fkIdRemedio INT FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio),
	fkIdFuncionario INT FOREIGN KEY (fkIdFuncionario) REFERENCES tbFuncionario(idFuncionario)
);

-- DROP TABLE tbLog

CREATE TABLE tbRedistribuicao (
    idRedistribuicao INT IDENTITY(1,1) PRIMARY KEY,
    quantRedistribuicao INT NOT NULL,
    dataRedistribuicao DATETIME DEFAULT CURRENT_TIMESTAMP,
    solicitacaoRedistribuicao TEXT,
    dataAprovacaoRedistribuicao DATETIME,
    dataEnvioRedistribuicao DATETIME,
    dataRecebimentoRedistribuicao DATETIME,
    statusRedistribuicao VARCHAR(50),
    fkIdChamado INT UNIQUE FOREIGN KEY (fkIdChamado) REFERENCES tbChamado(idChamado),
	fkIdFarmaciaOrigem INT FOREIGN KEY (fkIdFarmaciaOrigem) REFERENCES tbFarmacia(idFarmacia),
	fkIdFarmaciaDestino INT FOREIGN KEY (fkIdFarmaciaDestino) REFERENCES tbFarmacia(idFarmacia),
	fkIdGerente INT FOREIGN KEY (fkIdGerente) REFERENCES tbGerente(idGerente)
);

-- DROP TABLE tbRedistribuicao

-- Inserts...
-- ex: INSERT INTO nomeTabela (idTabela, ...) VALUES ('1',..);

INSERT INTO tbPaciente (nomePaciente, emailPaciente, senhaPaciente, cpfPaciente, telPaciente, dataNascPaciente ) VALUES ('Matheus', 'matheus@email.com', '123456', '12312312322', '12123451234', '2009-01-01');

-- Lista de Selects Básicos de dados gerais da tabela.

SELECT * FROM tbEndereco;
SELECT * FROM tbAdmin;
SELECT * FROM tbFuncionario;
SELECT * FROM tbLog;
SELECT * FROM tbPaciente;
SELECT * FROM tbCategoria;
SELECT * FROM tbComposicao;
SELECT * FROM tbFarmacia;
SELECT * FROM tbEstoque;
SELECT * FROM tbChamado;
SELECT * FROM tbCadastroRemedio;
SELECT * FROM tbCadastroGerenteFarmacia;