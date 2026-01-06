/**
 * Плагін для відображення коментарів з Rezka.ag
 * Адаптовано для Samsung TV та Lampa
 * Автор: BDVBuriлk.github.io
 * 2025
 */

(function() {
    'use strict';

    // Перевірка наявності необхідних об'єктів
    if (typeof Lampa === 'undefined') {
        console.log('[Rezka Comments] Lampa не знайдено, чекаємо...');
        setTimeout(function() {
            if (typeof Lampa !== 'undefined') {
                initPlugin();
            }
        }, 1000);
        return;
    }

    let year;
    let namemovie;
    let isPluginActive = false;

    // Проксі для обходу CORS
    const kp_prox = "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/";
    
    // Функція для пошуку на сайті hdrezka
    async function searchRezka(name, ye) {
        try {
            console.log('[Rezka Comments] Пошук:', name, ye);
            
            let searchUrl = kp_prox + 
                "https://hdrezka.ag/search/?do=search&subaction=search&q=" + 
                encodeURIComponent(name) + 
                (ye ? "+" + ye : "");
            
            console.log('[Rezka Comments] URL пошуку:', searchUrl);
            
            let fc = await fetch(searchUrl, { 
                method: "GET", 
                headers: { "Content-Type": "text/html" } 
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            });

            let dom = new DOMParser().parseFromString(fc, "text/html");

            const item = dom.querySelector(".b-content__inline_item");
            if (!item) {
                console.log('[Rezka Comments] Фільм не знайдено');
                Lampa.Loading.stop();
                Lampa.Noty.show("Фільм не знайдено на Rezka");
                return;
            }

            namemovie = item.querySelector(".b-content__inline_item-link")?.innerText || "";
            const movieId = item.dataset.id;
            
            console.log('[Rezka Comments] Знайдено фільм:', namemovie, 'ID:', movieId);
            
            if (movieId) {
                comment_rezka(movieId);
            } else {
                Lampa.Loading.stop();
                Lampa.Noty.show("Не вдалося отримати ID фільму");
            }
        } catch (error) {
            console.error('[Rezka Comments] Помилка пошуку:', error);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка пошуку");
        }
    }

    // Функція для отримання англійської назви фільму чи серіалу
    async function getEnTitle(id, type) {
        try {
            console.log('[Rezka Comments] Отримання англійської назви для:', id, type);
            
            const data = await new Promise((res, rej) => {
                if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
                    rej(new Error('TMDB API не доступно'));
                    return;
                }
                
                Lampa.Api.sources.tmdb.get(
                    `${type === "movie" ? "movie" : "tv"}/${id}?append_to_response=translations`,
                    {},
                    res,
                    rej
                );
            });

            const tr = data.translations?.translations || [];
            let enTitle = null;
            
            // Шукаємо англійську назву
            for (const translation of tr) {
                if (translation.iso_3166_1 === "US" || translation.iso_639_1 === "en") {
                    enTitle = translation.data?.title || translation.data?.name;
                    if (enTitle) break;
                }
            }
            
            if (!enTitle) {
                enTitle = data.original_title || data.original_name;
            }
            
            console.log('[Rezka Comments] Англійська назва:', enTitle);
            
            if (enTitle) {
                searchRezka(normalizeTitle(enTitle), year);
            } else {
                Lampa.Loading.stop();
                Lampa.Noty.show("Не вдалося отримати англійську назву");
            }
        } catch (e) {
            console.error('[Rezka Comments] Помилка TMDB:', e);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка отримання даних з TMDB");
        }
    }

    // Функція для очищення заголовка від зайвих символів
    function cleanTitle(str) {
        if (!str) return '';
        return str.replace(/[\s.,:;'`!?]+/g, " ").trim();
    }

    // Функція для нормалізації заголовка
    function normalizeTitle(str) {
        if (!str) return '';
        return cleanTitle(
            str
                .toLowerCase()
                .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, "-")
                .replace(/ё/g, "е")
        );
    }

    // Створює один коментар
    function buildCommentNode(item) {
        try {
            const q = (s) => item.querySelector(s);

            const avatar = q(".ava img")?.dataset?.src || q(".ava img")?.src || "";
            const user = q(".name, .b-comment__user")?.innerText?.trim() || "Анонім";
            const date = q(".date, .b-comment__time")?.innerText?.trim() || "";
            let text = q(".message .text, .text")?.innerHTML || "";

            // Очищаємо текст від зайвих тегів
            text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
            
            // Замінюємо спойлери
            text = text.replace(/<div class="title_spoiler"[^>]*>.*?<\/div>/g, '[Спойлер]');

            const wrapper = document.createElement("div");
            wrapper.className = "message";

            wrapper.innerHTML = `
                <div class="comment-wrap">
                    <div class="avatar-column">
                        <img src="${avatar}" class="avatar-img" alt="${user}" onerror="this.style.display='none'">
                    </div>

                    <div class="comment-card">
                        <div class="comment-header">
                            <span class="name">${user}</span>
                            <span class="date">${date}</span>
                        </div>

                        <div class="comment-text">
                            <div class="text">${text}</div>
                        </div>
                    </div>
                </div>
            `;

            return wrapper;
        } catch (error) {
            console.error('[Rezka Comments] Помилка створення коментаря:', error);
            return document.createElement("div");
        }
    }

    // Рекурсивно будує дерево коментарів
    function buildTree(root) {
        try {
            const fragment = document.createDocumentFragment();

            if (!root || !root.children) return fragment;

            for (let li of root.children) {
                try {
                    const indent = parseInt(li.dataset?.indent || 0, 10);

                    const wrapper = document.createElement("li");
                    wrapper.className = "comments-tree-item";
                    wrapper.style.marginLeft = indent > 0 ? "25px" : "0";
                    
                    const commentNode = buildCommentNode(li);
                    if (commentNode) {
                        wrapper.appendChild(commentNode);
                    }

                    const childrenList = li.querySelector("ol.comments-tree-list");
                    if (childrenList) {
                        const childWrapper = document.createElement("div");
                        childWrapper.className = "rc-children";
                        childWrapper.appendChild(buildTree(childrenList));
                        wrapper.appendChild(childWrapper);
                    }

                    fragment.appendChild(wrapper);
                } catch (error) {
                    console.error('[Rezka Comments] Помилка обробки елемента коментаря:', error);
                    continue;
                }
            }

            return fragment;
        } catch (error) {
            console.error('[Rezka Comments] Помилка побудови дерева:', error);
            return document.createDocumentFragment();
        }
    }

    // Основна функція обробки коментарів з Rezka
    async function comment_rezka(id) {
        if (!id) {
            console.error('[Rezka Comments] Немає ID для пошуку коментарів');
            Lampa.Loading.stop();
            Lampa.Noty.show("Немає ID для пошуку коментарів");
            return;
        }

        try {
            console.log('[Rezka Comments] Завантаження коментарів для ID:', id);
            
            const timestamp = Date.now();
            const url = kp_prox + `https://rezka.ag/ajax/get_comments/?t=${timestamp}&news_id=${id}&cstart=1&type=0&comment_id=0&skin=hdrezka`;
            
            console.log('[Rezka Comments] Коментарі URL:', url);
            
            let response = await fetch(url, {
                method: "GET",
                headers: { 
                    "Content-Type": "text/plain",
                    "Accept": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP помилка! статус: ${response.status}`);
            }

            let fc = await response.json();
            
            if (!fc || !fc.comments) {
                throw new Error("Немає коментарів у відповіді");
            }

            console.log('[Rezka Comments] Коментарі отримано, довжина:', fc.comments.length);

            let dom = new DOMParser().parseFromString(fc.comments, "text/html");
            
            // Видаляємо зайві елементи
            const elementsToRemove = [".actions", "i", ".share-link", ".reply", ".quote"];
            elementsToRemove.forEach(selector => {
                dom.querySelectorAll(selector).forEach(elem => elem.remove());
            });
            
            let rootList = dom.querySelector(".comments-tree-list");
            if (!rootList) {
                throw new Error("Дерево коментарів не знайдено");
            }

            let newTree = buildTree(rootList);

            // Відкриваємо модальне вікно з коментарями
            openModal(newTree);

        } catch (e) {
            console.error('[Rezka Comments] Помилка завантаження коментарів:', e);
            Lampa.Loading.stop();
            Lampa.Noty.show("Не вдалося завантажити коментарі");
        }
    }

    // Додаємо необхідні стилі
    function addStyles() {
        if (document.getElementById("rezka-comment-style")) return;
        
        const styleEl = document.createElement("style");
        styleEl.id = "rezka-comment-style";
        styleEl.textContent = `
            /* Основний контейнер */
            .rezka-comments-modal {
                font-family: Arial, sans-serif;
                color: #e0e0e0;
                font-size: 16px;
                line-height: 1.4;
                max-height: 70vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .broadcast__text {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
                text-align: left;
            }
            
            /* Список коментарів */
            .comments-tree-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            
            .comments-tree-item {
                list-style: none;
                margin: 0 0 15px 0;
                padding: 0;
                border-bottom: 1px solid #333;
                padding-bottom: 15px;
            }
            
            .comments-tree-item:last-child {
                border-bottom: none;
            }
            
            /* Обгортка коментаря */
            .comment-wrap {
                display: flex;
                margin-bottom: 5px;
            }
            
            .avatar-column {
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .avatar-img {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #444;
            }
            
            /* Картка коментаря */
            .comment-card {
                background: #1b1b1b;
                padding: 12px 15px;
                border-radius: 8px;
                border: 1px solid #2a2a2a;
                flex-grow: 1;
                min-width: 0;
            }
            
            .comment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                flex-wrap: wrap;
            }
            
            .comment-header .name {
                font-weight: 600;
                color: #fff;
                font-size: 16px;
            }
            
            .comment-header .date {
                opacity: 0.7;
                font-size: 13px;
                color: #aaa;
            }
            
            .comment-text .text {
                color: #ddd;
                line-height: 1.45;
                font-size: 15px;
                word-wrap: break-word;
                overflow-wrap: break-word;
            }
            
            .comment-text .text a {
                color: #4dabf7;
                text-decoration: underline;
            }
            
            /* Дочірні коментарі */
            .rc-children {
                margin-left: 30px;
                border-left: 2px solid #333;
                padding-left: 20px;
                margin-top: 10px;
            }
            
            /* Кнопки */
            .modal-close-btn {
                background: #2a2a2a;
                border: 1px solid #444;
                color: #ddd;
                border-radius: 6px;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                transition: background 0.2s;
                margin: 10px auto;
                display: block;
            }
            
            .modal-close-btn:hover,
            .modal-close-btn.focus {
                background: #3a3a3a;
                color: #fff;
            }
            
            /* Скролбар */
            .broadcast__text::-webkit-scrollbar {
                width: 8px;
            }
            
            .broadcast__text::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 4px;
            }
            
            .broadcast__text::-webkit-scrollbar-thumb {
                background: #444;
                border-radius: 4px;
            }
            
            .broadcast__text::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
            
            /* Адаптація для TV */
            @media (max-width: 1920px) {
                .comment-header .name {
                    font-size: 18px;
                }
                
                .comment-text .text {
                    font-size: 17px;
                }
                
                .avatar-img {
                    width: 56px;
                    height: 56px;
                }
            }
        `;
        document.head.appendChild(styleEl);
    }

    // Відкриває модальне вікно з коментарями
    function openModal(treeContent) {
        try {
            Lampa.Loading.stop();
            
            // Додаємо стилі
            addStyles();
            
            // Створюємо контейнер
            const modalWrapper = document.createElement('div');
            modalWrapper.className = 'rezka-comments-modal';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'broadcast__text';
            
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            
            // Додаємо коментарі
            if (treeContent && treeContent.nodeType === 1) {
                commentDiv.appendChild(treeContent);
            } else {
                commentDiv.innerHTML = '<p style="text-align: center; padding: 20px;">Коментарі не знайдено</p>';
            }
            
            contentDiv.appendChild(commentDiv);
            modalWrapper.appendChild(contentDiv);
            
            // Відкриваємо модальне вікно
            Lampa.Modal.open({
                title: namemovie || "Коментарі з Rezka",
                html: $(modalWrapper),
                size: "medium",
                width: "90%",
                height: "80%",
                mask: true,
                onBack: function() {
                    Lampa.Modal.close();
                },
                onReady: function(modal) {
                    // Додаємо кнопку закриття
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'selector modal-close-btn';
                    closeBtn.textContent = 'Закрити';
                    closeBtn.style.margin = '10px auto';
                    closeBtn.style.display = 'block';
                    
                    closeBtn.addEventListener('click', function() {
                        Lampa.Modal.close();
                    });
                    
                    $(closeBtn).on('hover:enter', function() {
                        Lampa.Modal.close();
                    });
                    
                    // Додаємо кнопку після контенту
                    modal.querySelector('.modal__body').appendChild(closeBtn);
                    
                    // Ініціалізуємо навігацію
                    setTimeout(function() {
                        if (Lampa.Controller && typeof Lampa.Controller.collectionSet === 'function') {
                            const selectors = modal.querySelectorAll('.selector');
                            if (selectors.length > 0) {
                                Lampa.Controller.collectionSet(Array.from(selectors));
                            }
                        }
                    }, 100);
                }
            });
            
        } catch (error) {
            console.error('[Rezka Comments] Помилка відкриття модального вікна:', error);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка відображення коментарів");
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (isPluginActive || window.comment_plugin) return;
        
        console.log('[Rezka Comments] Ініціалізація плагіна');
        
        isPluginActive = true;
        window.comment_plugin = true;
        
        // Чекаємо на завантаження Lampa компонентів
        let checkInterval = setInterval(function() {
            if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
                clearInterval(checkInterval);
                setupPlugin();
            }
        }, 500);
        
        // Таймаут на випадок якщо Lampa не завантажиться
        setTimeout(function() {
            clearInterval(checkInterval);
            if (!isPluginActive) {
                console.log('[Rezka Comments] Lampa не завантажилась, плагін не активовано');
            }
        }, 10000);
    }

    // Налаштування плагіна
    function setupPlugin() {
        console.log('[Rezka Comments] Налаштування плагіна');
        
        // Додаємо кнопку коментарів
        Lampa.Listener.follow("full", function(e) {
            if (e.type === "complite") {
                addCommentButton(e);
            }
        });
        
        // Додаємо стилі
        addStyles();
        
        console.log('[Rezka Comments] Плагін успішно активовано');
    }

    // Додає кнопку коментарів
    function addCommentButton(e) {
        try {
            // Видаляємо старі кнопки
            $(".button--comment").remove();
            
            // Створюємо нову кнопку
            const buttonHtml = `
                <div class="full-start__button selector button--comment" data-comment-btn="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span>Коментарі</span>
                </div>
            `;
            
            const buttonContainer = $(".full-start-new__buttons");
            if (buttonContainer.length) {
                buttonContainer.append(buttonHtml);
                
                // Додаємо обробник події
                $(".button--comment").on("hover:enter", function() {
                    handleCommentClick(e);
                });
                
                console.log('[Rezka Comments] Кнопка додана');
            }
        } catch (error) {
            console.error('[Rezka Comments] Помилка додавання кнопки:', error);
        }
    }

    // Обробник кліку по кнопці коментарів
    function handleCommentClick(e) {
        try {
            year = 0;
            if (e.data && e.data.movie) {
                if (e.data.movie.release_date) {
                    year = e.data.movie.release_date.slice(0, 4);
                } else if (e.data.movie.first_air_date) {
                    year = e.data.movie.first_air_date.slice(0, 4);
                }
                
                if (e.data.movie.id && e.object && e.object.method) {
                    Lampa.Loading.start();
                    getEnTitle(e.data.movie.id, e.object.method);
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

    // Запускаємо ініціалізацію
    if (typeof Lampa !== 'undefined') {
        initPlugin();
    } else {
        // Чекаємо на завантаження Lampa
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPlugin, 1000);
        });
    }

})();
