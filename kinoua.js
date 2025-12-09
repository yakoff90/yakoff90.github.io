(function(){
    function KinoUA(){}

    KinoUA.prototype.getMain = function(callback){
        fetch('https://kino-ua.info/')
            .then(r => r.text())
            .then(html => this.parseHTML(html, callback))
            .catch(e => { console.error('Kino-UA error:', e); callback([]); });
    };

    KinoUA.prototype.search = function(query, callback){
        fetch('https://kino-ua.info/?s=' + encodeURIComponent(query))
            .then(r => r.text())
            .then(html => this.parseHTML(html, callback))
            .catch(e => { console.error('Kino-UA search error:', e); callback([]); });
    };

    KinoUA.prototype.parseHTML = function(html, callback){
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const cards = doc.querySelectorAll('.movie-item'); // ⚠️ замінити селектор на актуальний
        const results = [];

        cards.forEach(card => {
            const a = card.querySelector('a');
            const title = card.querySelector('.title')?.textContent.trim();
            const img = card.querySelector('img')?.src;
            if(a && title){
                results.push({ title, url: a.href, poster: img || '' });
            }
        });
        callback(results);
    };

    KinoUA.prototype.render = function(){
        const body = $('<div class="kino-ua"><div class="list"></div></div>');
        this.getMain(list => {
            const container = body.find('.list');
            list.forEach(item => {
                const card = $(`<div class="card"><img src="${item.poster}"><div>${item.title}</div></div>`);
                card.on('click', () => Lampa.Platform.open({ url: item.url }));
                container.append(card);
            });
        });
        return body;
    };

    Lampa.Plugin.create({
        title: 'Kino-UA.info',
        component: 'kinoUA',
        type: 'card',
        search: function(query, callback){
            const kino = new KinoUA();
            kino.search(query, callback);
        },
        onCreate: function(){ console.log('Kino-UA plugin started'); },
        onDestroy: function(){ console.log('Kino-UA plugin destroyed'); }
    });

    Lampa.Component.add('kinoUA', {
        render: function(){ return (new KinoUA()).render(); },
        destroy: function(){}
    });
})();
