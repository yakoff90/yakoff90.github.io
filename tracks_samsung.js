(function () {
  'use strict';

  var connect_host = 'http://kinoxa.click';

  function reguest(params, callback) {
    var net = new Lampa.Reguest();
    net.timeout(15000);
    var url = connect_host + '/ffprobe?media=' + encodeURIComponent(params.url);

    var email = Lampa.Storage.get('account_email');
    if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));

    var uid = Lampa.Storage.get('lampac_unic_id', Lampa.Utils.uid(8));
    Lampa.Storage.set('lampac_unic_id', uid);
    url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));

    net.native(url, function (str) {
      try {
        var json = JSON.parse(str);
        if (json.streams) callback(json);
      } catch (e) {
        console.error('Tracks parse error:', e);
      }
    }, false, false, { dataType: 'text' });
  }

  function subscribeTracks(data) {
    var inited_parse = null;
    var platform = Lampa.Platform.get();

    function log() {
      console.log.apply(console.log, arguments);
    }

    function reguestAndSet() {
      reguest(data, function (result) {
        inited_parse = result;
        if (!result.streams) return;

        var audioTracks = result.streams.filter(a => a.codec_type === 'audio' && a.tags);
        var subTracks = result.streams.filter(a => a.codec_type === 'subtitle' && a.tags);

        if (audioTracks.length) {
          var audioList = audioTracks.map((track, i) => ({
            index: i,
            language: track.tags.language || 'und',
            label: track.tags.title || track.tags.handler_name || ('Audio ' + (i + 1)),
            selected: i === 0,
            ghost: false
          }));
          Lampa.PlayerPanel.setTracks(audioList);
          log('Samsung', 'Audio tracks applied:', audioList);
        }

        if (subTracks.length) {
          var subsList = subTracks.map((track, i) => ({
            index: i,
            language: track.tags.language || 'und',
            label: track.tags.title || track.tags.handler_name || ('Sub ' + (i + 1)),
            selected: false,
            ghost: false
          }));
          Lampa.PlayerPanel.setSubs(subsList);
          log('Samsung', 'Subtitle tracks applied:', subsList);
        }
      });
    }

    if (platform === 'tizen' || platform === 'orsay' || platform === 'samsung') {
      Lampa.PlayerVideo.listener.follow('canplay', function ready() {
        log('Samsung', 'Video canplay — tracks init');
        reguestAndSet();
        Lampa.PlayerVideo.listener.remove('canplay', ready);
      });
    } else {
      Lampa.PlayerVideo.listener.follow('canplay', function ready() {
        reguestAndSet();
        Lampa.PlayerVideo.listener.remove('canplay', ready);
      });
    }

    Lampa.Player.listener.follow('destroy', function () {
      inited_parse = null;
    });
  }

  Lampa.Player.listener.follow('start', function (data) {
    if (data.torrent_hash) subscribeTracks(data);
  });
})();