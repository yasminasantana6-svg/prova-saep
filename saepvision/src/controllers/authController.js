const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');

async function login(req, res) {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const usuario = await usuarioModel.findByEmail(String(email).trim().toLowerCase());

    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado ou senha incorreta' });
    }

    const senhaValida = await bcrypt.compare(String(senha), usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado ou senha incorreta' });
    }

    req.session.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario,
      foto_perfil: usuario.foto_perfil,
      identificador: usuario.identificador
    };

    return res.json({
      success: true,
      message: 'Login realizado com sucesso.',
      user: req.session.user
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
}

function logout(req, res) {
  if (req.session) {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Erro ao encerrar sessão.' });
      }

      return res.json({ success: true, message: 'Logout realizado com sucesso.' });
    });
    return;
  }

  return res.json({ success: true, message: 'Logout realizado com sucesso.' });
}

async function me(req, res) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Não autenticado.' });
  }

  return res.json({ success: true, user: req.session.user });
}

module.exports = {
  login,
  logout,
  me
};
