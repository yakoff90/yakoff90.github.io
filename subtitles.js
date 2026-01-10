// Мінімальний плагін субтитрів для Samsung TV
(function() {
    console.log('[Subs] Завантаження...');
    
    function addSubtitles() {
        try {
            const activity = Lampa.Activity.active();
            const playdata = Lampa.Player.playdata();
            const movie = activity?.movie;
            
            if (!movie || !movie.imdb_id || !playdata) return;
            
            const imdb = movie.imdb_id;
            const isSeries = !!movie.first_air_date;
            
            let url;
            if (isSeries && playdata.season && playdata.episode) {
                url = `https://opensubtitles-v3.strem.io/subtitles/series/${imdb}:${playdata.season}:${playdata.episode}.json`;
            } else {
                url = `https://opensubtitles-v3.strem.io/subtitles/movie/${imdb}.json`;
            }
            
            fetch(url)
                .then(r => r.json())
                .then(data => {
                    const subs = data.subtitles || [];
                    if (subs.length === 0) return;
                    
                    const langMap = {
                        'eng': 'Англійські',
                        'ukr': 'Українські', 
                        'rus': 'Російські'
                    };
                    
                    const formatted = subs
                        .filter(s => s.url && langMap[s.lang])
                        .map(s => ({
                            lang: s.lang,
                            url: s.url,
                            label: langMap[s.lang]
                        }));
                    
                    if (formatted.length > 0) {
                        // Додаємо тільки якщо їх ще немає
                        const current = playdata.subtitles || [];
                        formatted.forEach(newSub => {
                            if (!current.find(c => c.url === newSub.url)) {
                                current.push(newSub);
                            }
                        });
                        
                        Lampa.Player.subtitles(current, 0);
                        console.log('[Subs] Додано:', formatted.length);
                    }
                });
        } catch(e) {
            console.warn('[Subs] Помилка:', e);
        }
    }
    
    // Чекаємо Lampa
    function init() {
        if (window.Lampa && Lampa.Player) {
            Lampa.Player.listener.follow('start', () => {
                setTimeout(addSubtitles, 1500);
            });
            console.log('[Subs] Готово');
        } else {
            setTimeout(init, 300);
        }
    }
    
    init();
})();
