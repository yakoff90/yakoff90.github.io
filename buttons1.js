Lampa.Platform.tv();
(function () {
    'use strict';

    function startPlugin() {
        if (Lampa.Storage.get('full_btn_priority') === undefined) {
            Lampa.Storage.set('full_btn_priority', '{}');
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function () {
                    var fullContainer = e.object.activity.render();
                    var targetContainer = fullContainer.find('.full-start-new__buttons');

                    fullContainer.find('.button--play').remove();

                    var allButtons = fullContainer.find('.buttons--container .full-start__button')
                        .add(targetContainer.find('.full-start__button'));

                    // Категорії
                    var onlineButtons  = allButtons.filter(function () { return ($(this).attr('class') || '').includes('online'); });
                    var torrentButtons = allButtons.filter(function () { return ($(this).attr('class') || '').includes('torrent'); });
                    var trailerButtons = allButtons.filter(function () { return ($(this).attr('class') || '').includes('trailer'); });

                    var buttonOrder = [];

                    // Порядок: online → torrent → trailer → інші
                    onlineButtons.each(function () { buttonOrder.push($(this)); });
                    torrentButtons.each(function () { buttonOrder.push($(this)); });
                    trailerButtons.each(function () { buttonOrder.push($(this)); });

                    allButtons.filter(function () {
                        var cls = $(this).attr('class') || '';
                        return !cls.includes('online') && !cls.includes('torrent') && !cls.includes('trailer');
                    }).each(function () {
                        buttonOrder.push($(this).clone(true));
                    });

                    targetContainer.empty();

                    // === СТИЛІ КОНТЕЙНЕРА ===
                    targetContainer.css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '12px',
                        'justify-content': 'flex-start',
                        'padding': '15px 10px',
                        'overflow': 'visible'
                    });

                    // === ДОДАЄМО КНОПКИ З ПОСТІЙНИМ ТЕКСТОМ ===
                    buttonOrder.forEach(function ($button) {
                        // 1. Отримуємо текст (з data-name або з тексту)
                        var buttonText = $button.data('name') || $button.text().trim().split('\n')[0].trim();

                        // 2. Якщо data-name немає — зберігаємо для фокусу
                        if (!$button.data('name')) {
                            $button.attr('data-name', buttonText);
                        }

                        // 3. Очищаємо кнопку від зайвого
                        $button.empty();

                        // 4. Додаємо видимий текст (завжди!)
                        var $label = $('<div class="button-label-visible"></div>');
                        $label.text(buttonText);
                        $button.append($label);

                        // 5. Додаємо іконку (якщо є)
                        var $icon = $button.find('svg, img').clone();
                        if ($icon.length) {
                            $button.prepend($icon);
                        }

                        // 6. Додаємо в контейнер
                        targetContainer.append($button);
                    });

                    // === ДОДАЄМО CSS ДЛЯ ВИДИМОГО ТЕКСТУ ===
                    if (!$('#plugin-button-label-style').length) {
                        $('head').append(
                            '<style id="plugin-button-label-style">' +
                            '.full-start__button {' +
                                'position: relative; display: flex; align-items: center; justify-content: center; ' +
                                'min-height: 50px; padding: 8px 16px; border-radius: 8px; overflow: visible;' +
                            '}' +
                            '.button-label-visible {' +
                                'font-size: 14px; font-weight: 500; color: #fff; text-align: center; ' +
                                'white-space: nowrap; pointer-events: none; z-index: 2;' +
                            '}' +
                            '.full-start__button:focus .button-label-visible,' +
                            '.full-start__button:hover .button-label-visible {' +
                                'color: #fff;' +
                            '}' +
                            '</style>'
                        );
                    }

                    Lampa.Controller.toggle("full_start");

                }, 100);
            }
        });

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = {};
        }
    }

    startPlugin();
})();
