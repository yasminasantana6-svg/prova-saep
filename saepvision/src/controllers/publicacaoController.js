const path = require('path');
const fs = require('fs');
const publicacaoModel = require('../models/publicacaoModel');
const curtidaModel = require('../models/curtidaModel');
const usuarioModel = require('../models/usuarioModel');

const demoPublicacoes = [
  {
    id: 1,
    usuario_id: 2,
    titulo: 'Dedo de Deus',
    local: 'Rio de Janeiro',
    imagem: 'images/foto1.jpg',
    nome_fotografo: 'Fotógrafo 1',
    identificador: '@fotografo1',
    foto_perfil: 'images/fotografo1.jpg',
    total_curtidas: 12,
    curtido_por_mim: false
  },
  {
    id: 2,
    usuario_id: 2,
    titulo: 'Cidade ao pôr do sol',
    local: 'São Paulo',
    imagem: 'images/foto2.jpg',
    nome_fotografo: 'Fotógrafo 1',
    identificador: '@fotografo1',
    foto_perfil: 'images/fotografo1.jpg',
    total_curtidas: 9,
    curtido_por_mim: false
  },
  {
    id: 3,
    usuario_id: 3,
    titulo: 'Casa na montanha',
    local: 'Islândia',
    imagem: 'images/foto4.jpg',
    nome_fotografo: 'Fotógrafo 2',
    identificador: '@fotografo2',
    foto_perfil: 'images/fotografo2.jpg',
    total_curtidas: 7,
    curtido_por_mim: false
  },
  {
    id: 4,
    usuario_id: 3,
    titulo: 'Pico nevado',
    local: 'Nevada',
    imagem: 'images/foto5.jpg',
    nome_fotografo: 'Fotógrafo 2',
    identificador: '@fotografo2',
    foto_perfil: 'images/fotografo2.jpg',
    total_curtidas: 5,
    curtido_por_mim: false
  },
  {
    id: 5,
    usuario_id: 2,
    titulo: 'Floresta e rio',
    local: 'Alpes',
    imagem: 'images/foto6.jpg',
    nome_fotografo: 'Fotógrafo 1',
    identificador: '@fotografo1',
    foto_perfil: 'images/fotografo1.jpg',
    total_curtidas: 8,
    curtido_por_mim: false
  },
  {
    id: 6,
    usuario_id: 3,
    titulo: 'Lua sobre as montanhas',
    local: 'Montanhas',
    imagem: 'images/foto7.jpg',
    nome_fotografo: 'Fotógrafo 2',
    identificador: '@fotografo2',
    foto_perfil: 'images/fotografo2.jpg',
    total_curtidas: 6,
    curtido_por_mim: false
  },
  {
    id: 7,
    usuario_id: 2,
    titulo: 'Paisagem urbana',
    local: 'Centro da cidade',
    imagem: 'images/foto8.jpg',
    nome_fotografo: 'Fotógrafo 1',
    identificador: '@fotografo1',
    foto_perfil: 'images/fotografo1.jpg',
    total_curtidas: 4,
    curtido_por_mim: false
  },
  {
    id: 8,
    usuario_id: 3,
    titulo: 'Luz na floresta',
    local: 'Floresta',
    imagem: 'images/foto9.jpg',
    nome_fotografo: 'Fotógrafo 2',
    identificador: '@fotografo2',
    foto_perfil: 'images/fotografo2.jpg',
    total_curtidas: 10,
    curtido_por_mim: false
  },
  {
    id: 9,
    usuario_id: 2,
    titulo: 'Montanhas nevadas',
    local: 'Canadá',
    imagem: 'images/foto3.jpg',
    nome_fotografo: 'Fotógrafo 1',
    identificador: '@fotografo1',
    foto_perfil: 'images/fotografo1.jpg',
    total_curtidas: 11,
    curtido_por_mim: false
  }
];

