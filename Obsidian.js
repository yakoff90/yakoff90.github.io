(function() {
    'use strict';
    
    // Стилі для покращення відступів між бейджами
    const style = document.createElement('style');
    style.textContent = `
        .obsidian-badges,
        .badges-container,
        .movie-card .badges {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            margin: 12px 0 !important;
            padding: 8px 0 !important;
        }
        .obsidian-badge,
        .movie-card .badge,
        .movie-card .info-badge {
            padding: 6px 14px !important;
            border-radius: 20px !important;
            font-size: 12px !important;
            background: rgba(0,0,0,0.75) !important;
            color: #fff !important;
            margin: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        .obsidian-rating,
        .movie-card .rating {
            margin: 0 !important;
            padding: 0 !important;
        }
        .movie-card .rating-value {
            font-size: 14px !important;
            font-weight: bold !important;
        }
        /* Приховуємо дублікати */
        .movie-card .title.duplicate,
        .movie-card .original-title.duplicate,
        .movie-card .rating.duplicate {
            display: none !important;
        }
        /* Покращення для картки */
        .movie-card {
            position: relative;
        }
        .movie-card .title-container {
            margin-bottom: 8px;
        }
    `;
    document.head.appendChild(style);

    // Функція для видалення дублікатів
    function removeDuplicates(element, selector, keepFirst = true) {
        const items = element.querySelectorAll(selector);
        if (items.length > 1) {
            for (let i = keepFirst ? 1 : 0; i < items.length; i++) {
                if (items[i] && !items[i].classList.contains('kept')) {
                    items[i].classList.add('duplicate');
                    items[i].remove();
                }
            }
        }
        return items[0];
    }

    // Головна функція очищення
    function cleanupDuplicates() {
        // Обробка всіх карток фільмів
        document.querySelectorAll('.movie-card, .item-card, .video-card').forEach(card => {
            // Видаляємо дублікати назв
            removeDuplicates(card, '.title, .name, .movie-title');
            removeDuplicates(card, '.original-title, .original-name');
            
            // Видаляємо дублікати рейтингів
            const ratings = card.querySelectorAll('.rating, .rating-block, .rating-value, .rating-score');
            if (ratings.length > 1) {
                // Залишаємо тільки перший рейтинг
                for (let i = 1; i < ratings.length; i++) {
                    ratings[i].remove();
                }
            }
            
            // Покращуємо відступи для бейджів
            const badgesContainers = card.querySelectorAll('.badges, .info-badges, .tags, .genres');
            badgesContainers.forEach(container => {
                container.classList.add('obsidian-badges');
                
                // Оновлюємо стилі для всіх бейджів
                const badges = container.querySelectorAll('.badge, .info-badge, .tag, .genre');
                badges.forEach(badge => {
                    badge.classList.add('obsidian-badge');
                    // Видаляємо зайві margin
                    badge.style.margin = '0';
                });
            });
            
            // Переносимо назву на картку, якщо вона не на своєму місці
            const titleElement = card.querySelector('.title:not(.duplicate)');
            const originalTitleElement = card.querySelector('.original-title:not(.duplicate)');
            const titleContainer = card.querySelector('.title-container');
            
            if (titleElement && titleContainer && !titleContainer.contains(titleElement)) {
                titleContainer.appendChild(titleElement.cloneNode(true));
                removeDuplicates(card, '.title');
            }
            
            if (originalTitleElement && titleContainer && !titleContainer.contains(originalTitleElement)) {
                titleContainer.appendChild(originalTitleElement.cloneNode(true));
                removeDuplicates(card, '.original-title');
            }
        });
        
        // Додаткова очистка для головного контенту
        const mainContent = document.querySelector('.main-content, .content, .movies-list');
        if (mainContent) {
            removeDuplicates(mainContent, '.title');
            removeDuplicates(mainContent, '.original-title');
            removeDuplicates(mainContent, '.rating');
        }
    }

    // Функція для покращення відступів
    function improveSpacing() {
        const cards = document.querySelectorAll('.movie-card, .item-card');
        cards.forEach(card => {
            // Покращуємо відступи між елементами картки
            const infoBlock = card.querySelector('.info, .movie-info, .item-info');
            if (infoBlock) {
                infoBlock.style.gap = '10px';
                infoBlock.style.padding = '8px';
            }
            
            // Покращуємо бейджі
            const badges = card.querySelectorAll('.badge, .info-badge');
            badges.forEach(badge => {
                badge.style.marginRight = '8px';
                badge.style.marginBottom = '6px';
                badge.style.padding = '4px 10px';
                badge.style.borderRadius = '4px';
                badge.style.fontSize = '11px';
            });
        });
    }

    // Перехоплюємо створення карток
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName === 'div' && element.classList) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (element.classList.contains('movie-card') || element.classList.contains('item-card')) {
                            setTimeout(() => {
                                cleanupDuplicates();
                                improveSpacing();
                            }, 10);
                        }
                    }
                });
            });
            observer.observe(element, { attributes: true });
        }
        return element;
    };

    // Слідкуємо за змінами в DOM
    const domObserver = new MutationObserver(function(mutations) {
        let needCleanup = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && (node.classList?.contains('movie-card') || 
                        node.classList?.contains('item-card') ||
                        node.querySelector?.('.movie-card'))) {
                        needCleanup = true;
                    }
                });
            }
        });
        
        if (needCleanup) {
            setTimeout(() => {
                cleanupDuplicates();
                improveSpacing();
            }, 50);
        }
    });
    
    domObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Обробник подій Lampa
    if (window.Lampa && window.Lampa.Events) {
        // При готовності
        window.Lampa.Events.on('ready', function() {
            setTimeout(() => {
                cleanupDuplicates();
                improveSpacing();
            }, 100);
        });
        
        // При навігації
        window.Lampa.Events.on('navigate', function() {
            setTimeout(() => {
                cleanupDuplicates();
                improveSpacing();
            }, 150);
        });
        
        // При відкритті картки
        window.Lampa.Events.on('movie:card:open', function(card) {
            setTimeout(() => {
                if (card && card.$el) {
                    removeDuplicates(card.$el, '.title');
                    removeDuplicates(card.$el, '.rating');
                    improveSpacing();
                }
            }, 50);
        });
        
        // При оновленні контенту
        window.Lampa.Events.on('content:update', function() {
            setTimeout(cleanupDuplicates, 100);
        });
    }

    // Періодична очистка (для надійності)
    setInterval(() => {
        cleanupDuplicates();
        improveSpacing();
    }, 2000);

    // Запускаємо очистку при завантаженні
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                cleanupDuplicates();
                improveSpacing();
            }, 200);
        });
    } else {
        setTimeout(() => {
            cleanupDuplicates();
            improveSpacing();
        }, 200);
    }

    // Експортуємо функції для використання в консолі (для налагодження)
    window.ObsidianPlugin = {
        cleanup: cleanupDuplicates,
        fixSpacing: improveSpacing,
        version: '2.0.0'
    };
    
    console.log('Obsidian plugin loaded - Duplicates fixed, spacing improved');
})();
