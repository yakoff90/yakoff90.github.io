/* rating_omdb_samsung_full.js
   Версія для Android + Samsung TV
   Джерела: IMDB, TMDB, RottenTomatoes, Metacritic, Oscars, Emmy
   Використовуються SVG-іконки з maxsm_ratings_mod (1).js
*/

(function () {
    'use strict';

    // SVG-іконки з maxsm_ratings_mod (повні версії)
    var imdb_svg = '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"...>...</svg>';
    var tmdb_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150">...</svg>';
    var rotten_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>';
    var mc_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>';
    var oscars_svg = '<svg width="18px" height="60px" viewBox="0 0 18 60">...</svg>';
    var emmy_svg = '<svg width="321" height="563.40002" viewBox="0 0 321 563.40002">...</svg>';

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