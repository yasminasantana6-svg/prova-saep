CREATE DATABASE IF NOT EXISTS saepvision CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saepvision;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('usuario', 'fotografo') NOT NULL DEFAULT 'usuario',
  foto_perfil VARCHAR(255) DEFAULT NULL,
  identificador VARCHAR(80) NOT NULL UNIQUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS publicacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  local VARCHAR(200) NOT NULL,
  imagem VARCHAR(255) NOT NULL,
  data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_publicacoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS curtidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  publicacao_id INT NOT NULL,
  data_curtida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (usuario_id, publicacao_id),
  CONSTRAINT fk_curtidas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_curtidas_publicacao FOREIGN KEY (publicacao_id) REFERENCES publicacoes(id) ON DELETE CASCADE
);

INSERT INTO usuarios (nome, email, senha, tipo_usuario, foto_perfil, identificador) VALUES
('Usuário Comum', 'usuario@teste.com', '$2a$10$.ihCi86N2mrD0qeV1E7E2ONOz1iLXK9RyQ.IzO22bjYamubtF79WO', 'usuario', 'usuario1.jpg', '@usuario1'),
('Fotógrafo 1', 'fotografo1@teste.com', '$2a$10$.ihCi86N2mrD0qeV1E7E2ONOz1iLXK9RyQ.IzO22bjYamubtF79WO', 'fotografo', 'fotografo1.jpg', '@fotografo1'),
('Fotógrafo 2', 'fotografo2@teste.com', '$2a$10$.ihCi86N2mrD0qeV1E7E2ONOz1iLXK9RyQ.IzO22bjYamubtF79WO', 'fotografo', 'fotografo2.jpg', '@fotografo2');

INSERT INTO publicacoes (usuario_id, titulo, local, imagem) VALUES
(2, 'Dedo de Deus', 'Rio de Janeiro', 'foto1.jpg'),
(2, 'Cidade ao pôr do sol', 'São Paulo', 'foto2.jpg'),
(2, 'Montanhas Nevadas', 'Canadá', 'foto3.jpg'),
(3, 'Casa na montanha', 'Islândia', 'foto4.jpg'),
(3, 'Pico nevado', 'Nevada', 'foto5.jpg'),
(2, 'Floresta e rio', 'Alpes', 'foto6.jpg'),
(3, 'Lua sobre as montanhas', 'Montanhas', 'foto7.jpg'),
(2, 'Paisagem urbana', 'Centro da cidade', 'foto8.jpg'),
(3, 'Luz na floresta', 'Floresta', 'foto9.jpg');

INSERT INTO curtidas (usuario_id, publicacao_id) VALUES
(1, 1),
(1, 2),
(3, 1);
