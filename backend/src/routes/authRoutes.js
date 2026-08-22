const express = require("express");
const users = require("../data/users");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const user = users.find(
    (user) => user.email === email && user.senha === senha
  );

  if (!user) {
    return res.status(401).json({
      message: "Incorreto"
    });
  }

  res.json({
    message: "Nice",
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email
    }
  });
});

module.exports = router;