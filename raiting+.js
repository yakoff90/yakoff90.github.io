
// ==UserScript==
// @name         UAKino + eneyida + kinoukr (full version)
// @version      1.0
// @description  Повноцінний плагін для Lampa: підтримка фільмів, серіалів, плеєра, описів
// ==/UserScript==

(function () {
  if (!window.lampa_plugin_online) return;

  window.lampa_plugin_online.push({
    name: 'UAKino',
    show: true,
    url: 'https://uakino.me/',
    search: async function(title, original_title, year) {
      const query = encodeURIComponent(title);
      const searchUrl = `https://uakino.me/index.php?do=search&subaction=search&story=${query}`;
      const html = await Lampa.Utils.request(searchUrl, 'text');
      const dom = $('<div>' + html + '</div>');
      const items = [];

      dom.find('.shortstory').each((i, el) => {
        const item = $(el);
        const href = item.find('a.shortstory__img-link').attr('href');
        const name = item.find('.shortstory__title').text().trim();
        const yearMatch = name.match(/\((\d{4})\)/);
        const yearText = yearMatch ? parseInt(yearMatch[1]) : 0;
        const img = item.find('.shortstory__img img').attr('src') || '';
        if (href) {
          items.push({
            title: name,
            year: yearText,
            url: href,
            poster: img,
            original_title: name,
            method: 'call'
          });
        }
      });

      return items;
    },
    get: async function(url) {
      const html = await Lampa.Utils.request(url, 'text');
      const matches = [...html.matchAll(/<iframe[^>]+(data-src|src)="([^"]+)"/gi)];
      const videos = matches.map(m => ({
        title: 'Плеєр',
        url: m[2],
        method: 'play'
      }));
      return videos.length ? videos : [{
        title: 'Не знайдено плеєр',
        url: '',
        method: 'iframe'
      }];
    }
  });

  // eneyida
  window.lampa_plugin_online.push({
    name: 'eneyida',
    show: true,
    url: 'https://www.eneyida.tv/',
    search: function(title, original_title, year) {
      return Lampa.Utils.request(`https://lampa-api.cinemate.cc/eneyida/search?title=${encodeURIComponent(title)}&year=${year}`, 'json');
    },
    get: function(url) {
      return Lampa.Utils.request(url, 'json');
    }
  });

  // kinoukr
  window.lampa_plugin_online.push({
    name: 'kinoukr',
    show: true,
    url: 'https://kinoukr.com/',
    search: function(title, original_title, year) {
      return Lampa.Utils.request(`https://lampa-api.cinemate.cc/kinoukr/search?title=${encodeURIComponent(title)}&year=${year}`, 'json');
    },
    get: function(url) {
      return Lampa.Utils.request(url, 'json');
    }
  });
})();
