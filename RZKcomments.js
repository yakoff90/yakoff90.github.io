(function () {
    //BDVBuriлk.github.io
    //2025
    ("use strict");

    let year;
    let namemovie;
    let currentMovieData = null;

    let kp_prox = "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/";
    let url = "https://rezka.ag/ajax/get_comments/?t=1714093694732&news_id=";

    // Функція для пошуку на сайті hdrezka
    async function searchRezka(name, ye) {
        try {
            console.log("Пошук на Rezka:", name, ye);
            let searchUrl = kp_prox +
                "https://hdrezka.ag/search/?do=search&subaction=search&q=" +
                encodeURIComponent(name) +
                (ye ? "+" + ye : "");
            
            console.log("URL пошуку:", searchUrl);
            
            let fc = await fetch(searchUrl, {
                method: "GET",
                headers: { 
                    "Content-Type": "text/html",
                    "Accept": "text/html"
                }
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
            });

            let dom = new DOMParser().parseFromString(fc, "text/html");

            const item = dom.querySelector(".b-content__inline_item");
            if (!item) {
                console.log("Контент не знайдено на Rezka");
                Lampa.Loading.stop();
                Lampa.Noty.show("Коментарі не знайдено");
                return;
            }

            namemovie = item.querySelector(".b-content__inline_item-link")?.innerText || "";
            const rezkaId = item.dataset.id;
            
            console.log("Знайдено на Rezka:", namemovie, "ID:", rezkaId);
            
            if (rezkaId) {
                comment_rezka(rezkaId);
            } else {
                Lampa.Loading.stop();
                Lampa.Noty.show("Не вдалося отримати ID для коментарів");
            }
        } catch (e) {
            console.error("Помилка пошуку:", e);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка пошуку коментарів");
        }
    }

    // Функція для отримання англійської назви фільму чи серіалу
    async function getEnTitle(id, type) {
        try {
            console.log("Отримання англійської назви для:", id, type);
            
            const data = await new Promise((res, rej) =>
                Lampa.Api.sources.tmdb.get(
                    `${type === "movie" ? "movie" : "tv"}/${id}?append_to_response=translations`,
                    {},
                    res,
                    rej
                )
            );

            const tr = data.translations?.translations;
            let enTitle = null;
            
            if (tr && tr.length > 0) {
                enTitle = tr.find((t) => t.iso_3166_1 === "US")?.data?.title ||
                         tr.find((t) => t.iso_3166_1 === "US")?.data?.name ||
                         tr.find((t) => t.iso_639_1 === "en")?.data?.title ||
                         tr.find((t) => t.iso_639_1 === "en")?.data?.name;
            }
            
            if (!enTitle) {
                enTitle = data.original_title || data.original_name;
            }
            
            console.log("Англійська назва:", enTitle);
            
            if (enTitle) {
                searchRezka(normalizeTitle(enTitle), year);
            } else {
                Lampa.Loading.stop();
                Lampa.Noty.show("Не вдалося отримати назву для пошуку");
            }
        } catch (e) {
            console.error("TMDB помилка", e);
            Lampa.Loading.stop();
            Lampa.Noty.show("Помилка отримання інформації з TMDB");
        }
    }

    // Функція для очищення заголовка від зайвих символів
    function cleanTitle(str) {
        if (!str) return "";
        return str.replace(/[\s.,:;’'`!?]+/g, " ").trim();
    }

    // Функція для нормалізації заголовка
    function normalizeTitle(str) {
        if (!str) return "";
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

    // Рекурсивно будує дерево
    function buildTree(root) {
        const fragment = document.createDocumentFragment();

        if (!root || !root.children) return fragment;

        for (let li of root.children) {
            const indent = parseInt(li.dataset?.indent || 0, 10);

            const wrapper = document.createElement("li");
            wrapper.className = "comments-tree-item";
            wrapper.style.marginLeft = indent > 0 ? "20px" : "0";
            wrapper.appendChild(buildCommentNode(li));

            const childrenList = li.querySelector("ol.comments-tree-list");
            if (childrenList) {
                const childTree = buildTree(childrenList);
                if (childTree.children.length > 0) {
                    wrapper.appendChild(childTree);
                }
            }

            fragment.appendChild(wrapper);
        }

        return fragment;
    }

    // Основна обробка коментарів Rezka з кешуванням на добу
    async function comment_rezka(id) {
        console.log("Завантаження коментарів для ID:", id);
        
        if (!id) {
            Lampa.Loading.stop();
            Lampa.Noty.show("Немає ID для завантаження коментарів");
            return;
        }

        const storageKey = "rezkaComments_" + id;
        const storageTimeKey = storageKey + "_time";
        const oneDay = 24 * 60 * 60 * 1000;
        const now = Date.now();

        // 1. Показуємо з кешу одразу
        let savedHTML = localStorage.getItem(storageKey);
        let savedTime = parseInt(localStorage.getItem(storageTimeKey) || "0", 10);
        
        if (savedHTML && now - savedTime < oneDay) {
            console.log("Використовуються кешовані коментарі");
            const container = document.createElement("div");
            container.innerHTML = savedHTML;
            openModal(container);
        }

        // 2. Оновлюємо у фоновому режимі
        try {
            let apiUrl = kp_prox + url + id + "&cstart=1&type=0&comment_id=0&skin=hdrezka";
            console.log("Запит коментарів:", apiUrl);
            
            let response = await fetch(apiUrl, {
                method: "GET",
                headers: { 
                    "Content-Type": "text/plain",
                    "Accept": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            let fc = await response.json();
            
            if (!fc || !fc.comments) {
                throw new Error("Немає коментарів у відповіді");
            }
            
            console.log("Отримано коментарі, довжина:", fc.comments.length);
            
            let dom = new DOMParser().parseFromString(fc.comments, "text/html");
            
            // Видаляємо непотрібні елементи
            dom.querySelectorAll(".actions, i, .share-link").forEach((elem) => elem.remove());
            
            let rootList = dom.querySelector(".comments-tree-list");
            if (!rootList) {
                throw new Error("Немає коментарів для відображення");
            }
            
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
            
            // Якщо немає кешованих даних, показуємо помилку
            if (!savedHTML) {
                Lampa.Loading.stop();
                Lampa.Noty.show("Не вдалося завантажити коментарі: " + e.message);
            }
        }
    }

    // Функція для відкриття модального вікна з коментарями
    function openModal(treeContent) {
        console.log("Відкриття модального вікна з коментарями");
        Lampa.Loading.stop();
        
        // Додаємо стилі, якщо ще не додані
        if (!document.getElementById("rezka-comment-style")) {
            const styleEl = document.createElement("style");
            styleEl.id = "rezka-comment-style";
            styleEl.textContent = `
                .rezka-comments-modal {
                    padding: 20px;
                    max-height: 70vh;
                    overflow-y: auto;
                }
                .comments-tree-list { 
                    list-style: none; 
                    margin: 0; 
                    padding: 0; 
                }
                .comments-tree-item { 
                    list-style: none; 
                    margin: 0; 
                    padding: 0; 
                    margin-bottom: 15px;
                }
                .comment-wrap { 
                    display: flex; 
                    margin-bottom: 10px;
                }
                .avatar-column { 
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                .avatar-img { 
                    width: 50px; 
                    height: 50px; 
                    border-radius: 50%;
                    object-fit: cover;
                }
                .comment-card { 
                    background: rgba(30, 30, 30, 0.9); 
                    padding: 12px 16px; 
                    border-radius: 10px; 
                    border: 1px solid #3a3a3a; 
                    flex-grow: 1;
                    min-width: 0;
                }
                .comment-header { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    align-items: center;
                }
                .comment-header .name { 
                    font-weight: bold; 
                    color: #fff; 
                    font-size: 15px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .comment-header .date { 
                    opacity: 0.7; 
                    font-size: 12px; 
                    color: #aaa;
                    flex-shrink: 0;
                    margin-left: 10px;
                }
                .comment-text .text { 
                    color: #e0e0e0; 
                    line-height: 1.5; 
                    font-size: 14px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .rezka-modal-title {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-bottom: 1px solid #3a3a3a;
                }
                /* Стилі для спойлерів */
                .title_spoiler {
                    background: #2a2a2a;
                    border-radius: 4px;
                    padding: 2px 6px;
                    margin: 0 2px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                }
                .title_spoiler a {
                    color: #e0e0e0 !important;
                    text-decoration: none !important;
                }
            `;
            document.head.appendChild(styleEl);
        }

        // Створюємо контейнер для модального вікна
        const modalContainer = document.createElement('div');
        modalContainer.className = 'rezka-comments-modal';
        
        // Додаємо заголовок
        const title = document.createElement('div');
        title.className = 'rezka-modal-title';
        title.textContent = namemovie ? `Коментарі: ${namemovie}` : 'Коментарі';
        modalContainer.appendChild(title);
        
        // Додаємо коментарі
        const commentsContainer = document.createElement('div');
        commentsContainer.className = 'comments-container';
        commentsContainer.appendChild(treeContent);
        modalContainer.appendChild(commentsContainer);
        
        // Відкриваємо модальне вікно
        setTimeout(() => {
            Lampa.Modal.open({
                title: '',
                html: modalContainer,
                size: 'large',
                width: 900,
                onBack: function () {
                    Lampa.Modal.close();
                },
                onSelect: function () {
                    // Обробка вибору елементів у модальному вікні
                    return true;
                }
            });
            
            console.log("Модальне вікно відкрито");
        }, 100);
    }

    // Функція для обробки натискання кнопки коментарів
    function handleCommentButtonClick() {
        if (!currentMovieData) {
            console.log("Немає даних про фільм");
            return;
        }
        
        console.log("Клік по кнопці коментарів", currentMovieData);
        
        year = 0;
        if (currentMovieData.movie.release_date) {
            year = currentMovieData.movie.release_date.slice(0, 4);
        } else if (currentMovieData.movie.first_air_date) {
            year = currentMovieData.movie.first_air_date.slice(0, 4);
        }
        
        Lampa.Loading.start();
        getEnTitle(currentMovieData.movie.id, currentMovieData.object.method);
    }

    // Функція для початку роботи плагіна
    function startPlugin() {
        console.log("Запуск плагіна коментарів Rezka");
        window.comment_plugin = true;
        
        Lampa.Listener.follow("full", function (e) {
            console.log("Full event:", e.type, e.data);
            
            if (e.type === "complite") {
                // Зберігаємо дані про поточний фільм
                currentMovieData = e;
                
                // Видаляємо старі кнопки коментарів
                let oldButtons = document.querySelectorAll(".button--comment");
                oldButtons.forEach(btn => {
                    if (btn.parentNode) {
                        btn.parentNode.removeChild(btn);
                    }
                });
                
                // Знаходимо контейнер для кнопок
                let buttonsContainer = document.querySelector(".full-start-new__buttons");
                if (!buttonsContainer) {
                    buttonsContainer = document.querySelector(".full-start__buttons");
                }
                
                if (buttonsContainer) {
                    // Створюємо кнопку коментарів
                    let commentButton = document.createElement("div");
                    commentButton.className = "full-start__button selector button--comment";
                    commentButton.style.cssText = `
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 10px 20px;
                        margin: 5px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background 0.2s;
                    `;
                    
                    commentButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        </svg>
                        <span style="font-size: 14px;">Коментарі</span>
                    `;
                    
                    // Додаємо обробники подій
                    commentButton.addEventListener('click', handleCommentButtonClick);
                    
                    // Також додаємо обробник для натискання Enter (для ТВ-пульта)
                    commentButton.addEventListener('keydown', function(event) {
                        if (event.key === 'Enter' || event.keyCode === 13) {
                            handleCommentButtonClick();
                        }
                    });
                    
                    // Робимо кнопку фокусованою для ТВ
                    commentButton.setAttribute('tabindex', '0');
                    
                    buttonsContainer.appendChild(commentButton);
                    
                    console.log("Кнопка коментарів додана");
                } else {
                    console.log("Не знайдено контейнер для кнопок");
                }
            }
        });
        
        console.log("Плагін коментарів успішно ініціалізовано");
    }

    // Чекаємо завантаження Lampa
    function waitForLampa() {
        if (typeof Lampa !== 'undefined' && typeof Lampa.Listener !== 'undefined') {
            console.log("Lampa завантажена, запускаємо плагін");
            if (!window.comment_plugin) {
                startPlugin();
            }
        } else {
            console.log("Очікування завантаження Lampa...");
            setTimeout(waitForLampa, 1000);
        }
    }

    // Запускаємо очікування Lampa
    waitForLampa();
})();
