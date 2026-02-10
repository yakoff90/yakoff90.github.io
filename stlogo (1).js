(function () {
  'use strict';

  var pluginPath = 'https://crowley38.github.io/Icons/';
  var TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/h30';

  function getStudioLogos(movie) {
    var html = '';
    if (movie && movie.production_companies) {
      movie.production_companies.forEach(function(co) {
        if (co.logo_path) {
          html += '<div class="studio-logo-badge" style="margin-right: 12px; display: inline-block; vertical-align: middle;">' +
                    '<img src="' + TMDB_IMAGE_URL + co.logo_path + '" title="' + co.name + '" style="filter: brightness(0) invert(1); opacity: 0.9; height: 1.8em; width: auto; margin-top: -2px;">' +
                  '</div>';
        }
      });
    }
    return html;
  }

  Lampa.Listener.follow('full', function(e) {
    if (e.type !== 'complite') return;
    var details = $('.full-start-new__details');
    if (details.length) {
        if (!$('.studio-logos-container').length) details.after('<div class="studio-logos-container"></div>');
        
        var studioHtml = getStudioLogos(e.data.movie);
        $('.studio-logos-container').html(studioHtml);
    }
  });

  var style = '<style>\
    .studio-logos-container { \
      display: flex; \
      align-items: center; \
      gap: 0.8em; \
      margin: 0.8em 0; \
      min-height: 2em; \
      flex-wrap: wrap; \
    }\
    .studio-logo-badge { \
      height: 1.8em; \
      opacity: 0; \
      transform: translateY(8px); \
      animation: studio_logo_in 0.4s ease forwards; \
      display: flex; \
      align-items: center; \
    }\
    @keyframes studio_logo_in { \
      to { \
        opacity: 1; \
        transform: translateY(0); \
      } \
    }\
    .studio-logo-badge img { \
      height: 100%; \
      width: auto; \
      display: block; \
    }\
  </style>';
  $('body').append(style);

})();