async function listarPublicacoes(req, res) {
  const search = String(req.query.search || '').trim();
  const photographer = String(req.query.photographer || '').trim();

  try {
    const userId = req.session?.user?.id || null;

    const filtros = { userId };
    if (photographer) {
      const usuario = await usuarioModel.findByNameOrIdentifier(photographer);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Fotógrafo não encontrado' });
      }
      filtros.photographerId = usuario.id;
    } else if (search) {
      const usuario = await usuarioModel.findByNameOrIdentifier(search);
      if (usuario) {
        filtros.photographerId = usuario.id;
      } else {
        filtros.search = search;
      }
    }

    const publicacoes = await publicacaoModel.listPublicacoes(filtros);
    return res.json({ success: true, publicacoes });
  } catch (error) {
    console.error('Erro ao listar publicações:', error);
    const filteredDemo = demoPublicacoes.filter((publicacao) => {
      if (photographer) {
        const searchTerm = photographer.replace(/^@/, '').toLowerCase();
        return publicacao.identificador.toLowerCase().includes(searchTerm)
          || publicacao.nome_fotografo.toLowerCase().includes(searchTerm);
      }

      if (search) {
        const searchTerm = search.replace(/^@/, '').toLowerCase();
        return publicacao.identificador.toLowerCase().includes(searchTerm)
          || publicacao.nome_fotografo.toLowerCase().includes(searchTerm);
      }

      return true;
    });

    return res.json({ success: true, publicacoes: filteredDemo });
  }
}

async function cadastrarPublicacao(req, res) {
  const { titulo, local } = req.body;
  const usuarioId = req.session?.user?.id;

  if (!usuarioId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  if (!titulo || !local || !req.file) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
  }

  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (!allowedExt.includes(ext)) {
    return res.status(400).json({ success: false, message: 'Formato de imagem inválido.' });
  }

  try {
    const imagem = `uploads/${req.file.filename}`;
    const id = await publicacaoModel.createPublicacao({ usuario_id: usuarioId, titulo, local, imagem });
    return res.status(201).json({ success: true, message: 'Publicação cadastrada com sucesso.', id });
  } catch (error) {
    console.error('Erro ao cadastrar publicação:', error);
    return res.status(500).json({ success: false, message: 'Erro ao cadastrar a publicação.' });
  }
}

async function excluirPublicacao(req, res) {
  const { id } = req.params;
  const usuarioId = req.session?.user?.id;

  if (!usuarioId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  try {
    const publicacao = await publicacaoModel.getPublicacaoById(id);
    if (!publicacao) {
      return res.status(404).json({ success: false, message: 'Publicação não encontrada.' });
    }

    if (publicacao.usuario_id !== usuarioId) {
      return res.status(403).json({ success: false, message: 'Você não pode excluir uma publicação de terceiros.' });
    }

    const apagada = await publicacaoModel.deletePublicacao(id, usuarioId);
    if (!apagada) {
      return res.status(500).json({ success: false, message: 'Não foi possível excluir a publicação.' });
    }

    const filePath = path.join(__dirname, '../../public/uploads', publicacao.imagem);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({ success: true, message: 'Publicação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir publicação:', error);
    return res.status(500).json({ success: false, message: 'Erro ao excluir publicação.' });
  }
}

async function toggleCurtida(req, res) {
  const { publicacaoId } = req.body;
  const usuarioId = req.session?.user?.id;

  if (!usuarioId) {
    return res.status(401).json({ success: false, message: 'Você precisa estar autenticado para curtir.' });
  }

  if (!publicacaoId) {
    return res.status(400).json({ success: false, message: 'Publicação inválida.' });
  }

  try {
    const resultado = await curtidaModel.toggleCurtida(usuarioId, publicacaoId);
    return res.json({ success: true, curtida: resultado.curtida, total: resultado.total });
  } catch (error) {
    console.error('Erro ao registrar curtida:', error);
    return res.status(500).json({ success: false, message: 'Erro ao processar curtida.' });
  }
}

async function perfilFotografo(req, res) {
  const { id } = req.params;
  try {
    const usuario = await usuarioModel.findById(id);
    if (!usuario || usuario.tipo_usuario !== 'fotografo') {
      return res.status(404).json({ success: false, message: 'Fotógrafo não encontrado.' });
    }

    const stats = await usuarioModel.getProfileStats(id);
    const publicacoes = await publicacaoModel.getPublicacoesDoUsuario(id);
    return res.json({ success: true, usuario, stats, publicacoes });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return res.status(500).json({ success: false, message: 'Erro ao carregar perfil.' });
  }
}

module.exports = {
  listarPublicacoes,
  cadastrarPublicacao,
  excluirPublicacao,
  toggleCurtida,
  perfilFotografo
};
