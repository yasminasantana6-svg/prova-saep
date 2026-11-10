const db = require('../config/database');

async function listPublicacoes(filters = {}) {
  const { photographerId, userId, search } = filters;
  let query = `
    SELECT p.id, p.usuario_id, p.titulo, p.local, p.imagem, p.data_publicacao,
           u.nome AS nome_fotografo, u.identificador, u.foto_perfil,
           COUNT(DISTINCT c.id) AS total_curtidas,
           MAX(CASE WHEN c.usuario_id = ? THEN 1 ELSE 0 END) AS curtido_por_mim
    FROM publicacoes p
    INNER JOIN usuarios u ON u.id = p.usuario_id
    LEFT JOIN curtidas c ON c.publicacao_id = p.id
    WHERE 1 = 1
  `;
  const params = [userId || 0];

  if (photographerId) {
    query += ' AND p.usuario_id = ?';
    params.push(photographerId);
  }

  if (search) {
    query += ' AND (u.nome LIKE ? OR u.identificador LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  query += ' GROUP BY p.id, p.usuario_id, p.titulo, p.local, p.imagem, p.data_publicacao, u.nome, u.identificador, u.foto_perfil ORDER BY p.data_publicacao DESC';

  const [rows] = await db.query(query, params);
  return rows;
}

async function getPublicacaoById(id) {
  const [rows] = await db.query('SELECT * FROM publicacoes WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function createPublicacao({ usuario_id, titulo, local, imagem }) {
  const [result] = await db.query(
    'INSERT INTO publicacoes (usuario_id, titulo, local, imagem, data_publicacao) VALUES (?, ?, ?, ?, NOW())',
    [usuario_id, titulo, local, imagem]
  );
  return result.insertId;
}

async function deletePublicacao(id, usuarioId) {
  const [result] = await db.query('DELETE FROM publicacoes WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
  return result.affectedRows > 0;
}

async function getPublicacoesDoUsuario(usuarioId) {
  return listPublicacoes({ photographerId: usuarioId, userId: usuarioId });
}

module.exports = {
  listPublicacoes,
  getPublicacaoById,
  createPublicacao,
  deletePublicacao,
  getPublicacoesDoUsuario
};
