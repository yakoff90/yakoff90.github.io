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
        console.error('Lampa is not defined');
        return;
    }

    let year;
    let namemovie;

    // Проксі для обходу CORS
    let kp_prox = "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/";
    let url = "https://rezka.ag/ajax/get_comments/?t=" + Date.now() + "&news_id=";

    // Функція для пошуку на сайті hdrezka
    async function searchRezka(name, ye) {
        try {
            let searchUrl = kp_prox + 
                "https://hdrezka.ag/search/?do=search&subaction=search&q=" + 
                encodeURIComponent(name) + 
                (ye ? "+" + ye : "");
            
            let fc = await fetch(searchUrl, { 
                method: "GET", 
                headers: { "Content-Type": "text/html" } 
            }).then((response) => response.text());

            let dom = new DOMParser().parseFromString(fc, "text/html");

            const item = dom.querySelector(".b-content__inline_item");
            if (!item) {
                Lampa.Loading.stop();
                Lampa.Noty.show("Фільм не знайдено на Rezka");
                return;
            }

            namemovie = item.querySelector(".b-content__inline_item-link")?.innerText || "";
            comment_rezka(item.dataset.id);
        } catch (error) {
            console.error("Search error:", error);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка пошуку");
        }
    }

    // Функція для отримання англійської назви фільму чи серіалу
    async function getEnTitle(id, type) {
        try {
            const data = await new Promise((res, rej) =>
                Lampa.Api.sources.tmdb.get(
                    `${type === "movie" ? "movie" : "tv"}/${id}?append_to_response=translations`,
                    {},
                    res,
                    rej
                )
            );

            const tr = data.translations?.translations;
            const enTitle =
                tr.find((t) => t.iso_3166_1 === "US" || t.iso_639_1 === "en")?.data?.title ||
                tr.find((t) => t.iso_3166_1 === "US" || t.iso_639_1 === "en")?.data?.name ||
                data.original_title ||
                data.original_name;
            
            if (enTitle) {
                searchRezka(normalizeTitle(enTitle), year);
            } else {
                Lampa.Loading.stop();
                Lampa.Noty.show("Не вдалося отримати англійську назву");
            }
        } catch (e) {
            console.error("TMDB error", e);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка отримання даних з TMDB");
            return;
        }
    }

    // Функція для очищення заголовка від зайвих символів
    function cleanTitle(str) {
        return str.replace(/[\s.,:;'`!?]+/g, " ").trim();
    }

    // Функція для нормалізації заголовка
    function normalizeTitle(str) {
        return cleanTitle(
            str
                .toLowerCase()
                .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, "-")
                .replace(/ё/g, "е")
        );
    }

    // Створює один коментар
    function buildCommentNode(item) {
        const q = (s) => item.querySelector(s);

        const avatar = q(".ava img")?.dataset?.src || q(".ava img")?.src || "";
        const user = q(".name, .b-comment__user")?.innerText?.trim() || "Анонім";
        const date = q(".date, .b-comment__time")?.innerText?.trim() || "";
        const text = q(".message .text, .text")?.innerHTML || "";

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
    }

    // Рекурсивно будує дерево коментарів
    function buildTree(root) {
        const fragment = document.createDocumentFragment();

        for (let li of root.children) {
            const indent = parseInt(li.dataset.indent || 0, 10);

            const wrapper = document.createElement("li");
            wrapper.className = "comments-tree-item";
            wrapper.style.marginLeft = indent > 0 ? "25px" : "0";
            wrapper.appendChild(buildCommentNode(li));

            const childrenList = li.querySelector("ol.comments-tree-list");
            if (childrenList) {
                const childWrapper = document.createElement("div");
                childWrapper.className = "rc-children";
                childWrapper.appendChild(buildTree(childrenList));
                wrapper.appendChild(childWrapper);
            }

            fragment.appendChild(wrapper);
        }

        return fragment;
    }

    // Основна функція обробки коментарів з Rezka
    async function comment_rezka(id) {
        if (!id) {
            Lampa.Loading.stop();
            Lampa.Noty.show("Немає ID для пошуку коментарів");
            return;
        }

        const storageKey = "rezkaComments_" + id;
        const storageTimeKey = storageKey + "_time";
        const oneDay = 24 * 60 * 60 * 1000;
        const now = Date.now();

        // 1. Показуємо з localStorage відразу, якщо є і не старіше доби
        let savedHTML = localStorage.getItem(storageKey);
        let savedTime = parseInt(localStorage.getItem(storageTimeKey) || "0", 10);
        
        if (savedHTML && now - savedTime < oneDay) {
            try {
                const container = document.createElement("div");
                container.innerHTML = savedHTML;
                openModal(container);
            } catch (e) {
                console.error("Error loading cached comments:", e);
                // Продовжуємо завантаження онлайн
            }
        }

        // 2. Завантажуємо оновлені коментарі
        try {
            let response = await fetch(
                kp_prox + url + id + "&cstart=1&type=0&comment_id=0&skin=hdrezka",
                {
                    method: "GET",
                    headers: { "Content-Type": "text/plain" },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let fc = await response.json();
            
            if (!fc.comments) {
                throw new Error("No comments in response");
            }

            let dom = new DOMParser().parseFromString(fc.comments, "text/html");
            
            // Видаляємо зайві елементи
            dom.querySelectorAll(".actions, i, .share-link, .reply, .quote").forEach((elem) => elem.remove());
            
            let rootList = dom.querySelector(".comments-tree-list");
            if (!rootList) {
                throw new Error("Comments tree not found");
            }

            let newTree = buildTree(rootList);

            // Зберігаємо в localStorage
            try {
                const container = document.createElement("div");
                container.appendChild(newTree.cloneNode(true));
                localStorage.setItem(storageKey, container.innerHTML);
                localStorage.setItem(storageTimeKey, Date.now().toString());
            } catch (storageError) {
                console.warn("LocalStorage error:", storageError);
            }

            // Відкриваємо модальне вікно з коментарями
            openModal(newTree);

        } catch (e) {
            console.error("Error loading comments:", e);
            Lampa.Loading.stop();
            
            // Якщо є збережені коментарі, показуємо їх
            if (savedHTML) {
                Lampa.Noty.show("Використано збережені коментарі");
                const container = document.createElement("div");
                container.innerHTML = savedHTML;
                openModal(container);
            } else {
                Lampa.Noty.show("Не вдалося завантажити коментарі");
            }
        }
    }

    // Відкриває модальне вікно з коментарями
    function openModal(treeContent) {
        Lampa.Loading.stop();
        
        // Створюємо контейнер для коментарів
        let modalContent = $(`
            <div class="rezka-comments-modal">
                <div class="broadcast__text" style="text-align: left; padding: 10px;">
                    <div class="comment"></div>
                </div>
            </div>
        `);
        
        // Додаємо коментарі
        modalContent.find(".comment").append(treeContent);

        // Додаємо стилі для Samsung TV
        addStyles();

        // Відкриваємо модальне вікно
        Lampa.Modal.open({
            title: namemovie || "Коментарі",
            html: modalContent,
            size: "medium",
            width: "90%",
            height: "80%",
            mask: true,
            onBack: function() {
                Lampa.Modal.close();
                Lampa.Controller.toggle("content");
            },
            onSelect: function() {
                // Додаємо обробку вибору для TV
                Lampa.Controller.collectionSet(modalContent.find('.selector').toArray());
            }
        });

        // Додаємо кнопку закриття
        setTimeout(function() {
            const modalHead = document.querySelector(".modal__head");
            if (modalHead) {
                modalHead.insertAdjacentHTML(
                    "afterend",
                    `<div style="text-align: center; margin: 10px 0;">
                        <button class="selector modal-close-btn" data-focus="true" style="
                            background: #2a2a2a;
                            border: 1px solid #444;
                            color: #ddd;
                            border-radius: 6px;
                            padding: 8px 16px;
                            font-size: 16px;
                            cursor: pointer;
                            transition: background 0.2s;
                        ">Закрити</button>
                    </div>`
                );
                
                // Додаємо обробник події для кнопки
                const closeBtn = document.querySelector(".modal-close-btn");
                if (closeBtn) {
                    closeBtn.addEventListener("click", function() {
                        Lampa.Modal.close();
                    });
                    
                    // Додаємо обробник для TV remote
                    $(closeBtn).on("hover:enter", function() {
                        Lampa.Modal.close();
                    });
                }
            }
            
            // Ініціалізація навігації для TV
            Lampa.Controller.collectionSet(modalContent.find('.selector').toArray());
        }, 100);
    }

    // Додаємо необхідні стилі
    function addStyles() {
        if (!document.getElementById("rezka-comment-style")) {
            const styleEl = document.createElement("style");
            styleEl.id = "rezka-comment-style";
            styleEl.textContent = `
                /* Основний контейнер */
                .rezka-comments-modal {
                    font-family: Arial, sans-serif;
                    color: #e0e0e0;
                    font-size: 16px;
                    line-height: 1.4;
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
                
                /* Дочірні коментарі */
                .rc-children {
                    margin-left: 30px;
                    border-left: 2px solid #333;
                    padding-left: 20px;
                    margin-top: 10px;
                }
                
                /* Спеціальні елементи */
                .title_spoiler {
                    display: inline-flex;
                    align-items: center;
                    background: #2a2a2a;
                    border-radius: 6px;
                    padding: 2px 8px;
                    margin: 0 2px;
                    font-size: 14px;
                    color: #e0e0e0;
                    cursor: pointer;
                }
                
                .title_spoiler a {
                    color: #e0e0e0 !important;
                    text-decoration: none !important;
                }
                
                .title_spoiler img {
                    height: 16px;
                    width: auto;
                    vertical-align: middle;
                    margin: 0 4px;
                }
                
                /* Покращення для TV */
                .broadcast__text {
                    max-height: 70vh;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                }
                
                /* Фокус для TV */
                .selector.focus {
                    outline: 2px solid #00a8ff;
                    outline-offset: 2px;
                    background-color: rgba(0, 168, 255, 0.1);
                }
                
                /* Адаптація для маленьких екранів */
                @media (max-width: 768px) {
                    .comment-wrap {
                        flex-direction: column;
                    }
                    
                    .avatar-column {
                        margin-right: 0;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    
                    .avatar-img {
                        width: 40px;
                        height: 40px;
                    }
                    
                    .rc-children {
                        margin-left: 15px;
                        padding-left: 10px;
                    }
                }
            `;
            document.head.appendChild(styleEl);
        }
    }

    // Функція для запуску плагіна
    function startPlugin() {
        if (window.comment_plugin) return;
        window.comment_plugin = true;
        
        console.log("Rezka Comments Plugin started");

        Lampa.Listener.follow("full", function(e) {
            if (e.type === "complite") {
                // Видаляємо старі кнопки
                $(".button--comment").remove();
                
                // Додаємо нову кнопку
                $(".full-start-new__buttons").append(`
                    <div class="full-start__button selector button--comment">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        <span>Коментарі</span>
                    </div>
                `);

                // Додаємо обробник події для кнопки
                $(".button--comment").on("hover:enter", function() {
                    year = 0;
                    if (e.data.movie.release_date) {
                        year = e.data.movie.release_date.slice(0, 4);
                    } else if (e.data.movie.first_air_date) {
                        year = e.data.movie.first_air_date.slice(0, 4);
                    }
                    
                    Lampa.Loading.start();
                    getEnTitle(e.data.movie.id, e.object.method);
                });
            }
        });
    }

    // Запускаємо плагін після завантаження сторінки
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPlugin);
    } else {
        setTimeout(startPlugin, 1000); // Затримка для гарантії завантаження Lampa
    }

})();
