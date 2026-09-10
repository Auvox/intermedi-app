const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { atualizarFotoPerfil, buscarTodosOsPacientes, perfilPublico, editarPaciente, excluirPaciente } = require('../data/pacientes');

const router = express.Router();

const pastaPerfis = path.join(__dirname, '..', '..', 'uploads', 'perfis');

if (!fs.existsSync(pastaPerfis)) {
  fs.mkdirSync(pastaPerfis, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, pastaPerfis);
  },

  filename: (req, file, callback) => {
    const extensao = path.extname(file.originalname) || '.jpg';
    callback(null, `paciente-${req.params.id}-${Date.now()}${extensao}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('O arquivo enviado precisa ser uma imagem.'));
      return;
    }

    callback(null, true);
  },
});

router.put('/:id/foto', upload.single('foto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Nenhuma foto foi enviada.',
      });
    }

    const caminhoFoto = `/uploads/perfis/${req.file.filename}`;

    const atualizado = await atualizarFotoPerfil(
      req.params.id,
      caminhoFoto
    );

    if (!atualizado) {
      fs.unlink(req.file.path, () => {});

      return res.status(404).json({
        message: 'Paciente não encontrado.',
      });
    }

    return res.json({
      message: 'Foto atualizada com sucesso.',
      fotoPerfilPaciente: caminhoFoto,
    });
  } catch (error) {
    console.error('Erro ao atualizar foto:', error);

    return res.status(500).json({
      message: 'Erro ao atualizar a foto de perfil.',
    });
  }
});

async function verificarPaciente(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0 || typeof req.body?.senhaAtual !== 'string' || !req.body.senhaAtual) {
    return res.status(400).json({ message: 'Informe a senha atual para continuar.' });
  }
  try {
    const pacientes = await buscarTodosOsPacientes();
    const paciente = pacientes.find(p => p.idPaciente === id && p.senhaPaciente === req.body.senhaAtual);
    if (!paciente) return res.status(401).json({ message: 'Conta não encontrada ou senha atual incorreta.' });
    req.paciente = paciente;
    req.pacientes = pacientes;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível consultar a conta.' });
  }
}

router.post('/:id/perfil', verificarPaciente, (req, res) => {
  res.json({ user: perfilPublico(req.paciente) });
});

router.put('/:id', verificarPaciente, async (req, res) => {
  const dados = req.body;
  if (typeof dados.nome !== 'string' || !dados.nome.trim() ||
      typeof dados.cpf !== 'string' || !/^\d{11}$/.test(dados.cpf.replace(/\D/g, '')) ||
      typeof dados.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email) ||
      typeof dados.telefone !== 'string' || typeof dados.remedioFrequente !== 'string' ||
      (dados.senha !== undefined && typeof dados.senha !== 'string')) {
    return res.status(400).json({ message: 'Confira nome, CPF, e-mail e demais campos informados.' });
  }
  if (req.pacientes.some(p => p.idPaciente !== req.paciente.idPaciente &&
      (p.emailPaciente.toLowerCase() === dados.email.toLowerCase() ||
       (p.cpfPaciente || '').replace(/\D/g, '') === dados.cpf.replace(/\D/g, '')))) {
    return res.status(409).json({ message: 'CPF ou e-mail já cadastrado em outra conta.' });
  }
  try {
    const updated = await editarPaciente(req.paciente.idPaciente, dados);
    if (!updated) return res.status(401).json({ message: 'Conta não encontrada ou senha atual incorreta.' });
    const pacientes = await buscarTodosOsPacientes();
    res.json({ user: perfilPublico(pacientes.find(p => p.idPaciente === req.paciente.idPaciente)) });
  } catch (error) {
    res.status(error.status || (error.code === 'SQLITE_CONSTRAINT' ? 409 : 500)).json({
      message: error.status ? error.message : 'Não foi possível salvar. Confira os dados e tente novamente.'
    });
  }
});

router.delete('/:id', verificarPaciente, async (req, res) => {
  try {
    const deleted = await excluirPaciente(req.paciente.idPaciente, req.body.senhaAtual);
    if (!deleted) return res.status(401).json({ message: 'Conta não encontrada ou senha atual incorreta.' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível excluir a conta. Tente novamente.' });
  }
});

module.exports = router;