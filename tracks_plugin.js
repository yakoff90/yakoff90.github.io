(function() {
    var plugin = {
        name: "Tracks",
        description: "Замена названий аудиодорожек и субтитров для удобства выбора.",
        icon: "🎵",
        category: "Торренты",
        status: "Активен",
        status_icon: "✅",
        status_description: "Замена названий дорожек и субтитров",
        url_plugin: "http://cub.red/plugin/tracks",
        features: [
            { icon: "🎵", title: "Переименование дорожек", description: "Удобное отображение названий аудиодорожек" },
            { icon: "📝", title: "Переименование субтитров", description: "Понятные названия для субтитров" },
            { icon: "⚡", title: "Быстрый выбор", description: "Ускоряет выбор нужной дорожки или субтитра" }
        ],
        requirements: [
            "Lampa версии 1.8.0 или выше"
        ],
        notes: [
            "Полезен для мультиязычных фильмов",
            "Упрощает навигацию по дорожкам"
        ],
        init: function() {
            console.log("Плагин Tracks загружен и готов к работе!");
            // Тут можна додати функціонал заміни назв аудіо та субтитрів
        }
    };

    if(typeof window.Lampa !== "undefined") {
        Lampa.plugins = Lampa.plugins || [];
        Lampa.plugins.push(plugin);
        plugin.init();
    }
})();
