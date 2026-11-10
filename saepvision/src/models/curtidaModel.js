const db = require('../config/database');

async function toggleCurtida(usuarioId, publicacaoId) {
  const [exists] = await db.query(
    'SELECT id FROM curtidas WHERE usuario_id = ? AND publicacao_id = ? LIMIT 1',
    [usuarioId, publicacaoId]
  );

  if (exists.length > 0) {
    await db.query('DELETE FROM curtidas WHERE usuario_id = ? AND publicacao_id = ?', [usuarioId, publicacaoId]);
    return { curtida: false, total: await getTotalCurtidas(publicacaoId) };
  }

  await db.query('INSERT INTO curtidas (usuario_id, publicacao_id, data_curtida) VALUES (?, ?, NOW())', [usuarioId, publicacaoId]);
  return { curtida: true, total: await getTotalCurtidas(publicacaoId) };
}

async function getTotalCurtidas(publicacaoId) {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM curtidas WHERE publicacao_id = ?', [publicacaoId]);
  return rows[0].total;
}

async function usuarioCurtiu(publicacaoId, usuarioId) {
  const [rows] = await db.query('SELECT id FROM curtidas WHERE publicacao_id = ? AND usuario_id = ? LIMIT 1', [publicacaoId, usuarioId]);
  return rows.length > 0;
}

module.exports = {
  toggleCurtida,
  getTotalCurtidas,
  usuarioCurtiu
};
