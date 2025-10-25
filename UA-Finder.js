/**
 * Lampa Track Finder v3.0 - (UA-Finder)
 * --------------------------------------------------------------------------------
 * Цей плагін призначений для пошуку та відображення інформації про наявність
 * українських аудіодоріжок у релізах, доступних через Jacred API.
 * --------------------------------------------------------------------------------
 * Основні можливості:
 * - Шукає згадки українських доріжок (Ukr, 2xUkr і т.д.) у назвах торрентів.
 * - Ігнорує українські субтитри, аналізуючи лише частину назви до слова "sub".
 * - Виконує паралельний пошук за оригінальною та локалізованою назвою для максимального охоплення.
 * - Обирає реліз з найбільшою кількістю знайдених українських доріжок.
 * - Має надійний дворівневий фільтр для розрізнення фільмів та серіалів.
 * - Оптимізована обробка карток (дебаунсинг) для уникнення пропусків та підвищення продуктивності.
 * - Відображає мітку на постерах (динамічно адаптується до присутності плагіна RatingUp).
 * - Має систему кешування для зменшення навантаження та пришвидшення роботи.
 * - Не виконує пошук для майбутніх релізів або релізів з невідомою датою.
 * --------------------------------------------------------------------------------
 * - 🟩 ДОДАНО: Опція 'DISPLAY_MODE' в конфігурації.
 * - 🟩 Тепер можна перемикати вигляд мітки між текстом ('text' -> "Ukr") та прапором ('flag' -> "🇺🇦") (наприклад, "2xUkr" або "2x🇺🇦").
 * - 🟩 Повністю перероблено логіку `processListCard` на ідемпотентну.
 * - 🟩 Мітки, що зникали при перемальовуванні DOM, тепер миттєво відновлюються з кешу.
 * - 🟩 "Примарні" мітки (хибний кеш) тепер коректно видаляються під час 6-годинного фонового оновлення.
 * - 🟩 Збережено оптимізації (дебаунс, пакетна обробка) з v2.7.
 * - 🟩 Додано разову перевірку кешу при старті (з v3.0) для миттєвого відображення.
 * - 🟩 Виправлено логіку фільтрації за роком (дозволено різницю в 1 рік).
 * - 🟥 Видалено атрибут `data-ltf-tracks-processed` та логіку `retry` як непотрібні.
 */
