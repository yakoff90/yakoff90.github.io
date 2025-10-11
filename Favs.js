(функція () {
    «використовувати суворий»;

    функція debounce(func, wait) {
        час очікування var;
        функція повернення () {
            var контекст = це, args = аргументи;
            clearTimeout(тайм-аут);
            тайм-аут = встановитиТайм-аут(функція () {
                func.apply(контекст, аргументи);
            }, зачекайте);
        };
    }

    функція CustomFavoriteFolder(дані) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        this.data = дані;
        this.params = параметри;
        this.card = this.data.length ? this.data[0] : {};

        this.create = функція () {
            var self = це;

            this.folder = Lampa.Template.js('папка_закладок');
            this.folder.querySelector('.bookmarks-folder__title').innerText = Lampa.Lang.translate('menu_' + params.media);
            this.folder.querySelector('.bookmarks-folder__num').innerText = this.data.length;
            this.folder.addEventListener('hover:focus', function() {
                якщо (self.onFocus) {
                    self.onFocus(self.folder, self.card);
                }
            });
            this.folder.addEventListener('hover:touch', function() {
                якщо (self.onTouch) {
                    self.onTouch(self.folder, self.card);
                }
            });
            this.folder.addEventListener('наведіть курсор:наведіть курсор', функція () {
                якщо (self.onHover) {
                    self.onHover(self.folder, self.card);
                }
            });
            this.folder.addEventListener('наведіть курсор миші: введіть', функція () {
                Lampa.Activity.push({
                    URL-адреса: '',
                    заголовок: params.title + ' - ' + Lampa.Lang.translate('menu_' + params.media),
                    компонент: «улюблений»,
                    тип: params.category,
                    фільтр: params.media,
                    сторінка: 1
                });
            });
            this.folder.addEventListener('видимий', this.visible.bind(це));
        };

        this.image = функція (витік, i) {
            var self = це;

            var зображення = document.createElement('зображення');
            img.addClass('картка__img');
            img.addClass('i-' + i);

            зображення.onload = функція () {
                self.folder.classList.add('картка--завантажена');
            };

            зображення.onerror = функція () {
                зображення.src = './img/img_broken.svg';
            };

            this.folder.querySelector('.bookmarks-folder__body').append(img);
            зображення.витік = витік;
        };

        this.visible = функція () {
            var self = це;

            var фільтровано = this.data.filter(функція (a) {
                повернути a.poster_path;
            }).slice(0, 3);
            фільтровано.forEach(функція (a, i) {
                self.image(Lampa.Api.img(шлях_до_доріжки_до_постера), i);
            });
            якщо (фільтр.довжина == 0) {
                this.image('./img/img_load.svg');
            }
            якщо (this.onVisible) {
                this.onVisible(ця.папка, дані);
            }
        };

        this.destroy = функція () {
            this.folder.remove();
        };

        this.render = функція (js) {
            повернути js? this.folder : $(this.folder);
        };
    }

    функція CustomFavorite() {
        var allCustomFavs = [];

        this.getFavorite = функція () {
            var favorite = Lampa.Storage.get('favorite', {});
            улюблена.картка = улюблена.картка || [];

            var customTypes = favorite.customTypes || {};
            улюблені.customTypes = customTypes;

            allCustomFavs = this.getCards(улюблені);

            повернення до улюбленого;
        }

        this.getTypes = функція () {
            повернути Object.keys(this.getFavorite().customTypes);
        }

        this.getCards = функція (улюблене) {
            якщо (!улюблений && allCustomFavs.length > 0) {
                повернути всіCustomFavs;
            }

            улюблений = улюблене || this.getFavorite();
            allCustomFavs = Object.keys(favorite.customTypes).reduce(function(acc, key) {
                var uid = favorite.customTypes[ключ];
                повернути favorite.hasOwnProperty(uid) ? acc.concat(favorite[uid]) : acc;
            }, []);

            повернути всіCustomFavs;
        }

        this.createType = функція (назва_типу) {
            var favorite = this.getFavorite();

            якщо (favorite.customTypes[назва_типу]) {
                var err = new Error('custom.fav.name-used');
                код помилки = 'custom.fav';
                кинути помилку;
            }

            var uid = Lampa.Utils.uid(8).toLowerCase();
            favorite.customTypes[назва_типу] = uid;
            улюблений[uid] = [];

            Lampa.Storage.set('улюблений', улюблений);
            Lampa.Favorite.init();

            повернути {
                ім'я: typeName,
                ідентифікатор користувача: ідентифікатор користувача,
                лічильник: 0
            };
        }

        this.renameType = функція (стараНазва, новаНазва) {
            var favorite = this.getFavorite();
            var uid = favorite.customTypes[стараНазва];

            якщо (!uid) {
                var err = new Error('custom.fav.not-defined');
                код помилки = 'custom.fav';
                кинути помилку;
            }

            якщо (favorite.customTypes[новеНазва]) {
                var err = new Error('custom.fav.name-used');
                код помилки = 'custom.fav';
                кинути помилку;
            }

            favorite.customTypes[новеНазва] = uid;
            видалити favorite.customTypes[стараНазва];

            Lampa.Storage.set('улюблений', улюблений);
            Lampa.Favorite.init();

            повернути істину;
        }

        this.removeType = функція (назва_типу) {
            var favorite = this.getFavorite();
            var uid = favorite.customTypes[назва_типу];

            якщо (!uid) {
                var err = new Error('custom.fav.not-defined');
                код помилки = 'custom.fav';
                кинути помилку;
            }

            видалити favorite.customTypes[назва_типу];
            видалити улюблене[uid];

            Lampa.Storage.set('улюблений', улюблений);
            Lampa.Favorite.init();

            повернути істину;
        }

        this.getTypeList = функція (назва_типу) {
            var favorite = this.getFavorite();
            var uid = favorite.customTypes[назва_типу];

            якщо (!uid) {
                var err = new Error('custom.fav.not-defined');
                код помилки = 'custom.fav';
                кинути помилку;
            }

            повернути улюблене[uid] || [];
        }

        this.toggleCard = функція (назва_типу, картка) {
            var favorite = this.getFavorite();
            var uid = favorite.customTypes[назва_типу];

            якщо (!uid) {
                var err = new Error('custom.fav.not-defined');
                код помилки = 'custom.fav';
                кинути помилку;
            }

            var typeList = favorite[uid] || [];
            улюблений[uid] = списоктипів;

            якщо (typeList.indexOf(card.id) === -1) {
                якщо (favorite.card.every(функція (favCard) { повернути favCard.id !== card.id })) {
                    Lampa.Arrays.insert(улюблена.картка, 0, картка);
                }

                Lampa.Arrays.insert(typeList, 0, card.id);
                this.getCards(улюблені);

                Lampa.Favorite.listener.send('додати', {
                    картка: картка,
                    де: назва_типу,
                    typeId: uid
                });
            } інше {
                Lampa.Arrays.remove(typeList, card.id);
                var customCards = this.getCards(улюблені);

                Lampa.Favorite.listener.send('видалити', {
                    картка: картка,
                    метод: 'ідентифікатор',
                    де: назва_типу,
                    typeId: uid
                });

                var used = customCards.indexOf(card.id) >= 0 || Lampa.Favorite.check(card).any;

                якщо (!використовується) {
                    улюблена.картка = улюблена.картка.фільтр(функція (картка улюбленої) {
                        повернути favCard.id !== card.id;
                    });

                    Lampa.Favorite.listener.send('видалити', {
                        картка: картка,
                        метод: 'картка',
                        де: назва_типу,
                        typeId: uid
                    });
                }
            }

            Lampa.Storage.set('улюблений', улюблений);
            Lampa.Favorite.init();

            повернути {
                ім'я: typeName,
                ідентифікатор користувача: ідентифікатор користувача,
                лічильник: typeList.length,
            }
        }
    }

    var customFavorite = new CustomFavorite();


    функція FavoritePageService() {
    }

    FavoritePageService.prototype.renderCustomFavoriteButton = функція (тип) {
        var customTypeCssClass = 'custom-type-' + type.uid;

        var $register = Lampa.Template.js('register').addClass('selector').addClass(customTypeCssClass).addClass('custom-type');
        $register.find('.register__name').text(type.name).addClass(customTypeCssClass);
        $register.find('.register__counter').text(type.counter || 0).addClass(customTypeCssClass);

        var $render = Lampa.Activity.active().activity.render();

        $register.on('наведення:довго', функція () {
            меню var = [
                {
                    title: Lampa.Lang.translate('rename'),
                    дія: «перейменувати»
                },
                {
                    заголовок: Lampa.Lang.translate('settings_remove'),
                    дія: «видалити»
                }
            ]

            var controllerName = Lampa.Controller.enabled().name;

            Lampa.Select.show({
                заголовок: Lampa.Lang.translate('заголовок_дії'),
                пункти: меню,
                onBack: функція () {
                    Lampa.Controller.toggle(ім'я_контролера);
                    Lampa.Controller.toggle('вміст');
                },
                onSelect: функція (елемент) {
                    перемикач (елемент.дія) {
                        регістр 'видалити': {
                            спробуйте {
                                customFavorite.removeType(тип.назва);
                                $реєстр.видалити();

                                Lampa.Controller.toggle(ім'я_контролера);
                                Lampa.Controller.toggle('вміст');
                            } нарешті {
                                перерва;
                            }
                        }
                        випадок 'перейменування': {
                            var inputOptions = {
                                title: Lampa.Lang.translate('filter_set_name'),
                                значення: тип.назва,
                                безкоштовно: правда,
                                nosave: true
                            };

                            Lampa.Input.edit(inputOptions, function(value) {
                                якщо (значення === '' || тип.назва == значення) {
                                    Lampa.Controller.toggle('вміст');
                                    повернення;
                                };

                                спробуйте {
                                    customFavorite.renameType(тип.назва, значення);
                                    $register.find('.register__name').text(значення);
                                    тип.назва = значення;
                                } нарешті {
                                    Lampa.Controller.toggle(ім'я_контролера);
                                    Lampa.Controller.collectionFocus($register, $render);
                                }
                            });

                            перерва;
                        }
                    }
                }
            });
        });

        $register.on('наведіть курсор:введіть', функція () {
            Lampa.Activity.push({
                URL-адреса: '',
                компонент: «улюблений»,
                заголовок: тип.назва,
                тип: type.uid,
                сторінка: 1,
            });
        });

        $('.register:first', $render).after($register);
        повернути $реєстр;
    }

    FavoritePageService.prototype.refresh = функція (тип) {
        var activity = Lampa.Activity.active();

        якщо (activity.component === 'закладки') {
            $('.register__counter.custom-type-' + type.uid).text(type.counter || 0);
        };
    }

    FavoritePageService.prototype.renderAddButton = функція () {
        var self = це;

        var $register = Lampa.Template.js('register').addClass('selector').addClass('new-custom-type');
        $register.find('.register__counter').html('<img src="./img/icons/add.svg"/>');

        $('.register:first').before($register);

        $register.on('наведіть курсор:введіть', функція () {
            var inputOptions = {
                title: Lampa.Lang.translate('filter_set_name'),
                значення: '',
                безкоштовно: правда,
                nosave: true
            };

            Lampa.Input.edit(inputOptions, function(value) {
                якщо (значення === '') {
                    Lampa.Controller.toggle('вміст');
                    повернення;
                };

                спробуйте {
                    тип var = customFavorite.createType(значення);
                    self.renderCustomFavoriteButton(тип);
                } нарешті {
                    Lampa.Controller.toggle('вміст');
                }
            });
        });
    }

    FavoritePageService.prototype.renderLines = функція () {
        var об'єкт = Lampa.Activity.active();
        var favorite = customFavorite.getFavorite();
        var mediaTypes = ['кіно', 'телебачення'];
        var рядки = [];

        Object.keys(favorite.customTypes).reverse().forEach(function(typeName) {
            var typeUid = favorite.customTypes[назва_типу];
            var typeList = favorite[typeUid] || [];

            var typeCards = favorite.card.filter(function(card) { return typeList.indexOf(card.id) !== -1 });
            var lineItems = Lampa.Arrays.clone(typeCards.slice(0, 20));

            змінна i = 0;
            mediaTypes.forEach(функція (m) {
                var фільтр = Lampa.Utils.filterCardsByType(typeCards, m);

                якщо (фільтр.довжина) {
                    Lampa.Arrays.insert(lineItems, i, {
                        Клас карти: функція Клас карти() {
                            повернути новий CustomFavoriteFolder(фільтр, {
                                заголовок: typeName,
                                категорія: typeUID,
                                медіа: м
                            });
                        }
                    });
                    i++;
                }
            });

            lineItems = lineItems.slice(0, 20);
            lineItems.forEach(функція(елемент) {
                item.ready = false;
            });

            якщо (lineItems.довжина > 0) {
                об'єкт.активність.компонент().append({
                    заголовок: typeName,
                    результати: рядки,
                    тип: typeUid
                });
            }
        });
    }

    var favoritePageSvc = new FavoritePageService();

    функція CardFavoriteService() {
        this.extendContextMenu = функція (об'єкт) {
            var self = це;

            var bookmarkMenuItem = $('body > .selectbox').find('.selectbox-item__title').filter(function () {
                повернути $(this).text() === Lampa.Lang.translate('title_book');
            });

            customFavorite.getTypes().forEach(функція (customCategory) {
                var $menuItem = $('<div class="selectbox-item selector"><div class="selectbox-item__title">' + customCategory + '</div><div class="selectbox-item__checkbox"></div></div>');
                $menuItem.insertBefore(bookmarkMenuItem.parent());
                $menuItem.on('наведіть курсор:введіть', функція () {
                    var category = $(this).find('.selectbox-item__title').text();
                    var type = customFavorite.toggleCard(категорія, об'єкт.дані);
                    $(this).toggleClass('selectbox-item--checked');

                    setTimeout(функція () {
                        якщо (об'єкт.картка) {
                            self.refreshCustomFavoriteIcon(об'єкт);
                        } інше {
                            self.refreshBookmarkIcon();
                        }
                    }, 0);

                    favoritePageSvc.refresh(тип);
                });

                якщо (customFavorite.getTypeList(customCategory).indexOf(object.data.id) >= 0) {
                    $menuItem.addClass('selectbox-item--checked');
                }
            });

            Lampa.Controller.collectionSet($('body > .selectbox').find('.scroll__body'));

            setTimeout(функція () {
                var $menuItems = $('body > .selectbox').find('.selector');
                якщо ($menuItems.length > 0) {
                    Lampa.Controller.focus($menuItems.get(0));
                    Навігатор.focus($menuItems.get(0));
                }
            }, 10);
        };

        this.refreshCustomFavoriteIcon = функція (об'єкт) {
            var customFavCards = customFavorite.getCards();

            var $iconHolder = $('.card__icons-inner', object.card);

            var id = object.data.id;
            var anyFavorite = customFavCards.indexOf(id) >= 0;

            var $starIcon = $('.icon--зірка', $iconHolder);
            var маєЗначок = $starIcon.length !== 0;
            var маєПрихованийІкон = маєІкон && $starIcon.hasClass('приховати');

            якщо (будь-якийУлюблений) {
                якщо (!маєІконку) {
                    $iconHolder.prepend(Lampa.Template.get('користувацький-іконка-улюбленого'));
                } інакше якщо (маєПрихованийЗначок) {
                    $starIcon.removeClass('приховати');
                }
            } інше {
                if (hasIcon && !hasHiddenIcon) {
                    $starIcon.addClass('приховати');
                }
            }
        }

        this.refreshBookmarkIcon = функція () {
            var active = Lampa.Activity.active();

            якщо (активний.компонент !== 'повний') {
                повернення;
            }

            var картка = active.картка;
            var anyCustomFavorite = customFavorite.getCards().indexOf(card.id) !== -1;

            var favStates = anyCustomFavorite ? {} : Lampa.Favorite.check(картка);
            var anyFavorite = anyCustomFavorite || Object.keys(favStates).filter(function (favType) {
                повернути favType !== 'історія' && favType !== 'будь-який';
            }).some(функція (favType) {
                повернути !!favStates[favType];
            });

            var $svg = $(".button--шлях до файлу SVG книги", active.activity.render());

            якщо (будь-якийУлюблений) {
                $svg.attr('заповнення', 'поточнийКолір');
            } інше {
                $svg.attr('заливка', 'прозорий');
            };
        }
    }

    var cardFavoriteSvc = new CardFavoriteService();

    функція початок() {
        якщо (window.custom_favorites) {
            повернення;
        }

        window.custom_favorites = true;

        Lampa.Utils.putScript(['https://levende.github.io/lampa-plugins/listener-extensions.js'], функція () {
            Lampa.Listener.follow('картка', функція (подія) {
                якщо (event.type !== 'build') {
                    повернення;
                }

                var оригінальнийОбране = подія.об'єкт.улюблене;
                подія.об'єкт.улюблений = функція () {
                    originalFavorite.apply(це, аргументи);
                    cardFavoriteSvc.refreshCustomFavoriteIcon(event.object);
                }

                var оригінальнийOnMenu = подія.об'єкт.onMenu;
                подія.об'єкт.onMenu = функція () {
                    originalOnMenu.apply(це, аргументи);
                    cardFavoriteSvc.extendContextMenu(event.object);
                }
            });
        });

        Lampa.Favorite.listener.follow('видалити', (function () {
            var ЧергаПодії = [];
            var isProcessing = false;

            функція processEvents() {
                якщо (eventQueue.length === 0 || isProcessing) {
                    повернення;
                }

                isProcessing = true;

                var favorite = customFavorite.getFavorite();
                var cardsToAdd = [];
                змінна i, подія;

                для (i = 0; i < eventQueue.length; i++) {
                    подія = ЧергаПодії[i];
                    якщо (event.method === 'картка' && !event.typeId && customFavorite.getCards().indexOf(event.card.id) >= 0) {
                        cardsToAdd.push(подія.картка);
                    }
                }

                якщо (cardsToAdd.length > 0) {
                    для (i = 0; i < cardsToAdd.length; i++) {
                        favorite.card.push(cardsToAdd[i]);
                    }
                    Lampa.Storage.set('улюблений', улюблений);
                }

                ЧергаПодії = [];

                var маєПодіяНеКартки = хибно;
                для (i = 0; i < eventQueue.length; i++) {
                    якщо (eventQueue[i].method !== 'картка') {
                        маєПодіяНеКартки = true;
                        перерва;
                    }
                }
                якщо (маєНеКартковуПодія) {
                    встановитиЧаймаут(карткаОбраніСвц.рефрешІконкаЗакладки, 0);
                }

                isProcessing = false;

                якщо (eventQueue.length > 0) {
                    встановитиЧасОуту(процесПодії, 0);
                }
            }

            var debounceProcess = debounce(processEvents, 100);

            функція повернення (подія) {
                eventQueue.push(подія);
                Процес_відмовлення();
            };
        })());

        Lampa.Lang.add({
            перейменувати: {
                en: «Перейменувати»,
                ук: «Змінити ім'я»,
                ru: 'Змінити ім'я'
            }
        });
        Lampa.Template.add('custom-fav-icon', '<div class="card__icon icon--star"><svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.6162 7.10981L15.8464 7.55198L16.3381 7.63428L22.2841 8.62965C22.8678 8.72736 23.0999 9.44167 22.6851 9.86381L18.4598 14.1641L18.1104 14.5196L18.184 15.0127L19.0748 20.9752C19.1622 21.5606 18.5546 22.002 18.025 21.738L12.6295 19.0483L12.1833 18.8259L11.7372 19.0483L6.34171 21.738C5.81206 22.002 5.20443 21.5606 5.29187 20.9752L6.18264 15.0127L6.25629 14.5196L5.9069 14.1641L1.68155 9.86381C1.26677 9.44167 1.49886 8.72736 2.08255 8.62965L8.02855 7.63428L8.52022 7.55198L8.75043 7.10981L11.5345 1.76241C11.8078 1.23748 12.5589 1.23748 12.8322 1.76241L15.6162 7.10981Z" stroke="currentColor" stroke-width="2.2"></path></svg></div>');

        $('<стиль>').prop('тип', 'текст/css').html(
            '.card__icon { позиція: відносна; } ' +
            '.icon--star svg { позиція: абсолютна; висота: 60%; ширина: 60%; зверху: 50%; зліва: 50%; трансформація: трансляція(-50%, -50%) }' +
            '.new-custom-type .register__counter { display:flex; justify-content:center; align-items:center }' +
            '.new-custom-type .register__counter img { висота: 2.2em; відступ: 0.4em; }' +
            '.register.custom-type { background-image: url("https://levende.github.io/lampa-plugins/assets/tap.svg"); background-repeat: no-repeat; background-position: 90% 90%; background-size: 20%; }'
        ).appendTo('голова');

        Lampa.Listener.follow('full', функція (подія) {
            якщо (event.type == 'завершено') {
                var active = Lampa.Activity.active();
                cardFavoriteSvc.refreshBookmarkIcon();

                var $btnBook = $(".button--book", active.activity.render());
                $btnBook.on('наведіть курсор миші:введіть', функція () {
                    cardFavoriteSvc.extendContextMenu({ дані: active.card });
                });
            }
        });

        Lampa.Storage.listener.follow('змінити', функція (подія) {
            якщо (назва події !== 'активність') {
                повернення;
            }

            якщо (Lampa.Activity.active().component === 'закладки') {
                якщо ($('.new-custom-type').length !== 0) {
                    повернення;
                }

                favoritePageSvc.renderAddButton();
                var favorite = customFavorite.getFavorite();

                favoritePageSvc.renderLines();

                Object.keys(favorite.customTypes).reverse().forEach(function(typeName) {
                    var typeUid = favorite.customTypes[назва_типу];
                    var typeList = favorite[typeUid] || [];
                    var typeCounter = typeList.length;

                    favoritePageSvc.renderCustomFavoriteButton({
                        ім'я: typeName,
                        uid: typeUid,
                        лічильник: typeCounter
                    });
                });


                Лампа.Активність.активний().активність.перемикач();
            }
        });
    }

    якщо (window.appready) {
        початок();
    } інше {
        Lampa.Listener.follow('додаток', функція (подія) {
            якщо (event.type === 'готовий') {
                початок();
            }
        });
    }
})();
