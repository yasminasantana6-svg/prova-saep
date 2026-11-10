function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  return next();
}

function requirePhotographer(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  if (req.session.user.tipo_usuario !== 'fotografo') {
    return res.status(403).json({ success: false, message: 'Acesso restrito a fotógrafos.' });
  }

  return next();
}

module.exports = {
  requireAuth,
  requirePhotographer
};
