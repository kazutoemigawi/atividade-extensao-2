console.log('🏋️ Site de dicas carregado');

document.addEventListener('DOMContentLoaded', function(){
  // Dark/Light mode toggle
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  const body = document.body;
  
  // Carregar tema salvo ou preferência do sistema
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  if(savedTheme === 'dark'){
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  } else {
    body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
  }
  
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      body.classList.toggle('dark-mode');
      const isDarkMode = body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    });
  }
  
  // Busca de exercícios
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  // Mapeamento de objetivos para arquivos
  const objetivosMap = {
    'hipertrofia': 'musculos/hipertrofia.html',
    'ganho': 'musculos/hipertrofia.html',
    'massa': 'musculos/hipertrofia.html',
    'growth': 'musculos/hipertrofia.html',
    
    
    'cardio': 'musculos/cardio.html',
    'resistência': 'musculos/cardio.html',
    'resistencia': 'musculos/cardio.html',
    'corrida': 'musculos/cardio.html',
    'aeróbico': 'musculos/cardio.html',
    'aerobico': 'musculos/cardio.html',
    
    'força': 'musculos/força.html',
    'forca': 'musculos/força.html',
    'força máxima': 'musculos/força.html',
    'power': 'musculos/força.html',
    'explosivo': 'musculos/força.html'
  };

  // Lista de sugestões
  const sugestoesArray = ['hipertrofia', 'cardio', 'força'];

  // Criar container de sugestões
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.id = 'suggestions-container';
  suggestionsContainer.className = 'suggestions-container hidden';
  searchInput.parentElement.appendChild(suggestionsContainer);

  if(searchInput){
    // Busca em tempo real + sugestões
    searchInput.addEventListener('input', function(){
      const query = this.value.toLowerCase().trim();

      // Mostrar sugestões
      if(query === ''){
        searchResults.classList.add('hidden');
        suggestionsContainer.classList.add('hidden');
      } else {
        mostrarSugestoes(query);
      }
    });

    // Função para mostrar sugestões
    function mostrarSugestoes(query) {
      const sugestoesFiltered = sugestoesArray.filter(sugestao => 
        sugestao.startsWith(query) && sugestao !== query
      );

      if(sugestoesFiltered.length > 0){
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('hidden');

        sugestoesFiltered.forEach(sugestao => {
          const suggestionItem = document.createElement('div');
          suggestionItem.className = 'suggestion-item';
          
          // Destacar a parte já digitada
          const prefix = sugestao.substring(0, query.length);
          const suffix = sugestao.substring(query.length);
          suggestionItem.innerHTML = `<strong>${prefix}</strong>${suffix}`;
          
          suggestionItem.addEventListener('click', function(){
            searchInput.value = sugestao;
            searchInput.dispatchEvent(new Event('input'));
          });

          suggestionItem.addEventListener('mouseenter', function(){
            this.classList.add('active');
          });

          suggestionItem.addEventListener('mouseleave', function(){
            this.classList.remove('active');
          });

          suggestionsContainer.appendChild(suggestionItem);
        });
      } else {
        suggestionsContainer.classList.add('hidden');
      }
    }

    // Navegar sugestões com setas
    searchInput.addEventListener('keydown', function(e){
      const suggestionItems = suggestionsContainer.querySelectorAll('.suggestion-item');
      
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        let activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
        if(!activeItem && suggestionItems.length > 0){
          suggestionItems[0].classList.add('active');
        } else if(activeItem){
          const nextItem = activeItem.nextElementSibling;
          if(nextItem){
            activeItem.classList.remove('active');
            nextItem.classList.add('active');
          }
        }
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        let activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
        if(activeItem){
          const prevItem = activeItem.previousElementSibling;
          if(prevItem){
            activeItem.classList.remove('active');
            prevItem.classList.add('active');
          } else {
            activeItem.classList.remove('active');
          }
        }
      } else if(e.key === 'Enter'){
        e.preventDefault();
        const activeItem = suggestionsContainer.querySelector('.suggestion-item.active');
        if(activeItem){
          searchInput.value = activeItem.textContent;
          searchInput.dispatchEvent(new Event('input'));
        }
        
        const query = this.value.toLowerCase().trim();
        
        // Procurar por objetivo correspondente
        if(objetivosMap[query]){
          window.location.href = objetivosMap[query];
        } else {
          // Se não encontrar exato, procurar por palavra-chave
          for(let objetivo in objetivosMap){
            if(query.includes(objetivo) || objetivo.includes(query)){
              window.location.href = objetivosMap[objetivo];
              return;
            }
          }
          // Se nada encontrado, mostrar mensagem
          alert('❌ Objetivo não encontrado. Tente: hipertrofia, definição, cardio ou força');
        }
      }
    });

    // Limpar busca ao pressionar ESC
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && searchInput.value){
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    });
  }
});