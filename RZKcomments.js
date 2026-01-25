(function () {
    //BDVBuriлk.github.io
    //2025
    ("use strict");

    let year;
    let namemovie;

    let kp_prox = "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/";
    let url = "https://rezka.ag/ajax/get_comments/?t=1714093694732&news_id=";

    // Функція для пошуку на сайті hdrezka
    async function searchRezka(name, ye) {
        try {
            let fc = await fetch(
                kp_prox +
                "https://hdrezka.ag/search/?do=search&subaction=search&q=" +
                encodeURIComponent(name) +
                (ye ? "+" + ye : ""),
                { method: "GET", headers: { "Content-Type": "text/html" } }
            ).then((response) => response.text());

            let dom = new DOMParser().parseFromString(fc, "text/html");

            const item = dom.querySelector(".b-content__inline_item");
            if (!item) {
                Lampa.Loading.stop();
                return;
            }

            namemovie =
                item.querySelector(".b-content__inline_item-link")?.innerText || "";
            comment_rezka(item.dataset.id);
        } catch (e) {
            console.error("Помилка пошуку:", e);
            Lampa.Loading.stop();
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
                tr?.find((t) => t.iso_3166_1 === "US" || t.iso_639_1 === "en")?.data?.title ||
                tr?.find((t) => t.iso_3166_1 === "US" || t.iso_639_1 === "en")?.data?.name ||
                data.original_title ||
                data.original_name;
            
            if (enTitle) {
                searchRezka(normalizeTitle(enTitle), year);
            } else {
                Lampa.Loading.stop();
            }
        } catch (e) {
            console.error("TMDB помилка", e);
            Lampa.Loading.stop();
        }
    }

    // Функція для очищення заголовка від зайвих символів
    function cleanTitle(str) {
        return str.replace(/[\s.,:;’'`!?]+/g, " ").trim();
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
        const user = q(".name, .b-comment__user")?.innerText || "Без імені";
        const date = q(".date, .b-comment__time")?.innerText || "";
        const text = q(".message .text, .text")?.innerHTML || "";

        const wrapper = document.createElement("div");
        wrapper.className = "message";

        wrapper.innerHTML = `
            <div class="comment-wrap">
                <div class="avatar-column">
                    <img src="${avatar}" class="avatar-img" alt="${user}">
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

    // Рекурсивно будує дерево
    function buildTree(root) {
        const fragment = document.createDocumentFragment();

        for (let li of root.children) {
            const indent = parseInt(li.dataset.indent || 0, 10);

            const wrapper = document.createElement("li");
            wrapper.className = "comments-tree-item";
            wrapper.style.marginLeft = indent > 0 ? "20px" : "0";
            wrapper.appendChild(buildCommentNode(li));

            const childrenList = li.querySelector("ol.comments-tree-list");
            if (childrenList) wrapper.appendChild(buildTree(childrenList));

            fragment.appendChild(wrapper);
        }

        return fragment;
    }

    // Основна обробка коментарів Rezka з кешуванням на добу
    async function comment_rezka(id) {
        const storageKey = "rezkaComments_" + id;
        const storageTimeKey = storageKey + "_time";
        const oneDay = 24 * 60 * 60 * 1000;
        const now = Date.now();

        // 1. Показуємо з кешу одразу
        let savedHTML = localStorage.getItem(storageKey);
        let savedTime = parseInt(localStorage.getItem(storageTimeKey) || "0", 10);
        
        if (savedHTML && now - savedTime < oneDay) {
            const container = document.createElement("div");
            container.innerHTML = savedHTML;
            openModal(container);
        }

        // 2. Оновлюємо у фоновому режимі
        try {
            let response = await fetch(
                kp_prox +
                url +
                (id ? id : "1") +
                "&cstart=1&type=0&comment_id=0&skin=hdrezka",
                {
                    method: "GET",
                    headers: { "Content-Type": "text/plain" }
                }
            );
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            let fc = await response.json();
            let dom = new DOMParser().parseFromString(fc.comments, "text/html");
            
            // Видаляємо непотрібні елементи
            dom.querySelectorAll(".actions, i, .share-link").forEach((elem) => elem.remove());
            
            let rootList = dom.querySelector(".comments-tree-list");
            if (!rootList) throw new Error("Немає коментарів");
            
            let newTree = buildTree(rootList);

            // Зберігаємо у кеш
            const container = document.createElement("div");
            container.appendChild(newTree.cloneNode(true));
            localStorage.setItem(storageKey, container.innerHTML);
            localStorage.setItem(storageTimeKey, Date.now().toString());

            // Якщо вже показали старі, оновлюємо вміст
            if (savedHTML && now - savedTime < oneDay) {
                const commentWrapper = document.querySelector(".broadcast__text .comment");
                if (commentWrapper) {
                    commentWrapper.innerHTML = "";
                    commentWrapper.appendChild(newTree);
                }
            } else {
                openModal(newTree);
            }
        } catch (e) {
            console.error("Помилка завантаження коментарів:", e);
            Lampa.Loading.stop();
            
            // Показуємо помилку
            if (!savedHTML) {
                Lampa.Noty.show("Не вдалося завантажити коментарі");
            }
        }
    }

    // Функція для відкриття модального вікна з коментарями
    function openModal(treeContent) {
        Lampa.Loading.stop();
        
        // Створюємо контейнер для коментарів
        let modalDiv = document.createElement("div");
        modalDiv.innerHTML = `
            <div class="broadcast__text" style="text-align:left; padding: 10px;">
                <div class="comment"></div>
            </div>
        `;
        
        // Додаємо коментарі
        modalDiv.querySelector(".comment").appendChild(treeContent);
        
        // Додаємо стилі, якщо ще не додані
        if (!document.getElementById("rezka-comment-style")) {
            const styleEl = document.createElement("style");
            styleEl.id = "rezka-comment-style";
            styleEl.textContent = `
                .comments-tree-list { list-style: none; margin: 0; padding: 0; }
                .comments-tree-item { list-style: none; margin: 0; padding: 0; }
                .comment-wrap { display: flex; margin-bottom: 15px; }
                .avatar-column { margin-right: 10px; }
                .avatar-img { width: 48px; height: 48px; border-radius: 50%; }
                .comment-card { background: #1b1b1b; padding: 10px 15px; border-radius: 8px; border: 1px solid #2a2a2a; width: 100%; }
                .comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .comment-header .name { font-weight: 600; color: #fff; font-size: 14px; }
                .comment-header .date { opacity: .7; font-size: 12px; }
                .comment-text .text { color: #ddd; line-height: 1.5; font-size: 13px; }
                .modal-close-btn { 
                    position: absolute; 
                    top: 10px; 
                    right: 10px; 
                    background: #2a2a2a; 
                    border: 1px solid #444; 
                    color: #ddd; 
                    border-radius: 6px; 
                    font-size: 20px; 
                    width: 36px; 
                    height: 36px; 
                    cursor: pointer; 
                    transition: .15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-close-btn:hover { background: #3a3a3a; color: #fff; }
                .modal-title { 
                    font-size: 18px; 
                    font-weight: bold; 
                    padding: 10px 50px 10px 20px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `;
            document.head.appendChild(styleEl);
        }
        
        // Функція для спойлерів
        if (!window.rezkaSpoilerInit) {
            window.rezkaSpoilerInit = true;
            const Script = document.createElement("script");
            Script.textContent = `
                function ShowOrHide(id) {
                    var elem = document.getElementById(id);
                    if (elem) {
                        var prev = elem.previousElementSibling;
                        if (prev && prev.classList.contains('title_spoiler')) {
                            prev.remove();
                        }
                        elem.style.display = 'inline';
                    }
                }
            `;
            document.head.appendChild(Script);
        }

        // Відкриваємо модальне вікно
        Lampa.Modal.open({
            title: namemovie || "Коментарі",
            html: modalDiv,
            size: "large",
            width: 800,
            onBack: function () {
                Lampa.Modal.close();
            }
        });

        // Додаємо кнопку закриття
        let modalHead = document.querySelector(".modal__head");
        if (modalHead) {
            let closeBtn = document.createElement("button");
            closeBtn.className = "modal-close-btn";
            closeBtn.innerHTML = "×";
            closeBtn.onclick = function() {
                Lampa.Modal.close();
            };
            modalHead.appendChild(closeBtn);
        }
    }

    // Функція для початку роботи плагіна
    function startPlugin() {
        window.comment_plugin = true;
        
        Lampa.Listener.follow("full", function (e) {
            if (e.type === "complite") {
                // Видаляємо старі кнопки коментарів
                let oldButtons = document.querySelectorAll(".button--comment");
                oldButtons.forEach(btn => btn.remove());
                
                // Додаємо нову кнопку
                let buttonsContainer = document.querySelector(".full-start-new__buttons");
                if (buttonsContainer) {
                    let commentButton = document.createElement("div");
                    commentButton.className = "full-start__button selector button--comment";
                    commentButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        </svg>
                        <span>Коментарі</span>
                    `;
                    
                    buttonsContainer.appendChild(commentButton);
                    
                    // Додаємо обробник кліку
                    commentButton.addEventListener("click", function() {
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
            }
        });
    }

    // Запускаємо плагін
    if (!window.comment_plugin) {
        // Чекаємо завантаження Lampa
        if (typeof Lampa !== 'undefined') {
            startPlugin();
        } else {
            setTimeout(function() {
                if (typeof Lampa !== 'undefined' && !window.comment_plugin) {
                    startPlugin();
                }
            }, 2000);
        }
    }
})();
