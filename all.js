(function () {
  "use strict";

  var timer = setInterval(function () {
    if (typeof Lampa !== "undefined") {
      clearInterval(timer);

      Lampa.Utils.putScriptAsync(
        [

          "http://wtch.ch/m", //Онлайн без преміум
          "https://lampame.github.io/main/bo.js", // Бандера Онлайн
          
          "https://ipavlin98.github.io/lmp-plugins/cardify.js",
          "https://tvigl.github.io/plugins/quality.js",
          "https://yakoff90.github.io/QLT.js",
          "https://mylampa1.github.io/buttons.js",
          "https://ko31k.github.io/LMP/plugins/rtg.js",
          "https://yakoff90.github.io/StudiosLogo.js",
          // "https://вашепосилання",
          // "https://вашепосилання",
          // "https://вашепосилання",
          // "https://вашепосилання",

          //"https://вашепосилання",

          // "https://вашепосилання",
          // "https://вашепосилання",
          // "https://вашепосилання,

        // "https://вашепосилання",

         // "http://вашепосилання",

         // "https://вашепосилання",

          "https://icantrytodo.github.io/lampa/torrent_styles_v2.js", //стиль торентів може конфліктувати з іншими стилями
          "https://darkestclouds.github.io/plugins/easytorrent/easytorrent.min.js", //рекомендація торрентів
         // "https://вашепосилання",

          
        ],
        function () {},
      );
    }
  }, 200);
})();
