/*
Плагін для відображення рейтингів на картках зі зірочкою ★
Повна копія стилю з maxsm-ratings, без зміни позиціонування
*/

(function() {
    'use strict';

    // Налаштування логування
    var C_LOGGING = true; // false щоб вимкнути логи

    // ==============================================
    // СТИЛІ ДЛЯ РЕЙТИНГУ НА КАРТЦІ
    // (тільки кольори, без зміни позиціонування)
    // ==============================================
    
    var style = "<style id=\"maxsm_card_star_style\">" +
        /* Кольорові класи для різних рейтингів */
        ".card__vote.low-rating {" +
            "background-color: #dc3545 !important;" +
            "color: white !important;" +
        "}" +
        ".card__vote.medium-rating {" +
            "background-color: #ffc107 !important;" +
            "color: #212529 !important;" +
        "}" +
        ".card__vote.high-rating {" +
            "background-color: #28a745 !important;" +
            "color: white !important;" +
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
            var originalText = cardVote.textContent.trim();
            
            // Перевіряємо чи це вже наш формат (з зірочкою)
            if (originalText.startsWith('★')) {
                continue; // Пропускаємо, бо вже оброблено
            }
            
            // Перевіряємо що це рейтинг (число), а не кількість голосів
            var isRating = /^[\d]+\.?[\d]*$/.test(originalText);
            var isVotes = /[KM]/.test(originalText) || /,/.test(originalText);
            
            if (isVotes) {
                if (C_LOGGING) console.log("MAXSM-CARD", "Пропуск - це голоси: " + originalText);
                continue;
            }
            
            if (!isRating) {
                if (C_LOGGING) console.log("MAXSM-CARD", "Пропуск - не число: " + originalText);
                continue;
            }
            
            // Конвертуємо в число
            var ratingValue = parseFloat(originalText);
            if (isNaN(ratingValue)) continue;
            
            // Форматуємо зірочку та число (як у maxsm-ratings)
            var newText = '★ ' + ratingValue.toFixed(1);
            
            // Змінюємо текст (без зміни структури елемента)
            cardVote.textContent = newText;
            
            // Видаляємо старі класи
            cardVote.classList.remove('low-rating', 'medium-rating', 'high-rating');
            
            // Додаємо клас кольору
            if (ratingValue < 5) {
                cardVote.classList.add('low-rating');
                if (C_LOGGING) console.log("MAXSM-CARD", "🔴 " + newText);
            } else if (ratingValue >= 5 && ratingValue < 7) {
                cardVote.classList.add('medium-rating');
                if (C_LOGGING) console.log("MAXSM-CARD", "🟡 " + newText);
            } else if (ratingValue >= 7) {
                cardVote.classList.add('high-rating');
                if (C_LOGGING) console.log("MAXSM-CARD", "🟢 " + newText);
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
        if (C_LOGGING) console.log("MAXSM-CARD", "🚀 Плагін зірочок запущено");
        
        // Запускаємо спостереження
        cardsObserver.observe(document.body, { childList: true, subtree: true });
        
        // Обробляємо існуючі картки
        setTimeout(function() {
            var existingCards = document.querySelectorAll('.card');
            if (existingCards.length) {
                if (C_LOGGING) console.log("MAXSM-CARD", "📦 Існуючих карток: " + existingCards.length);
                processCardRatings(existingCards);
            }
        }, 1000);
    }

    // Запускаємо
    initPlugin();

})();
