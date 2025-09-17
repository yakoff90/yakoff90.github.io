
(function () {
    "use strict";

    function uaFlix() {
        let base = "https://uaflix-api.vercel.app"; // приклад API, треба перевірити актуальний

        function search(query, callback) {
            let url = base + "/search?query=" + encodeURIComponent(query);

            fetch(url)
                .then(r => r.json())
                .then(json => {
                    let results = [];

                    (json.results || []).forEach(item => {
                        results.push({
                            title: item.title,
                            original_title: item.original_title || item.title,
                            poster: item.poster || "",
                            year: item.year || "",
                            description: item.overview || "",
                            id: item.id,
                            url: base + "/movie/" + item.id
                        });
                    });

                    callback(results);
                })
                .catch(e => {
                    console.error("UAFlix search error:", e);
                    callback([]);
                });
        }

        function getDetails(item, callback) {
            fetch(item.url)
                .then(r => r.json())
                .then(json => {
                    let links = [];

                    (json.videos || []).forEach(v => {
                        links.push({
                            title: v.name || "Дивитися",
                            url: v.url,
                            quality: v.quality || "HD"
                        });
                    });

                    callback({
                        title: json.title,
                        description: json.overview,
                        poster: json.poster,
                        links: links
                    });
                })
                .catch(e => {
                    console.error("UAFlix details error:", e);
                    callback(null);
                });
        }

        return {
            search: search,
            getDetails: getDetails
        };
    }

    window.plugin_uaflix = uaFlix();

})();
