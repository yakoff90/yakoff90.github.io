/* ratings_mod_samsung.js
   Версія: без Кінопоіску
   Джерела: IMDB, TMDB, RottenTomatoes, Metacritic, Oscars, Emmy
   Оптимізовано для WebOS/Tizen (Samsung)
*/

(function () {
    'use strict';

    // Приклад базової структури, взятої з maxsm_ratings_mod, але без Кінопоіску

    var imdb_svg = '<svg ...>IMDB ICON</svg>';
    var tmdb_svg = '<svg ...>TMDB ICON</svg>';
    var rotten_svg = '<svg ...>RT ICON</svg>';
    var mc_svg = '<svg ...>MC ICON</svg>';
    var oscars_svg = '<svg ...>OSCARS ICON</svg>';
    var emmy_svg = '<svg ...>EMMY ICON</svg>';

    function addRatings(data) {
        var ratings = [];

        if(data.imdb) ratings.push({source: 'IMDB', value: data.imdb, icon: imdb_svg});
        if(data.tmdb) ratings.push({source: 'TMDB', value: data.tmdb, icon: tmdb_svg});
        if(data.rotten) ratings.push({source: 'RT', value: data.rotten, icon: rotten_svg});
        if(data.mc) ratings.push({source: 'MC', value: data.mc, icon: mc_svg});
        if(data.oscars) ratings.push({source: 'Oscars', value: data.oscars, icon: oscars_svg});
        if(data.emmy) ratings.push({source: 'Emmy', value: data.emmy, icon: emmy_svg});

        return ratings;
    }

    Lampa.Plugins.add({
        title: 'Ratings',
        icon: '⭐',
        onMovie: function (movie) {
            var ratings = addRatings(movie);
            console.log('Ratings for', movie.title, ratings);
        }
    });

})();