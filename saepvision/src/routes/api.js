const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');
const publicacaoController = require('../controllers/publicacaoController');
const { requireAuth, requirePhotographer } = require('../middlewares/authMiddleware');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagem inválido.'));
    }
  }
});

router.get('/health', (req, res) => { res.json({ success: true, message: 'API funcionando.' }); });
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.get('/publicacoes', publicacaoController.listarPublicacoes);
router.post('/publicacoes/curtir', requireAuth, publicacaoController.toggleCurtida);
router.get('/perfil/:id', publicacaoController.perfilFotografo);
router.post('/publicacoes', requirePhotographer, upload.single('imagem'), publicacaoController.cadastrarPublicacao);
router.delete('/publicacoes/:id', requirePhotographer, publicacaoController.excluirPublicacao);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: error.code === 'LIMIT_UNEXPECTED_FILE' ? 'Nenhum arquivo escolhido' : 'Arquivo inválido.' });
  }

  if (error) {
    return res.status(400).json({ success: false, message: error.message || 'Erro ao processar o upload.' });
  }

  return next();
});

module.exports = router;
