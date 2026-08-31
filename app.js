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
    html_url: 'https://uptpc.github.io/proyecto-automatizacion/',
    description: 'Sistema automatizado para la creación y estandarización de repositorios académicos e investigativos de la UPTPC.',
    language: 'JavaScript',
    stargazers_count: 12,
    forks_count: 5,
    updated_at: new Date().toISOString()
  },
  {
    name: 'plataforma-investigacion-cyt',
    html_url: 'https://github.com/REPOUPTPC/plataforma-investigacion-cyt',
    description: 'Recursos, proyectos y documentación de la Unidad de Ciencia y Tecnología de la UPTPC.',
    language: 'Python',
    stargazers_count: 8,
    forks_count: 3,
    updated_at: new Date().toISOString()
  },
  {
    name: 'plantillas-proyectos-uptpc',
    html_url: 'https://github.com/REPOUPTPC/plantillas-proyectos-uptpc',
    description: 'Plantillas oficiales para proyectos socio-integradores (PNF) y líneas de investigación institucional.',
    language: 'HTML',
    stargazers_count: 15,
    forks_count: 7,
    updated_at: new Date().toISOString()
  },
  {
    name: 'lineas-investigacion-carabobo',
    html_url: 'https://github.com/REPOUPTPC/lineas-investigacion-carabobo',
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
    // Try fetching from orgs API first, fallback to users API
    let response = await fetch('https://api.github.com/orgs/REPOUPTPC/repos?sort=updated&per_page=30');
    if (!response.ok) {
      response = await fetch('https://api.github.com/users/REPOUPTPC/repos?sort=updated&per_page=30');
    }

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        allRepos = data;
      } else {
        allRepos = DEFAULT_REPOS;
      }
    } else {
      allRepos = DEFAULT_REPOS;
    }
  } catch (err) {
    console.warn('Error fetching GitHub API, using fallback repos list:', err);
    allRepos = DEFAULT_REPOS;
  }

  // Update total count
  if (totalCounter) {
    totalCounter.textContent = allRepos.length;
  }

  renderRepos();

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderRepos();
    });
  }

  // Filter Buttons Event
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

    return `
      <div class="repo-card">
        <div class="repo-card-top">
          <div class="repo-name-wrap">
            <span class="repo-icon">📦</span>
            <h3 class="repo-name">
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a>
            </h3>
          </div>
          <p class="repo-desc">${escapeHtml(repo.description || 'Sin descripción disponible.')}</p>
        </div>
        <div class="repo-card-bottom">
          <div class="repo-meta">
            <span class="lang-badge">
              <span class="lang-color" style="background-color: ${langColor};"></span>
              ${escapeHtml(lang)}
            </span>
            <span class="repo-stars">
              ⭐ ${repo.stargazers_count || 0}
            </span>
          </div>
          <span style="font-size: 0.75rem; color: #94a3b8;">${updatedDate}</span>
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
