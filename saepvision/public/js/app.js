const state = {
  user: null,
  photoSearch: '',
  selectedPhotographerId: null
};

const els = {
  userBadge: document.getElementById('userBadge'),
  profileAvatar: document.getElementById('profileAvatar'),
  userName: document.getElementById('userName'),
  openLoginBtn: document.getElementById('openLoginBtn'),
  openProfileBtn: document.getElementById('openProfileBtn'),
  closeMenuBtn: document.getElementById('closeMenuBtn'),
  mainLayout: document.getElementById('mainLayout'),
  profilePanel: document.getElementById('profilePanel'),
  panelAvatar: document.getElementById('panelAvatar'),
  panelName: document.getElementById('panelName'),
  panelIdentifier: document.getElementById('panelIdentifier'),
  panelLikes: document.getElementById('panelLikes'),
  panelPosts: document.getElementById('panelPosts'),
  myPostsBtn: document.getElementById('myPostsBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  searchInput: document.getElementById('searchInput'),
  gallery: document.getElementById('gallery'),
  messageBox: document.getElementById('messageBox'),
  loginModal: document.getElementById('loginModal'),
  loginForm: document.getElementById('loginForm'),
  photoModal: document.getElementById('photoModal'),
  photoForm: document.getElementById('photoForm'),
  newPhotoBtn: document.getElementById('newPhotoBtn'),
  fileNameText: document.getElementById('fileNameText')
};

const apiBase = '/api';

function resolveAssetPath(value, fallback = '/images/usuario1.jpg') {
  if (!value) return fallback;
  const normalized = String(value).replace(/\\/g, '/');
  if (normalized.startsWith('/')) return normalized;
  if (normalized.startsWith('images/')) return `/${normalized}`;
  if (normalized.startsWith('uploads/')) return `/${normalized}`;
  if (normalized.includes('/')) return normalized;
  return `/images/${normalized}`;
}

function showMessage(text, type = 'success') {
  els.messageBox.textContent = text;
  els.messageBox.className = `message-box ${type}`;
  els.messageBox.classList.remove('hidden');
}

function hideMessage() {
  els.messageBox.classList.add('hidden');
}

function setUser(user) {
  state.user = user;
  const isLogged = Boolean(user);
  const isPhotographer = isLogged && user.tipo_usuario === 'fotografo';

  els.userBadge.classList.toggle('hidden', !isLogged);
  els.openLoginBtn.classList.toggle('hidden', isLogged);
  els.openProfileBtn.classList.toggle('hidden', !isPhotographer || !isLogged);
  els.newPhotoBtn.classList.toggle('hidden', !isPhotographer || !isLogged);

  if (isLogged) {
    const profileImage = resolveAssetPath(user.foto_perfil, '/images/usuario1.jpg');
    els.profileAvatar.src = profileImage;
    els.userName.textContent = user.nome || 'SAEPVision';
    els.panelAvatar.src = profileImage;
    els.panelName.textContent = user.nome || 'Fotógrafo';
    els.panelIdentifier.textContent = user.identificador || '@usuario';
  } else {
    els.profileAvatar.src = '/images/usuario1.jpg';
    els.userName.textContent = 'SAEPVision';
    els.panelName.textContent = 'Fotógrafo';
    els.panelIdentifier.textContent = '@fotografo';
  }

  if (!isLogged) {
    els.profilePanel.classList.add('hidden');
  }
  if (isLogged && isPhotographer) {
    els.profilePanel.classList.remove('hidden');
    populatePhotographerStats(user.id);
  }
  els.mainLayout.classList.toggle('has-profile', !els.profilePanel.classList.contains('hidden'));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Erro desconhecido.' }));

  if (!response.ok) {
    throw new Error(data.message || 'Erro inesperado.');
  }

  return data;
}

async function getCurrentUser() {
  try {
    const data = await fetchJson(`${apiBase}/me`);
    setUser(data.user);
    loadGallery();
  } catch (error) {
    setUser(null);
    loadGallery();
  }
}

function renderGallery(publicacoes) {
  if (!publicacoes || publicacoes.length === 0) {
    els.gallery.innerHTML = '<div class="photo-card"><div class="photo-card__body"><p>Nenhuma publicação encontrada.</p></div></div>';
    return;
  }

  els.gallery.innerHTML = publicacoes.map((pub) => {
    const likedClass = pub.curtido_por_mim ? 'is-liked' : '';
    const heart = pub.curtido_por_mim ? '♥' : '♡';
    const imageSrc = resolveAssetPath(pub.imagem, '/images/usuario1.jpg');
    return `
      <article class="photo-card">
        <img class="photo-card__image" src="${imageSrc}" alt="${pub.titulo}" />
        <div class="photo-card__body">
          <div class="photo-card__header">
            <h3 class="photo-card__title">${pub.titulo}</h3>
            ${state.user && state.user.tipo_usuario === 'fotografo' && pub.usuario_id === state.user.id ? '<button class="btn btn--danger btn--small" data-delete-id="' + pub.id + '">Excluir</button>' : ''}
          </div>
          <p class="photo-card__meta">Fotógrafo: ${pub.nome_fotografo} · ${pub.local}</p>
          <div class="photo-card__footer">
            <button class="like-btn ${likedClass}" data-like-id="${pub.id}" aria-label="Curtir publicação">
              <span class="heart">${heart}</span>
            </button>
            <span class="photo-card__likes">${pub.total_curtidas} curtidas</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  els.gallery.querySelectorAll('[data-like-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const publicacaoId = Number(button.dataset.likeId);
      if (!state.user) {
        showMessage('Você precisa estar autenticado para curtir.', 'error');
        openLogin();
        return;
      }
      try {
        const data = await fetchJson(`${apiBase}/publicacoes/curtir`, {
          method: 'POST',
          body: JSON.stringify({ publicacaoId })
        });

        const current = publicacoes.find((item) => item.id === publicacaoId);
        if (current) {
          current.total_curtidas = Number(data.total);
          current.curtido_por_mim = data.curtida;
        }

        loadGallery();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  });

  const deleteButtons = els.gallery.querySelectorAll('[data-delete-id]');
  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteId;
      try {
        const data = await fetchJson(`${apiBase}/publicacoes/${id}`, { method: 'DELETE' });
        showMessage(data.message, 'success');
        loadGallery();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  });
}

async function loadGallery() {
  const query = (state.photoSearch || '').trim();
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  if (state.selectedPhotographerId) params.set('photographer', state.selectedPhotographerId);

  try {
    const data = await fetchJson(`${apiBase}/publicacoes?${params.toString()}`);
    renderGallery(data.publicacoes || []);
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function populatePhotographerStats(userId) {
  if (!userId) return;
  try {
    const data = await fetchJson(`${apiBase}/perfil/${userId}`);
    const stats = data.stats || {};
    els.panelLikes.textContent = String(stats.total_curtidas || 0);
    els.panelPosts.textContent = String(stats.total_publicacoes || 0);
  } catch (error) {
    els.panelLikes.textContent = '0';
    els.panelPosts.textContent = '0';
  }
}

function openLogin() {
  els.loginModal.classList.remove('hidden');
}

function closeLogin() {
  els.loginModal.classList.add('hidden');
}

function openPhotoModal() {
  els.photoModal.classList.remove('hidden');
}

function closePhotoModal() {
  els.photoModal.classList.add('hidden');
  els.photoForm.reset();
  els.fileNameText.textContent = 'Nenhum arquivo escolhido';
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;

  if (!email || !senha) {
    showMessage('E-mail e senha são obrigatórios.', 'error');
    return;
  }

  try {
    const data = await fetchJson(`${apiBase}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });

    setUser(data.user);
    closeLogin();
    hideMessage();
    loadGallery();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function handleLogout() {
  try {
    await fetchJson(`${apiBase}/logout`, { method: 'POST' });
    setUser(null);
    state.photoSearch = '';
    state.selectedPhotographerId = null;
    els.searchInput.value = '';
    hideMessage();
    loadGallery();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function handlePhotoSubmit(event) {
  event.preventDefault();
  if (!state.user || state.user.tipo_usuario !== 'fotografo') {
    showMessage('Acesso restrito a fotógrafos.', 'error');
    return;
  }

  const formData = new FormData(event.currentTarget);
  const titulo = String(formData.get('titulo') || '').trim();
  const local = String(formData.get('local') || '').trim();
  const file = formData.get('imagem');

  if (!titulo || !local) {
    showMessage('Título e local são obrigatórios.', 'error');
    return;
  }

  if (!file || !file.name) {
    showMessage('Nenhum arquivo escolhido', 'error');
    return;
  }

  if (file.size === 0) {
    showMessage('Arquivo inválido.', 'error');
    return;
  }

  const validExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExt.includes(ext)) {
    showMessage('Formato de imagem inválido.', 'error');
    return;
  }

  try {
    const response = await fetch(`${apiBase}/publicacoes`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao salvar publicação.');
    showMessage(data.message, 'success');
    closePhotoModal();
    loadGallery();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function setupSearch() {
  els.searchInput.addEventListener('input', async () => {
    const value = els.searchInput.value.trim();
    state.photoSearch = value;

    if (!value) {
      state.selectedPhotographerId = null;
      loadGallery();
      return;
    }

    try {
      const response = await fetchJson(`${apiBase}/publicacoes?search=${encodeURIComponent(value)}`);
      if (response.publicacoes && response.publicacoes.length > 0) {
        renderGallery(response.publicacoes);
        state.selectedPhotographerId = response.publicacoes[0].usuario_id;
      } else {
        showMessage('Fotógrafo não encontrado', 'error');
        state.selectedPhotographerId = null;
        renderGallery([]);
      }
    } catch (error) {
      showMessage(error.message, 'error');
    }
  });
}

function setupModalEvents() {
  els.openLoginBtn.addEventListener('click', openLogin);
  els.closeLoginBtn = document.getElementById('closeLoginBtn');
  els.closeLoginBtn.addEventListener('click', closeLogin);
  document.querySelectorAll('[data-close="true"]').forEach((el) => {
    el.addEventListener('click', () => {
      closeLogin();
      closePhotoModal();
    });
  });

  els.closeMenuBtn.addEventListener('click', () => {
    state.user = null;
    setUser(null);
    els.searchInput.value = '';
    hideMessage();
  });

  els.loginForm.addEventListener('submit', handleLoginSubmit);
  els.photoForm.addEventListener('submit', handlePhotoSubmit);
  document.getElementById('closePhotoModalBtn').addEventListener('click', closePhotoModal);
  document.getElementById('newPhotoBtn').addEventListener('click', openPhotoModal);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('openProfileBtn').addEventListener('click', () => {
    els.profilePanel.classList.toggle('hidden');
    els.mainLayout.classList.toggle('has-profile', !els.profilePanel.classList.contains('hidden'));
  });

  document.getElementById('photoFile').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    els.fileNameText.textContent = file ? file.name : 'Nenhum arquivo escolhido';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupModalEvents();
  setupSearch();
  getCurrentUser();
  loadGallery();
});