(function() {
    'use strict'; // Використовуємо суворий режим для кращої якості коду та запобігання помилок.

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА (LTF - Lampa Track Finder) =====================
    
    // SVG прапор України замість емодзі
    var ukraineFlagSVG = '<svg class="flag-svg" viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';
    
    var LTF_CONFIG = {
        // --- Налаштування кешу ---
        CACHE_VERSION: 3, // Версія кешу. Змініть, якщо хочете скинути старі збережені дані.
        CACHE_KEY: 'lampa_ukr_tracks_cache', // Унікальний ключ для зберігання кешу в LocalStorage.
        CACHE_VALID_TIME_MS: 12 * 60 * 60 * 1000, // Час життя кешу (12 годин).
        CACHE_REFRESH_THRESHOLD_MS: 6 * 60 * 60 * 1000, // Через скільки часу кеш потребує фонового оновлення (6 годин).

        // --- Налаштування логування для налагодження ---
        LOGGING_GENERAL: false, // Загальні логі роботи плагіна.
        LOGGING_TRACKS: false, // Логи, що стосуються процесу пошуку та підрахунку доріжок.
        LOGGING_CARDLIST: false, // Логи для відстеження обробки карток у списках.

        // --- Налаштування API та мережі ---
        JACRED_PROTOCOL: 'http://', // Протокол для API JacRed.
        JACRED_URL: 'jacred.xyz', // Домен API JacRed.
        PROXY_LIST: [ // Список проксі-серверів для обходу CORS-обмежень.
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 3500, // Максимальний час очікування відповіді від одного проксі (3.5 секунди).
        MAX_PARALLEL_REQUESTS: 10,
        MAX_RETRY_ATTEMPTS: 2,

        // --- Налаштування функціоналу ---
        SHOW_TRACKS_FOR_TV_SERIES: true, // Чи показувати мітки для серіалів (true або false)

        // ✅ НОВЕ: Налаштування відображення
        DISPLAY_MODE: 'flag', // Режим відображення: 'text' (Ukr) або 'flag' (🇺🇦)

        //ДОДАНО: Ручні перевизначення доріжок для конкретних ID контенту ===
        MANUAL_OVERRIDES: {
            '207703': { track_count: 1 },    //✅Примусово показувати Ukr для цього ID
            '1195518': { track_count: 2 },   //✅Примусово показувати 2xUkr для цього ID
            '215995': { track_count: 2 },    //✅Примусово показувати 2xUkr для цього ID
            '1234821': { track_count: 2 },   //✅Примусово показувати 2xUkr для цього ID
            '933260': { track_count: 3 },    //✅Примусово показувати 3xUkr для цього ID
            '245827': { track_count: 0 }     //✅Примусово не показувати Ukr для цього ID
            /*'933260': { track_count: 3 }*/     //✅Примусово показувати 3xUkr для цього ID
            /*'Тут ID фільму': { track_count: 0 },*/   //✅Примусово приховувати мітку для цього ID
            /*'Тут ID фільму': { track_count: 3 }*/    //✅Примусово показувати 3xUkr для цього ID
        }
        // КІНЕЦЬ перевизначень
    
    };

    // ======== АВТОМАТИЧНЕ СКИДАННЯ СТАРОГО КЕШУ ПРИ ОНОВЛЕННІ ========
    (function resetOldCache() {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var hasOld = Object.keys(cache).some(k => !k.startsWith(LTF_CONFIG.CACHE_VERSION + '_'));
            if (hasOld) {
            console.log('UA-Finder: очищено старий кеш доріжок');
            Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, {});
            }
    })();
    
// ===================== СТИЛІ CSS =====================
// Цей блок створює та додає на сторінку всі необхідні стилі для відображення міток.
var styleTracks = "<style id=\"lampa_tracks_styles\">" +
    // Встановлюємо контекст позиціонування для постера
    ".card__view { position: relative; }" +

    // Стиль для мітки з доріжками
    ".card__tracks {" +
    " position: absolute !important; " + // Абсолютне позиціонування відносно .card__view
    " right: 0.3em !important; " + // Відступ праворуч
    " left: auto !important; " + // Скидаємо позиціонування зліва
    " top: 0.3em !important; " + // Позиція за замовчуванням (коли RatingUp неактивний)
    " background: rgba(0,0,0,0.5) !important;" + // Напівпрозорий чорний фон
    " color: #FFFFFF !important;" + // Білий колір тексту
    " font-size: 1.3em !important;" + // Розмір шрифту
    " padding: 0.2em 0.5em !important;" + // Внутрішні відступи
    " border-radius: 1em !important;" + // Закруглення кутів
    " font-weight: 700 !important;" + // Жирний шрифт
    " z-index: 20 !important;" + // Високий z-index, щоб бути поверх інших елементів
    " width: fit-content !important; " + // Ширина за вмістом
    " max-width: calc(100% - 1em) !important; " + // Максимальна ширина
    " overflow: hidden !important;" + // Приховувати все, що виходить за межі
    "}" +

    // Додатковий клас, який застосовується динамічно, якщо плагін RatingUp активний
    ".card__tracks.positioned-below-rating {" +
    " top: 1.85em !important; " + // Версія позиції, щоб зміститися нижче рейтингу
    "}" +
    
    // Стиль для тексту всередині мітки
    ".card__tracks div {" +
    " text-transform: none !important; " + // Без перетворення у великі літери
    " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif !important; " + // Шрифт
    " font-weight: 700 !important; " + // Жирність
    " letter-spacing: 0.1px !important; " + // Міжлітерна відстань
    " font-size: 1.05em !important; " + // Розмір шрифту
    " color: #FFFFFF !important;" + // Колір тексту
    " padding: 0 !important; " + // Скидання відступів (вони в батьківському елементі)
    " white-space: nowrap !important;" + // Заборона переносу рядка
    " display: flex !important; " + // Flex-контейнер
    " align-items: center !important; " + // Вертикальне вирівнювання
    " gap: 4px !important; " + // Відстань між елементами
    " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3) !important; " + // Тінь для тексту
    "}" +
    
    // Стилі для прапора - точне вирівнювання
    ".card__tracks .flag-svg {" +
    " display: inline-block;" +
    " vertical-align: middle;" +
    " width: 1.6em;" +
    " height: 0.9em;" +
    " margin-right: -0.1em;" + // Зменшуємо відступ справа
    " margin-left: -0.1em;" + //  Зменшуємо відступ зліва
    " margin-top: 0em;" + // вертикальний відступ
    "}" +
    "</style>";
// Додаємо стилі в DOM один раз при завантаженні плагіна.
Lampa.Template.add('lampa_tracks_css', styleTracks);
$('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));

    // ===================== УПРАВЛІННЯ ЧЕРГОЮ ЗАПИТІВ =====================
    var requestQueue = [];
    var activeRequests = 0;
    var networkHealth = 1.0;

    function enqueueTask(fn) {
        requestQueue.push(fn);
        processQueue();
    }

    function processQueue() {
        var adaptiveLimit = Math.max(3, Math.min(LTF_CONFIG.MAX_PARALLEL_REQUESTS, Math.floor(LTF_CONFIG.MAX_PARALLEL_REQUESTS * networkHealth)));
        
        if (activeRequests >= adaptiveLimit) return;
        var task = requestQueue.shift();
        if (!task) return;

        activeRequests++;
        try {
            task(function onTaskDone() {
                activeRequests--;
                setTimeout(processQueue, 0);
            });
        } catch (e) {
            console.error("LTF-LOG", "Помилка виконання завдання з черги:", e);
            activeRequests--;
            setTimeout(processQueue, 0);
        }
    }

    function updateNetworkHealth(success) {
        if (success) {
            networkHealth = Math.min(1.0, networkHealth + 0.1);
        } else {
            networkHealth = Math.max(0.3, networkHealth - 0.2);
        }
        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG", "Оновлено здоров'я мережі:", networkHealth);
    }

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;

        function tryNextProxy() {
            if (currentProxyIndex >= LTF_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    updateNetworkHealth(false);
                    callback(new Error('Всі проксі не відповіли для ' + url));
                }
                return;
            }
            var proxyUrl = LTF_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, LTF_CONFIG.PROXY_TIMEOUT_MS);

            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error('Помилка проксі: ' + response.status);
                    return response.text();
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        updateNetworkHealth(true);
                        callback(null, data);
                    }
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                });
        }
        tryNextProxy();
    }
    
    // ===================== ДОПОМІЖНІ ФУНКЦІЇ =====================
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type;
        if (type === 'movie' || type === 'tv') return type;
        return cardData.name || cardData.original_name ? 'tv' : 'movie';
    }

    // ===================== ОСНОВНА ЛОГІКА ПІДРАХУНКУ ДОРІЖОК =====================
    function countUkrainianTracks(title) {
        if (!title) return 0;
        let cleanTitle = title.toLowerCase();
        
        const subsIndex = cleanTitle.indexOf('sub');
        if (subsIndex !== -1) {
            cleanTitle = cleanTitle.substring(0, subsIndex);
        }

        const multiTrackMatch = cleanTitle.match(/(\d+)x\s*ukr/);
        if (multiTrackMatch && multiTrackMatch[1]) {
            return parseInt(multiTrackMatch[1], 10);
        }

        const singleTrackMatches = cleanTitle.match(/\bukr\b/g);
        if (singleTrackMatches) {
            return singleTrackMatches.length;
        }

        return 0;
    }

    /**
     * ✅ ОНОВЛЕНО
     * Форматує текст мітки на основі кількості доріжок та налаштування DISPLAY_MODE.
     * @param {number} count - Кількість доріжок.
     * @returns {string|null} - Текст мітки ("Ukr", "2xUkr", "🇺🇦", "2x🇺🇦") або null.
     */
    function formatTrackLabel(count) {
        if (!count || count === 0) return null; // Не показувати мітку, якщо доріжок 0.
    
        // Вибираємо мітку згідно конфігурації
        if (LTF_CONFIG.DISPLAY_MODE === 'flag') {
            // Режим прапора - використовуємо SVG
            if (count === 1) return ukraineFlagSVG; // Поверне SVG прапор
            return `${count}x${ukraineFlagSVG}`; // Поверне '2x[SVG прапор]'
        } else {
            // Режим тексту - використовуємо текст "Ukr"
            if (count === 1) return 'Ukr'; // Поверне 'Ukr'
            return `${count}xUkr`; // Поверне '2xUkr'
        }
    }

    // ===================== ПОШУК НА JACRED =====================
    function getBestReleaseWithUkr(normalizedCard, cardId, callback) {
        enqueueTask(function(done) {

            if (!normalizedCard.release_date || normalizedCard.release_date.toLowerCase().includes('невідомо') || isNaN(new Date(normalizedCard.release_date).getTime())) {
                callback(null);
                done();
                return;
                }
            
            var releaseDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                callback(null);
                done();
                return;
            }

            var year = '';
            if (normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
                year = normalizedCard.release_date.substring(0, 4);
            }
            if (!year || isNaN(parseInt(year, 10))) {
                callback(null);
                done();
                return;
            }
            var searchYearNum = parseInt(year, 10);
            
            function extractYearFromTitle(title) {
                var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                var match, lastYear = 0;
                var currentYear = new Date().getFullYear();
                while ((match = regex.exec(title)) !== null) {
                    var extractedYear = parseInt(match[1], 10);
                    if (extractedYear >= 1900 && extractedYear <= currentYear + 2) { 
                        lastYear = extractedYear;
                    }
                }
                return lastYear;
            }

            function searchJacredApi(searchTitle, searchYear, apiCallback) {
                var userId = Lampa.Storage.get('lampac_unic_id', '');
                var apiUrl = LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                    encodeURIComponent(searchTitle) +
                    '&year=' + searchYear +
                    '&uid=' + userId;
                
                fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                    if (error || !responseText) {
                        apiCallback(null);
                        return;
                    }
                    try {
                        var torrents = JSON.parse(responseText);
                        if (!Array.isArray(torrents) || torrents.length === 0) {
                            apiCallback(null);
                            return;
                        }

                        let bestTrackCount = 0;
                        let bestFoundTorrent = null;

                        for (let i = 0; i < torrents.length; i++) {
                            const currentTorrent = torrents[i];
                            const torrentTitle = currentTorrent.title.toLowerCase();

                            // --- ДВОРІВНЕВИЙ ФІЛЬТР "ФІЛЬМ/СЕРІАЛ" ---
                            const isSeriesTorrent = /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/.test(torrentTitle);
                            if (normalizedCard.type === 'tv' && !isSeriesTorrent) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (схожий на фільм для картки серіалу):`, currentTorrent.title);
                                continue; 
                            }
                            if (normalizedCard.type === 'movie' && isSeriesTorrent) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (схожий на серіал для картки фільму):`, currentTorrent.title);
                                continue;
                            }
                            
                            if (normalizedCard.type === 'movie') {
                                const hasStrongSeriesIndicators = /(сезон|season|s\d|серії|episodes|епізод|\d+×\d+)/i.test(torrentTitle);
                                if (hasStrongSeriesIndicators) {
                                    if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (чіткі ознаки серіалу для картки фільму):`, currentTorrent.title);
                                    continue;
                                }
                            }
                            
                            // --- НАЛАШТУВАННЯ ГНУЧКОСТІ ПОШУКУ ЗА РОКОМ ---                            
                            // Тут можна змінити припустиму різницю у роках.
                            // > 0 : Тільки точний збіг року. Максимальна точність, але може пропускати релізи на межі років.
                            // > 1 : Дозволяє різницю в 1 рік. РЕКОМЕНДОВАНО для серіалів та фільмів на межі років.
                            // > 3 : Дозволяє різницю в 3 роки. Добре для трилогій, але може іноді помилятись

                            //Шукаємо рік в назві релізу
                            //Спочатку бере рік із назви релізу (extractYearFromTitle), 
                            //а потім із поля relased, якщо в назві року немає.
                            var parsedYear = extractYearFromTitle(currentTorrent.title) || parseInt(currentTorrent.relased, 10);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);
                            
                            // ✅ Дозволяє різницю в 1 рік (0 або 1).
                            if (parsedYear > 1900 && yearDifference > 0) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (рік не співпадає: ${parsedYear} vs ${searchYearNum}):`, currentTorrent.title);
                                continue;
                            }
                            
                            const currentTrackCount = countUkrainianTracks(currentTorrent.title);
                            
                            if (currentTrackCount > bestTrackCount) {
                                bestTrackCount = currentTrackCount;
                                bestFoundTorrent = currentTorrent;
                            } else if (currentTrackCount === bestTrackCount && bestTrackCount > 0 && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
                                bestFoundTorrent = currentTorrent;
                            }
                        }

                        if (bestFoundTorrent) {
                            apiCallback({
                                track_count: bestTrackCount,
                                full_label: bestFoundTorrent.title
                            });
                        } else {
                            apiCallback(null);
                        }
                    } catch (e) {
                        apiCallback(null);
                    }
                });
            }

            // --- ЛОГІКА ПАРАЛЕЛЬНОГО ПОШУКУ ---
            const titlesToSearch = [ normalizedCard.original_title, normalizedCard.title ];
            const uniqueTitles = [...new Set(titlesToSearch)].filter(Boolean);
            if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', `[${cardId}] Запускаємо пошук за назвами:`, uniqueTitles);
            const searchPromises = uniqueTitles.map(title => {
                return new Promise(resolve => {
                    searchJacredApi(title, year, resolve);
                });
            });

            Promise.all(searchPromises).then(results => {
                let bestOverallResult = null;
                let maxTrackCount = 0;
                results.forEach(result => {
                    if (!result || !result.track_count) return;
                    if (result.track_count > maxTrackCount) {
                        maxTrackCount = result.track_count;
                        bestOverallResult = result;
                    }
                });
                if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', `[${cardId}] Найкращий результат з усіх пошуків:`, bestOverallResult);
                callback(bestOverallResult);
                done();
            });
        });
    }

    // ===================== РОБОТА З КЕШЕМ =====================
    function getTracksCache(key) {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var item = cache[key];
        var isCacheValid = item && (Date.now() - item.timestamp < LTF_CONFIG.CACHE_VALID_TIME_MS);
        return isCacheValid ? item : null;
    }

    function saveTracksCache(key, data) {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        cache[key] = {
            track_count: data.track_count,
            timestamp: Date.now()
        };
        Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, cache);
    }
    
