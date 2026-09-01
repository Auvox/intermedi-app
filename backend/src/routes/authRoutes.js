const express = require("express");

const { buscarTodosOsPacientes } = require("../data/pacientes");
const { cadastrarPaciente } = require('../data/pacientes');
const router = express.Router();

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

router.post('/register', async (req, res) => {
   try {
    console.log("Dados recebidos no backend:", req.body);

    // ⚠️ ESSA LINHA É A QUE INSERE DE FATO NO BANCO:
    const resultado = await cadastrarPaciente(req.body); 

    // Retorna o sucesso para o front-end exibir o alert()
    return res.status(201).json({ 
      message: 'Usuário cadastrado com sucesso', 
      user: resultado 
    });

  } catch (err) {
    console.error("Erro na rota de cadastro:", err.message);
    return res.status(400).json({ 
      message: 'Erro ao salvar no banco: ' + err.message 
    });
  }
});

module.exports = router;
