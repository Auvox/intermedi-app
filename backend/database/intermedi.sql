CREATE TABLE IF NOT EXISTS tbEndereco (
    idEndereco INTEGER PRIMARY KEY AUTOINCREMENT,
    logradouroEndereco VARCHAR(150),
    numeroEndereco VARCHAR(20),
    bairroEndereco VARCHAR(100),
    cidadeEndereco VARCHAR(100),
    estadoEndereco VARCHAR(100),
    ufEndereco CHAR(2),
    cepEndereco VARCHAR(10),
    complementoEndereco VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS tbFarmacia (
    idFarmacia INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeFarmacia VARCHAR(150) NOT NULL,
    cnesFarmacia VARCHAR(50),
    senhaFarmacia VARCHAR(255) NOT NULL,
    telFarmacia VARCHAR(20),
    fkIdEndereco INTEGER,
    FOREIGN KEY (fkIdEndereco) REFERENCES tbEndereco(idEndereco)
);

CREATE TABLE IF NOT EXISTS tbAdmin (
    idAdmin INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeAdmin VARCHAR(150) NOT NULL,
    emailAdmin VARCHAR(150) NOT NULL UNIQUE,
    senhaAdmin VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tbFuncionario (
    idFuncionario INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeFuncionario VARCHAR(150) NOT NULL,
    cpfFuncionario VARCHAR(14) NOT NULL UNIQUE,
    emailFuncionario VARCHAR(150) NOT NULL UNIQUE,
    senhaFuncionario VARCHAR(255) NOT NULL,
    telFuncionario VARCHAR(20),
    cargoFuncionario VARCHAR(100),
    createAtFuncionario TEXT DEFAULT CURRENT_TIMESTAMP,
    fkIdEndereco INTEGER,
    fkIdFarmacia INTEGER,
    FOREIGN KEY (fkIdEndereco) REFERENCES tbEndereco(idEndereco),
    FOREIGN KEY (fkIdFarmacia) REFERENCES tbFarmacia(idFarmacia)
);

CREATE TABLE IF NOT EXISTS tbGerente (
    idGerente INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeGerente VARCHAR(150) NOT NULL,
    emailGerente VARCHAR(150) NOT NULL UNIQUE,
    senhaGerente VARCHAR(255) NOT NULL,
    createdAtGerente TEXT DEFAULT CURRENT_TIMESTAMP,
    fkIdFuncionario INTEGER,
    FOREIGN KEY (fkIdFuncionario) REFERENCES tbFuncionario(idFuncionario)
);

CREATE TABLE IF NOT EXISTS tbCadastroGerenteFarmacia (
    idCadastroGerenteFarmacia INTEGER PRIMARY KEY AUTOINCREMENT,
    fkIdFarmacia INTEGER,
    fkIdGerente INTEGER,
    FOREIGN KEY (fkIdFarmacia) REFERENCES tbFarmacia(idFarmacia),
    FOREIGN KEY (fkIdGerente) REFERENCES tbGerente(idGerente)
);

CREATE TABLE IF NOT EXISTS tbCategoria (
    idCategoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeCategoria VARCHAR(150) NOT NULL,
    descCategoria TEXT
);

CREATE TABLE IF NOT EXISTS tbCadastroRemedio (
    idRemedio INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeRemedio VARCHAR(150) NOT NULL,
    descRemedio TEXT,
    dosagemRemedio VARCHAR(100),
    fabricanteRemedio VARCHAR(150),
    createdAtRemedio TEXT DEFAULT CURRENT_TIMESTAMP,
    fkIdGerente INTEGER,
    FOREIGN KEY (fkIdGerente) REFERENCES tbGerente(idGerente)
);

CREATE TABLE IF NOT EXISTS tbEstoque (
    idEstoque INTEGER PRIMARY KEY AUTOINCREMENT,
    quantEstoque INTEGER NOT NULL,
    dataValidadeEstoque TEXT,
    loteEstoque VARCHAR(50),
    fkIdRemedio INTEGER,
    fkIdFarmacia INTEGER,
    FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio),
    FOREIGN KEY (fkIdFarmacia) REFERENCES tbFarmacia(idFarmacia)
);

CREATE TABLE IF NOT EXISTS tbRemedioCategoria (
    idRemedioCategoria INTEGER PRIMARY KEY AUTOINCREMENT,
    fkIdRemedio INTEGER,
    fkIdCategoria INTEGER,
    FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio),
    FOREIGN KEY (fkIdCategoria) REFERENCES tbCategoria(idCategoria)
);

