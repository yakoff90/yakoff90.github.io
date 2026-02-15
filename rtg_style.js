/*
Плагін для розфарбовування рейтингів на картках
Тільки кольори, без зміни тексту та кешування
*/

(function() {
    'use strict';

    // Налаштування логування
    var C_LOGGING = true; // Змініть на false, щоб вимкнути логи

    // ==============================================
    // СТИЛІ ДЛЯ РОЗФАРБОВУВАННЯ РЕЙТИНГУ
    // ==============================================
    var style = "<style id=\"maxsm_card_colors_only\">" +
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
            if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "🔴 Червоний для рейтингу: " + rating);
        } else if (rating >= 5 && rating < 7) {
            element.classList.add('medium-rating');
            if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "🟡 Жовтий для рейтингу: " + rating);
        } else if (rating >= 7) {
            element.classList.add('high-rating');
            if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "🟢 Зелений для рейтингу: " + rating);
        }
    }

    // Основна функція обробки карток
    function processCardRatings(cards) {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var cardVote = card.querySelector('.card__vote');
            
            if (!cardVote) continue;
            
            // Отримуємо текст рейтингу
            var ratingText = cardVote.textContent.trim();
            
            // Перевіряємо що це рейтинг (число), а не кількість голосів
            // Рейтинг: "7.5", "8.1", "6.0" (тільки цифри і крапка)
            // Голоси: "1.5K", "2.3M", "1,234" (з літерами K/M або комами)
            
            var isRating = /^[\d]+\.?[\d]*$/.test(ratingText); // Тільки цифри і крапка
            var isVotes = /[KM]/.test(ratingText) || /,/.test(ratingText); // Літери K/M або коми
            
            if (isVotes) {
                if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "Пропуск: це кількість голосів: " + ratingText);
                continue;
            }
            
            if (!isRating) {
                if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "Пропуск: незрозумілий формат: " + ratingText);
                continue;
            }
            
            // Конвертуємо в число і розфарбовуємо
            var ratingValue = parseFloat(ratingText);
            if (!isNaN(ratingValue)) {
                colorizeCardRating(cardVote, ratingValue);
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
                    
                    // Якщо додана картка
                    if (node.classList && node.classList.contains('card')) {
                        newCards.push(node);
                    }
                    
                    // Пошук карток всередині доданого елемента
                    var nestedCards = node.querySelectorAll('.card');
                    for (var k = 0; k < nestedCards.length; k++) {
                        newCards.push(nestedCards[k]);
                    }
                }
            }
        }
        
        if (newCards.length) {
            if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "Знайдено нових карток: " + newCards.length);
            processCardRatings(newCards);
        }
    });

    // ==============================================
    // ІНІЦІАЛІЗАЦІЯ ПЛАГІНА
    // ==============================================
    
    function initPlugin() {
        if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "🚀 Плагін розфарбовування рейтингів запущено!");
        
        // Запуск спостереження за картками
        cardsObserver.observe(document.body, { childList: true, subtree: true });
        if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "👀 Обсервер запущено");
        
        // Обробка вже завантажених карток
        setTimeout(function() {
            var existingCards = document.querySelectorAll('.card');
            if (existingCards.length) {
                if (C_LOGGING) console.log("MAXSM-CARD-COLORS", "📦 Обробка існуючих карток: " + existingCards.length);
                processCardRatings(existingCards);
            }
        }, 1000);
    }

    // Запускаємо плагін
    initPlugin();

})();
