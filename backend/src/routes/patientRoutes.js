const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { atualizarFotoPerfil } = require('../data/pacientes');

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

module.exports = router;