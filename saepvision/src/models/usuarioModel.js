const db = require('../config/database');

async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findByIdentifier(identifier) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE identificador = ? LIMIT 1', [identifier]);
  return rows[0] || null;
}

async function findByNameOrIdentifier(term) {
  const normalized = String(term || '').trim().replace(/^@/, '');
  if (!normalized) return null;

  const [rows] = await db.query(
    `SELECT * FROM usuarios
     WHERE tipo_usuario = 'fotografo'
       AND (LOWER(nome) LIKE LOWER(?) OR LOWER(identificador) LIKE LOWER(?))
     LIMIT 1`,
    [`%${normalized}%`, `%${normalized}%`]
  );

  return rows[0] || null;
}

async function searchPhotographers(query) {
  const pattern = `%${query.replace(/^@/, '')}%`;

  const [rows] = await db.query(
    `SELECT id, nome, email, tipo_usuario, foto_perfil, identificador
     FROM usuarios
     WHERE tipo_usuario = 'fotografo'
       AND (nome LIKE ? OR identificador LIKE ?)
     ORDER BY nome ASC`,
    [pattern, pattern]
  );

  return rows;
}

async function getProfileStats(userId) {
  const [profile] = await db.query(
    `SELECT u.id, u.nome, u.identificador, u.foto_perfil,
            COUNT(DISTINCT p.id) AS total_publicacoes,
            COUNT(DISTINCT c.id) AS total_curtidas
     FROM usuarios u
     LEFT JOIN publicacoes p ON p.usuario_id = u.id
     LEFT JOIN curtidas c ON c.publicacao_id = p.id
     WHERE u.id = ?
     GROUP BY u.id, u.nome, u.identificador, u.foto_perfil`,
    [userId]
  );

  return profile[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  findByIdentifier,
  findByNameOrIdentifier,
  searchPhotographers,
  getProfileStats
};
