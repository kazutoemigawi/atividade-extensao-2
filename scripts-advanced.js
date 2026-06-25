/**
 * SEARCH-ADVANCED.JS
 * Filtros avançados e recursos extras para a busca
 * Inclua este arquivo após scripts.js para ativar recursos adicionais
 */

// ========== DEBOUNCE (Para otimizar busca com delay) ==========
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// ========== HIGHLIGHT DE PALAVRAS ==========
function highlightMatches(element, query) {
  if (!query) {
    element.innerHTML = element.textContent;
    return;
  }

  const regex = new RegExp(`(${query})`, 'gi');
  const html = element.textContent.replace(regex, '<mark style="background: #fff59d;">$1</mark>');
  element.innerHTML = html;
}

// ========== BUSCA COM DESTAQUE ==========
function searchWithHighlight(query) {
  const searchInput = document.getElementById('search-input');
  const cards = document.querySelectorAll('.muscle-card');
  let count = 0;

  cards.forEach(card => {
    const title = card.querySelector('h2');
    const titleText = title.textContent.toLowerCase();
    const exercises = card.querySelector('ul');
    const exercisesText = exercises.textContent.toLowerCase();
    const tip = card.querySelector('p');
    const tipText = tip.textContent.toLowerCase();

    if (query === '' || titleText.includes(query) || exercisesText.includes(query) || tipText.includes(query)) {
      card.style.display = 'block';
      count++;

      // Destacar texto
      if (query) {
        highlightMatches(title, query);
        highlightMatches(exercises, query);
        highlightMatches(tip, query);
      }
    } else {
      card.style.display = 'none';
      // Remover destaque
      title.innerHTML = title.textContent;
      exercises.innerHTML = exercises.textContent;
      tip.innerHTML = tip.textContent;
    }
  });

  return count;
}

// ========== SALVANDO BUSCAS RECENTES ==========
const SearchHistory = {
  key: 'searchHistory',
  
  save(query) {
    if (!query.trim()) return;
    let history = this.get();
    history = history.filter(q => q !== query);
    history.unshift(query);
    if (history.length > 5) history.pop();
    localStorage.setItem(this.key, JSON.stringify(history));
  },

  get() {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  },

  clear() {
    localStorage.removeItem(this.key);
  },

  display() {
    const history = this.get();
    if (history.length === 0) return '';
    return `<div class="search-history"><strong>Recentes:</strong> ${history.map(q => `<span onclick="document.getElementById('search-input').value='${q}'; document.getElementById('search-input').dispatchEvent(new Event('input'))" class="history-tag">${q}</span>`).join(' ')}</div>`;
  }
};

// ========== FILTRO POR CATEGORIA ==========
function createCategoryFilter() {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'category-filters';
  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all">Todos (6)</button>
    <button class="filter-btn" data-filter="superior">Tórax (3)</button>
    <button class="filter-btn" data-filter="lower">Inferior (1)</button>
    <button class="filter-btn" data-filter="full">Full Body (2)</button>
  `;

  const searchContainer = document.querySelector('.search-box-container');
  if (searchContainer) {
    searchContainer.insertBefore(filterContainer, searchContainer.firstChild);
  }

  // Adicionar listeners aos filtros
  filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Implementar filtro aqui
    });
  });
}

// ========== CONTADOR DE RESULTADOS MELHORADO ==========
function updateResultsCounter(count, totalCards) {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;

  if (count === 0) {
    searchResults.innerHTML = '❌ Nenhum exercício encontrado. Tente outros termos.';
    searchResults.classList.add('not-found');
  } else if (count === totalCards) {
    searchResults.innerHTML = `✅ Mostrando todos os ${totalCards} exercício${totalCards > 1 ? 's' : ''}`;
    searchResults.classList.remove('not-found');
  } else {
    searchResults.innerHTML = `✅ ${count} de ${totalCards} exercício${count > 1 ? 's' : ''} encontrado${count > 1 ? 's' : ''}`;
    searchResults.classList.remove('not-found');
  }
}

// ========== EXPORTAR PARA PRINT ==========
function printFilteredResults() {
  const visibleCards = document.querySelectorAll('.muscle-card:not([style*="display: none"])');
  if (visibleCards.length === 0) {
    alert('Nenhum exercício para imprimir. Ajuste sua busca.');
    return;
  }

  const printWindow = window.open('', '', 'height=800,width=800');
  let html = '<html><head><title>Treinos Filtrados</title><style>body{font-family:Arial;padding:20px}h2{color:#0c8659;border-bottom:2px solid #ffa500;padding:10px 0}ul{margin:10px 0}li{margin:5px 0}</style></head><body>';

  visibleCards.forEach(card => {
    html += `<h2>${card.querySelector('h2').textContent}</h2>`;
    html += `<div>${card.querySelector('ul').innerHTML}</div>`;
    html += `<p>${card.querySelector('p').textContent}</p><hr>`;
  });

  html += '</body></html>';
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

// ========== INICIALIZAR RECURSOS AVANÇADOS ==========
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');

  if (searchInput) {
    // Debounce para performance
    const debouncedSearch = debounce(() => {
      const query = searchInput.value.toLowerCase().trim();
      const total = document.querySelectorAll('.muscle-card').length;
      const count = searchWithHighlight(query);

      if (query) {
        SearchHistory.save(query);
        updateResultsCounter(count, total);
      }
    }, 100);

    searchInput.addEventListener('input', debouncedSearch);

    // Mostrar histórico ao focar
    searchInput.addEventListener('focus', () => {
      console.log('Buscas recentes:', SearchHistory.get());
    });

    // Adicionar botão de impressão
    const printBtn = document.createElement('button');
    printBtn.textContent = '🖨️ Imprimir';
    printBtn.style.cssText = 'margin-left:10px;padding:8px 16px;background:#0c8659;color:white;border:none;border-radius:6px;cursor:pointer;';
    printBtn.onclick = printFilteredResults;

    const searchContainer = document.querySelector('.search-box-container');
    if (searchContainer) {
      searchContainer.appendChild(printBtn);
    }
  }
});

// ========== ATALHOS DE TECLADO AVANÇADOS ==========
document.addEventListener('keydown', function(e) {
  // Ctrl + F para focar busca
  if (e.ctrlKey && e.key === 'f') {
    e.preventDefault();
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.focus();
  }

  // Ctrl + P para imprimir
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    printFilteredResults();
  }
});

console.log('✅ Recursos avançados de busca carregados');
