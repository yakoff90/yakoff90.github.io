/**
 * Плагін для відображення коментарів з Rezka.ag
 * Спростена версія для Samsung TV та Lampa
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

    // Альтернативні проксі сервери (вибираємо перший робочий)
    const proxyServers = [
        "https://corsproxy.io/?",
        "https://api.codetabs.com/v1/proxy?quest=",
        "https://cors-anywhere.herokuapp.com/",
        ""
    ];

    // Отримуємо коментарі напряму або через проксі
    async function getCommentsDirectly(movieId) {
        try {
            console.log('[Rezka Comments] Спроба прямого запиту для ID:', movieId);
            
            // Формуємо URL для коментарів
            const url = `https://rezka.ag/ajax/get_comments/?t=${Date.now()}&news_id=${movieId}&cstart=1&type=0&comment_id=0&skin=hdrezka`;
            
            console.log('[Rezka Comments] URL запиту:', url);
            
            // Спроба прямого запиту
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                mode: 'cors'
            });

            if (response.ok) {
                let data = await response.json();
                return data.comments;
            }
            
            // Якщо прямий запит не працює, пробуємо через проксі
            for (let proxy of proxyServers) {
                try {
                    console.log('[Rezka Comments] Спроба через проксі:', proxy);
                    
                    const proxyUrl = proxy + encodeURIComponent(url);
                    const proxyResponse = await fetch(proxyUrl, {
                        method: "GET",
                        headers: {
                            "Accept": "application/json",
                            "Origin": "https://hdrezka.ag"
                        }
                    });

                    if (proxyResponse.ok) {
                        let data = await proxyResponse.json();
                        return data.comments;
                    }
                } catch (proxyError) {
                    console.log('[Rezka Comments] Проксі не працює:', proxy, proxyError);
                    continue;
                }
            }
            
            throw new Error("Не вдалося отримати коментарі");
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка отримання коментарів:', error);
            throw error;
        }
    }

    // Пошук фільму на Rezka за назвою
    async function searchRezka(title, year) {
        try {
            console.log('[Rezka Comments] Пошук фільму:', title, year);
            
            // Формуємо пошуковий запит
            const searchQuery = encodeURIComponent(`${title} ${year || ''}`.trim());
            const searchUrl = `https://hdrezka.ag/search/?do=search&subaction=search&q=${searchQuery}`;
            
            console.log('[Rezka Comments] Пошуковий URL:', searchUrl);
            
            // Спроба прямого запиту
            let response = await fetch(searchUrl, {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "text/html"
                }
            });

            let html = '';
            
            if (response.ok) {
                html = await response.text();
            } else {
                // Пробуємо через проксі
                for (let proxy of proxyServers) {
                    try {
                        const proxyUrl = proxy + encodeURIComponent(searchUrl);
                        const proxyResponse = await fetch(proxyUrl);
                        
                        if (proxyResponse.ok) {
                            html = await proxyResponse.text();
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
            
            if (!html) {
                throw new Error("Не вдалося завантажити сторінку пошуку");
            }
            
            // Парсимо HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Знаходимо перший результат
            const result = doc.querySelector('.b-content__inline_item');
            if (!result) {
                console.log('[Rezka Comments] Фільм не знайдено в результатах пошуку');
                return null;
            }
            
            // Отримуємо ID фільму
            const movieId = result.getAttribute('data-id');
            const movieTitle = result.querySelector('.b-content__inline_item-link')?.textContent || '';
            
            console.log('[Rezka Comments] Знайдено фільм:', movieTitle, 'ID:', movieId);
            
            return {
                id: movieId,
                title: movieTitle
            };
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка пошуку:', error);
            return null;
        }
    }

    // Отримання оригінальної назви з TMDB
    async function getOriginalTitle(tmdbId, type) {
        try {
            console.log('[Rezka Comments] Отримання оригінальної назви з TMDB:', tmdbId, type);
            
            const response = await fetch(
                `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=6f6a7c8a4b4478c5c5f5d5e5f5g5h5i5&language=en-US`
            );
            
            if (!response.ok) {
                throw new Error(`TMDB API error: ${response.status}`);
            }
            
            const data = await response.json();
            const originalTitle = type === 'movie' ? data.original_title : data.original_name;
            
            console.log('[Rezka Comments] Оригінальна назва:', originalTitle);
            return originalTitle;
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка TMDB:', error);
            // Якщо TMDB не працює, використовуємо локальну назву
            return null;
        }
    }

    // Готуємо назву для пошуку
    function prepareSearchTitle(title) {
        if (!title) return '';
        
        // Видаляємо спеціальні символи
        let cleanTitle = title
            .replace(/[^\w\sА-Яа-яЁёіїєґІЇЄҐ\-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        // Замінюємо українські літери на російські (для пошуку на Rezka)
        const ukrainianToRussian = {
            'і': 'и', 'І': 'И',
            'ї': 'и', 'Ї': 'И',
            'є': 'е', 'Є': 'Е',
            'ґ': 'г', 'Ґ': 'Г'
        };
        
        cleanTitle = cleanTitle.split('').map(char => {
            return ukrainianToRussian[char] || char;
        }).join('');
        
        console.log('[Rezka Comments] Підготовлена назва для пошуку:', cleanTitle);
        return cleanTitle;
    }

    // Створення розмітки коментаря
    function createCommentMarkup(comment) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(comment, 'text/html');
            
            const avatar = doc.querySelector('.ava img')?.src || '';
            const username = doc.querySelector('.name')?.textContent?.trim() || 'Користувач';
            const date = doc.querySelector('.date')?.textContent?.trim() || '';
            const text = doc.querySelector('.text')?.innerHTML || '';
            
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
            return '';
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
                if (index < 50) { // Обмежуємо кількість коментарів для продуктивності
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
                <div class="comments-scroll-container">
                    ${commentsHtml}
                </div>
                <button class="modal-close-btn selector" style="
                    display: block;
                    margin: 20px auto;
                    padding: 12px 24px;
                    background: #2a2a2a;
                    border: 1px solid #444;
                    color: #fff;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                ">Закрити</button>
            </div>
        `);
        
        // Обробник кнопки закриття
        modalContent.find('.modal-close-btn').on('hover:enter click', function() {
            Lampa.Modal.close();
        });
        
        Lampa.Modal.open({
            title: title || "Коментарі з Rezka",
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
                if (Lampa.Controller && typeof Lampa.Controller.collectionSet === 'function') {
                    const selectors = modalContent.find('.selector').toArray();
                    if (selectors.length > 0) {
                        Lampa.Controller.collectionSet(selectors);
                    }
                }
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
            }
            
            .comments-scroll-container {
                max-height: 65vh;
                overflow-y: auto;
                padding-right: 10px;
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
            
            .modal-close-btn.focus {
                background: #3a3a3a !important;
                border-color: #555 !important;
                outline: 2px solid #00a8ff;
            }
            
            @media (max-width: 768px) {
                .comment-avatar {
                    width: 32px;
                    height: 32px;
                }
                
                .comment-username {
                    font-size: 14px;
                }
                
                .comment-text {
                    font-size: 14px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Головна функція пошуку коментарів
    async function searchComments(tmdbId, type, releaseYear) {
        try {
            console.log('[Rezka Comments] Пошук коментарів для:', tmdbId, type, releaseYear);
            
            year = releaseYear;
            
            // Отримуємо оригінальну назву
            const originalTitle = await getOriginalTitle(tmdbId, type);
            
            // Підготовлюємо назву для пошуку
            const searchTitle = prepareSearchTitle(originalTitle);
            
            if (!searchTitle) {
                Lampa.Noty.show("Не вдалося отримати назву для пошуку");
                return;
            }
            
            // Шукаємо фільм на Rezka
            const rezkaResult = await searchRezka(searchTitle, year);
            
            if (!rezkaResult || !rezkaResult.id) {
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
                    <span>Коментарі Rezka</span>
                </div>
            `);
            
            // Додаємо в контейнер кнопок
            const buttonsContainer = $(".full-start-new__buttons");
            if (buttonsContainer.length) {
                buttonsContainer.append(button);
                
                // Обробник кліку
                button.on("hover:enter", function() {
                    handleCommentButtonClick(e);
                });
                
                console.log('[Rezka Comments] Кнопка додана');
            }
        } catch (error) {
            console.error('[Rezka Comments] Помилка додавання кнопки:', error);
        }
    }

    // Обробник кліку по кнопці коментарів
    function handleCommentButtonClick(e) {
        try {
            let releaseYear = '';
            
            if (e.data && e.data.movie) {
                if (e.data.movie.release_date) {
                    releaseYear = e.data.movie.release_date.substring(0, 4);
                } else if (e.data.movie.first_air_date) {
                    releaseYear = e.data.movie.first_air_date.substring(0, 4);
                }
                
                if (e.data.movie.id && e.object && e.object.method) {
                    console.log('[Rezka Comments] Запуск пошуку для:', e.data.movie.id, e.object.method, releaseYear);
                    searchComments(e.data.movie.id, e.object.method, releaseYear);
                } else {
                    Lampa.Noty.show("Недостатньо даних для пошуку");
                }
            } else {
                Lampa.Noty.show("Дані фільму не знайдено");
            }
        } catch (error) {
            console.error('[Rezka Comments] Помилка обробки кліку:', error);
            Lampa.Noty.show("Помилка запуску пошуку");
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
