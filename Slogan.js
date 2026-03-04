<?php
/*
Назва плагіна: Cardify Movie Slogan
Опис: Примусово відображає слоган фільму після логотипу в картці інтерфейсу Cardify для додатку Lampa
Версія: 1.0
Автор: Ваше ім'я
*/

// Перевірка, чи плагін викликається в контексті Lampa
if (!defined('LAMPA_PLUGIN') && !function_exists('lampa_add_plugin')) {
    // Якщо Lampa не визначена, можна додати код для ручного підключення
    add_action('lampa_plugins_loaded', 'cardify_movie_slogan_init');
} else {
    cardify_movie_slogan_init();
}

function cardify_movie_slogan_init() {
    // Перевіряємо, чи існує функція для додавання плагіна в Lampa
    if (function_exists('lampa_add_plugin')) {
        lampa_add_plugin(array(
            'name' => 'cardify_movie_slogan',
            'description' => 'Додає слоган фільму після логотипу в Cardify',
            'version' => '1.0',
            'author' => 'Ваше ім\'я',
            'init' => 'cardify_movie_slogan_setup'
        ));
    } else {
        // Якщо Lampa не має системи плагінів, просто викликаємо налаштування
        cardify_movie_slogan_setup();
    }
}

function cardify_movie_slogan_setup() {
    // Додаємо стилі для слогану
    add_action('lampa_head', 'cardify_movie_slogan_styles');
    
    // Модифікуємо HTML картки фільму в Cardify
    add_filter('cardify_movie_card_html', 'cardify_movie_slogan_modify_html', 10, 2);
    
    // Додаємо JavaScript для динамічного додавання слогану (якщо потрібно)
    add_action('lampa_footer', 'cardify_movie_slogan_script');
}

function cardify_movie_slogan_styles() {
    ?>
    <style>
        /* Стилі для слогану фільму в Cardify */
        .cardify-movie-slogan {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
            margin-bottom: 10px;
            padding: 0 10px;
            text-align: center;
            font-style: italic;
            line-height: 1.4;
            max-height: 60px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            word-break: break-word;
        }
        
        /* Адаптація для темної теми, якщо використовується */
        .dark-theme .cardify-movie-slogan {
            color: #aaa;
        }
        
        /* Забезпечуємо правильне відображення після логотипу */
        .cardify-movie-card .movie-logo + .cardify-movie-slogan {
            display: block;
        }
    </style>
    <?php
}

function cardify_movie_slogan_modify_html($html, $movie_data) {
    // Отримуємо слоган фільму з даних
    $slogan = isset($movie_data['slogan']) ? $movie_data['slogan'] : '';
    
    // Якщо слоган порожній, можна встановити за замовчуванням або не додавати нічого
    if (empty($slogan)) {
        // Можна повернути оригінальний HTML без змін
        // або встановити слоган за замовчуванням:
        // $slogan = 'Немає слогану';
        
        // Залишаємо порожнім, щоб не відображати зайвого
        return $html;
    }
    
    // Екрануємо слоган для безпеки
    $slogan = htmlspecialchars($slogan, ENT_QUOTES, 'UTF-8');
    
    // Створюємо HTML для слогану
    $slogan_html = '<div class="cardify-movie-slogan">' . $slogan . '</div>';
    
    // Додаємо слоган після логотипу фільму
    // Шукаємо закриваючий тег для логотипу або контейнер логотипу
    if (strpos($html, '<div class="movie-logo">') !== false) {
        // Додаємо після закриття div логотипу
        $html = str_replace('</div>', $slogan_html . '</div>', substr($html, 0, strpos($html, '<div class="movie-logo">') + 30));
    } elseif (strpos($html, 'movie-logo') !== false) {
        // Альтернативний пошук, якщо клас може бути в різних тегах
        $html = preg_replace('/(<[^>]*class="[^"]*movie-logo[^"]*"[^>]*>.*?<\/[^>]*>)/is', '$1' . $slogan_html, $html);
    } else {
        // Якщо не знайдено логотип, додаємо на початок картки
        $html = $slogan_html . $html;
    }
    
    return $html;
}

