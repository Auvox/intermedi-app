const express = require("express");
// 1. Importação corrigida com as chaves { }
const { buscarTodosOsPacientes } = require("../data/pacientes");

const router = express.Router();

// 2. Adicionado o "async" antes da função da rota
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        // 3. Busca a lista de pacientes do banco SQLite com "await"
        const listaPacientes = await buscarTodosOsPacientes();

        // 4. Procura o usuário testando tanto os nomes curtos quanto os nomes do SQLite
        const user = listaPacientes.find(
            (user) => (user.emailPaciente === email || user.email === email) && 
                      (user.senhaPaciente === senha || user.senha === senha)
        );

        if (!user) {
            return res.status(401).json({
                message: "Incorreto"
            });
        }

        // 5. Mapeia os dados dinamicamente baseado nos campos que o SQLite retornar
        res.json({
            message: "Nice",
            user: {
                id: user.idPaciente || user.id,
                nome: user.nomePaciente || user.nome,
                email: user.emailPaciente || user.email
            }
        });

    } catch (error) {
        console.error("Erro interno no login:", error);
        res.status(500).json({ message: "Erro interno no servidor ao autenticar" });
    }
});

module.exports = router;
