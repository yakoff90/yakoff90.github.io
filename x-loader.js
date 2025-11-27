(function() {
    'use strict';
    
    Lampa.Lang.add({
        maxsm_themes: {
            ru: "Темы оформления",
            en: "Interface themes",
            uk: "Теми оформлення",
            be: "Тэмы афармлення",
            zh: "主题",
            pt: "Temas",
            bg: "Теми",
            he: "ערכות נושא",
            cs: "Témata"
        },
        maxsm_themes_tvcaption: {
            ru: "ТВ",       
            en: "TV SERIES",   
            uk: "СЕРІАЛ",    
            be: "СЕРЫЯЛ",     
            zh: "剧集",       
            pt: "SÉRIE",     
            bg: "СЕРИАЛ",      
            he: "סִדְרָה",  
            cs: "SERIÁL" 
        }
    });

    // Основной объект плагина
    var maxsm_themes = {
        // Название плагина
        name: 'maxsm_themes',
        // Версия плагина
        version: '2.5.0',
        // Настройки по умолчанию
        settings: {
            theme: 'mint_dark'
        }
    };

    // Была ли предыдущая тема стоковая
    var prevtheme = '';
    // Запускаем только один раз
    var onetime = false;

    // Цвета loader'а для каждой темы
    var loaderColors = {
        "default": '#fff',
        violet_blue: '#6a11cb',
        mint_dark: '#3da18d',
        lime_energy: '#9eff3a',
        deep_aurora: '#7e7ed9',
        crystal_cyan: '#7ed0f9',
        neon_pulse: '#29ccb4',
        amber_noir: '#f4a261',
        velvet_sakura: '#f6a5b0'
    };

    // Функция для применения тем
    function applyTheme(theme) {
        // Удаляем предыдущие стили темы
        $('#maxsm_interface_mod_theme').remove();

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

        // Если выбрано "Нет", просто удаляем стили
        if (theme === 'default') return;

        var color = loaderColors[theme] || loaderColors["default"];

        // ⚡⚡⚡ ТВОЙ GITHUB URL ДЛЯ SVG ⚡⚡⚡
        //var svgUrl = "https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/logo.svg";
        var svgUrl = "https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/logo.gif";
        
        
        // Создаем новый стиль
        var style = $('<style id="maxsm_interface_mod_theme"></style>');

        // Базовые стили лоадера
        var loaderStyles = `
.screensaver__preload {
    background: url("${svgUrl}") no-repeat 50% 50% !important;
    background-size: 120px 120px !important;
    pointer-events: none !important;
}
.activity__loader {
    background: url("${svgUrl}") no-repeat 50% 50% !important;
    background-size: 80px 80px !important;
    display: none !important;
    pointer-events: none !important;
}
.activity--load .activity__loader,
.activity--preload .activity__loader {
    display: block !important;
}
`;

        // Определяем стили для разных тем
        var themes = {
            mint_dark: loaderStyles + `
.navigation-bar__body
{background: rgba(18, 32, 36, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #1e6262, #3da18d);
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

            crystal_cyan: loaderStyles + `
.navigation-bar__body
{background: rgba(10, 25, 40, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #00d2ff, #3a8ee6);
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
`,

            neon_pulse: loaderStyles + `
.navigation-bar__body
{background: rgba(10, 25, 40, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #00d2ff, #3a8ee6);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #081822, #112380);
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
background-color: #112380;
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
background-color: #a31d9fcc;
border: 0.2em solid #00d2ff;
}
`,
         
            lime_energy: loaderStyles + `
.navigation-bar__body {
  background: rgba(20, 30, 10, 0.96);
}
.card__quality,
.card__type::after {
  background: linear-gradient(to right, #a8ff60, #64ff3d);
}
html, body, .extensions {
  background: linear-gradient(135deg, #142d0b, #1b5e20);
  color: #ffffff;
}
.company-start.icon--broken .company-start__icon,
.explorer-card__head-img > img,
.bookmarks-folder__layer,
.card-more__box,
.card__img,
.extensions__block-add,
.extensions__item {
  background-color: #193a16;
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
  background: linear-gradient(to right, #a8ff60, #64ff3d);
  color: #000;
  box-shadow: 0 0.0em 0.4em rgba(160, 255, 80, 0.3);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
  background: linear-gradient(to right, #a8ff60, #64ff3d);
  color: #000;
  box-shadow: 0 0.0em 0.4em rgba(160, 255, 80, 0.3);
  border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after,
.card-episode.focus .full-episode::after,
.items-cards .selector.focus::after,
.card-more.focus .card-more__box::after,
.card.focus .card__view::after,
.card.hover .card__view::after,
.torrent-item.focus::after,
.extensions__item.focus::after,
.extensions__block-add.focus::after {
  border: 0.2em solid #9eff3a;
  box-shadow: 0 0 0.8em rgba(160, 255, 80, 0.5);
}
.head__action.focus,
.head__action.hover {
  background: linear-gradient(45deg, #9eff3a, #64ff3d);
}
.modal__content {
  background: rgba(20, 30, 10, 0.96);
  border: 0em solid rgba(20, 30, 10, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
  background: rgba(20, 30, 10, 0.96);
}
.torrent-serial {
  background: rgba(0, 0, 0, 0.22);
  border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
  background-color: #214a16cc;
  border: 0.2em solid #9eff3a;
}
`,
         
            deep_aurora: loaderStyles + `
.navigation-bar__body
{background: rgba(18, 34, 59, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #2c6fc1, #7e7ed9);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #1a102b, #0a1c3f);
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
background-color: #171f3a;
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
background: linear-gradient(to right, #2c6fc1, #7e7ed9);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(124, 194, 255, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #2c6fc1, #7e7ed9);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(124, 194, 255, 0.0);
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
border: 0.2em solid #7e7ed9;
box-shadow: 0 0 0.8em rgba(124, 194, 255, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #7e7ed9, #2c6fc1);
}
.modal__content {
background: rgba(18, 34, 59, 0.96);
border: 0em solid rgba(18, 34, 59, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(18, 34, 59, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #1a102bcc;
border: 0.2em solid #7e7ed9;
}
`,

            amber_noir: loaderStyles + `
.navigation-bar__body
{background: rgba(28, 18, 10, 0.96);
}
.card__quality,
 .card__type::after {
background: linear-gradient(to right, #f4a261, #e76f51);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #1f0e04, #3b2a1e);
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
background-color: #2a1c11;
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
background: linear-gradient(to right, #f4a261, #e76f51);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(255, 160, 90, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #f4a261, #e76f51);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(255, 160, 90, 0.0);
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
border: 0.2em solid #f4a261;
box-shadow: 0 0 0.8em rgba(255, 160, 90, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #f4a261, #e76f51);
}
.modal__content {
background: rgba(28, 18, 10, 0.96);
border: 0em solid rgba(28, 18, 10, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(28, 18, 10, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #3b2412cc;
border: 0.2em solid #f4a261;
}
`,

            velvet_sakura: loaderStyles + `
.navigation-bar__body
{background: rgba(56, 32, 45, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #f6a5b0, #f9b8d3);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #4b0e2b, #7c2a57);
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
background-color: #5c0f3f;
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
background: linear-gradient(to right, #f6a5b0, #f9b8d3);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(246, 165, 176, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #f6a5b0, #f9b8d3);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(246, 165, 176, 0.0);
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
border: 0.2em solid #f6a5b0;
box-shadow: 0 0 0.8em rgba(246, 165, 176, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #f9b8d3, #f6a5b0);
}
.modal__content {
background: rgba(56, 32, 45, 0.96);
border: 0em solid rgba(56, 32, 45, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(56, 32, 45, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #7c2a57cc;
border: 0.2em solid #f6a5b0;
}
`
        };

        // Устанавливаем стили для выбранной темы
        style.html(themes[theme] || '');

        // Добавляем стиль в head
        $('head').append(style);

        if (onetime === false) {
            onetime = true;
            forall();
            removeFromSettingsMenu();
            fix_lang();
        }
    }
    
    function fix_lang() {
       Lampa.Lang.add({
        tv_status_returning_series: {
          ru: "Идет"
        },
        tv_status_planned: {
          ru: "Запланирован"
        },
        tv_status_in_production: {
          ru: "В производстве"
        },
        tv_status_ended: {
          ru: "Завершен"
        },
        tv_status_canceled: {
          ru: "Отменен"
        },
        tv_status_pilot: {
          ru: "Пилот"
        },
        tv_status_released: {
          ru: "Вышел"
        },
        tv_status_rumored: {
          ru: "По слухам"
        },
        tv_status_post_production: {
          ru: "Скоро"
        }
      });
    }

    function removeFromSettingsMenu() {
        // Скрываем всё, что плохо сочетается с плагином тем
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name == 'interface') {
                e.body.find('[data-name="light_version"]').remove();
                e.body.find('[data-name="background"]').remove();
                e.body.find('[data-name="background_type"]').remove();
                e.body.find('[data-name="card_interfice_type"]').remove();
                e.body.find('[data-name="glass_style"]').prev('.settings-param-title').remove();
                e.body.find('[data-name="glass_style"]').remove();
                e.body.find('[data-name="glass_opacity"]').remove();
                e.body.find('[data-name="card_interfice_poster"]').prev('.settings-param-title').remove();
                e.body.find('[data-name="card_interfice_poster"]').remove();
                e.body.find('[data-name="card_interfice_cover"]').remove();
                e.body.find('[data-name="advanced_animation"]').remove();
            }
        });
        // Настройки интерфейса под темы
        Lampa.Storage.set('light_version', 'false');
        Lampa.Storage.set('background', 'false');
        Lampa.Storage.set('card_interfice_type', 'new');
        Lampa.Storage.set('glass_style', 'false');
        Lampa.Storage.set('card_interfice_poster', 'false');
        Lampa.Storage.set('card_interfice_cover', 'true');
        Lampa.Storage.set('advanced_animation', 'false');

    }

    // Дополнительные Шаблоны, не меняющиеся от цветовых стилей    
    function forall() {
        // Шаблон карточки, где год перенесен выше названия
        Lampa.Template.add('card', "<div class=\"card selector layer--visible layer--render\">\n    <div class=\"card__view\">\n        <img src=\"./img/img_load.svg\" class=\"card__img\" />\n\n        <div class=\"card__icons\">\n            <div class=\"card__icons-inner\">\n                \n            </div>\n        </div>\n    <div class=\"card__age\">{release_year}</div>\n    </div>\n\n    <div class=\"card__title\">{title}</div>\n    </div>");
        // Шаблон карточки выхода эпизода, выкинем футер из card_episode, год и название на карточку
        Lampa.Template.add('card_episode', "<div class=\"card-episode selector layer--visible layer--render\">\n    <div class=\"card-episode__body\">\n        <div class=\"full-episode\">\n            <div class=\"full-episode__img\">\n                <img />\n            </div>\n\n            <div class=\"full-episode__body\">\n     <div class=\"card__title\">{title}</div>\n            <div class=\"card__age\">{release_year}</div>\n            <div class=\"full-episode__num hide\">{num}</div>\n                <div class=\"full-episode__name\">{name}</div>\n                <div class=\"full-episode__date\">{date}</div>\n            </div>\n        </div>\n    </div>\n    <div class=\"card-episode__footer hide\">\n        <div class=\"card__imgbox\">\n            <div class=\"card__view\">\n                <img class=\"card__img\" />\n            </div>\n        </div>\n\n        <div class=\"card__left\">\n            <div class=\"card__title\">{title}</div>\n            <div class=\"card__age\">{release_year}</div>\n        </div>\n    </div>\n</div>");
        // Стили 
          // Подтянем перевод для плашки Сериал
        var tv_caption = Lampa.Lang.translate('maxsm_themes_tvcaption');
        var style = "\n        <style id=\"maxsm_interface_mod_theme_forall\">\n " +
            // Firefox
            // "@-moz-document url-prefix() {    .full-start__background {        opacity: 0.7 !important;        filter: none !important; /* Отключаем фильтры для Firefox */    }" +   
            // "@-moz-document url-prefix() {    body {        background: #0a0a0a !important; /*Заменяем градиент на сплошной цвет */    }}" +
            // По центру в мобилке
            "@media screen and (max-width: 480px) { .full-start-new__head, .full-start-new__title, .full-start__title-original, .full-start__rate, .full-start-new__reactions, .full-start-new__rate-line, .full-start-new__buttons, .full-start-new__details, .full-start-new__tagline { -webkit-justify-content: center; justify-content: center; text-align: center; max-width: 100%; }}" +
            "@media screen and (max-width: 480px) { .full-start-new__right { background: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 0))); background: -webkit-linear-gradient(top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%); background: -o-linear-gradient(top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%); background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%);}}" +
            // Круглые чек-боксы
            ".selectbox-item__checkbox\n {\nborder-radius: 100%\n}\n" +
            ".selectbox-item--checked .selectbox-item__checkbox\n {\nbackground: #ccc;\n}\n" +
            //  Рейтинг внутри карточки
            ".full-start-new__rate-line .full-start__pg {\n    font-size: 1em;\nbackground: #fff;\n    color: #000;\n}\n." +
            ".full-start__rate \n{\n     border-radius: 0.25em;\n padding: 0.3em;\n background-color: rgba(0, 0, 0, 0.3);\n}\n" +
            ".full-start__pg, .full-start__status\n {\nfont-size: 1em;\nbackground: #fff;\n    color: #000;\n}\n" +
            // Докручиваем плашки на карточках стилями 
            // Заголовок
            ".card__title {\n                    height: 3.6em;\n                    text-overflow: ellipsis;\n                     -o-text-overflow: ellipsis;\n                    text-overflow: ellipsis;\n                    -webkit-line-clamp: 3;\n                    line-clamp: 3;\n                }\n " +
            // Год
            ".card__age {\n  position: absolute;\n  right: 0em;\n  bottom: 0em;\n  z-index: 10;\n  background: rgba(0, 0, 0, 0.6);\n  color: #ffffff;\n  font-weight: 700;\n  padding: 0.4em 0.6em;\n    -webkit-border-radius: 0.48em 0 0.48em 0;\n     -moz-border-radius: 0.48em 0 0.48em 0;\n          border-radius: 0.48em 0 0.48em 0;\nline-height: 1.0;\nfont-size: 1.0em;\n}\n " +
            // Рейтинг
            ".card__vote {\n  position: absolute;\n  bottom: auto; \n right: 0em;\n  top: 0em;\n  background: rgba(0, 0, 0, 0.6);\n    font-weight: 700;\n  color: #fff;\n -webkit-border-radius: 0 0.34em 0 0.34em;\n     -moz-border-radius: 0 0.34em 0 0.34em;\n          border-radius: 0 0.34em 0 0.34em;\nline-height: 1.0;\nfont-size: 1.4em;\n}\n  " +
            // Тип (Сериал)
            //".card__type  {\n  position: absolute;\n  bottom: auto; \n left: 0em; \nright: auto;\n  top: 0em;\n  background: rgba(0, 0, 0, 0.6);\n  color: #fff;\n  font-weight: 700;\n  padding: 0.4em 0.6em;\n  -webkit-border-radius: 0.4em 0 0.4em 0;\n     -moz-border-radius: 0.4em 0 0.4em 0;\n          border-radius: 0.4em 0 0.4em 0;\nline-height: 1.0;\nfont-size: 1.0em;\n}\n " +
            //".card--tv .card__type {\n  color: #fff;\n}\n" +
            ".card--tv .card__type,\n.card__type {\n  font-size: 1em;\n  background: transparent;\n color: transparent;\n left: 0;\n  top: 0;\n}\n" + 
              // Воткнуть в нее с переводом
            ".card__type::after {\n  background: url('https://raw.githubusercontent.com/нік на гітхаб /репозиторій/main/ім'я іконки.png') no-repeat center center / 120% !important;\n  filter: drop-shadow(0 0 5px #0ff21e);\n  content: '';\n  position: absolute;\n  left: 0.1em;\n  top: 0.1em;\n width: 1.8em;\n  height: 1.8em;\n  border-radius: 0.4em 0.4em 0.4em 0.4em;\n}" +
            // Иконки закладок и т.д.
            ".card__icons {\n  position: absolute;\n  top: 2em;\n  left: 0;\n  right: auto;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n     -moz-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n background: rgba(0, 0, 0, 0.6);\n  color: #fff;\n    -webkit-border-radius: 0 0.5em 0.5em 0;\n     -moz-border-radius: 0 0.5em 0.5em 0;\n          border-radius: 0 0.5em 0.5em 0;\n}\n" +
            ".card__icons-inner {\n  background: rgba(0, 0, 0, 0); \n}\n" +
            // Статус расширенных закладок
            ".card__marker {\n position: absolute;\n  left: 0em;\n  top: 4em;\n  bottom: auto; \n  background: rgba(0, 0, 0, 0.6);\n  -webkit-border-radius: 0 0.5em 0.5em 0;\n     -moz-border-radius: 0 0.5em 0.5em 0;\n          border-radius: 0 0.5em 0.5em 0;\n  font-weight: 700;\n font-size: 1.0em;\n   padding: 0.4em 0.6em;\n    display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n     -moz-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  line-height: 1.2;\nmax-width: min(12em, 95%);\nbox-sizing: border-box;\n}\n" +
            // На маленьких экранах обрезаем, на больших полностью
            ".card__marker > span {\n max-width: min(12em, 95%);\n}\n" +
            // отметка качества background: rgba(0, 0, 0, 0.6);\n  
            ".card__quality {\n  position: absolute;\n  left: 0em;\n right: auto;\n  bottom: 0em;\n  padding: 0.2em 0.3em;\n  color: #1c3178;\n font-weight: 700;\n  font-size: 1.0em;\n  -webkit-border-radius: 0 0.5em 0.5em 0;\n  -moz-border-radius: 0 0.5em 0.5em 0;\n  border-radius: 0 0.5em 0.5em 0;\n  text-transform: uppercase;\n}\n" +
            // Уменьшаем расстояние между рядами только для карточках в списках
            ".items-line.items-line--type-cards + .items-line.items-line--type-cards  {\nmargin-top: 1em;\n}\n" +
            // Так же широкие карты фиксим, чтобы не было отскока нижнего ряда, делаем отступ снизу
            ".card--small .card__view {\nmargin-bottom: 2em;\n}\n" +
            // Уменьшаем высоту после удаления футера, нужно для card_episode
            ".items-line--type-cards {\n min-height: 18em;\n}\n" +
            // Внутри карточки информация стремится к нижней границе экрана
            "@media screen and (min-width: 580px) {\n.full-start-new {\nmin-height: 80vh;\ndisplay: flex\n}\n}\n" +
            // Делаем, чтобы кнопки были большими, если экран большой, и всегда маленькими на мелеом экране
            //".full-start-new__buttons .full-start__button:not(.focus) span {\ndisplay: inline ;\n}\n@media screen and (max-width: 580px) {\n.full-start-new__buttons {\noverflow: auto;\n}\n.full-start-new__buttons .full-start__button:not(.focus) span {\ndisplay: none;\n}\n}\n" +
            // Постер в карточке, менее затемнен чем в стоке
            ".full-start__background.loaded {\nopacity: 0.8;\n}\n.full-start__background.dim {\nopacity: 0.2;\n}\n" +
            // Скругления у большого числа элементов
            ".explorer__files .torrent-filter .simple-button {\nfont-size: 1.2em;\n-webkit-border-radius: 0.5em;\n-moz-border-radius: 0.5em;\nborder-radius: 0.5em;\n}\n" +
            ".full-review-add,\n.full-review,\n.extensions__item,\n.extensions__block-add,\n.search-source,\n.bookmarks-folder__layer,\n.bookmarks-folder__body,\n.card__img,\n.card__promo,\n.full-episode--next .full-episode__img:after,\n.full-episode__img img,\n.full-episode__body,\n.full-person__photo,\n.card-more__box,\n.full-start__button,\n.simple-button,\n.register {\nborder-radius: 0.5em;\n}\n" +
            ".extensions__item.focus::after,\n.extensions__block-add.focus::after,\n.full-episode.focus::after,\n.full-review-add.focus::after,\n.card-parser.focus::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.card-more.focus .card-more__box::after,\n.register.focus::after {\nborder-radius: 1em;\n}\n" +
            ".search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus {\nborder-radius: 0.5em;\n}\n" +
            // Пробуем немного анимацмм
            ".card\n{transform: scale(1);\ntransition: transform 0.3s ease;\n}\n" +
            ".card.focus\n{transform: scale(1.03);\n}\n" +
            ".torrent-item,\n.online-prestige\n{transform: scale(1);\ntransition: transform 0.3s ease;\n}\n" +
            ".torrent-item.focus,\n.online-prestige.focus\n{transform: scale(1.01);\n}\n" +
            ".extensions__item,\n.extensions__block-add,\n.full-review-add,\n.full-review,\n.tag-count,\n.full-person,\n.full-episode,\n.simple-button,\n.full-start__button,\n.items-cards .selector,\n.card-more,\n.explorer-card__head-img.selector,\n.card-episode\n{transform: scale(1);\ntransition: transform 0.3s ease;\n}\n" +
            ".extensions__item.focus,\n.extensions__block-add.focus,\n.full-review-add.focus,\n.full-review.focus,\n.tag-count.focus,\n.full-person.focus,\n.full-episode.focus,\n.simple-button.focus,\n.full-start__button.focus,\n.items-cards .selector.focus,\n.card-more.focus,\n.explorer-card__head-img.selector.focus,\n.card-episode.focus\n{transform: scale(1.03);\n}\n" +
            ".menu__item {\n  transition: transform 0.3s ease;\n}\n" +
            ".menu__item.focus {\n transform: translateX(-0.2em);\n}\n" +
            ".selectbox-item,\n.settings-folder,\n.settings-param {\n transition: transform 0.3s ease;\n}\n" +
            ".selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\n transform: translateX(0.2em);\n}\n" +
            // Меню слева
            ".menu__item.focus {border-radius: 0 0.5em 0.5em 0;\n}\n" +
            ".menu__list {\npadding-left: 0em;\n}\n" +
            // Оставим иконки белыми в левом Меню
            ".menu__item.focus .menu__ico {\n   -webkit-filter: invert(1);\n    filter: invert(1);\n }\n " +
            // Белые иконки в бошке
            // ".head__action.focus, .head__action.hover {\ncolor: fff;\n}\n" +
            "</style>\n";
        Lampa.Template.add('card_css', style);
        $('body').append(Lampa.Template.get('card_css', {}, true));
    }

    // Функция инициализации плагина
    function startPlugin() {
        // Список доступных тем
        var availableThemes = ['mint_dark', 'deep_aurora', 'crystal_cyan', 'neon_pulse', 'lime_energy', 'amber_noir', 'velvet_sakura', 'default'];
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'maxsm_themes_selected',
                type: 'select',
                values: {
                    mint_dark: 'Mint Dark',
                    deep_aurora: 'Deep Aurora',
                    crystal_cyan: 'Crystal Cyan',
                    neon_pulse: 'Neon Pulse',
                    lime_energy: 'Lime Energy',
                    amber_noir: 'Amber Noir',
                    velvet_sakura: 'Velvet Sakura',
                    default: 'LAMPA'
                },
                "default": 'Mint Dark'
            },
            field: {
                name: Lampa.Lang.translate('maxsm_themes'),
                description: ''
            },
            onChange: function onChange(value) {
                maxsm_themes.settings.theme = value;
                Lampa.Settings.update();
                applyTheme(value);
            }
        });
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name == 'interface') {
                $("div[data-name=interface_size]").after($("div[data-name=maxsm_themes_selected]"));
            }
        });

        // Применяем настройки и проверяем, существует ли выбранная тема
        var savedTheme = Lampa.Storage.get('maxsm_themes_selected', 'mint_dark');
        if (availableThemes.indexOf(savedTheme) === -1) {
            // Если сохраненная тема не существует, ставим по умолчанию
            Lampa.Storage.set('maxsm_themes_selected', 'mint_dark');
            savedTheme = 'mint_dark';
        }
        maxsm_themes.settings.theme = savedTheme;
        applyTheme(maxsm_themes.settings.theme);
    }

    // Ждем загрузки приложения и запускаем плагин
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }
    // Регистрация плагина в манифесте
    Lampa.Manifest.plugins = {
        name: 'maxsm_themes',
        version: '2.5.0',
        description: 'maxsm_themes'
    };

    // Экспортируем объект плагина для внешнего доступа
    window.maxsm_themes = maxsm_themes;
})();



















