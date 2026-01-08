(function() {
    'use strict';
    
    if (window.simpleStyleInterface) return;
    window.simpleStyleInterface = true;
    
    var checkInterval = setInterval(function() {
        if (window.Lampa && Lampa.Storage && Lampa.SettingsApi) {
            clearInterval(checkInterval);
            startPlugin();
        }
    }, 100);
    
    function startPlugin() {
        try {
            // Встановлюємо налаштування
            if (!Lampa.Storage.get('style_int_init')) {
                Lampa.Storage.set('style_int_init', '1');
                Lampa.Storage.set('style_wide_post', '1');
                Lampa.Storage.set('style_logo_show', '1');
                Lampa.Storage.set('style_show_bg', '1');
                Lampa.Storage.set('style_show_rating', '1');
                Lampa.Storage.set('style_hide_titles', '1');
            }
            
            // Додаємо стилі
            var style = document.createElement('style');
            style.textContent = [
                '.card .card__title { display: none; }',
                '.new-interface { background: rgba(0,0,0,0.3); }'
            ].join(' ');
            document.head.appendChild(style);
            
            // Додаємо пункт в налаштування
            addSettingsItem();
            
        } catch (e) {
            console.log('Simple Style Error:', e);
        }
    }
    
    function addSettingsItem() {
        try {
            // Створюємо простий елемент
            var item = $('<div class="selector focusable settings-param" data-name="style_interface" style="opacity: 0;">');
            item.html('<div class="settings-param__name">Стильний інтерфейс</div><div class="settings-param__descr">Налаштування</div>');
            
            // Додаємо в меню
            setTimeout(function() {
                var target = $('[data-name="interface_size"]');
                if (target.length) {
                    target.after(item);
                }
                item.css('opacity', '1');
                
                // Обробник кліку
                item.on('hover:enter', function() {
                    showStyleSettings();
                });
            }, 500);
            
        } catch (e) {
            console.log('Settings item error:', e);
        }
    }
    
    function showStyleSettings() {
        // Просте модальне вікно з налаштуваннями
        var html = '<div class="full full--settings" style="z-index: 999999;">';
        html += '<div class="full-head"><div class="full-back"></div><div class="full-title">Стильний інтерфейс</div></div>';
        html += '<div class="full-cont">';
        html += '<div class="settings-param selector focusable"><div class="settings-param__name">Широкі постери</div><div class="settings-param__value">' + (Lampa.Storage.get('style_wide_post') ? 'Так' : 'Ні') + '</div></div>';
        html += '<div class="settings-param selector focusable"><div class="settings-param__name">Показувати логотип</div><div class="settings-param__value">' + (Lampa.Storage.get('style_logo_show') ? 'Так' : 'Ні') + '</div></div>';
        html += '<div class="settings-param selector focusable"><div class="settings-param__name">Фонові зображення</div><div class="settings-param__value">' + (Lampa.Storage.get('style_show_bg') ? 'Так' : 'Ні') + '</div></div>';
        html += '<div class="settings-param selector focusable"><div class="settings-param__name">Приховувати назви</div><div class="settings-param__value">' + (Lampa.Storage.get('style_hide_titles') ? 'Так' : 'Ні') + '</div></div>';
        html += '</div></div>';
        
        var modal = $(html);
        $('body').append(modal);
        
        // Обробники кліків
        modal.find('.full-back').on('click', function() {
            modal.remove();
        });
        
        modal.find('.settings-param').on('click', function() {
            var name = $(this).find('.settings-param__name').text();
            var current = $(this).find('.settings-param__value').text();
            var newValue = current === 'Так' ? 'Ні' : 'Так';
            
            $(this).find('.settings-param__value').text(newValue);
            
            // Зберігаємо налаштування
            if (name === 'Широкі постери') {
                Lampa.Storage.set('style_wide_post', newValue === 'Так' ? '1' : '0');
            } else if (name === 'Показувати логотип') {
                Lampa.Storage.set('style_logo_show', newValue === 'Так' ? '1' : '0');
            } else if (name === 'Фонові зображення') {
                Lampa.Storage.set('style_show_bg', newValue === 'Так' ? '1' : '0');
            } else if (name === 'Приховувати назви') {
                Lampa.Storage.set('style_hide_titles', newValue === 'Так' ? '1' : '0');
                setTimeout(function() {
                    window.location.reload();
                }, 300);
            }
        });
        
        // Закриття по ESC
        $(document).on('keydown.stylemodal', function(e) {
            if (e.keyCode === 27) {
                modal.remove();
                $(document).off('keydown.stylemodal');
            }
        });
    }
    
})();
