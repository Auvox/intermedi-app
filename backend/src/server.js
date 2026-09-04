const express = require("express");
const cors = require("cors");
const { buscarTodosOsPacientes } = require("./data/pacientes.js");

const path = require('path');
const patientRoutes = require('./routes/patientRoutes');

const middlewareModulo = require("./middlewares/jsonHandlerUsuarios");
const jsonHandlerUsuarios = middlewareModulo.jsonHandlerUsuarios || middlewareModulo.default || middlewareModulo;

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))
  );

//app.use(jsonHandlerUsuarios);

app.use("/api/auth", authRoutes);
app.use('/api/pacientes', patientRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "API do Intermedi funcionando!"
    });
});

app.get("/api/pacientes", async (req, res) => {
    try {
        const pacientes = await buscarTodosOsPacientes();
        res.status(200).json(pacientes);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar pacientes no banco SQL" });
    }
});

const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
