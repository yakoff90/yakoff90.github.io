/*
Плагін для розфарбовування рейтингів на картках
Взято з maxsm-ratings plugin
*/

(function() {
    'use strict';

    // Налаштування логування
    var C_LOGGING = true; // Змініть на false, щоб вимкнути логи

    // Кеш для середніх рейтингів
    var AVERAGE_CACHE = 'maxsm_card_ratings_cache';
    var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 доби

    // ==============================================
    // СТИЛІ ДЛЯ РОЗФАРБОВУВАННЯ РЕЙТИНГУ
    // ==============================================
    var style = "<style id=\"maxsm_card_ratings\">" +
        ".card__vote {" +
            "transition: all 0.3s ease;" +
        "}" +
        ".card__vote.low-rating {" +
            "background-color: #dc3545 !important;" +  /* червоний */
            "color: white !important;" +
        "}" +
        ".card__vote.medium-rating {" +
            "background-color: #ffc107 !important;" +  /* жовтий */
            "color: #212529 !important;" +
        "}" +
        ".card__vote.high-rating {" +
            "background-color: #28a745 !important;" +  /* зелений */
            "color: white !important;" +
        "}" +
    "</style>";

    // Додаємо стилі
    $('head').append(style);

    // ==============================================
    // ФУНКЦІЇ РОБОТИ З КЕШЕМ
    // ==============================================
    
    // Зберегти середній рейтинг в кеш
    function saveAverageToCache(cardId, average) {
        if (!cardId) return;
        
        if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Збереження рейтингу в кеш для card: " + cardId);
        
        var cache = Lampa.Storage.get(AVERAGE_CACHE) || {};
        cache[cardId] = {
            average: average,
            timestamp: Date.now()
        };
        
        Lampa.Storage.set(AVERAGE_CACHE, cache);
    }
    
    // Отримати середній рейтинг з кешу
    function getAverageFromCache(cardId) {
        if (!cardId) {
            if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Не знайдено кеш: немає cardId");
            return null;
        }
        
        var cache = Lampa.Storage.get(AVERAGE_CACHE) || {};
        var item = cache[cardId];
        
        if (!item) {
            if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Не знайдено кеш для card: " + cardId);
            return null;
        }
        
        if (Date.now() - item.timestamp < CACHE_TIME) {
            if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Знайдено рейтинг в кеші для card: " + cardId + " - " + item.average);
            return item.average;
        }
        
        if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Кеш застарів для card: " + cardId);
        return null;
    }

    // ==============================================
    // ФУНКЦІЯ РОЗФАРБОВУВАННЯ РЕЙТИНГУ
    // ==============================================
    
    // Функція для розфарбовування рейтингу на картці
    function colorizeCardRating(element, rating) {
        if (!element || rating === undefined || rating === null) return;
        
        // Видаляємо попередні класи рейтингу
        element.classList.remove('low-rating', 'medium-rating', 'high-rating');
        
        // Застосовуємо нові класи в залежності від оцінки
        if (rating < 5) {
            element.classList.add('low-rating');
            if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Застосовано клас low-rating (червоний) для рейтингу: " + rating);
        } else if (rating >= 5 && rating < 7) {
            element.classList.add('medium-rating');
            if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Застосовано клас medium-rating (жовтий) для рейтингу: " + rating);
        } else if (rating >= 7) {
            element.classList.add('high-rating');
            if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Застосовано клас high-rating (зелений) для рейтингу: " + rating);
        }
    }

    // Основна функція обробки карток
    function processCardRatings(cards) {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var cardVote = card.querySelector('.card__vote');
            
            // ========== ПЕРЕВІРКА: ЦЕ РЕЙТИНГ ЧИ КІЛЬКІСТЬ ГОЛОСІВ? ==========
            if (cardVote) {
                var ratingText = cardVote.textContent.trim();
                
                // Перевіряємо що це рейтинг, а не кількість голосів
                // Рейтинг: "7.5", "8.1", "6.0" (одне або два числа з крапкою)
                // Голоси: "1.5K", "2.3M", "1,234" (з літерами K/M або комами)
                
                var isRating = /^[\d]+\.?[\d]*$/.test(ratingText); // Тільки цифри і крапка
                var isVotes = /[KM]/.test(ratingText) || /,/.test(ratingText); // Літери K/M або коми
                
                if (isVotes) {
                    if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Пропуск картки: в лейблі кількість голосів: " + ratingText);
                    continue; // Пропускаємо цю картку
                }
                
                if (!isRating) {
                    if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Пропуск картки: незрозумілий формат: " + ratingText);
                    continue; // Пропускаємо
                }
            }
            
            // ========== ЕТАП 1: ОТРИМУЄМО РЕЙТИНГ ==========
            var ratingValue = null;  // Число для розфарбовування
            var ratingText = null;   // Текст для відображення (зі зірочкою)
            var source = null;
            
            // Варіант 1: Рейтинг з кешу (середній)
            var cardData = card.card_data || {};
            var cardId = cardData.id;
            
            if (cardId) {
                var cachedAverage = getAverageFromCache(cardId);
                if (cachedAverage) {
                    ratingValue = parseFloat(cachedAverage); // Число
                    ratingText = '✦ ' + ratingValue.toFixed(1);      // Текст із зірочкою
                    source = 'cache';
                }
            }
            
            // Варіант 2: Рейтинг з картки (оригінальний)
            if (!ratingValue) {
                var cardVoteElem = card.querySelector('.card__vote');
                if (cardVoteElem) {
                    var ratingTextContent = cardVoteElem.textContent.trim();
                    ratingValue = parseFloat(ratingTextContent);
                    if (!isNaN(ratingValue)) {
                        ratingText = '★ ' + ratingValue.toFixed(1);
                        source = 'card';
                    }
                }
            }
            
            // Якщо не знайшли жодного рейтингу - пропускаємо
            if (!ratingValue) {
                if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Картка " + (cardId || 'unknown') + 
                    ": немає рейтингу");
                continue;
            }
            
            if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Картка " + (cardId || 'unknown') + 
                ": рейтинг " + ratingText + " з " + source);
            
            // ========== ЕТАП 2: ЗМІНЮЄМО ЦИФРУ НА КАРТЦІ ==========
            if (cardVote) {
                // Оновлюємо існуючий
                cardVote.textContent = ratingText;
            } else {
                // Створюємо новий
                var cardView = card.querySelector('.card__view');
                if (!cardView) {
                    if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Картка " + (cardId || 'unknown') + 
                        ": немає .card__view");
                    continue;
                }
                
                cardVote = document.createElement('div');
                cardVote.className = 'card__vote';
                cardVote.textContent = ratingText;
                cardView.appendChild(cardVote);
            }
            
            // ========== ЕТАП 3: РОЗФАРБОВУЄМО РЕЙТИНГ ==========
            colorizeCardRating(cardVote, ratingValue);
            
            // Зберігаємо в кеш, якщо це оригінальний рейтинг з картки
            if (source === 'card' && cardId) {
                saveAverageToCache(cardId, ratingValue);
            }
        }
    }

    // ==============================================
    // НАСТРОЙКА СПОСТЕРІГАЧА ЗА НОВИМИ КАРТКАМИ
    // ==============================================
    
    // Обсервер DOM для нових карток
    var cardsObserver = new MutationObserver(function(mutations) {
        var newCards = [];
        for (var m = 0; m < mutations.length; m++) {
            var mutation = mutations[m];
            if (mutation.addedNodes) {
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    if (node.nodeType !== 1) continue;
                    
                    if (node.classList && node.classList.contains('card')) {
                        newCards.push(node);
                    }
                    
                    var nestedCards = node.querySelectorAll('.card');
                    for (var k = 0; k < nestedCards.length; k++) {
                        newCards.push(nestedCards[k]);
                    }
                }
            }
        }
        
        if (newCards.length) {
            if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Знайдено нових карток: " + newCards.length);
            processCardRatings(newCards);
        }
    });

    // ==============================================
    // ІНІЦІАЛІЗАЦІЯ ПЛАГІНА
    // ==============================================
    
    function initPlugin() {
        if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Плагін розфарбовування рейтингів запущено!");
        
        // Запуск спостереження за картками
        cardsObserver.observe(document.body, { childList: true, subtree: true });
        if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Обсервер для розфарбовування рейтингів запущено");
        
        // Обробка вже завантажених карток
        setTimeout(function() {
            var existingCards = document.querySelectorAll('.card');
            if (existingCards.length) {
                if (C_LOGGING) console.log("MAXSM-CARD-RATINGS", "Обробка вже завантажених карток: " + existingCards.length);
                processCardRatings(existingCards);
            }
        }, 1000); // Невелика затримка, щоб дати час на завантаження
    }

    // Запускаємо плагін
    initPlugin();

})();