function cardify_movie_slogan_script() {
    ?>
    <script>
    // Додатковий JavaScript для динамічного додавання слогану,
    // якщо контент завантажується через AJAX
    (function() {
        // Функція для додавання слоганів до карток
        function addSlogansToCards() {
            // Знаходимо всі картки фільмів
            document.querySelectorAll('.cardify-movie-card, .movie-card, [data-movie-id]').forEach(function(card) {
                // Перевіряємо, чи вже є слоган
                if (card.querySelector('.cardify-movie-slogan')) {
                    return; // Пропускаємо, якщо слоган вже додано
                }
                
                // Шукаємо логотип фільму
                var logo = card.querySelector('.movie-logo, [class*="logo"]');
                if (!logo) {
                    // Якщо логотип не знайдено, шукаємо інші елементи
                    logo = card.querySelector('img, h3, .title');
                }
                
                if (logo) {
                    // Отримуємо ID фільму або інші дані
                    var movieId = card.getAttribute('data-movie-id') || 
                                  card.getAttribute('data-id') || 
                                  (card.querySelector('[data-id]') ? card.querySelector('[data-id]').getAttribute('data-id') : null);
                    
                    if (movieId) {
                        // Тут можна зробити запит до API для отримання слогану
                        // Або використати вже завантажені дані
                        
                        // Приклад: отримуємо слоган з data-атрибута
                        var slogan = card.getAttribute('data-slogan') || 
                                     (card.querySelector('[data-slogan]') ? card.querySelector('[data-slogan]').getAttribute('data-slogan') : null);
                        
                        if (slogan && slogan !== 'null' && slogan !== 'undefined') {
                            var sloganDiv = document.createElement('div');
                            sloganDiv.className = 'cardify-movie-slogan';
                            sloganDiv.textContent = slogan;
                            
                            // Додаємо після логотипу
                            if (logo.nextSibling) {
                                logo.parentNode.insertBefore(sloganDiv, logo.nextSibling);
                            } else {
                                logo.parentNode.appendChild(sloganDiv);
                            }
                        }
                    }
                }
            });
        }
        
        // Викликаємо при завантаженні сторінки
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addSlogansToCards);
        } else {
            addSlogansToCards();
        }
        
        // Спостерігаємо за змінами в DOM (для динамічного контенту)
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    addSlogansToCards();
                }
            });
        });
        
        // Починаємо спостереження після завантаження DOM
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    })();
    </script>
    <?php
}

// Додаємо фільтр для отримання даних фільму з API
add_filter('lampa_api_movie_data', 'cardify_movie_slogan_add_to_data', 10, 2);

function cardify_movie_slogan_add_to_data($data, $movie_id) {
    // Тут можна додати логіку для отримання слогану з API
    // Наприклад, з The Movie Database (TMDB) або іншого джерела
    
    // Приклад для TMDB (потрібно налаштувати відповідно до вашого API)
    /*
    if (function_exists('tmdb_get_movie_details')) {
        $details = tmdb_get_movie_details($movie_id);
        if (!empty($details['tagline'])) {
            $data['slogan'] = $details['tagline'];
        }
    }
    */
    
    // Для тестування можна встановити тестовий слоган
    if (empty($data['slogan'])) {
        // $data['slogan'] = 'Тестовий слоган фільму';
    }
    
    return $data;
}

// Функція для ручного додавання слогану в шаблон (якщо потрібно)
function cardify_movie_slogan_display($movie_data) {
    if (!empty($movie_data['slogan'])) {
        echo '<div class="cardify-movie-slogan">' . htmlspecialchars($movie_data['slogan']) . '</div>';
    }
}
?>
