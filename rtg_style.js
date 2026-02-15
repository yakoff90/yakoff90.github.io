/*
Плагін для оформлення рейтингів на картках
Тільки зовнішній вигляд, без додаткового функціоналу
*/

(function() {
    'use strict';

    // Налаштування логування
    var C_LOGGING = true; // false щоб вимкнути логи

    // ==============================================
    // СТИЛІ ДЛЯ РЕЙТИНГУ НА КАРТЦІ
    // (скопійовано з maxsm-ratings)
    // ==============================================
    
    var style = "<style id=\"maxsm_card_style\">" +
        /* Базові стилі для картки */
        ".card__vote {" +
            "transition: all 0.3s ease;" +
            "display: inline-block;" +
            "padding: 0.2em 0.5em;" +
            "border-radius: 0.3em;" +
            "font-weight: bold;" +
            "font-size: 0.9em;" +
        "}" +
        
        /* Кольорові класи для різних рейтингів */
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
        
        /* Стилі для різних типів зірочок */
        ".card__vote.star-original {" +
            "position: relative;" +
        "}" +
        ".card__vote.star-original::before {" +
            "content: '★';" +
            "margin-right: 0.2em;" +
        "}" +
        ".card__vote.star-cached::before {" +
            "content: '✦';" +
            "margin-right: 0.2em;" +
        "}" +
    "</style>";

    // Додаємо стилі
    $('head').append(style);

    // ==============================================
    // ОСНОВНА ФУНКЦІЯ
    // ==============================================
    
    function processCardRatings(cards) {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var cardVote = card.querySelector('.card__vote');
            
            if (!cardVote) continue;
            
            // Отримуємо текст рейтингу
            var ratingText = cardVote.textContent.trim();
            
            // Перевіряємо що це рейтинг (число), а не кількість голосів
            var isRating = /^[\d]+\.?[\d]*$/.test(ratingText);
            var isVotes = /[KM]/.test(ratingText) || /,/.test(ratingText);
            
            if (isVotes) {
                if (C_LOGGING) console.log("MAXSM-CARD", "Пропуск - це голоси: " + ratingText);
                continue;
            }
            
            if (!isRating) {
                if (C_LOGGING) console.log("MAXSM-CARD", "Пропуск - не число: " + ratingText);
                continue;
            }
            
            // Конвертуємо в число
            var ratingValue = parseFloat(ratingText);
            if (isNaN(ratingValue)) continue;
            
            // Видаляємо старі класи
            cardVote.classList.remove('low-rating', 'medium-rating', 'high-rating', 
                                      'star-original', 'star-cached');
            
            // Додаємо клас зірочки (завжди використовуємо оригінальну зірочку)
            cardVote.classList.add('star-original');
            
            // Додаємо клас кольору
            if (ratingValue < 5) {
                cardVote.classList.add('low-rating');
                if (C_LOGGING) console.log("MAXSM-CARD", "🔴 " + ratingValue);
            } else if (ratingValue >= 5 && ratingValue < 7) {
                cardVote.classList.add('medium-rating');
                if (C_LOGGING) console.log("MAXSM-CARD", "🟡 " + ratingValue);
            } else if (ratingValue >= 7) {
                cardVote.classList.add('high-rating');
                if (C_LOGGING) console.log("MAXSM-CARD", "🟢 " + ratingValue);
            }
        }
    }

    // ==============================================
    // СПОСТЕРІГАЧ ЗА НОВИМИ КАРТКАМИ
    // ==============================================
    
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
            if (C_LOGGING) console.log("MAXSM-CARD", "Нових карток: " + newCards.length);
            processCardRatings(newCards);
        }
    });

    // ==============================================
    // ІНІЦІАЛІЗАЦІЯ
    // ==============================================
    
    function initPlugin() {
        if (C_LOGGING) console.log("MAXSM-CARD", "Плагін запущено");
        
        // Запускаємо спостереження
        cardsObserver.observe(document.body, { childList: true, subtree: true });
        
        // Обробляємо існуючі картки
        setTimeout(function() {
            var existingCards = document.querySelectorAll('.card');
            if (existingCards.length) {
                if (C_LOGGING) console.log("MAXSM-CARD", "Існуючих карток: " + existingCards.length);
                processCardRatings(existingCards);
            }
        }, 1000);
    }

    // Запускаємо
    initPlugin();

})();