// ===================== ОНОВЛЕННЯ ІНТЕРФЕЙСУ (UI) =====================
function updateCardListTracksElement(cardView, trackCount) {
    const displayLabel = formatTrackLabel(trackCount); // Отримає '2xUkr' або SVG код
    const existingElement = cardView.querySelector('.card__tracks');
    
    // Якщо мітки не має бути, а вона є - видаляємо.
    if (!displayLabel) {
        if (existingElement) existingElement.remove();
        return;
    }
    
    // Якщо мітка вже є і вміст той самий - нічого не робимо.
    if (existingElement && existingElement.innerHTML === displayLabel) {
        return;
    }
    
    // В інших випадках - видаляємо стару (якщо є) і малюємо нову.
    if (existingElement) existingElement.remove();
    
    const trackDiv = document.createElement('div');
    trackDiv.className = 'card__tracks';

    const parentCard = cardView.closest('.card');
    if (parentCard) {
        const voteElement = parentCard.querySelector('.card__vote');
        if (voteElement) {
             const topStyle = getComputedStyle(voteElement).top;
             if (topStyle !== 'auto' && parseInt(topStyle) < 100) {
                 trackDiv.classList.add('positioned-below-rating');
             }
        }
    }
    
    // ЗМІНА: використовуємо innerHTML замість textContent для коректного відображення SVG
    const innerElement = document.createElement('div');
    innerElement.innerHTML = displayLabel; //ЗМІНА!
    trackDiv.appendChild(innerElement);
    cardView.appendChild(trackDiv);
}
    // ===================== ГОЛОВНИЙ ОБРОБНИК КАРТОК =====================
    /**
     * 🟩 НОВА ЛОГІКА (ІДЕМПОТЕНТНА)
     * Ця функція може викликатись для однієї картки багато разів.
     * Вона сама вирішує, що робити, базуючись на стані кешу.
     * 1. Немає кешу? -> Робимо пошук, малюємо.
     * 2. Кеш свіжий? -> Малюємо з кешу.
     * 3. Кеш застарілий? -> Малюємо з кешу + запускаємо фонове оновлення.
     * Це автоматично виправляє і "зникнення" міток, і "примарні" мітки.
     */
    function processListCard(cardElement) {
        if (!cardElement || !cardElement.isConnected || !document.body.contains(cardElement)) {
            return;
        }

        var cardData = cardElement.card_data;
        var cardView = cardElement.querySelector('.card__view');
        if (!cardData || !cardView) return;

        var isTvSeries = (getCardType(cardData) === 'tv');
        if (isTvSeries && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) return;

        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        var cardId = normalizedCard.id;
        var cacheKey = `${LTF_CONFIG.CACHE_VERSION}_${normalizedCard.type}_${cardId}`;

        // 1. Перевірка ручних перевизначень (мають найвищий пріоритет)
        var manualOverrideData = LTF_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Використовується ручне перевизначення:`, manualOverrideData);
            updateCardListTracksElement(cardView, manualOverrideData.track_count);
            return; // Не продовжуємо стандартну обробку
        }

        // 2. Отримуємо дані з кешу
        var cachedData = getTracksCache(cacheKey);

        // 3. Вирішуємо, що робити
        if (cachedData) {
            // --- КЕШ ІСНУЄ ---
            
            // 3a. Малюємо мітку з кешу (це також "автозцілення")
            updateCardListTracksElement(cardView, cachedData.track_count);
            
            // 3b. Перевіряємо, чи не час оновити кеш у фоні (виправлення "примар")
            if (Date.now() - cachedData.timestamp > LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Кеш застарілий, фонове оновлення...`);
                
                getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                    let trackCount = liveResult ? liveResult.track_count : 0;
                    saveTracksCache(cacheKey, { track_count: trackCount });
                    
                    // Оновлюємо UI, лише якщо картка ще існує
                    if (document.body.contains(cardElement)) {
                        updateCardListTracksElement(cardView, trackCount);
                    }
                });
            }
        } else {
            // --- КЕШУ НЕМАЄ (або він прострочений) ---
            if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Кеш відсутній, новий пошук...`);
            
            getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                let trackCount = liveResult ? liveResult.track_count : 0;
                saveTracksCache(cacheKey, { track_count: trackCount });
                
                if (document.body.contains(cardElement)) {
                    updateCardListTracksElement(cardView, trackCount);
                }
            });
        }
    }
    
    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    // ✅ Збережено оптимізований дебаунсинг з v2.7
    var observerDebounceTimer = null;
    var cardsToProcess = [];

    function debouncedProcessCards() {
        clearTimeout(observerDebounceTimer);
        observerDebounceTimer = setTimeout(function() {
            const batch = [...new Set(cardsToProcess)]; // Видаляємо дублікати
            cardsToProcess = [];
            
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log("LTF-LOG: Обробка пачки з", batch.length, "карток.");

            var BATCH_SIZE = 12;
            var DELAY_MS = 30;

            function processBatch(startIndex) {
                var currentBatch = batch.slice(startIndex, startIndex + BATCH_SIZE);
                
                currentBatch.forEach(card => {
                    if (card.isConnected && document.body.contains(card)) {
                        processListCard(card);
                    }
                });
                
                var nextIndex = startIndex + BATCH_SIZE;
                if (nextIndex < batch.length) {
                    setTimeout(function() {
                        processBatch(nextIndex);
                    }, DELAY_MS);
                }
            }
            
            if (batch.length > 0) {
                processBatch(0);
            }
            
        }, 150); // Затримка в 150 мілісекунд.
    }

    // MutationObserver - слідкує за появою нових карток.
    var observer = new MutationObserver(function(mutations) {
        let newCardsFound = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { 
                        if (node.classList && node.classList.contains('card')) {
                            cardsToProcess.push(node);
                            newCardsFound = true;
                        }
                        const nestedCards = node.querySelectorAll('.card');
                        if (nestedCards.length) {
                           nestedCards.forEach(card => cardsToProcess.push(card));
                           newCardsFound = true;
                        }
                    }
                });
            }
        });
        
        if (newCardsFound) {
            debouncedProcessCards();
        }
    });

    /**
     * Головна функція ініціалізації, яка запускає весь механізм.
     */
    function initializeLampaTracksPlugin() {
        if (window.lampaTrackFinderPlugin) return;
        window.lampaTrackFinderPlugin = true;

        // Запускаємо спостерігач DOM
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length) {
            containers.forEach(container => observer.observe(container, { childList: true, subtree: true }));
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // ===============================================================
        // 🟩 Разова перевірка кешу при старті (взято з v3.0)
        // Миттєво відновлює мітки для карток, що вже є на екрані при запуску.
        // ===============================================================
        setTimeout(function () {
            const allCards = document.querySelectorAll('.card');
            if (LTF_CONFIG.LOGGING_GENERAL && allCards.length > 0) {
                 console.log(`UA-Finder: Разова перевірка кешу для ${allCards.length} карток...`);
            }
            allCards.forEach(card => {
                if (card.card_data && card.querySelector('.card__view')) {
                    // Використовуємо ту ж логіку, що й observer,
                    // це гарантує відновлення з кешу або фонове оновлення.
                    processListCard(card);
                }
            });
        }, 1200); // Через 1.2 секунди після старту Lampa

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок (v3.2) успішно ініціалізовано!");
    }

    // Запускаємо ініціалізовано, коли DOM буде готовий.
    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }
})();
