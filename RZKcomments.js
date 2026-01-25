(function () {
    //BDVBuriлk.github.io
    //2025
    "use strict";

    let year;
    let namemovie;
    let currentMovieData = null;
    let isModalOpen = false;

    // Проксі для обходу CORS
    let kp_prox = "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/";
    let url = "https://rezka.ag/ajax/get_comments/?t=1714093694732&news_id=";

    // Допоміжна функція для логування
    function log(message, data) {
        console.log("[RezkaComments] " + message, data || '');
    }

    // Асинхронний запит з обробкою помилок
    async function makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/html',
                    'Accept': 'text/html'
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.text();
        } catch (error) {
            log("Помилка запиту", error);
            throw error;
        }
    }

    // Пошук на HDRezka
    async function searchRezka(name, ye) {
        try {
            log("Пошук на Rezka:", { name: name, year: ye });
            
            const searchUrl = kp_prox + 
                "https://hdrezka.ag/search/?do=search&subaction=search&q=" + 
                encodeURIComponent(name) + 
                (ye ? "+" + ye : "");
            
            log("URL пошуку:", searchUrl);
            
            const html = await makeRequest(searchUrl);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Знаходимо перший результат
            const result = doc.querySelector('.b-content__inline_item');
            
            if (!result) {
                throw new Error("Фільм не знайдено на Rezka");
            }
            
            namemovie = result.querySelector('.b-content__inline_item-link')?.textContent || "Невідома назва";
            const rezkaId = result.getAttribute('data-id');
            
            log("Знайдено:", { назва: namemovie, ID: rezkaId });
            
            if (!rezkaId) {
                throw new Error("Не вдалося отримати ID");
            }
            
            await loadComments(rezkaId);
            
        } catch (error) {
            log("Помилка пошуку", error);
            Lampa.Loading.stop();
            showNotification("Помилка пошуку: " + error.message);
        }
    }

    // Отримання англійської назви з TMDB
    async function getEnTitle(id, type) {
        try {
            log("Отримання назви з TMDB", { id: id, type: type });
            
            const data = await new Promise((resolve, reject) => {
                Lampa.Api.sources.tmdb.get(
                    `${type === 'movie' ? 'movie' : 'tv'}/${id}?append_to_response=translations`,
                    {},
                    resolve,
                    reject
                );
            });
            
            let enTitle = null;
            
            // Шукаємо англійську назву
            if (data.translations && data.translations.translations) {
                const translations = data.translations.translations;
                
                // Спочатку шукаємо US переклад
                enTitle = translations.find(t => t.iso_3166_1 === 'US')?.data?.title ||
                          translations.find(t => t.iso_3166_1 === 'US')?.data?.name ||
                          translations.find(t => t.iso_639_1 === 'en')?.data?.title ||
                          translations.find(t => t.iso_639_1 === 'en')?.data?.name;
            }
            
            // Якщо не знайшли, беремо оригінальну назву
            if (!enTitle) {
                enTitle = data.original_title || data.original_name;
            }
            
            log("Англійська назва:", enTitle);
            
            if (enTitle) {
                const normalizedTitle = normalizeTitle(enTitle);
                await searchRezka(normalizedTitle, year);
            } else {
                throw new Error("Не вдалося отримати назву");
            }
            
        } catch (error) {
            log("Помилка TMDB", error);
            Lampa.Loading.stop();
            showNotification("Помилка отримання інформації");
        }
    }

    // Нормалізація назви
    function normalizeTitle(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .replace(/ё/g, 'е')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Завантаження коментарів
    async function loadComments(id) {
        try {
            log("Завантаження коментарів для ID:", id);
            
            const commentsUrl = kp_prox + url + id + "&cstart=1&type=0&comment_id=0&skin=hdrezka";
            log("URL коментарів:", commentsUrl);
            
            const response = await fetch(commentsUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.comments) {
                throw new Error("Немає коментарів у відповіді");
            }
            
            log("Отримано коментарі, довжина HTML:", data.comments.length);
            
            // Парсимо HTML коментарів
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.comments, 'text/html');
            
            // Видаляємо непотрібні елементи
            doc.querySelectorAll('.actions, .share-link, i').forEach(el => el.remove());
            
            // Створюємо дерево коментарів
            const commentsTree = createCommentsTree(doc.querySelector('.comments-tree-list'));
            
            // Відображаємо коментарі
            showCommentsModal(commentsTree);
            
            // Кешуємо на 24 години
            cacheComments(id, commentsTree);
            
        } catch (error) {
            log("Помилка завантаження коментарів", error);
            Lampa.Loading.stop();
            
            // Спробуємо показати кешовані коментарі
            const cached = getCachedComments(id);
            if (cached) {
                showCommentsModal(cached);
            } else {
                showNotification("Не вдалося завантажити коментарі");
            }
        }
    }

    // Створення дерева коментарів
    function createCommentsTree(rootElement) {
        if (!rootElement) {
            return document.createDocumentFragment();
        }
        
        const fragment = document.createDocumentFragment();
        
        Array.from(rootElement.children).forEach(commentElement => {
            const indent = parseInt(commentElement.getAttribute('data-indent') || '0', 10);
            
            // Створюємо контейнер для коментаря
            const commentContainer = document.createElement('div');
            commentContainer.className = 'comment-item';
            commentContainer.style.marginLeft = indent > 0 ? (indent * 20) + 'px' : '0';
            
            // Додаємо коментар
            commentContainer.appendChild(createCommentElement(commentElement));
            
            // Додаємо дочірні коментарі
            const childList = commentElement.querySelector('.comments-tree-list');
            if (childList) {
                const childTree = createCommentsTree(childList);
                if (childTree.children.length > 0) {
                    const childrenContainer = document.createElement('div');
                    childrenContainer.className = 'comment-children';
                    childrenContainer.appendChild(childTree);
                    commentContainer.appendChild(childrenContainer);
                }
            }
            
            fragment.appendChild(commentContainer);
        });
        
        return fragment;
    }

    // Створення елемента коментаря
    function createCommentElement(commentElement) {
        const getText = (selector) => {
            const el = commentElement.querySelector(selector);
            return el ? el.textContent.trim() : '';
        };
        
        const getImage = () => {
            const img = commentElement.querySelector('.ava img');
            return img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : '';
        };
        
        const avatar = getImage();
        const userName = getText('.name, .b-comment__user');
        const date = getText('.date, .b-comment__time');
        const messageElement = commentElement.querySelector('.message .text, .text');
        const message = messageElement ? messageElement.innerHTML : '';
        
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
            <div class="comment-header">
                ${avatar ? `<img src="${avatar}" class="comment-avatar" alt="${userName}">` : ''}
                <div class="comment-info">
                    <div class="comment-author">${userName || 'Анонім'}</div>
                    <div class="comment-date">${date}</div>
                </div>
            </div>
            <div class="comment-body">
                ${message}
            </div>
        `;
        
        return commentDiv;
    }

    // Кешування коментарів
    function cacheComments(id, content) {
        try {
            const storageKey = `rezka_comments_${id}`;
            const timestampKey = `rezka_comments_time_${id}`;
            
            const container = document.createElement('div');
            container.appendChild(content.cloneNode(true));
            
            localStorage.setItem(storageKey, container.innerHTML);
            localStorage.setItem(timestampKey, Date.now().toString());
            
            log("Коментарі закешовано", id);
        } catch (error) {
            log("Помилка кешування", error);
        }
    }

    // Отримання кешованих коментарів
    function getCachedComments(id) {
        try {
            const storageKey = `rezka_comments_${id}`;
            const timestampKey = `rezka_comments_time_${id}`;
            
            const cachedHTML = localStorage.getItem(storageKey);
            const cachedTime = parseInt(localStorage.getItem(timestampKey) || '0', 10);
            
            // Перевіряємо, чи не старіше 24 годин
            if (cachedHTML && (Date.now() - cachedTime) < (24 * 60 * 60 * 1000)) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(`<div>${cachedHTML}</div>`, 'text/html');
                
                const fragment = document.createDocumentFragment();
                Array.from(doc.body.firstChild.children).forEach(child => {
                    fragment.appendChild(child);
                });
                
                log("Використано кешовані коментарі", id);
                return fragment;
            }
        } catch (error) {
            log("Помилка отримання кешу", error);
        }
        
        return null;
    }

    // Показ модального вікна з коментарями
    function showCommentsModal(commentsContent) {
        log("Відкриття модального вікна з коментарями");
        Lampa.Loading.stop();
        
        // Створюємо стилі
        if (!document.getElementById('rezka-comments-styles')) {
            const styles = document.createElement('style');
            styles.id = 'rezka-comments-styles';
            styles.textContent = `
                .rezka-comments-container {
                    padding: 20px;
                    background: #1a1a1a;
                    color: #fff;
                    max-height: 80vh;
                    overflow-y: auto;
                    font-family: Arial, sans-serif;
                }
                
                .rezka-comments-title {
                    font-size: 22px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #333;
                    text-align: center;
                }
                
                .comment-item {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #2a2a2a;
                    border-radius: 8px;
                    border: 1px solid #3a3a3a;
                }
                
                .comment-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .comment-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 12px;
                    object-fit: cover;
                }
                
                .comment-info {
                    flex-grow: 1;
                }
                
                .comment-author {
                    font-weight: bold;
                    font-size: 16px;
                    color: #fff;
                }
                
                .comment-date {
                    font-size: 12px;
                    color: #aaa;
                    margin-top: 2px;
                }
                
                .comment-body {
                    font-size: 14px;
                    line-height: 1.5;
                    color: #ddd;
                }
                
                .comment-body a {
                    color: #4dabf7;
                    text-decoration: none;
                }
                
                .comment-body a:hover {
                    text-decoration: underline;
                }
                
                .comment-children {
                    margin-left: 30px;
                    margin-top: 15px;
                    padding-left: 15px;
                    border-left: 2px solid #3a3a3a;
                }
                
                /* Стилі для спойлерів */
                .title_spoiler {
                    background: #333;
                    color: #fff;
                    padding: 2px 6px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: inline-block;
                    margin: 0 2px;
                    font-size: 12px;
                }
                
                /* Кнопка закриття */
                .modal-close-button {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    border: none;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 1000;
                }
                
                .modal-close-button:hover {
                    background: rgba(0, 0, 0, 0.7);
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Створюємо контейнер для коментарів
        const container = document.createElement('div');
        container.className = 'rezka-comments-container';
        
        // Додаємо заголовок
        const title = document.createElement('div');
        title.className = 'rezka-comments-title';
        title.textContent = namemovie ? `Коментарі: ${namemovie}` : 'Коментарі з HDRezka';
        container.appendChild(title);
        
        // Додаємо коментарі
        const commentsDiv = document.createElement('div');
        commentsDiv.className = 'rezka-comments-list';
        commentsDiv.appendChild(commentsContent);
        container.appendChild(commentsDiv);
        
        // Використовуємо вбудований метод Lampa для відкриття модального вікна
        setTimeout(() => {
            try {
                Lampa.Modal.open({
                    title: namemovie ? `Коментарі: ${namemovie.substring(0, 50)}${namemovie.length > 50 ? '...' : ''}` : 'Коментарі',
                    html: container,
                    size: 'large',
                    width: 800,
                    height: 600,
                    onBack: function() {
                        isModalOpen = false;
                        Lampa.Modal.close();
                    },
                    onSelect: function() {
                        return true;
                    }
                });
                
                isModalOpen = true;
                log("Модальне вікна відкрито успішно");
                
                // Додаємо кнопку закриття
                setTimeout(() => {
                    const modalHead = document.querySelector('.modal__head');
                    if (modalHead) {
                        const closeButton = document.createElement('button');
                        closeButton.className = 'modal-close-button';
                        closeButton.innerHTML = '×';
                        closeButton.onclick = function() {
                            Lampa.Modal.close();
                            isModalOpen = false;
                        };
                        modalHead.appendChild(closeButton);
                    }
                }, 100);
                
            } catch (error) {
                log("Помилка відкриття модального вікна", error);
                showNotification("Не вдалося відкрити коментарі");
            }
        }, 100);
    }

    // Показ сповіщення
    function showNotification(message) {
        try {
            if (Lampa.Noty && Lampa.Noty.show) {
                Lampa.Noty.show(message);
            } else {
                alert(message);
            }
        } catch (error) {
            console.error("Помилка показу сповіщення", error);
        }
    }

    // Обробник кліку по кнопці коментарів
    function handleCommentsClick() {
        if (!currentMovieData || !currentMovieData.movie) {
            showNotification("Немає інформації про фільм");
            return;
        }
        
        log("Запуск пошуку коментарів для:", currentMovieData.movie.title || currentMovieData.movie.name);
        
        // Визначаємо рік
        year = 0;
        if (currentMovieData.movie.release_date) {
            year = currentMovieData.movie.release_date.substring(0, 4);
        } else if (currentMovieData.movie.first_air_date) {
            year = currentMovieData.movie.first_air_date.substring(0, 4);
        }
        
        log("Рік:", year);
        
        // Запускаємо завантаження
        Lampa.Loading.start();
        getEnTitle(currentMovieData.movie.id, currentMovieData.object.method);
    }

    // Додавання кнопки коментарів
    function addCommentsButton() {
        // Видаляємо старі кнопки
        document.querySelectorAll('.button--comment').forEach(btn => btn.remove());
        
        // Знаходимо контейнер для кнопок
        const buttonsContainer = document.querySelector('.full-start-new__buttons') || 
                                document.querySelector('.full-start__buttons') ||
                                document.querySelector('.broadcast__buttons');
        
        if (!buttonsContainer) {
            log("Не знайдено контейнер для кнопок");
            return;
        }
        
        // Створюємо кнопку
        const commentButton = document.createElement('div');
        commentButton.className = 'full-start__button selector button--comment';
        commentButton.setAttribute('tabindex', '0');
        commentButton.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            margin: 0 10px 0 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s, opacity 0.2s;
            font-weight: bold;
            color: white;
            min-width: 120px;
        `;
        
        commentButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <span>Коментарі</span>
        `;
        
        // Додаємо обробники подій
        commentButton.addEventListener('click', handleCommentsClick);
        commentButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                handleCommentsClick();
            }
        });
        
        // Ефекти при фокусі
        commentButton.addEventListener('mouseover', function() {
            this.style.opacity = '0.9';
            this.style.transform = 'scale(1.05)';
        });
        
        commentButton.addEventListener('mouseout', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });
        
        // Додаємо кнопку
        buttonsContainer.appendChild(commentButton);
        log("Кнопка коментарів додана");
    }

    // Ініціалізація плагіна
    function initPlugin() {
        log("Ініціалізація плагіна коментарів Rezka");
        
        // Слухаємо події завантаження контенту
        Lampa.Listener.follow('full', function(e) {
            log("Подія full:", e.type);
            
            if (e.type === 'complite' || e.type === 'complete') {
                currentMovieData = e;
                setTimeout(addCommentsButton, 500);
            }
        });
        
        log("Плагін ініціалізовано");
    }

    // Чекаємо завантаження Lampa
    function waitForLampa() {
        if (window.Lampa && window.Lampa.Listener) {
            setTimeout(() => {
                if (!window.comment_plugin) {
                    window.comment_plugin = true;
                    initPlugin();
                }
            }, 2000);
        } else {
            setTimeout(waitForLampa, 1000);
        }
    }

    // Запускаємо
    if (!window.comment_plugin) {
        waitForLampa();
    }

})();
