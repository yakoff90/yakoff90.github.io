(function() {
    'use strict';

    Lampa.Lang.add({
        maxsm_themes: {
            ru: "Темы",
            en: "Themes",
            uk: "Теми",
            be: "Тэмы",
            zh: "主题",
            pt: "Temas",
            bg: "Теми",
            he: "ערכות נושא",
            cs: "Témata"
        },
        maxsm_themes_theme: {
            ru: "Тема оформления",
            en: "Interface theme",
            uk: "Тема оформлення",
            be: "Тэма афармлення",
            zh: "界面主题",
            pt: "Tema de interface",
            bg: "Тема на интерфейса",
            he: "ערכת נושא לממשק",
            cs: "Téma rozhraní"
        },
        maxsm_themes_animations: {
            ru: "Анимации",
            en: "Animations",
            uk: "Анімації",
            be: "Анімацыі",
            zh: "动画",
            pt: "Animações",
            bg: "Анимации",
            he: "אנימציות",
            cs: "Animace"
        },
        maxsm_themes_translate_tv: {
            ru: "Переводить TV",
            en: "Translate TV",
            uk: "Перекладати TV",
            be: "Перакладаць TV",
            zh: "翻译 TV",
            pt: "Traduzir TV",
            bg: "Превеждане на TV",
            he: "לתרגם TV",
            cs: "Přeložit TV"
        },
        maxsm_themes_tvcaption: {
            ru: "СЕРИАЛ",       
            en: "SERIES",   
            uk: "СЕРІАЛ",    
            be: "СЕРЫЯЛ",     
            zh: "剧集",       
            pt: "SÉRIE",     
            bg: "СЕРИАЛ",      
            he: "סִדְרָה",  
            cs: "SERIÁL" 
        },
        maxsm_themes_incardtemplate: {
            ru: "Макет содержимого карточки",
            en: "Card content layout",
            uk: "Макет вмісту картки",
            be: "Макет змесціва карткі",
            zh: "卡片内容布局",
            pt: "Layout do conteúdo do cartão",
            bg: "Оформление на съдържанието в картата",
            he: "פריסת תוכן בכרטיס",
            cs: "Rozvržení obsahu karty"
        },
        maxsm_themes_bigbuttons: {
            ru: "Большие кнопки в карточке",
            en: "Large buttons in card",
            uk: "Великі кнопки в картці",
            be: "Вялікія кнопкі ў картцы",
            zh: "卡片中的大按钮",
            pt: "Botões grandes no cartão",
            bg: "Големи бутони в картата",
            he: "כפתורים גדולים בכרטיס",
            cs: "Velká tlačítka v kartě"
        }
    });

    var themes_svg = '<svg viewBox="0 0 512.00026 512" xmlns="http://www.w3.org/2000/svg"><path d="m491.238281 20.761719c-14.375-14.375-34.265625-21.890625-54.550781-20.625-20.289062 1.269531-39.078125 11.207031-51.550781 27.261719l-98.660157 127.007812-41.109374-41.109375c-12.015626-12.019531-27.996094-18.636719-44.988282-18.636719-16.996094 0-32.972656 6.617188-44.992187 18.636719l-142.363281 142.363281c-17.363282 17.363282-17.363282 45.617188 0 62.980469l180.335937 180.335937c8.679687 8.683594 20.085937 13.023438 31.488281 13.023438 11.40625 0 22.808594-4.339844 31.492188-13.023438l142.363281-142.363281c12.019531-12.019531 18.636719-27.996093 18.636719-44.992187 0-16.992188-6.617188-32.972656-18.636719-44.988282l-41.109375-41.109374 127.007812-98.660157c16.054688-12.472656 25.992188-31.261719 27.261719-51.550781 1.269531-20.292969-6.25-40.175781-20.625-54.550781zm-276.386719 456.722656-15.898437-15.898437 22.957031-22.957032c5.933594-5.9375 5.933594-15.558594 0-21.496094-5.933594-5.933593-15.558594-5.933593-21.492187 0l-22.957031 22.957032-10.152344-10.148438 44.210937-44.210937c5.9375-5.933594 5.9375-15.558594 0-21.492188-5.933593-5.9375-15.558593-5.9375-21.492187 0l-44.210938 44.210938-42.265625-42.265625 22.957031-22.957032c5.9375-5.9375 5.9375-15.558593 0-21.496093-5.933593-5.933594-15.558593-5.933594-21.492187 0l-22.957031 22.957031-10.152344-10.148438 44.210938-44.210937c5.9375-5.933594 5.9375-15.558594 0-21.492187-5.933594-5.9375-15.558594-5.9375-21.492188 0l-44.210938 44.210937-15.898437-15.898437c-5.511719-5.511719-5.511719-14.484376 0-19.996094l77.199219-77.195313 200.328125 200.328125-77.199219 77.199219c-5.511719 5.511719-14.480469 5.511719-19.992188 0zm118.6875-98.695313-200.328124-200.328124 18.175781-18.175782 200.328125 200.328125zm53.40625-67.167968c0 8.875-3.457031 17.222656-9.734374 23.496094l-4 4.003906-191.484376-191.480469-8.847656-8.847656 4.003906-4.003907c6.273438-6.277343 14.621094-9.730468 23.496094-9.730468s17.21875 3.453125 23.492188 9.730468l153.339844 153.335938c6.277343 6.277344 9.734374 14.621094 9.734374 23.496094zm94.578126-238.210938c-.726563 11.589844-6.398438 22.324219-15.570313 29.449219l-130.019531 101-27.796875-27.792969 101.003906-130.019531c7.125-9.171875 17.855469-14.847656 29.449219-15.570313 11.578125-.71875 22.945312 3.566407 31.15625 11.777344 8.210937 8.210938 12.503906 19.570313 11.777344 31.15625zm0 0" fill="#000000" style="fill: rgb(255, 255, 255);"></path><path d="m439.84375 56.953125c-7.949219 0-15.566406 6.992187-15.195312 15.199219.367187 8.234375 6.675781 15.199218 15.195312 15.199218 7.953125 0 15.566406-6.988281 15.199219-15.199218-.367188-8.234375-6.675781-15.199219-15.199219-15.199219zm0 0" fill="#000000" style="fill: rgb(255, 255, 255);"></path></svg>';

    var maxsm_themes = {
        name: 'maxsm_themes',
        version: '2.6.1',
        settings: {
            theme: 'mint_dark'
        }
    };

    var prevtheme = '';
    var onetime = false;

    // 🔥 НОВИЙ SVG-LOADER (працює на Samsung Tizen)
    var gifLoaderUrl = "/mnt/data/loader_mojito.svg"; // Оновлено для нового SVG лоадера

    function applyTheme(theme) {
        $('#maxsm_themes_theme').remove();

        if (
            prevtheme !== '' &&
            (
                (prevtheme === 'default' && theme !== 'default') ||
                (prevtheme !== 'default' && theme === 'default')
            )
        ) {
            window.location.reload();
        }

        prevtheme = theme;

        if (theme === 'default') {
            removeAdditionalSettings();
            return;
        }

        var loaderStyles = `
.screensaver__preload {
    background: url("${gifLoaderUrl}") no-repeat 50% 50% !important;
    background-size: 120px 120px !important;
    pointer-events: none !important;
}
.activity__loader {
    background: url("${gifLoaderUrl}") no-repeat 50% 50% !important;
    background-size: 80px 80px !important;
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    display:none !important;
    pointer-events: none !important;
}
.activity--load .activity__loader,
.activity--preload .activity__loader {
    display:block !important;
}
`;

        var style = $('<style id="maxsm_themes_theme"></style>');

        var themes = {
            mint_dark: `
.navigation-bar__body
{background: rgba(18, 32, 36, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #1e6262dd, #3da18ddd);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #0a1b2a, #1a4036);
color: #ffffff;
}
.company-start.icon--broken .company-start__icon,
.explorer-card__head-img > img,
.bookmarks-folder__layer,
.card-more__box,
.card__img
,.extensions__block-add
,.extensions__item
 {
background-color: #1e2c2f;
}
.search-source.focus,
.simple-button.focus,
.menu__item.focus,
.menu__item.traverse,
.menu__item.hover,
.full-start__button.focus,
.full-descr__tag.focus,
.player-panel .button.focus,
.full-person.selector.focus,
.tag-count.selector.focus,
.full-review.focus {
background: linear-gradient(to right, #1e6262, #3da18d);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(61, 161, 141, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #1e6262, #3da18d);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(61, 161, 141, 0.0);
border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after,
.card-episode.focus .full-episode::after,
.items-cards .selector.focus::after,  
.card-more.focus .card-more__box::after,
.card-episode.focus .full-episode::after,
.card-episode.hover .full-episode::after,
.card.focus .card__view::after,
.card.hover .card__view::after,
.torrent-item.focus::after,
.online-prestige.selector.focus::after,
.online-prestige--full.selector.focus::after,
.explorer-card__head-img.selector.focus::after,
.extensions__item.focus::after,
.extensions__block-add.focus::after,
.full-review-add.focus::after {
border: 0.2em solid #3da18d;
box-shadow: 0 0 0.8em rgba(61, 161, 141, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #3da18d, #1e6262);
}
.modal__content {
background: rgba(18, 32, 36, 0.96);
border: 0em solid rgba(18, 32, 36, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(18, 32, 36, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #1a3b36cc;
border: 0.2em solid #3da18d;
}
`,
            crystal_cyan: `
.navigation-bar__body
{background: rgba(10, 25, 40, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #00d2ffdd, #3a8ee6dd);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #081822, #104059);
color: #ffffff;
}
.company-start.icon--broken .company-start__icon,
.explorer-card__head-img > img,
.bookmarks-folder__layer,
.card-more__box,
.card__img
,.extensions__block-add
,.extensions__item
 {
background-color: #112b3a;
}
.search-source.focus,
.simple-button.focus,
.menu__item.focus,
.menu__item.traverse,
.menu__item.hover,
.full-start__button.focus,
.full-descr__tag.focus,
.player-panel .button.focus,
.full-person.selector.focus,
.tag-count.selector.focus,
.full-review.focus {
background: linear-gradient(to right, #00d2ff, #3a8ee6);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(72, 216, 255, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #00d2ff, #3a8ee6);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(72, 216, 255, 0.0);
border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after,
.card-episode.focus .full-episode::after,
.items-cards .selector.focus::after,  
.card-more.focus .card-more__box::after,
.card-episode.focus .full-episode::after,
.card-episode.hover .full-episode::after,
.card.focus .card__view::after,
.card.hover .card__view::after,
.torrent-item.focus::after,
.online-prestige.selector.focus::after,
.online-prestige--full.selector.focus::after,
.explorer-card__head-img.selector.focus::after,
.extensions__item.focus::after,
.extensions__block-add.focus::after,
.full-review-add.focus::after {
border: 0.2em solid #00d2ff;
box-shadow: 0 0 0.8em rgba(72, 216, 255, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #00d2ff, #3a8ee6);
}
.modal__content {
background: rgba(10, 25, 40, 0.96);
border: 0em solid rgba(10, 25, 40, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(10, 25, 40, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #0c2e45cc;
border: 0.2em solid #00d2ff;
}
`
        };

        style.html(loaderStyles + (themes[theme] || ''));
        $('head').append(style);

        animations();
        translate_tv();
        bigbuttons();

        if (onetime === false) {
            onetime = true;
            forall();
            removeFromSettingsMenu();
            fix_lang();
            incardtemplate();
        }
    }

    function startPlugin() {
        var availableThemes = ['mint_dark', 'deep_aurora', 'crystal_cyan', 'amber_noir', 'velvet_sakura', 'default'];

        if (!localStorage.getItem('maxsm_themes_animations')) {
            localStorage.setItem('maxsm_themes_animations', 'true');
        }
        if (!localStorage.getItem('maxsm_themes_translate_tv')) {
            localStorage.setItem('maxsm_themes_translate_tv', 'true');
        }
        if (!localStorage.getItem('maxsm_themes_incardtemplate')) {
            localStorage.setItem('maxsm_themes_incardtemplate', 'false');
        }   
        if (!localStorage.getItem('maxsm_themes_bigbuttons')) {
            localStorage.setItem('maxsm_themes_bigbuttons', 'false');
        }

        Lampa.SettingsApi.addComponent({
            component: "maxsm_themes",
            name: Lampa.Lang.translate('maxsm_themes'),
            icon: themes_svg
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_themes',
            param: {
                name: 'maxsm_themes_selected',
                type: 'select',
                values: {
                    mint_dark: 'Mint Dark',
                    deep_aurora: 'Deep Aurora',
                    crystal_cyan: 'Crystal Cyan',
                    amber_noir: 'Amber Noir',
                    velvet_sakura: 'Velvet Sakura',
                    default: 'LAMPA'
                },
                "default": 'Mint Dark'
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_theme'),
                description: ''
            },
            onChange: function(value) {
                maxsm_themes.settings.theme = value;
                Lampa.Settings.update();
                applyTheme(value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_themes',
            param: {
                name: 'maxsm_themes_animations',
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_animations'),
                description: ''
            },
            onChange: function(value) {
                animations();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_themes',
            param: {
                name: 'maxsm_themes_translate_tv',
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_translate_tv'),
                description: ''
            },
            onChange: function(value) {
                translate_tv();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_themes',
            param: {
                name: 'maxsm_themes_incardtemplate',
                type: "trigger",
                default: false
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_incardtemplate'),
                description: ''
            },
            onChange: function(value) {
                window.location.reload();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_themes',
            param: {
                name: 'maxsm_themes_bigbuttons',
                type: "trigger",
                default: false
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes_bigbuttons'),
                description: ''
            },
            onChange: function(value) {
                bigbuttons();
            }
        });

        var savedTheme = Lampa.Storage.get('maxsm_themes_selected', 'mint_dark');
        if (availableThemes.indexOf(savedTheme) === -1) {
            Lampa.Storage.set('maxsm_themes_selected', 'mint_dark');
            savedTheme = 'mint_dark';
        }
        maxsm_themes.settings.theme = savedTheme;
        applyTheme(maxsm_themes.settings.theme);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }

    Lampa.Manifest.plugins = {
        name: 'maxsm_themes',
        version: '2.6.1',
        description: 'maxsm_themes'
    };

    window.maxsm_themes = maxsm_themes;
})();
