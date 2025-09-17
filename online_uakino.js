(function() {
  'use strict';

  var Defined = {
    api: 'lampac',
    localhost: 'http://batmen.my.to/',
    apn: ''
  };
  
  var rchtype = 'web';
  var check = function check(good) {
    rchtype = Lampa.Platform.is('android') ? 'apk' : good ? 'cors' : 'web';
  };
  
  var unic_id = Lampa.Storage.get('lampac_unic_id', '');
  if (!unic_id) {
    unic_id = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set('lampac_unic_id', unic_id);
  }
  
  if (Lampa.Platform.is('android') || Lampa.Platform.is('tizen')) check(true);
  else {
    var net = new Lampa.Reguest();
    net.silent('https://github.com/', function() { check(true); }, function() { check(false); }, false, { dataType: 'text' });
  }

  // * Здесь сокращён условный список балансеров — он уже не важен,
  //     мы будем фильтровать только нужные домены. *
  // var balansers_with_search = [...];

  function BlazorNet() {
    this.net = new Lampa.Reguest();
    this.timeout = function(time) { this.net.timeout(time); };
    this.req = function(type, url, success, error, post, params = {}) {
      var path = url.split(Defined.localhost).pop().split('?');
      if (path[0].indexOf('http') >= 0) {
        return this.net[type](url, success, error, post, params);
      }
      DotNet.invokeMethodAsync("JinEnergy", path[0], path[1])
        .then(function(result) {
          if (params.dataType == 'text') success(result);
          else success(Lampa.Arrays.decodeJson(result, {}));
        })
        .catch(function(e) {
          console.log('Blazor', 'error:', e);
          error(e);
        });
    };
    this.silent = function(url, success, error, post, params) {
      this.req('silent', url, success, error, post, params);
    };
    this.native = function(url, success, error, post, params) {
      this.req('native', url, success, error, post, params);
    };
    this.clear = function() { this.net.clear(); };
  }

  var Network = Lampa.Reguest;
  // var Network = Defined.api.indexOf('pwa') == 0 && typeof Blazor !== 'undefined'
  //   ? BlazorNet : Lampa.Reguest;

  function component(object) {
    var network     = new Network();
    var scroll      = new Lampa.Scroll({ mask: true, over: true });
    var files       = new Lampa.Explorer(object);
    var filter      = new Lampa.Filter(object);
    var sources     = {};
    var last, source, balanser, initialized;
    var hubConnection, balanser_timer, hub_timer, life_wait_timer;
    var filter_sources = {};
    var filter_translate = {
      season: Lampa.Lang.translate('torrent_serial_season'),
      voice:  Lampa.Lang.translate('torrent_parser_voice'),
      source: Lampa.Lang.translate('settings_rest_source')
    };
    var filter_find = { season: [], voice: [] };

    // Оставляем только эти три балансера:
    var allowedDomains = ['eneyida.tv', 'kinoukr.com', 'uakino.me'];

    this.initialize = function() {
      var _this = this;
      this.loading(true);

      // ... (фильтр, UI и т.п. без изменений) ...

      this.externalids()
        .then(function() { return _this.createSource(); })
        .then(function(json) { _this.search(); })
        .catch(function(e)   { _this.noConnectToServer(e); });
    };

    // Здесь основная правка: из всех возвращённых JSON мы берём только нужные домены
    this.startSource = function(json) {
      return new Promise(function(resolve, reject) {
        sources = {};
        json.forEach(function(j) {
          if (allowedDomains.some(function(d) { return j.url.includes(d); })) {
            var name = (j.balanser || j.name.split(' ')[0]).toLowerCase();
            sources[name] = {
              url:  j.url,
              name: j.name,
              show: true
            };
          }
        });
        filter_sources = Lampa.Arrays.getKeys(sources);
        if (!filter_sources.length) return reject();

        // Сохраняем последний выбранный или берём первый
        var last_select = Lampa.Storage.cache('online_last_balanser', 3000, {});
        balanser = last_select[object.movie.id] || filter_sources[0];
        source   = sources[balanser].url;
        resolve(json);
      });
    };

    // Полная версия метода createSource без изменений,
    // оно в итоге зовёт startSource()

    this.createSource = function() {
      var _this = this;
      return new Promise(function(resolve, reject) {
        var url = Defined.localhost + 'lite/events?life=true';
        network.timeout(15000);
        network.silent(account(url), function(json) {
          if (json.life) {
            _this.lifeSource().then(_this.startSource).then(resolve).catch(reject);
          } else {
            _this.startSource(json).then(resolve).catch(reject);
          }
        }, reject);
      });
    };

    // Остальные методы компонента (search, find, parse, display и т.д.) без изменений...
    // ...

    this.start = function() {
      if (!initialized) {
        initialized = true;
        this.initialize();
      }
      Lampa.Controller.add('content', {
        toggle:  function() { Lampa.Controller.collectionFocus(last || false, scroll.render()); },
        up:      function() { if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
        down:    function() { Navigator.move('down'); },
        right:   function() { if (Navigator.canmove('right')) Navigator.move('right'); else filter.show(); },
        left:    function() { if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
        back:    this.back.bind(this)
      });
      Lampa.Controller.toggle('content');
    };

    this.render = function() {
      return files.render();
    };
    this.back = function() {
      Lampa.Activity.backward();
    };
    this.destroy = function() {
      network.clear();
      this.clearImages();
      files.destroy();
      scroll.destroy();
      clearInterval(balanser_timer);
      clearTimeout(hub_timer);
      clearTimeout(life_wait_timer);
      if (hubConnection) hubConnection.stop();
    };
  }

  // Регистрация плагина
  function startPlugin() {
    if (window.bat_plugin) return;
    window.bat_plugin = true;

    // Манифест
    var manifest = {
      type:        'video',
      version:     '',
      name:        'BATmen',
      description: 'Плагин для просмотра',
      component:   'bat',
      onContextMenu: function() {
        return { name: Lampa.Lang.translate('lampac_watch'), description: 'Плагин для просмотра' };
      },
      onContextLauch: function(object) {
        resetTemplates();
        Lampa.Component.add('bat', component);
        var id  = Lampa.Utils.hash(object.number_of_seasons ? object.original_name : object.original_title);
        var all = Lampa.Storage.get('clarification_search','{}');
        Lampa.Activity.push({
          url:          '',
          title:        Lampa.Lang.translate('title_online'),
          component:    'bat',
          search:       all[id] || object.title,
          search_one:   object.title,
          search_two:   object.original_title,
          movie:        object,
          page:         1,
          clarification: !!all[id]
        });
      }
    };

    Lampa.Manifest.plugins = manifest;
    Lampa.Lang.add({
      lampac_watch:     { ru: 'Смотреть онлайн', uk: 'Дивитися онлайн', en: 'Watch online' },
      // ... остальные переводы ...
    });
    // ... все Template.add и стили без изменений ...

    Lampa.Component.add('bat', component);
    resetTemplates();

    // Вешаем кнопку в UI
    Lampa.Listener.follow('full', function(e) {
      if (e.type == 'complite') {
        var render = (Lampa.Storage.get('card_interfice_type')==='new')
          ? e.object.activity.render().find('.button--play')
          : e.object.activity.render().find('.view--torrent');
        var movie  = e.data.movie;
        if (!render.find('.lampac--button').length) {
          var btn = $(Lampa.Lang.translate(button));
          btn.on('hover:enter', function() {
            resetTemplates();
            Lampa.Component.add('bat', component);
            Lampa.Activity.push({
              url:         '',
              title:       '',
              component:   'bat',
              search:      movie.title,
              search_one:  movie.title,
              search_two:  movie.original_title,
              movie:       movie,
              page:        1
            });
          });
          render.before(btn);
        }
      }
    });
  }

  // Запуск
  startPlugin();

  // helper-функции (account, resetTemplates и т.д.) — без изменений
  // ...

})();
