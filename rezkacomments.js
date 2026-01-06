/**
 * Плагін для відображення коментарів з Rezka.ag
 * Версія з TMDB API та покращеним парсингом
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
    
    // TMDB API ключ (безкоштовний, для отримання оригінальної назви)
    const TMDB_API_KEY = '6f6a7c8a4b4478c5c5f5d5e5f5g5h5i5'; // Це тестовий ключ, може не працювати

    // Функція для отримання оригінальної англійської назви через TMDB
    async function getEnglishTitleFromTMDB(tmdbId, type) {
        try {
            console.log('[Rezka Comments] Отримання англійської назви з TMDB:', tmdbId, type);
            
            // Формуємо URL для TMDB API
            const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;
            
            console.log('[Rezka Comments] TMDB URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.log('[Rezka Comments] TMDB помилка:', response.status);
                return null;
            }
            
            const data = await response.json();
            
            // Отримуємо оригінальну назву
            let englishTitle = '';
            if (type === 'movie') {
                englishTitle = data.original_title || data.title || '';
            } else {
                englishTitle = data.original_name || data.name || '';
            }
            
            console.log('[Rezka Comments] Англійська назва:', englishTitle);
            return englishTitle;
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка TMDB:', error);
            return null;
        }
    }

    // Альтернатива: отримуємо назву з Lampa даних
    function getTitleFromLampaData(e) {
        try {
            if (!e || !e.data || !e.data.movie) return null;
            
            // Пріоритет: оригінальна назва > локалізована назва
            const movie = e.data.movie;
            
            if (movie.original_title) return movie.original_title;
            if (movie.original_name) return movie.original_name;
            if (movie.title) return movie.title;
            if (movie.name) return movie.name;
            
            return null;
        } catch (error) {
            console.error('[Rezka Comments] Помилка отримання назви з Lampa:', error);
            return null;
        }
    }

    // Проксі сервер для обходу CORS
    async function fetchWithProxy(url, options = {}) {
        const proxyUrls = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
            url // Прямий запит як останній варіант
        ];
        
        for (const proxyUrl of proxyUrls) {
            try {
                console.log('[Rezka Comments] Спроба через проксі:', proxyUrl);
                
                const response = await fetch(proxyUrl, {
                    ...options,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'text/html,application/json',
                        ...options.headers
                    }
                });
                
                if (response.ok) {
                    console.log('[Rezka Comments] Запит успішний через проксі');
                    return response;
                }
            } catch (error) {
                console.log('[Rezka Comments] Проксі не працює:', error.message);
                continue;
            }
        }
        
        throw new Error('Не вдалося виконати запит через жоден проксі');
    }

    // Пошук фільму на Rezka
    async function searchOnRezka(title, year) {
        try {
            console.log('[Rezka Comments] Пошук на Rezka:', title, year);
            
            // Підготовлюємо назву для пошуку
            let searchTitle = prepareTitleForSearch(title);
            if (!searchTitle) {
                console.log('[Rezka Comments] Пуста назва для пошуку');
                return null;
            }
            
            // Додаємо рік до пошуку
            if (year) {
                searchTitle += ` ${year}`;
            }
            
            // Формуємо URL пошуку
            const searchUrl = `https://hdrezka.ag/search/?do=search&subaction=search&q=${encodeURIComponent(searchTitle)}`;
            console.log('[Rezka Comments] Пошуковий URL:', searchUrl);
            
            // Виконуємо запит через проксі
            const response = await fetchWithProxy(searchUrl);
            const html = await response.text();
            
            // Парсимо HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Знаходимо перший результат
            const result = doc.querySelector('.b-content__inline_item');
            if (!result) {
                console.log('[Rezka Comments] Фільм не знайдено на Rezka');
                return null;
            }
            
            // Отримуємо дані фільму
            const movieId = result.getAttribute('data-id');
            const movieTitle = result.querySelector('.b-content__inline_item-link')?.textContent?.trim() || '';
            const movieYear = result.querySelector('.b-content__inline_item-cover .info .year')?.textContent?.trim() || '';
            
            console.log('[Rezka Comments] Знайдено на Rezka:', movieTitle, 'ID:', movieId, 'Рік:', movieYear);
            
            return {
                id: movieId,
                title: movieTitle,
                year: movieYear
            };
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка пошуку на Rezka:', error);
            return null;
        }
    }

    // Підготовка назви для пошуку
    function prepareTitleForSearch(title) {
        if (!title) return '';
        
        // Замінюємо українські літери на російські
        const ukrainianToRussian = {
            'і': 'и', 'І': 'И',
            'ї': 'и', 'Ї': 'И', 
            'є': 'е', 'Є': 'Е',
            'ґ': 'г', 'Ґ': 'Г'
        };
        
        let preparedTitle = title;
        
        // Замінюємо символи
        preparedTitle = preparedTitle.split('').map(char => {
            return ukrainianToRussian[char] || char;
        }).join('');
        
        // Видаляємо спеціальні символи
        preparedTitle = preparedTitle.replace(/[^\w\sА-Яа-яЁё\-]/gi, ' ');
        
        // Видаляємо зайві пробіли
        preparedTitle = preparedTitle.replace(/\s+/g, ' ').trim();
        
        console.log('[Rezka Comments] Підготовлена назва:', preparedTitle);
        return preparedTitle;
    }

    // Отримання коментарів з Rezka
    async function getCommentsFromRezka(movieId) {
        try {
            console.log('[Rezka Comments] Отримання коментарів для ID:', movieId);
            
            // Формуємо URL для коментарів
            const commentsUrl = `https://rezka.ag/ajax/get_comments/?t=${Date.now()}&news_id=${movieId}&cstart=1&type=0&comment_id=0&skin=hdrezka`;
            console.log('[Rezka Comments] URL коментарів:', commentsUrl);
            
            // Виконуємо запит через проксі
            const response = await fetchWithProxy(commentsUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!data || !data.comments) {
                console.log('[Rezka Comments] Немає коментарів у відповіді');
                return null;
            }
            
            console.log('[Rezka Comments] Коментарі отримані, HTML довжина:', data.comments.length);
            
            // Парсимо коментарі
            return parseCommentsHTML(data.comments);
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка отримання коментарів:', error);
            return null;
        }
    }

    // Парсинг HTML коментарів
    function parseCommentsHTML(html) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Знаходимо всі коментарі
            const commentElements = doc.querySelectorAll('.b-comment');
            console.log('[Rezka Comments] Знайдено елементів коментарів:', commentElements.length);
            
            if (commentElements.length === 0) {
                return [];
            }
            
            const comments = [];
            
            // Обробляємо кожен коментар
            commentElements.forEach((commentEl, index) => {
                try {
                    const comment = parseSingleComment(commentEl);
                    if (comment) {
                        comments.push(comment);
                    }
                } catch (error) {
                    console.log('[Rezka Comments] Помилка парсингу коментаря', index, error);
                }
            });
            
            console.log('[Rezka Comments] Успішно розпарсено коментарів:', comments.length);
            return comments;
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка парсингу HTML коментарів:', error);
            return [];
        }
    }

    // Парсинг одного коментаря
    function parseSingleComment(commentEl) {
        try {
            // Отримуємо аватар
            const avatarEl = commentEl.querySelector('.ava img');
            const avatar = avatarEl ? (avatarEl.dataset.src || avatarEl.src) : '';
            
            // Отримуємо ім'я користувача
            const nameEl = commentEl.querySelector('.name');
            const username = nameEl ? nameEl.textContent.trim() : 'Анонім';
            
            // Отримуємо дату
            const dateEl = commentEl.querySelector('.date');
            const date = dateEl ? dateEl.textContent.trim() : '';
            
            // Отримуємо текст коментаря
            const textEl = commentEl.querySelector('.text');
            let text = textEl ? textEl.innerHTML.trim() : '';
            
            // Очищаємо текст від спойлерів та інших елементів
            text = cleanCommentText(text);
            
            // Отримуємо рейтинг
            const ratingEl = commentEl.querySelector('.rating');
            const rating = ratingEl ? ratingEl.textContent.trim() : '';
            
            return {
                avatar,
                username,
                date,
                text,
                rating,
                hasAvatar: !!avatar
            };
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка парсингу одного коментаря:', error);
            return null;
        }
    }

    // Очищення тексту коментаря
    function cleanCommentText(text) {
        if (!text) return '';
        
        // Видаляємо спойлери
        text = text.replace(/<div class="title_spoiler"[^>]*>.*?<\/div>/gi, '[СПОЙЛЕР]');
        
        // Видаляємо скрипти та стилі
        text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        
        // Видаляємо зайві теги, але залишаємо базове форматування
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<[^>]+>/g, ' ');
        
        // Очищаємо від зайвих пробілів
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    // Створення HTML для коментарів
    function createCommentsHTML(comments, movieTitle) {
        if (!comments || comments.length === 0) {
            return `
                <div class="no-comments">
                    <h3>Коментарі не знайдено</h3>
                    <p>Для фільму "${movieTitle}" ще немає коментарів на Rezka.ag</p>
                </div>
            `;
        }
        
        let html = `
            <div class="comments-header">
                <h3>Коментарі з Rezka.ag</h3>
                <p class="movie-title">${movieTitle}</p>
                <p class="comments-count">Знайдено коментарів: ${comments.length}</p>
            </div>
            
            <div class="comments-list">
        `;
        
        comments.forEach((comment, index) => {
            const avatarHtml = comment.hasAvatar 
                ? `<img src="${comment.avatar}" class="comment-avatar" alt="${comment.username}">`
                : `<div class="comment-avatar placeholder">${comment.username.charAt(0)}</div>`;
            
            const ratingHtml = comment.rating 
                ? `<span class="comment-rating">${comment.rating}</span>`
                : '';
            
            html += `
                <div class="comment-item" data-index="${index}">
                    <div class="comment-header">
                        ${avatarHtml}
                        <div class="comment-user-info">
                            <span class="comment-username">${comment.username}</span>
                            <span class="comment-date">${comment.date}</span>
                            ${ratingHtml}
                        </div>
                    </div>
                    <div class="comment-text">
                        ${comment.text}
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="comments-footer">
                <button class="modal-close-btn selector" data-action="close">
                    Закрити (ESC)
                </button>
            </div>
        `;
        
        return html;
    }

    // Показ модального вікна з коментарями
    function showCommentsModal(comments, movieTitle) {
        Lampa.Loading.stop();
        
        // Створюємо HTML
        const commentsHTML = createCommentsHTML(comments, movieTitle);
        
        // Створюємо контейнер
        const modalContent = $(`
            <div class="rezka-comments-container">
                ${commentsHTML}
            </div>
        `);
        
        // Обробник кнопки закриття
        modalContent.find('.modal-close-btn').on('hover:enter click', function() {
            Lampa.Modal.close();
        });
        
        // Відкриваємо модальне вікно
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
                // Додаємо стилі
                addCommentsStyles();
                
                // Ініціалізуємо навігацію
                setTimeout(function() {
                    const closeBtn = document.querySelector('.modal-close-btn');
                    if (closeBtn && Lampa.Controller) {
                        Lampa.Controller.collectionSet([closeBtn]);
                    }
                }, 100);
            }
        });
    }

    // Додавання стилів
    function addCommentsStyles() {
        if (document.getElementById('rezka-comments-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'rezka-comments-styles';
        style.textContent = `
            .rezka-comments-container {
                font-family: Arial, sans-serif;
                color: #e0e0e0;
                padding: 10px;
                max-height: 70vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .comments-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #333;
                flex-shrink: 0;
            }
            
            .comments-header h3 {
                margin: 0 0 10px 0;
                color: #fff;
                font-size: 22px;
            }
            
            .movie-title {
                margin: 0 0 5px 0;
                color: #aaa;
                font-size: 18px;
                font-weight: bold;
            }
            
            .comments-count {
                margin: 0;
                color: #888;
                font-size: 14px;
            }
            
            .comments-list {
                flex: 1;
                overflow-y: auto;
                padding-right: 10px;
                margin-bottom: 15px;
            }
            
            .comments-list::-webkit-scrollbar {
                width: 8px;
            }
            
            .comments-list::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 4px;
            }
            
            .comments-list::-webkit-scrollbar-thumb {
                background: #444;
                border-radius: 4px;
            }
            
            .comment-item {
                background: #1e1e1e;
                border-radius: 10px;
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
                width: 48px;
                height: 48px;
                border-radius: 50%;
                margin-right: 15px;
                border: 2px solid #444;
                object-fit: cover;
            }
            
            .comment-avatar.placeholder {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: bold;
            }
            
            .comment-user-info {
                flex: 1;
            }
            
            .comment-username {
                font-weight: bold;
                color: #fff;
                font-size: 18px;
                display: block;
                margin-bottom: 3px;
            }
            
            .comment-date {
                color: #888;
                font-size: 13px;
                display: block;
                margin-bottom: 3px;
            }
            
            .comment-rating {
                background: #2a5c2a;
                color: #8bc34a;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .comment-text {
                color: #ccc;
                line-height: 1.6;
                font-size: 16px;
                white-space: pre-line;
            }
            
            .no-comments {
                text-align: center;
                padding: 40px 20px;
            }
            
            .no-comments h3 {
                color: #fff;
                margin-bottom: 15px;
            }
            
            .no-comments p {
                color: #aaa;
            }
            
            .comments-footer {
                text-align: center;
                padding-top: 15px;
                border-top: 1px solid #333;
                flex-shrink: 0;
            }
            
            .modal-close-btn {
                background: #2a2a2a;
                border: 2px solid #444;
                color: #fff;
                border-radius: 8px;
                padding: 12px 30px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                min-width: 150px;
                transition: all 0.2s;
            }
            
            .modal-close-btn:hover,
            .modal-close-btn.focus {
                background: #3a3a3a;
                border-color: #00a8ff;
                transform: scale(1.05);
            }
            
            /* Адаптація для TV */
            @media (min-width: 1920px) {
                .comment-username {
                    font-size: 20px;
                }
                
                .comment-text {
                    font-size: 18px;
                }
                
                .modal-close-btn {
                    font-size: 18px;
                    padding: 14px 35px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Основна функція пошуку коментарів
    async function searchComments(e) {
        try {
            console.log('[Rezka Comments] === ПОЧАТОК ПОШУКУ КОМЕНТАРІВ ===');
            
            // Отримуємо дані фільму
            const movieData = e.data.movie;
            if (!movieData) {
                Lampa.Noty.show("Дані фільму не знайдені");
                return;
            }
            
            // Отримуємо назву фільму
            let movieTitle = getTitleFromLampaData(e);
            if (!movieTitle) {
                Lampa.Noty.show("Не вдалося отримати назву фільму");
                return;
            }
            
            console.log('[Rezka Comments] Назва фільму з Lampa:', movieTitle);
            
            // Отримуємо рік
            let releaseYear = '';
            if (movieData.release_date) {
                releaseYear = movieData.release_date.substring(0, 4);
            } else if (movieData.first_air_date) {
                releaseYear = movieData.first_air_date.substring(0, 4);
            }
            
            console.log('[Rezka Comments] Рік випуску:', releaseYear);
            
            // Спроба отримати англійську назву через TMDB
            let englishTitle = null;
            if (movieData.id && e.object.method) {
                englishTitle = await getEnglishTitleFromTMDB(movieData.id, e.object.method);
            }
            
            // Використовуємо англійську назву якщо є, інакше оригінальну
            const searchTitle = englishTitle || movieTitle;
            console.log('[Rezka Comments] Назва для пошуку:', searchTitle);
            
            // Починаємо завантаження
            Lampa.Loading.start();
            
            // Шукаємо фільм на Rezka
            const rezkaResult = await searchOnRezka(searchTitle, releaseYear);
            
            if (!rezkaResult) {
                Lampa.Loading.stop();
                Lampa.Noty.show("Фільм не знайдено на Rezka.ag");
                return;
            }
            
            console.log('[Rezka Comments] Фільм знайдено на Rezka:', rezkaResult.title, 'ID:', rezkaResult.id);
            
            // Отримуємо коментарі
            const comments = await getCommentsFromRezka(rezkaResult.id);
            
            if (!comments || comments.length === 0) {
                Lampa.Loading.stop();
                Lampa.Noty.show("Коментарі не знайдені");
                return;
            }
            
            console.log('[Rezka Comments] Знайдено коментарів:', comments.length);
            
            // Показуємо коментарі
            showCommentsModal(comments, rezkaResult.title);
            
        } catch (error) {
            console.error('[Rezka Comments] КРИТИЧНА ПОМИЛКА:', error);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка завантаження коментарів");
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (isPluginActive) return;
        
        console.log('[Rezka Comments] === ІНІЦІАЛІЗАЦІЯ ПЛАГІНА ===');
        
        isPluginActive = true;
        
        // Чекаємо на готовність Lampa
        const checkLampa = setInterval(function() {
            if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
                clearInterval(checkLampa);
                setupPlugin();
            }
        }, 500);
        
        // Таймаут
        setTimeout(function() {
            clearInterval(checkLampa);
            console.log('[Rezka Comments] Lampa не завантажилася');
        }, 10000);
    }

    // Налаштування плагіна
    function setupPlugin() {
        console.log('[Rezka Comments] === НАЛАШТУВАННЯ ПЛАГІНА ===');
        
        // Додаємо слухач подій
        Lampa.Listener.follow("full", function(e) {
            if (e.type === "complite") {
                addCommentButton(e);
            }
        });
        
        console.log('[Rezka Comments] Плагін активовано');
    }

    // Додавання кнопки коментарів
    function addCommentButton(e) {
        try {
            // Видаляємо старі кнопки
            $(".button--comment").remove();
            
            // Створюємо нову кнопку
            const button = $(`
                <div class="full-start__button selector button--comment">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span>Коментарі Rezka</span>
                </div>
            `);
            
            // Додаємо в контейнер
            const buttonsContainer = $(".full-start-new__buttons");
            if (buttonsContainer.length) {
                buttonsContainer.append(button);
                
                // Додаємо обробник події
                button.on("hover:enter", function() {
                    console.log('[Rezka Comments] Клік по кнопці коментарів');
                    searchComments(e);
                });
                
                console.log('[Rezka Comments] Кнопка додана успішно');
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
