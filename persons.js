(function() {
    "use strict";

    // ==== ПРИХОВАННЯ СТАНДАРТНОЇ КНОПКИ "ПІДПИСАТИСЯ" ====
    function hideSubscribeButton() {
        if (document.getElementById('hide-subscribe-style')) return;

        const css = `
            .button--subscribe {
                display: none !important;
            }
        `;

        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== ОСНОВНА ЛОГІКА ПЛАГІНА ====
    var PLUGIN_NAME = "persons_plugin";
    var PERSONS_KEY = "saved_persons";
    var DEFAULT_PERSONS_DATA = { cards: {}, ids: [] };
    var currentPersonId = null;
    var my_logging = true;

    var pluginTranslations = {
        persons_title: {
            ru: "Персоны",
            en: "Persons",
            uk: "Персони",
            be: "Асобы",
            pt: "Pessoas",
            zh: "人物",
            he: "אנשים",
            cs: "Osobnosti",
            bg: "Личности"
        },
        subscriibbe: {
            ru: "Подписаться",
            en: "Subscribe",
            uk: "Підписатися",
            be: "Падпісацца",
            pt: "Inscrever",
            zh: "订阅",
            he: "הירשם",
            cs: "Přihlásit se",
            bg: "Абонирай се"
        },
        unsubscriibbe: {
            ru: "Отписаться",
            en: "Unsubscribe",
            uk: "Відписатися",
            be: "Адпісацца",
            pt: "Cancelar inscrição",
            zh: "退订",
            he: "בטל מנוי",
            cs: "Odhlásit se",
            bg: "Отписване"
        },
        persons_not_found: {
            ru: "Персоны не найдены",
            en: "No persons found",
            uk: "Особи не знайдені",
            be: "Асобы не знойдзены",
            pt: "Nenhuma pessoa encontrada",
            zh: "未找到人物",
            he: "לא נמצאו אנשים",
            cs: "Nebyly nalezeny žádné osoby",
            bg: "Не са намерени хора"
        }
    };

    var ICON_SVG = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

    function log() {
        if (my_logging && console && console.log) {
            try { console.log.apply(console, arguments); } catch (e) {}
        }
    }

    function error() {
        if (my_logging && console && console.error) {
            try { console.error.apply(console, arguments); } catch (e) {}
        }
    }

    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    function initStorage() {
        var current = Lampa.Storage.get(PERSONS_KEY);
        if (!current || !current.cards) {
            Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSONS_DATA);
        }
    }

    function getPersonsData() {
        return Lampa.Storage.get(PERSONS_KEY, DEFAULT_PERSONS_DATA);
    }

    function savePersonCard(personId, personData) {
        var savedPersons = getPersonsData();
        savedPersons.cards[personId] = personData;
        if (!savedPersons.ids.includes(personId)) savedPersons.ids.push(personId);
        Lampa.Storage.set(PERSONS_KEY, savedPersons);
    }

    function removePersonCard(personId) {
        var savedPersons = getPersonsData();
        delete savedPersons.cards[personId];
        var index = savedPersons.ids.indexOf(personId);
        if (index !== -1) savedPersons.ids.splice(index, 1);
        Lampa.Storage.set(PERSONS_KEY, savedPersons);
    }

    function togglePersonSubscription(personId) {
        var savedPersons = getPersonsData();
        var index = savedPersons.ids.indexOf(personId);

        if (index === -1) {
            var currentLang = getCurrentLanguage();
            var url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${currentLang}`);
            new Lampa.Reguest().silent(url, function (response) {
                try {
                    var json = typeof response === 'string' ? JSON.parse(response) : response;
                    if (json && json.id) {
                        savePersonCard(personId, json);
                    }
                } catch (e) { error('Error saving person data:', e); }
            });
            return true;
        } else {
            removePersonCard(personId);
            return false;
        }
    }

    function isPersonsubscriibbed(personId) {
        var savedPersons = getPersonsData();
        return savedPersons.ids.includes(personId);
    }

    function addButtonToContainer(bottomBlock) {
        var existingButton = bottomBlock.querySelector('.button--subscriibbe-plugin');
        if (existingButton && existingButton.parentNode) existingButton.parentNode.removeChild(existingButton);

        var issubscriibbed = isPersonsubscriibbed(currentPersonId);
        var buttonText = issubscriibbed ? 
            Lampa.Lang.translate('persons_plugin_unsubscriibbe') : 
            Lampa.Lang.translate('persons_plugin_subscriibbe');

        var button = document.createElement('div');
        button.className = 'full-start__button selector button--subscriibbe-plugin';
        button.classList.add(issubscriibbed ? 'button--unsubscriibbe' : 'button--subscriibbe');
        button.setAttribute('data-focusable', 'true');

        button.innerHTML =
            '<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>' +
            '<path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>' +
            '</svg>' +
            '<span>' + buttonText + '</span>';

        button.addEventListener('hover:enter', function () {
            var wasAdded = togglePersonSubscription(currentPersonId);
            var newText = wasAdded ?
                Lampa.Lang.translate('persons_plugin_unsubscriibbe') :
                Lampa.Lang.translate('persons_plugin_subscriibbe');

            button.classList.remove('button--subscriibbe', 'button--unsubscriibbe');
            button.classList.add(wasAdded ? 'button--unsubscriibbe' : 'button--subscriibbe');

            var span = button.querySelector('span');
            if (span) span.textContent = newText;
        });

        var buttonsContainer = bottomBlock.querySelector('.full-start__buttons');
        if (buttonsContainer) buttonsContainer.append(button);
        else bottomBlock.append(button);
    }

    function addsubscriibbeButton() {
        if (!currentPersonId) return;

        var bottomBlock = document.querySelector('.person-start__bottom');
        if (bottomBlock) addButtonToContainer(bottomBlock);
        else {
            let attempts = 0;
            const maxAttempts = 10;
            function tryAgain() {
                attempts++;
                var container = document.querySelector('.person-start__bottom');
                if (container) addButtonToContainer(container);
                else if (attempts < maxAttempts) setTimeout(tryAgain, 300);
            }
            setTimeout(tryAgain, 300);
        }
    }

    function addButtonStyles() {
        if (document.getElementById('subscriibbe-button-styles')) return;
        var css = `
            .full-start__button.selector.button--subscriibbe-plugin.button--subscriibbe {
                color: #4CAF50;
            }
            .full-start__button.selector.button--subscriibbe-plugin.button--unsubscriibbe {
                color: #F44336;
            }`;
        var style = document.createElement('style');
        style.id = 'subscriibbe-button-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== НОВА ЛОГІКА ВІДОБРАЖЕННЯ СПИСКУ ПЕРСОН ====
    function PersonsList() {
        let scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 });
        let body = document.createElement('div');
        let items = [];
        let active = 0;
        let last;

        body.classList.add('category-full');

        this.create = function () {
            this.activity.loader(true);
            this.loadSavedPersons();
        };

        this.loadSavedPersons = function () {
            let saved = Lampa.Storage.get(PERSONS_KEY, { cards: {}, ids: [] });
            let ids = saved.ids || [];
            let cardsData = saved.cards || {};

            this.activity.loader(false);

            if (!ids.length) {
                let empty = new Lampa.Empty();
                body.appendChild(empty.render(true));
                scroll.append(body);
                this.activity.toggle();
                return;
            }

            ids.forEach((id) => {
                let data = cardsData[id];
                if (!data) return;

                let cardData = {
                    id: data.id,
                    name: data.name,
                    title: data.name,
                    original_name: data.name,
                    poster_path: data.profile_path,
                    profile_path: data.profile_path,
                    gender: data.gender || 2
                };

                let card = new Lampa.Card(cardData, {
                    card_category: true,
                    object: { source: 'tmdb' }
                });

                card.create();

                card.onFocus = (target, card_data) => {
                    last = target;
                    active = items.indexOf(card);
                    scroll.update(card.render(true));
                    Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));
                };

                card.onTouch = (target, card_data) => {
                    last = target;
                    active = items.indexOf(card);
                };

                card.onEnter = (target, card_data) => {
                    Lampa.Activity.push({
                        title: data.name,
                        component: 'actor',
                        id: data.id,
                        url: '',
                        source: 'tmdb'
                    });
                };

                body.appendChild(card.render(true));
                items.push(card);
            });

            scroll.append(body);
            scroll.minus();

            scroll.onWheel = (step) => {
                if (!Lampa.Controller.own(this)) this.start();
                if (step > 0) Navigator.move('down');
                else Navigator.move('up');
            };

            scroll.onScroll = () => this.limit();
            this.activity.toggle();
            this.limit();
        };

        this.limit = function () {
            let limit_view = 12;
            let collection = items.slice(Math.max(0, active - limit_view), active + limit_view);
            items.forEach(item => {
                if (collection.indexOf(item) === -1)
                    item.render(true).classList.remove('layer--render');
                else
                    item.render(true).classList.add('layer--render');
            });

            Navigator.setCollection(items.slice(Math.max(0, active - 36), active + 36).map(c => c.render(true)));
            Navigator.focused(last);
            Lampa.Layer.visible(scroll.render(true));
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                link: this,
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render(true));
                    Lampa.Controller.collectionFocus(last || false, scroll.render(true));
                    this.limit();
                },
                left: () => { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                right: () => Navigator.move('right'),
                up: () => { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                down: () => { if (Navigator.canmove('down')) Navigator.move('down'); },
                back: () => Lampa.Activity.backward()
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () { };
        this.stop = function () { };
        this.render = function () { return scroll.render(); };
        this.destroy = function () {
            scroll.destroy();
            items.forEach(card => card.destroy());
            items = [];
        };
    }

    // ==== ЗАПУСК ПЛАГІНА ====
    function startPlugin() {
        hideSubscribeButton();

        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        initStorage();
        Lampa.Component.add('persons_plugin_list', PersonsList);

        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
            '<div class="menu__ico">' + ICON_SVG + '</div>' +
            '<div class="menu__text">' + Lampa.Lang.translate('persons_plugin_title') + '</div>' +
            '</li>'
        );

        menuItem.on("hover:enter", function () {
            Lampa.Activity.push({
                title: Lampa.Lang.translate('persons_plugin_title'),
                component: 'persons_plugin_list',
                page: 1
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                setTimeout(addsubscriibbeButton, 500);
            }
        });

        addButtonStyles();
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