CREATE TABLE IF NOT EXISTS tbComposicao (
    idComposicao INTEGER PRIMARY KEY AUTOINCREMENT,
    quantidadeComposicao DECIMAL(10,2),
    descricaoComposicao TEXT,
    principioAtivoComposicao VARCHAR(150),
    unidadeComposicao VARCHAR(50),
    fkIdRemedio INTEGER,
    FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio)
);

CREATE TABLE IF NOT EXISTS tbPaciente (
    idPaciente INTEGER PRIMARY KEY AUTOINCREMENT,
    nomePaciente VARCHAR(150) NOT NULL,
    emailPaciente VARCHAR(60) NOT NULL,
    senhaPaciente VARCHAR(255) NOT NULL,
    cpfPaciente VARCHAR(14) NOT NULL UNIQUE,
    telPaciente VARCHAR(20),
    dataNascPaciente TEXT NOT NULL,
    fotoPerfilPaciente VARCHAR(500),
    createdAtPaciente TEXT DEFAULT CURRENT_TIMESTAMP,
    fkIdRemedioFrequente INTEGER,
    fkIdEndereco INTEGER,
    FOREIGN KEY (fkIdRemedioFrequente) REFERENCES tbCadastroRemedio(idRemedio),
    FOREIGN KEY (fkIdEndereco) REFERENCES tbEndereco(idEndereco)
);

CREATE TABLE IF NOT EXISTS tbChamado (
    idChamado INTEGER PRIMARY KEY AUTOINCREMENT,
    tituloChamado VARCHAR(200) NOT NULL,
    descChamado TEXT,
    statusChamado VARCHAR(50),
    prioridadeChamado VARCHAR(50),
    dataAberturaChamado TEXT DEFAULT CURRENT_TIMESTAMP,
    dataFechamentoChamado TEXT,
    fkIdRemedio INTEGER,
    fkIdFuncionario INTEGER,
    fkIdFarmaciaSolicitante INTEGER,
    FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio),
    FOREIGN KEY (fkIdFuncionario) REFERENCES tbFuncionario(idFuncionario),
    FOREIGN KEY (fkIdFarmaciaSolicitante) REFERENCES tbFarmacia(idFarmacia)
);

CREATE TABLE IF NOT EXISTS tbLog (
    idLog INTEGER PRIMARY KEY AUTOINCREMENT,
    tabelaAfetadaLog VARCHAR(100),
    tipoOperacaoLog VARCHAR(50),
    descLog TEXT,
    dataLog TEXT DEFAULT CURRENT_TIMESTAMP,
    fkIdRemedio INTEGER,
    fkIdFuncionario INTEGER,
    FOREIGN KEY (fkIdRemedio) REFERENCES tbCadastroRemedio(idRemedio),
    FOREIGN KEY (fkIdFuncionario) REFERENCES tbFuncionario(idFuncionario)
);

CREATE TABLE IF NOT EXISTS tbRedistribuicao (
    idRedistribuicao INTEGER PRIMARY KEY AUTOINCREMENT,
    quantRedistribuicao INTEGER NOT NULL,
    dataRedistribuicao TEXT DEFAULT CURRENT_TIMESTAMP,
    solicitacaoRedistribuicao TEXT,
    dataAprovacaoRedistribuicao TEXT,
    dataEnvioRedistribuicao TEXT,
    dataRecebimentoRedistribuicao TEXT,
    statusRedistribuicao VARCHAR(50),
    fkIdChamado INTEGER UNIQUE,
    fkIdFarmaciaOrigem INTEGER,
    fkIdFarmaciaDestino INTEGER,
    fkIdGerente INTEGER,
    FOREIGN KEY (fkIdChamado) REFERENCES tbChamado(idChamado),
    FOREIGN KEY (fkIdFarmaciaOrigem) REFERENCES tbFarmacia(idFarmacia),
    FOREIGN KEY (fkIdFarmaciaDestino) REFERENCES tbFarmacia(idFarmacia),
    FOREIGN KEY (fkIdGerente) REFERENCES tbGerente(idGerente)
);
