/**
 * Плагін для відображення коментарів з Rezka.ag
 * Спрощена версія без TMDB API
 */

(function() {
    'use strict';

    // Перевірка наявності Lampa
    if (typeof Lampa === 'undefined') {
        console.log('[Rezka Comments] Чекаємо на завантаження Lampa...');
        setTimeout(function() {
            if (typeof Lampa !== 'undefined') {
                initPlugin();
            }
        }, 2000);
        return;
    }

    let year;
    let namemovie;
    let isPluginActive = false;

    // Альтернативні проксі сервери
    const proxyServers = [
        "https://corsproxy.io/?",
        "https://api.codetabs.com/v1/proxy?quest=",
        "https://api.allorigins.win/raw?url=",
        ""
    ];

    // Отримуємо коментарі
    async function getCommentsDirectly(movieId) {
        try {
            console.log('[Rezka Comments] Спроба отримати коментарі для ID:', movieId);
            
            // Формуємо URL для коментарів
            const url = `https://rezka.ag/ajax/get_comments/?t=${Date.now()}&news_id=${movieId}&cstart=1&type=0&comment_id=0&skin=hdrezka`;
            
            console.log('[Rezka Comments] URL запиту:', url);
            
            // Спроба через кожен проксі
            for (let proxy of proxyServers) {
                try {
                    let requestUrl = proxy ? proxy + encodeURIComponent(url) : url;
                    
                    console.log('[Rezka Comments] Спроба через:', proxy || 'Без проксі');
                    
                    let response = await fetch(requestUrl, {
                        method: "GET",
                        headers: {
                            "Accept": "application/json",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                        },
                        signal: AbortSignal.timeout(10000) // Таймаут 10 секунд
                    });

                    if (response.ok) {
                        let data = await response.json();
                        if (data.comments) {
                            console.log('[Rezka Comments] Коментарі отримані успішно');
                            return data.comments;
                        }
                    }
                } catch (proxyError) {
                    console.log('[Rezka Comments] Проксі не працює:', proxy, proxyError);
                    continue;
                }
            }
            
            throw new Error("Не вдалося отримати коментарі через жоден проксі");
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка отримання коментарів:', error);
            throw error;
        }
    }

    // Пошук фільму на Rezka
    async function searchRezka(title, year) {
        try {
            console.log('[Rezka Comments] Пошук фільму:', title, year);
            
            // Формуємо пошуковий запит
            const searchQuery = encodeURIComponent(`${title} ${year || ''}`.trim());
            const searchUrl = `https://hdrezka.ag/search/?do=search&subaction=search&q=${searchQuery}`;
            
            console.log('[Rezka Comments] Пошуковий URL:', searchUrl);
            
            // Спроба через кожен проксі
            for (let proxy of proxyServers) {
                try {
                    let requestUrl = proxy ? proxy + encodeURIComponent(searchUrl) : searchUrl;
                    
                    console.log('[Rezka Comments] Пошук через:', proxy || 'Без проксі');
                    
                    let response = await fetch(requestUrl, {
                        method: "GET",
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                            "Accept": "text/html"
                        },
                        signal: AbortSignal.timeout(10000)
                    });

                    if (response.ok) {
                        let html = await response.text();
                        
                        // Парсимо HTML
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        // Знаходимо перший результат
                        const result = doc.querySelector('.b-content__inline_item');
                        if (result) {
                            // Отримуємо ID фільму
                            const movieId = result.getAttribute('data-id');
                            const movieTitle = result.querySelector('.b-content__inline_item-link')?.textContent || '';
                            
                            console.log('[Rezka Comments] Знайдено фільм:', movieTitle, 'ID:', movieId);
                            
                            return {
                                id: movieId,
                                title: movieTitle
                            };
                        }
                    }
                } catch (proxyError) {
                    console.log('[Rezka Comments] Проксі не працює для пошуку:', proxy, proxyError);
                    continue;
                }
            }
            
            console.log('[Rezka Comments] Фільм не знайдено в результатах пошуку');
            return null;
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка пошуку:', error);
            return null;
        }
    }

    // Готуємо назву для пошуку
    function prepareSearchTitle(title) {
        if (!title) return '';
        
        // Замінюємо українські літери на російські (для пошуку на Rezka)
        const ukrainianToRussian = {
            'і': 'и', 'І': 'И',
            'ї': 'и', 'Ї': 'И',
            'є': 'е', 'Є': 'Е',
            'ґ': 'г', 'Ґ': 'Г',
            '’': '', "'": ''
        };
        
        let cleanTitle = title;
        
        // Видаляємо спеціальні символи
        cleanTitle = cleanTitle.replace(/[^\w\sА-Яа-яЁё\-]/gi, ' ');
        
        // Замінюємо українські літери
        cleanTitle = cleanTitle.split('').map(char => {
            return ukrainianToRussian[char] || char;
        }).join('');
        
        // Видаляємо зайві пробіли
        cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
        
        console.log('[Rezka Comments] Підготовлена назва для пошуку:', cleanTitle);
        return cleanTitle;
    }

    // Отримуємо назву фільму з Lampa
    function getMovieTitleFromLampa(e) {
        try {
            if (!e || !e.data || !e.data.movie) return null;
            
            // Спершу пробуємо оригінальну назву
            if (e.data.movie.original_title) {
                return e.data.movie.original_title;
            }
            
            if (e.data.movie.original_name) {
                return e.data.movie.original_name;
            }
            
            // Потім локалізовану назву
            if (e.data.movie.title) {
                return e.data.movie.title;
            }
            
            if (e.data.movie.name) {
                return e.data.movie.name;
            }
            
            return null;
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка отримання назви:', error);
            return null;
        }
    }

    // Створення розмітки коментаря
    function createCommentMarkup(comment) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(comment, 'text/html');
            
            const avatar = doc.querySelector('.ava img')?.src || '';
            const username = doc.querySelector('.name')?.textContent?.trim() || 'Користувач';
            const date = doc.querySelector('.date')?.textContent?.trim() || '';
            let text = doc.querySelector('.text')?.innerHTML || '';
            
            // Очищаємо текст від спойлерів
            text = text.replace(/<div class="title_spoiler"[^>]*>.*?<\/div>/g, '[Спойлер]');
            text = text.replace(/<script[^>]*>.*?<\/script>/gi, '');
            text = text.replace(/<style[^>]*>.*?<\/style>/gi, '');
            
            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <img src="${avatar}" class="comment-avatar" onerror="this.style.display='none'">
                        <div class="comment-user-info">
                            <span class="comment-username">${username}</span>
                            <span class="comment-date">${date}</span>
                        </div>
                    </div>
                    <div class="comment-text">
                        ${text}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[Rezka Comments] Помилка парсингу коментаря:', error);
            return '<div class="comment-error">Помилка завантаження коментаря</div>';
        }
    }

    // Завантаження та відображення коментарів
    async function loadAndShowComments(movieId, movieTitle) {
        try {
            console.log('[Rezka Comments] Завантаження коментарів для:', movieTitle, 'ID:', movieId);
            
            if (!movieId) {
                throw new Error('Немає ID фільму');
            }
            
            Lampa.Loading.start();
            namemovie = movieTitle;
            
            const commentsHtml = await getCommentsDirectly(movieId);
            
            if (!commentsHtml) {
                throw new Error('Не вдалося отримати коментарі');
            }
            
            console.log('[Rezka Comments] Коментарі отримані, довжина:', commentsHtml.length);
            
            // Парсимо коментарі
            const parser = new DOMParser();
            const doc = parser.parseFromString(commentsHtml, 'text/html');
            
            // Знаходимо всі коментарі
            const commentElements = doc.querySelectorAll('.b-comment');
            console.log('[Rezka Comments] Знайдено коментарів:', commentElements.length);
            
            if (commentElements.length === 0) {
                showNoComments();
                return;
            }
            
            // Створюємо контейнер для коментарів
            let commentsHtmlString = '<div class="comments-container">';
            
            commentElements.forEach((comment, index) => {
                if (index < 30) { // Обмежуємо кількість коментарів
                    commentsHtmlString += createCommentMarkup(comment.outerHTML);
                }
            });
            
            commentsHtmlString += '</div>';
            
            // Показуємо коментарі
            showCommentsModal(commentsHtmlString, movieTitle);
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка завантаження коментарів:', error);
            Lampa.Loading.stop();
            Lampa.Noty.show("Не вдалося завантажити коментарі");
        }
    }

    // Показуємо повідомлення про відсутність коментарів
    function showNoComments() {
        Lampa.Loading.stop();
        Lampa.Modal.open({
            title: namemovie || "Коментарі",
            html: $(`<div style="padding: 40px; text-align: center;">
                <h3>Коментарі не знайдено</h3>
                <p>Для цього фільму ще немає коментарів на Rezka.ag</p>
                <p>Або фільм не знайдено на сайті</p>
            </div>`),
            size: "small",
            onBack: function() {
                Lampa.Modal.close();
            }
        });
    }

    // Показуємо модальне вікно з коментарями
    function showCommentsModal(commentsHtml, title) {
        Lampa.Loading.stop();
        
        // Додаємо стилі
        addStyles();
        
        const modalContent = $(`
            <div class="rezka-comments-wrapper">
                <div class="comments-header">
                    <h3>Коментарі з Rezka.ag</h3>
                    <p class="movie-title">${title || 'Фільм'}</p>
                </div>
                <div class="comments-scroll-container">
                    ${commentsHtml}
                </div>
                <div class="comments-footer">
                    <button class="modal-close-btn selector" data-action="close">
                        Закрити
                    </button>
                </div>
            </div>
        `);
        
        // Обробник кнопки закриття
        modalContent.find('.modal-close-btn').on('hover:enter', function() {
            Lampa.Modal.close();
        });
        
        modalContent.find('.modal-close-btn').on('click', function() {
            Lampa.Modal.close();
        });
        
        Lampa.Modal.open({
            title: "Коментарі з Rezka",
            html: modalContent,
            size: "large",
            width: "90%",
            height: "85%",
            mask: true,
            onBack: function() {
                Lampa.Modal.close();
            },
            onReady: function() {
                // Ініціалізуємо навігацію для TV
                setTimeout(function() {
                    const closeBtn = document.querySelector('.modal-close-btn');
                    if (closeBtn && Lampa.Controller) {
                        Lampa.Controller.collectionSet([closeBtn]);
                    }
                }, 100);
            }
        });
    }

    // Додаємо стилі
    function addStyles() {
        if (document.getElementById('rezka-comments-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'rezka-comments-styles';
        style.textContent = `
            .rezka-comments-wrapper {
                font-family: Arial, sans-serif;
                color: #e0e0e0;
                padding: 10px;
            }
            
            .comments-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #333;
            }
            
            .comments-header h3 {
                margin: 0 0 10px 0;
                color: #fff;
                font-size: 20px;
            }
            
            .movie-title {
                margin: 0;
                color: #aaa;
                font-size: 16px;
            }
            
            .comments-scroll-container {
                max-height: 60vh;
                overflow-y: auto;
                padding-right: 10px;
                margin-bottom: 20px;
            }
            
            .comments-scroll-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .comments-scroll-container::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 4px;
            }
            
            .comments-scroll-container::-webkit-scrollbar-thumb {
                background: #444;
                border-radius: 4px;
            }
            
            .comment-item {
                background: #1e1e1e;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                border: 1px solid #2a2a2a;
            }
            
            .comment-header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .comment-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 12px;
                border: 2px solid #444;
                background: #333;
            }
            
            .comment-user-info {
                flex: 1;
            }
            
            .comment-username {
                font-weight: bold;
                color: #fff;
                font-size: 16px;
                display: block;
            }
            
            .comment-date {
                color: #888;
                font-size: 12px;
                display: block;
                margin-top: 2px;
            }
            
            .comment-text {
                color: #ccc;
                line-height: 1.5;
                font-size: 15px;
            }
            
            .comment-text a {
                color: #4dabf7;
                text-decoration: underline;
            }
            
            .comments-footer {
                text-align: center;
                padding-top: 15px;
                border-top: 1px solid #333;
            }
            
            .modal-close-btn {
                background: #2a2a2a;
                border: 1px solid #444;
                color: #fff;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 16px;
                cursor: pointer;
                min-width: 120px;
                transition: background 0.2s;
            }
            
            .modal-close-btn:hover,
            .modal-close-btn.focus {
                background: #3a3a3a;
                border-color: #555;
                outline: 2px solid #00a8ff;
            }
            
            .comment-error {
                padding: 10px;
                background: #2a1a1a;
                border: 1px solid #5a1a1a;
                border-radius: 4px;
                color: #ff6b6b;
                text-align: center;
            }
            
            /* Адаптація для TV */
            @media (min-width: 1920px) {
                .comment-username {
                    font-size: 18px;
                }
                
                .comment-text {
                    font-size: 17px;
                }
                
                .modal-close-btn {
                    font-size: 18px;
                    padding: 14px 28px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Головна функція пошуку коментарів
    async function searchComments(e) {
        try {
            console.log('[Rezka Comments] Початок пошуку коментарів');
            
            // Отримуємо назву фільму з Lampa
            const movieTitle = getMovieTitleFromLampa(e);
            
            if (!movieTitle) {
                Lampa.Noty.show("Не вдалося отримати назву фільму");
                return;
            }
            
            // Отримуємо рік
            let releaseYear = '';
            if (e.data.movie.release_date) {
                releaseYear = e.data.movie.release_date.substring(0, 4);
            } else if (e.data.movie.first_air_date) {
                releaseYear = e.data.movie.first_air_date.substring(0, 4);
            }
            
            console.log('[Rezka Comments] Назва для пошуку:', movieTitle, 'Рік:', releaseYear);
            
            // Підготовлюємо назву для пошуку
            const searchTitle = prepareSearchTitle(movieTitle);
            
            if (!searchTitle) {
                Lampa.Noty.show("Не вдалося підготувати назву для пошуку");
                return;
            }
            
            // Шукаємо фільм на Rezka
            Lampa.Loading.start();
            const rezkaResult = await searchRezka(searchTitle, releaseYear);
            
            if (!rezkaResult || !rezkaResult.id) {
                Lampa.Loading.stop();
                Lampa.Noty.show("Фільм не знайдено на Rezka");
                return;
            }
            
            // Завантажуємо коментарі
            await loadAndShowComments(rezkaResult.id, rezkaResult.title);
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка пошуку коментарів:', error);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка пошуку коментарів");
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (isPluginActive) return;
        
        console.log('[Rezka Comments] Ініціалізація плагіна');
        
        isPluginActive = true;
        
        // Чекаємо на готовність Lampa
        let initAttempts = 0;
        const maxAttempts = 10;
        
        const initInterval = setInterval(function() {
            initAttempts++;
            
            if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
                clearInterval(initInterval);
                setupPlugin();
            } else if (initAttempts >= maxAttempts) {
                clearInterval(initInterval);
                console.log('[Rezka Comments] Lampa не завантажилася за 5 секунд');
            }
        }, 500);
    }

    // Налаштування плагіна
    function setupPlugin() {
        console.log('[Rezka Comments] Налаштування плагіна');
        
        // Слухаємо події відкриття фільму
        Lampa.Listener.follow("full", function(e) {
            if (e.type === "complite") {
                addCommentButton(e);
            }
        });
        
        // Додаємо стилі
        addStyles();
        
        console.log('[Rezka Comments] Плагін активовано');
    }

    // Додає кнопку коментарів
    function addCommentButton(e) {
        try {
            // Видаляємо старі кнопки
            $(".button--comment").remove();
            
            // Створюємо нову кнопку
            const button = $(`
                <div class="full-start__button selector button--comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Коментарі</span>
                </div>
            `);
            
            // Додаємо в контейнер кнопок
            const buttonsContainer = $(".full-start-new__buttons");
            if (buttonsContainer.length) {
                buttonsContainer.append(button);
                
                // Обробник кліку
                button.on("hover:enter", function() {
                    searchComments(e);
                });
                
                console.log('[Rezka Comments] Кнопка додана');
            }
        } catch (error) {
            console.error('[Rezka Comments] Помилка додавання кнопки:', error);
        }
    }

    // Запускаємо плагін
    if (typeof Lampa !== 'undefined') {
        initPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPlugin, 1000);
        });
    }

})();
