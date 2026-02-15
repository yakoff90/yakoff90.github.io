(function () {
  'use strict';

  var pluginPath = 'https://crowley38.github.io/Icons/';
  var TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/h30';

  function getStudioLogos(movie) {
    var html = '';
    if (movie && movie.production_companies) {
      movie.production_companies.forEach(function(co) {
        if (co.logo_path) {
          html += '<div class="studio-logo-badge selector" data-id="' + co.id + '" data-name="' + co.name + '" style="display: inline-flex; vertical-align: middle; margin-right: 6px; cursor: pointer; align-items: center; justify-content: center;">' +
                    '<img src="' + TMDB_IMAGE_URL + co.logo_path + '" title="' + co.name + '" style="filter: brightness(0) invert(1); opacity: 0.9; height: 1.8em; width: auto; display: block;">' +
                  '</div>';
        }
      });
    }
    return html;
  }

  Lampa.Listener.follow('full', function(e) {
    if (e.type !== 'complite') return;
    
    var renderTarget = e.object.activity.render();
    var rateLine = $('.full-start-new__rate-line', renderTarget);
    
    if (rateLine.length) {
        var cont = $('.studio-logos-container', renderTarget);
        if (!cont.length) { 
            cont = $('<div class="studio-logos-container"></div>'); 
            rateLine.append(cont); 
        }
        cont.html(getStudioLogos(e.data.movie));
        
        $('.studio-logo-badge', renderTarget).on('hover:enter', function () {
            var id = $(this).data('id');
            var name = $(this).data('name');
            if (id) {
                Lampa.Activity.push({
                    url: 'movie',
                    id: id,
                    title: name,
                    component: 'company',
                    source: 'tmdb',
                    page: 1
                });
            }
        });
    }
  });

  $('body').append('<style>\
    .full-start-new__rate-line { display: flex !important; flex-wrap: wrap !important; align-items: center !important; gap: 8px !important; }\
    .studio-logos-container { \
        display: inline-flex; \
        vertical-align: middle; \
        margin-left: 4px; \
        gap: 6px; \
        align-items: center; \
    }\
    .studio-logo-badge { \
      opacity: 0; \
      transform: translateY(8px); \
      animation: studio_logo_in 0.4s ease forwards; \
      display: inline-flex; \
      align-items: center; \
      justify-content: center; \
      transition: all 0.2s ease; \
      border: 1px solid transparent; \
      border-radius: 6px; \
      padding: 4px; \
    }\
    .studio-logo-badge.focus { \
      background: rgba(255,255,255,0.2) !important; \
      border: 1px solid #fff; \
      transform: scale(1.05); \
    }\
    @keyframes studio_logo_in { \
      to { \
        opacity: 1; \
        transform: translateY(0); \
      } \
    }\
    .studio-logo-badge img { \
      height: 1.8em; \
      width: auto; \
      display: block; \
    }\
  </style>');

})();
