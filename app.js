/**
 * REPOUPTPC - Main JavaScript Application
 * Universidad Politécnica Territorial de Puerto Cabello (UPTPC)
 * Unidad de Ciencia y Tecnología (CYT)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initGitHubRepos();
});

// Mobile Navigation Toggle
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      toggleBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close menu when clicking links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggleBtn.innerHTML = '☰';
      });
    });
  }
}

// GitHub Repositories Fetcher & Search/Filter Logic
const DEFAULT_REPOS = [
  {
    name: 'proyecto-automatizacion',
    html_url: 'https://github.com/REPOUPTPC/proyecto-automatizacion',
    homepage: 'https://uptpc.github.io/proyecto-automatizacion/',
    has_pages: true,
    description: 'Sistema automatizado para la creación y estandarización de repositorios académicos e investigativos de la UPTPC.',
    language: 'JavaScript',
    stargazers_count: 12,
    forks_count: 5,
    updated_at: new Date().toISOString()
  },
  {
    name: 'plataforma-investigacion-cyt',
    html_url: 'https://github.com/REPOUPTPC/plataforma-investigacion-cyt',
    homepage: null,
    has_pages: false,
    description: 'Recursos, proyectos y documentación de la Unidad de Ciencia y Tecnología de la UPTPC.',
    language: 'Python',
    stargazers_count: 8,
    forks_count: 3,
    updated_at: new Date().toISOString()
  },
  {
    name: 'plantillas-proyectos-uptpc',
    html_url: 'https://github.com/REPOUPTPC/plantillas-proyectos-uptpc',
    homepage: null,
    has_pages: false,
    description: 'Plantillas oficiales para proyectos socio-integradores (PNF) y líneas de investigación institucional.',
    language: 'HTML',
    stargazers_count: 15,
    forks_count: 7,
    updated_at: new Date().toISOString()
  },
  {
    name: 'lineas-investigacion-carabobo',
    html_url: 'https://github.com/REPOUPTPC/lineas-investigacion-carabobo',
    homepage: null,
    has_pages: false,
    description: 'Proyectos alineados con el Consejo Científico Estadal de Carabobo y la Gran Misión Ciencia y Tecnología.',
    language: 'Documentation',
    stargazers_count: 10,
    forks_count: 4,
    updated_at: new Date().toISOString()
  }
];

let allRepos = [];
let currentFilter = 'all';
let searchQuery = '';

async function initGitHubRepos() {
  const reposContainer = document.getElementById('repos-container');
  const searchInput = document.getElementById('repo-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const totalCounter = document.getElementById('stat-total-repos');

  if (!reposContainer) return;

  try {
    let page = 1;
    let fetchedRepos = [];
    let keepFetching = true;

    // Recorre todas las páginas (hasta 100 repos por petición)
    while (keepFetching) {
      // Consulta directa al endpoint de usuarios
      let response = await fetch(`https://api.github.com/users/REPOUPTPC/repos?sort=updated&per_page=100&page=${page}`);

      // Fallback a orgs por si en el futuro migran a organización
      if (response.status === 404 && page === 1) {
        response = await fetch(`https://api.github.com/orgs/REPOUPTPC/repos?sort=updated&per_page=100&page=${page}`);
      }

      if (!response.ok) break;

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        fetchedRepos = fetchedRepos.concat(data);
        // Si llegaron menos de 100, ya no quedan más páginas
        if (data.length < 100) {
          keepFetching = false;
        } else {
          page++;
        }
      } else {
        keepFetching = false;
      }
    }

    allRepos = fetchedRepos.length > 0 ? fetchedRepos : DEFAULT_REPOS;
  } catch (err) {
    console.warn('Error fetching GitHub API, using fallback repos list:', err);
    allRepos = DEFAULT_REPOS;
  }

  // Actualizar contador total
  if (totalCounter) {
    totalCounter.textContent = allRepos.length;
  }

  renderRepos();

  // Evento del buscador
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderRepos();
    });
  }

  // Evento de los filtros
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      renderRepos();
    });
  });
}

function renderRepos() {
  const container = document.getElementById('repos-container');
  if (!container) return;

  const filtered = allRepos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery));
    
    if (!matchesSearch) return false;

    if (currentFilter === 'all') return true;
    if (currentFilter === 'javascript') return repo.language?.toLowerCase() === 'javascript';
    if (currentFilter === 'python') return repo.language?.toLowerCase() === 'python';
    if (currentFilter === 'html') return repo.language?.toLowerCase() === 'html' || repo.language?.toLowerCase() === 'css';
    if (currentFilter === 'docs') return !repo.language || repo.language?.toLowerCase() === 'documentation' || repo.language?.toLowerCase() === 'markdown';

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #64748b;">
        <p style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; color: #024dba;">No se encontraron repositorios</p>
        <p>Prueba con otros términos de búsqueda o cambia el filtro seleccionado.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(repo => {
    const lang = repo.language || 'General';
    const langColor = getLangColor(lang);
    const updatedDate = new Date(repo.updated_at).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const repoUrl = repo.html_url && !String(repo.html_url).includes('.github.io') 
      ? repo.html_url 
      : (repo.name ? `https://github.com/REPOUPTPC/${repo.name}` : 'https://github.com/REPOUPTPC');

    // Detect possible GitHub Pages URL for the repo
    let pagesUrl = null;
    try {
      if (repo.has_pages) {
        if (repo.homepage && String(repo.homepage).startsWith('http')) {
          pagesUrl = repo.homepage;
        } else if (repo.owner && repo.owner.login) {
          pagesUrl = `https://${repo.owner.login}.github.io/${repo.name}/`;
        } else {
          pagesUrl = `https://uptpc.github.io/${repo.name}/`;
        }
      } else if (repo.homepage && String(repo.homepage).startsWith('http')) {
        pagesUrl = repo.homepage;
      } else if (repo.html_url && String(repo.html_url).includes('.github.io')) {
        pagesUrl = repo.html_url;
      }
    } catch (err) {
      pagesUrl = null;
    }

    const pagesButtonHtml = pagesUrl ? `
      <a href="${pagesUrl}" target="_blank" rel="noopener noreferrer" class="repo-btn repo-btn-pages">
        <svg class="btn-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span>Sitio Pages</span>
      </a>
    ` : '';

    const githubButtonHtml = `
      <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="repo-btn repo-btn-github">
        <svg class="btn-icon" viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span>Ver en GitHub</span>
      </a>
    `;

    return `
      <div class="repo-card">
        <div class="repo-card-top">
          <div class="repo-header-row">
            <div class="repo-name-wrap">
              <span class="repo-icon">📦</span>
              <h3 class="repo-name">
                <a href="${repoUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a>
              </h3>
            </div>
            <span class="lang-badge">
              <span class="lang-color" style="background-color: ${langColor};"></span>
              ${escapeHtml(lang)}
            </span>
          </div>
          <p class="repo-desc">${escapeHtml(repo.description || 'Sin descripción disponible.')}</p>
        </div>

        <div class="repo-card-middle">
          <div class="repo-stats-bar">
            <div class="stat-pill stars-pill" title="${repo.stargazers_count || 0} Estrellas en GitHub">
              <span class="stat-icon">⭐</span>
              <span class="stat-value">${repo.stargazers_count || 0}</span>
              <span class="stat-label">estrellas</span>
            </div>
            <div class="stat-pill forks-pill" title="${repo.forks_count || 0} Forks en GitHub">
              <span class="stat-icon">🍴</span>
              <span class="stat-value">${repo.forks_count || 0}</span>
              <span class="stat-label">forks</span>
            </div>
            <span class="stat-date">📅 ${updatedDate}</span>
          </div>
        </div>

        <div class="repo-card-bottom">
          <div class="repo-card-actions">
            ${githubButtonHtml}
            ${pagesButtonHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getLangColor(lang) {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'PHP': '#4F5D95',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'Documentation': '#024dba'
  };
  return colors[lang] || '#2563eb';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
