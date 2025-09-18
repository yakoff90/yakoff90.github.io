// Filmix only plugin with auth
(function () {
    'use strict';

    function filmixHost() {
      return 'https://filmix.my';
    }

    function filmixToken(dev_id, token) {
      return '?user_dev_id=' + dev_id + '&user_dev_name=Xiaomi&user_dev_token=' + token + '&user_dev_vendor=Xiaomi&user_dev_os=14&user_dev_apk=2.2.0&app_lang=ru-rRU';
    }

    function filmixUserAgent() {
      return 'okhttp/3.10.0';
    }

    function baseUserAgent() {
      return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36';
    }

    function addSettingsFilmix() {
      Lampa.SettingsApi.addComponent({
        component: 'filmix',
        name: 'online_mod_filmix',
        type: 'input',
        title: 'Filmix dev_id',
        value: Lampa.Storage.get('filmix_dev_id',''),
        onChange: function (val) {
          Lampa.Storage.set('filmix_dev_id', val);
        }
      });

      Lampa.SettingsApi.addComponent({
        component: 'filmix',
        name: 'online_mod_filmix_token',
        type: 'input',
        title: 'Filmix token',
        value: Lampa.Storage.get('filmix_token',''),
        onChange: function (val) {
          Lampa.Storage.set('filmix_token', val);
        }
      });
    }

    function filmix(component, object) {
      var network = new Lampa.Reguest();
      var select_title = object.search || object.movie.title;
      var host = filmixHost();
      var user_agent = filmixUserAgent();
      var ref = host + '/';

      this.search = function (_object, kinopoisk_id, data) {
        object = _object;
        select_title = object.search || object.movie.title;
        component.loading(true);

        var query = encodeURIComponent(select_title);
        var dev_id = Lampa.Storage.get('filmix_dev_id','');
        var token = Lampa.Storage.get('filmix_token','');
        var auth = (dev_id && token) ? filmixToken(dev_id, token) : '';

        var url = host + '/api/v2/search?query=' + query + auth;

        network.clear();
        network.timeout(15000);
        network.native(url, function (json) {
          if (json && json.data && json.data.length) {
            success(json.data, dev_id, token);
          } else {
            component.emptyForQuery(select_title);
          }
        }, function (a, c) {
          component.empty(network.errorDecode(a, c));
        }, false, {
          headers: {
            'User-Agent': user_agent,
            'Referer': ref
          }
        });
      };

      function success(results, dev_id, token) {
        component.loading(false);
        var items = [];

        results.forEach(function (elem) {
          items.push({
            title: elem.title || select_title,
            quality: elem.quality || 'HD',
            info: elem.year ? elem.year.toString() : '',
            media: elem,
            dev_id: dev_id,
            token: token
          });
        });

        append(items);
      }

      function append(items) {
        component.reset();
        items.forEach(function (element) {
          var item = Lampa.Template.get('online_mod', element);
          item.on('hover:enter', function () {
            if (element.loading) return;
            element.loading = true;
            getStream(element, function (elem) {
              element.loading = false;
              var first = {
                url: elem.stream,
                quality: elem.qualitys || false,
                subtitles: elem.subtitles || false,
                title: elem.title
              };
              Lampa.Player.play(first);
              Lampa.Player.playlist([first]);
            }, function () {
              element.loading = false;
              Lampa.Noty.show(Lampa.Lang.translate('online_mod_nolink'));
            });
          });
          component.append(item);
        });
        component.start(true);
      }

      function getStream(element, call, error) {
        if (!element.media || !element.media.id) return error();
        var dev_id = element.dev_id;
        var token = element.token;
        var auth = (dev_id && token) ? filmixToken(dev_id, token) : '';

        var url = host + '/api/v2/movie?id=' + element.media.id + auth;

        network.clear();
        network.timeout(15000);
        network.native(url, function (json) {
          if (json && json.data && json.data.link) {
            element.stream = json.data.link;
            element.qualitys = json.data.quality || false;
            element.subtitles = json.data.subtitles || false;
            call(element);
          } else error();
        }, function (a, c) {
          error();
        }, false, {
          headers: {
            'User-Agent': user_agent,
            'Referer': ref
          }
        });
      }

      this.extendChoice = function () {};
      this.reset = function () { component.reset(); };
      this.filter = function () {};
      this.destroy = function () { network.clear(); };
    }

    addSettingsFilmix();

    Lampa.Source.add('filmix', {
        title: 'Filmix',
        object: filmix
    });

})();