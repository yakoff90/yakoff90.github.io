(function () {
    'use strict';

    const APPLECATION_VERSION = '1.1.5';

    // Иконка плагина
    const PLUGIN_ICON = '<svg viewBox="110 90 180 210"xmlns=http://www.w3.org/2000/svg><g id=sphere><circle cx=200 cy=140 fill="hsl(200, 80%, 40%)"opacity=0.3 r=1.2 /><circle cx=230 cy=150 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=170 cy=155 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=245 cy=175 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=155 cy=180 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=215 cy=165 fill="hsl(200, 80%, 46%)"opacity=0.36 r=1.2 /><circle cx=185 cy=170 fill="hsl(200, 80%, 43%)"opacity=0.33 r=1.3 /><circle cx=260 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=140 cy=200 fill="hsl(200, 80%, 50%)"opacity=0.4 r=1.5 /><circle cx=250 cy=220 fill="hsl(200, 80%, 48%)"opacity=0.38 r=1.4 /><circle cx=150 cy=225 fill="hsl(200, 80%, 47%)"opacity=0.37 r=1.4 /><circle cx=235 cy=240 fill="hsl(200, 80%, 45%)"opacity=0.35 r=1.3 /><circle cx=165 cy=245 fill="hsl(200, 80%, 44%)"opacity=0.34 r=1.3 /><circle cx=220 cy=255 fill="hsl(200, 80%, 42%)"opacity=0.32 r=1.2 /><circle cx=180 cy=258 fill="hsl(200, 80%, 41%)"opacity=0.31 r=1.2 /><circle cx=200 cy=120 fill="hsl(200, 80%, 60%)"opacity=0.5 r=1.8 /><circle cx=240 cy=135 fill="hsl(200, 80%, 65%)"opacity=0.55 r=2 /><circle cx=160 cy=140 fill="hsl(200, 80%, 62%)"opacity=0.52 r=1.9 /><circle cx=270 cy=165 fill="hsl(200, 80%, 70%)"opacity=0.6 r=2.2 /><circle cx=130 cy=170 fill="hsl(200, 80%, 67%)"opacity=0.57 r=2.1 /><circle cx=255 cy=190 fill="hsl(200, 80%, 72%)"opacity=0.62 r=2.3 /><circle cx=145 cy=195 fill="hsl(200, 80%, 69%)"opacity=0.59 r=2.2 /><circle cx=280 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=120 cy=200 fill="hsl(200, 80%, 75%)"opacity=0.65 r=2.5 /><circle cx=275 cy=215 fill="hsl(200, 80%, 73%)"opacity=0.63 r=2.4 /><circle cx=125 cy=220 fill="hsl(200, 80%, 71%)"opacity=0.61 r=2.3 /><circle cx=260 cy=235 fill="hsl(200, 80%, 68%)"opacity=0.58 r=2.2 /><circle cx=140 cy=240 fill="hsl(200, 80%, 66%)"opacity=0.56 r=2.1 /><circle cx=245 cy=255 fill="hsl(200, 80%, 63%)"opacity=0.53 r=2 /><circle cx=155 cy=260 fill="hsl(200, 80%, 61%)"opacity=0.51 r=1.9 /><circle cx=225 cy=270 fill="hsl(200, 80%, 58%)"opacity=0.48 r=1.8 /><circle cx=175 cy=272 fill="hsl(200, 80%, 56%)"opacity=0.46 r=1.7 /><circle cx=200 cy=100 fill="hsl(200, 80%, 85%)"opacity=0.8 r=2.8 /><circle cx=230 cy=115 fill="hsl(200, 80%, 90%)"opacity=0.85 r=3 /><circle cx=170 cy=120 fill="hsl(200, 80%, 87%)"opacity=0.82 r=2.9 /><circle cx=250 cy=140 fill="hsl(200, 80%, 92%)"opacity=0.88 r=3.2 /><circle cx=150 cy=145 fill="hsl(200, 80%, 89%)"opacity=0.84 r=3.1 /><circle cx=265 cy=170 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.4 /><circle cx=135 cy=175 fill="hsl(200, 80%, 93%)"opacity=0.87 r=3.3 /><circle cx=275 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=125 cy=200 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.5 /><circle cx=200 cy=200 fill="hsl(200, 80%, 100%)"opacity=1 r=4 /><circle cx=220 cy=195 fill="hsl(200, 80%, 98%)"opacity=0.95 r=3.8 /><circle cx=180 cy=205 fill="hsl(200, 80%, 97%)"opacity=0.93 r=3.7 /><circle cx=240 cy=210 fill="hsl(200, 80%, 96%)"opacity=0.92 r=3.6 /><circle cx=160 cy=215 fill="hsl(200, 80%, 95%)"opacity=0.9 r=3.5 /><circle cx=270 cy=230 fill="hsl(200, 80%, 94%)"opacity=0.88 r=3.4 /><circle cx=130 cy=235 fill="hsl(200, 80%, 92%)"opacity=0.86 r=3.3 /><circle cx=255 cy=250 fill="hsl(200, 80%, 90%)"opacity=0.84 r=3.2 /><circle cx=145 cy=255 fill="hsl(200, 80%, 88%)"opacity=0.82 r=3.1 /><circle cx=235 cy=265 fill="hsl(200, 80%, 86%)"opacity=0.8 r=3 /><circle cx=165 cy=268 fill="hsl(200, 80%, 84%)"opacity=0.78 r=2.9 /><circle cx=215 cy=280 fill="hsl(200, 80%, 82%)"opacity=0.76 r=2.8 /><circle cx=185 cy=282 fill="hsl(200, 80%, 80%)"opacity=0.74 r=2.7 /><circle cx=200 cy=290 fill="hsl(200, 80%, 78%)"opacity=0.72 r=2.6 /><circle cx=210 cy=130 fill="hsl(200, 80%, 88%)"opacity=0.83 r=2.5 /><circle cx=190 cy=135 fill="hsl(200, 80%, 86%)"opacity=0.81 r=2.4 /><circle cx=225 cy=155 fill="hsl(200, 80%, 91%)"opacity=0.86 r=2.8 /><circle cx=175 cy=160 fill="hsl(200, 80%, 89%)"opacity=0.84 r=2.7 /><circle cx=245 cy=185 fill="hsl(200, 80%, 94%)"opacity=0.89 r=3.3 /><circle cx=155 cy=190 fill="hsl(200, 80%, 92%)"opacity=0.87 r=3.2 /><circle cx=260 cy=210 fill="hsl(200, 80%, 95%)"opacity=0.91 r=3.4 /><circle cx=140 cy=215 fill="hsl(200, 80%, 93%)"opacity=0.88 r=3.3 /><circle cx=250 cy=230 fill="hsl(200, 80%, 91%)"opacity=0.85 r=3.2 /><circle cx=150 cy=235 fill="hsl(200, 80%, 89%)"opacity=0.83 r=3.1 /><circle cx=230 cy=245 fill="hsl(200, 80%, 87%)"opacity=0.81 r=3 /><circle cx=170 cy=250 fill="hsl(200, 80%, 85%)"opacity=0.79 r=2.9 /><circle cx=210 cy=260 fill="hsl(200, 80%, 83%)"opacity=0.77 r=2.8 /><circle cx=190 cy=265 fill="hsl(200, 80%, 81%)"opacity=0.75 r=2.7 /></g></svg>';

    /**
     * Проверяет, является ли активность все еще активной
     */
    function isAlive(activity) {
        return activity && !activity.__destroyed;
    }

    /**
     * Анализирует качество контента из данных ffprobe
     * Извлекает информацию о разрешении, HDR, Dolby Vision, аудио каналах
     */
    function analyzeContentQuality(ffprobe) {
        if (!ffprobe || !Array.isArray(ffprobe)) return null;

        const quality = {
            resolution: null,
            hdr: false,
            dolbyVision: false,
            audio: null
        };

        // Анализ видео потока
        const video = ffprobe.find(stream => stream.codec_type === 'video');
        if (video) {
            // Разрешение
            if (video.width && video.height) {
                quality.resolution = `${video.width}x${video.height}`;
                
                // Определяем метки качества
                if (video.height >= 2160 || video.width >= 3840) {
                    quality.resolutionLabel = '4K';
                } else if (video.height >= 1440 || video.width >= 2560) {
                    quality.resolutionLabel = '2K';
                } else if (video.height >= 1080 || video.width >= 1920) {
                    quality.resolutionLabel = 'FULL HD';
                } else if (video.height >= 720 || video.width >= 1280) {
                    quality.resolutionLabel = 'HD';
                }
            }

            // HDR определяется через side_data_list или color_transfer
            if (video.side_data_list) {
                const hasMasteringDisplay = video.side_data_list.some(data => 
                    data.side_data_type === 'Mastering display metadata'
                );
                const hasContentLight = video.side_data_list.some(data => 
                    data.side_data_type === 'Content light level metadata'
                );
                const hasDolbyVision = video.side_data_list.some(data => 
                    data.side_data_type === 'DOVI configuration record' ||
                    data.side_data_type === 'Dolby Vision RPU'
                );

                if (hasDolbyVision) {
                    quality.dolbyVision = true;
                    quality.hdr = true;
                } else if (hasMasteringDisplay || hasContentLight) {
                    quality.hdr = true;
                }
            }

            // Альтернативная проверка HDR через color_transfer
            if (!quality.hdr && video.color_transfer) {
                const hdrTransfers = ['smpte2084', 'arib-std-b67'];
                if (hdrTransfers.includes(video.color_transfer.toLowerCase())) {
                    quality.hdr = true;
                }
            }

            // Проверка через codec_name для Dolby Vision
            if (!quality.dolbyVision && video.codec_name) {
                if (video.codec_name.toLowerCase().includes('dovi') || 
                    video.codec_name.toLowerCase().includes('dolby')) {
                    quality.dolbyVision = true;
                    quality.hdr = true;
                }
            }
        }

        // Анализ аудио потоков
        const audioStreams = ffprobe.filter(stream => stream.codec_type === 'audio');
        let maxChannels = 0;
        
        audioStreams.forEach(audio => {
            if (audio.channels && audio.channels > maxChannels) {
                maxChannels = audio.channels;
            }
        });

        // Определяем аудио формат
        if (maxChannels >= 8) {
            quality.audio = '7.1';
        } else if (maxChannels >= 6) {
            quality.audio = '5.1';
        } else if (maxChannels >= 4) {
            quality.audio = '4.0';
        } else if (maxChannels >= 2) {
            quality.audio = '2.0';
        }

        return quality;
    }

    /**
     * Анализирует качество контента при переходе на страницу full
     */
    function analyzeContentQualities(movie, activity) {
        if (!movie || !Lampa.Storage.field('parser_use')) return;

        if (!Lampa.Parser || typeof Lampa.Parser.get !== 'function') {
            return;
        }

        const title = movie.title || movie.name || 'Неизвестно';
        
        // Формируем параметры для парсера
        const year = ((movie.first_air_date || movie.release_date || '0000') + '').slice(0,4);
        const combinations = {
            'df': movie.original_title,
            'df_year': movie.original_title + ' ' + year,
            'df_lg': movie.original_title + ' ' + movie.title,
            'df_lg_year': movie.original_title + ' ' + movie.title + ' ' + year,
            'lg': movie.title,
            'lg_year': movie.title + ' ' + year,
            'lg_df': movie.title + ' ' + movie.original_title,
            'lg_df_year': movie.title + ' ' + movie.original_title + ' ' + year,
        };

        const searchQuery = combinations[Lampa.Storage.field('parse_lang')] || movie.title;

        // Вызываем парсер
        Lampa.Parser.get({
            search: searchQuery,
            movie: movie,
            page: 1
        }, (results) => {
            if (!isAlive(activity)) return;

            if (!results || !results.Results || results.Results.length === 0) return;

            const availableQualities = {
                resolutions: new Set(),
                hdr: new Set(),
                audio: new Set(),
                hasDub: false
            };

            // Анализируем каждый торрент
            results.Results.forEach((torrent) => {
                // Анализируем ffprobe если есть
                if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
                    const quality = analyzeContentQuality(torrent.ffprobe);
                    
                    if (quality) {
                        if (quality.resolutionLabel) {
                            availableQualities.resolutions.add(quality.resolutionLabel);
                        }
                        
                        if (quality.audio) {
                            availableQualities.audio.add(quality.audio);
                        }
                    }

                    // Проверяем наличие русского дубляжа
                    if (!availableQualities.hasDub) {
                        const audioStreams = torrent.ffprobe.filter(stream => stream.codec_type === 'audio' && stream.tags);
                        audioStreams.forEach(audio => {
                            const lang = (audio.tags.language || '').toLowerCase();
                            const title = (audio.tags.title || audio.tags.handler_name || '').toLowerCase();
                            
                            if (lang === 'rus' || lang === 'ru' || lang === 'russian') {
                                if (title.includes('dub') || title.includes('дубляж') || 
                                    title.includes('дублир') || title === 'd') {
                                    availableQualities.hasDub = true;
                                }
                            }
                        });
                    }
                }

                // Анализируем название торрента для HDR/DV
                const titleLower = torrent.Title.toLowerCase();
                
                if (titleLower.includes('dolby vision') || titleLower.includes('dovi') || titleLower.match(/\bdv\b/)) {
                    availableQualities.hdr.add('Dolby Vision');
                }
                if (titleLower.includes('hdr10+')) {
                    availableQualities.hdr.add('HDR10+');
                }
                if (titleLower.includes('hdr10')) {
                    availableQualities.hdr.add('HDR10');
                }
                if (titleLower.includes('hdr')) {
                    availableQualities.hdr.add('HDR');
                }
            });

            // Формируем структурированный объект с качеством
            const qualityInfo = {
                title: title,
                torrents_found: results.Results.length,
                quality: null,
                dv: false,
                hdr: false,
                hdr_type: null,
                sound: null,
                dub: availableQualities.hasDub
            };

            // Разрешение - берем только максимальное
            if (availableQualities.resolutions.size > 0) {
                const resOrder = ['8K', '4K', '2K', 'FULL HD', 'HD'];
                for (const res of resOrder) {
                    if (availableQualities.resolutions.has(res)) {
                        qualityInfo.quality = res;
                        break;
                    }
                }
            }
            
            // Dolby Vision
            if (availableQualities.hdr.has('Dolby Vision')) {
                qualityInfo.dv = true;
                qualityInfo.hdr = true;
            }
            
            // HDR - берем максимальный тип
            if (availableQualities.hdr.size > 0) {
                qualityInfo.hdr = true;
                
                const hdrOrder = ['HDR10+', 'HDR10', 'HDR'];
                for (const hdr of hdrOrder) {
                    if (availableQualities.hdr.has(hdr)) {
                        qualityInfo.hdr_type = hdr;
                        break;
                    }
                }
            }
            
            // Аудио - берем только максимальное
            if (availableQualities.audio.size > 0) {
                const audioOrder = ['7.1', '5.1', '4.0', '2.0'];
                for (const audio of audioOrder) {
                    if (availableQualities.audio.has(audio)) {
                        qualityInfo.sound = audio;
                        break;
                    }
                }
            }

            // Выводим JSON с результатами
            console.log('Applecation', qualityInfo);
            
            // Сохраняем данные в activity для отображения иконок
            if (activity && activity.applecation_quality === undefined) {
                activity.applecation_quality = qualityInfo;
                updateQualityBadges(activity, qualityInfo);
            }
            
        }, (error) => {
            console.log('Applecation', { error: error });
        });
    }

    // Главная функция плагина
    function initializePlugin() {
        console.log('Applecation', 'v' + APPLECATION_VERSION);
        
        patchApiImg();
        addCustomTemplate();
        addOverlayTemplate();
        addStyles();
        addSettings();
        applyLiquidGlassClass();
        attachLogoLoader();
        attachEpisodesCorePatch();
        
        // Инициализация для Samsung TV
        if (Lampa.Platform.screen('tv')) {
            initSamsungTVOptimizations();
        }
    }

    // Оптимизации для Samsung TV
    function initSamsungTVOptimizations() {
        console.log('Applecation: Samsung TV optimizations enabled');
        
        // Уменьшаем анимации для лучшей производительности
        $('body').addClass('applecation-samsung-tv');
        
        // Добавляем обработчик клавиши "Back" для оверлея
        $(document).on('keydown', function(e) {
            // Код 27 = Escape, 10009 = Back на Samsung TV
            if (e.keyCode === 27 || e.keyCode === 10009) {
                const overlay = $('.applecation-description-overlay.show');
                if (overlay.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeDescriptionOverlay();
                    return false;
                }
            }
        });
        
        // Делаем оверлей доступным для навигации с пульта
        Lampa.Listener.follow('full', function(event) {
            if (event.type === 'complite') {
                setTimeout(function() {
                    const overlay = $('.applecation-description-overlay');
                    if (overlay.length && Lampa.Controller) {
                        Lampa.Controller.collectionAppend(overlay.find('.applecation-description-overlay__close'));
                    }
                }, 500);
            }
        });
    }

    /**
     * Патч логики линии эпизодов
     */
    function attachEpisodesCorePatch(){
        try{
            if(window.applecation_episodes_core_patch) return;
            window.applecation_episodes_core_patch = true;

            window.episodes_order_fix = true;
            window.episodes_core_patch = true;

            if(!window.Lampa || !Lampa.Utils || typeof Lampa.Utils.createInstance !== 'function') return;
            if(Lampa.Utils.__applecation_episodes_core_patch_applied) return;
            Lampa.Utils.__applecation_episodes_core_patch_applied = true;

            function looksLikeEpisodesLinePayload(element){
                try{
                    if(!element) return false;
                    if(!element.movie) return false;
                    if(!Array.isArray(element.results) || !element.results.length) return false;

                    var hits = 0;
                    for(var i = 0; i < element.results.length; i++){
                        var r = element.results[i];
                        if(!r) continue;

                        if(typeof r.episode_number === 'number') hits++;
                        if(typeof r.season_number === 'number') hits++;
                        if(r.comeing) hits++;
                        if(r.air_date) hits++;
                    }

                    return hits >= 3;
                }catch(e){
                    return false;
                }
            }

            function normalizeEpisodesResults(element){
                try{
                    var results = element.results || [];

                    var next = [];
                    var list = [];

                    for(var i = 0; i < results.length; i++){
                        var r = results[i];
                        if(!r) continue;

                        if(r.comeing) next.push(r);
                        else list.push(r);
                    }

                    // Сортируем по номеру эпизода
                    list.sort(function(a,b){
                        return (a.episode_number || 0) - (b.episode_number || 0);
                    });

                    element.results = list.concat(next);
                }catch(e){}
            }

            function patchScrollAppendToKeepMoreLast(line){
                try{
                    if(!line || !line.scroll || typeof line.scroll.append !== 'function') return;
                    if(line.__applecation_episodes_scroll_append_patched) return;
                    line.__applecation_episodes_scroll_append_patched = true;

                    var originalAppend = line.scroll.append.bind(line.scroll);

                    line.scroll.append = function(object){
                        var node = object instanceof jQuery ? object[0] : object;

                        if(node && node.classList && node.classList.contains('card-more')){
                            return originalAppend(object);
                        }

                        var body = typeof line.scroll.body === 'function' ? line.scroll.body(true) : null;
                        if(body){
                            var more = body.querySelector('.card-more');
                            if(more && node && node !== more){
                                body.insertBefore(node, more);
                                return;
                            }
                        }

                        return originalAppend(object);
                    };
                }catch(e){}
            }

            function patchLineCreate(line){
                try{
                    if(!line || typeof line.create !== 'function') return;
                    if(line.__applecation_episodes_create_patched) return;
                    line.__applecation_episodes_create_patched = true;

                    var originalCreate = line.create.bind(line);

                    line.create = function(){
                        patchScrollAppendToKeepMoreLast(line);

                        var res = originalCreate();

                        setTimeout(function(){
                            try{
                                var body = line && line.scroll && typeof line.scroll.body === 'function' ? line.scroll.body(true) : null;
                                var more = body ? body.querySelector('.card-more') : null;
                                if(more) more.classList.remove('card-more--first');
                            }catch(e){}
                        }, 0);

                        return res;
                    };
                }catch(e){}
            }

            var original = Lampa.Utils.createInstance;

            Lampa.Utils.createInstance = function(BaseClass, element, add_params, replace){
                var isEpisodesLine = looksLikeEpisodesLinePayload(element);

                var shouldReverse = Lampa.Storage.get('applecation_reverse_episodes', true);

                if(isEpisodesLine && shouldReverse){
                    normalizeEpisodesResults(element);
                }

                var instance = original.call(this, BaseClass, element, add_params, replace);

                if(isEpisodesLine && shouldReverse){
                    patchLineCreate(instance);
                }

                return instance;
            };
        }catch(e){}
    }

    // Переводы для настроек
    const translations = {
        show_ratings: {
            ru: 'Показывать рейтинги',
            en: 'Show ratings',
            uk: 'Показувати рейтинги',
            be: 'Паказваць рэйтынгі',
            bg: 'Показване на рейтинги',
            cs: 'Zobrazit hodnocení',
            he: 'הצג דירוגים',
            pt: 'Mostrar classificações',
            zh: '显示评分'
        },
        show_ratings_desc: {
            ru: 'Отображать рейтинги IMDB и КиноПоиск',
            en: 'Display IMDB and KinoPoisk ratings',
            uk: 'Відображати рейтинги IMDB та КіноПошук',
            be: 'Адлюстроўваць рэйтынгі IMDB і КіноПошук',
            bg: 'Показване на рейтинги IMDB и КиноПоиск',
            cs: 'Zobrazit hodnocení IMDB a KinoPoisk',
            he: 'הצג דירוגי IMDB וקינופויסק',
            pt: 'Exibir classificações IMDB e KinoPoisk',
            zh: '显示 IMDB 和 KinoPoisk 评分'
        },
        show_reactions: {
            ru: 'Показывать реакции Lampa',
            en: 'Show Lampa Reactions',
            uk: 'Показувати реакції Lampa',
            be: 'Паказваць рэакцыі Lampa',
            bg: 'Показване на реакции Lampa',
            cs: 'Zobrazit reakce Lampa',
            he: 'הצג תגובות Lampa',
            pt: 'Mostrar reações Lampa',
            zh: '显示 Lampa 反应'
        },
        show_reactions_desc: {
            ru: 'Отображать блок с реакциями на карточке',
            en: 'Display reactions block on card',
            uk: 'Відображати блок з реакціями на картці',
            be: 'Адлюстроўваць блок з рэакцыямі на картцы',
            bg: 'Показване на блока с реакции на картата',
            cs: 'Zobrazit blok s reakcemi na kartě',
            he: 'הצג בלוק תגובות בכרטיס',
            pt: 'Exibir bloco de reações no cartão',
            zh: '在卡片上显示反应块'
        },
        show_foreign_logo: {
            ru: 'Логотип на английском',
            en: 'No language logo',
            uk: 'Логотип англійською',
            be: 'Лагатып на англійскай',
            bg: 'Лого на английски',
            cs: 'Logo v angličtině',
            he: 'לוגו באנגלית',
            pt: 'Logotipo em inglês',
            zh: '英文徽标'
        },
        show_foreign_logo_desc: {
            ru: 'Показывать логотип на английском языке, если нет на русском',
            en: 'Show no language logo if localized version is missing',
            uk: 'Показувати логотип на англійській мові, якщо немає на українській',
            be: 'Паказваць лагатып на англійскай мове, калі няма на беларускай',
            bg: 'Показване на лого на английски език, ако не е налично на български',
            cs: 'Zobrazit logo v angličtině, pokud není k dispozici v češtině',
            he: 'הצג לוגו באנגלית אם הגרסה המקומית חסרה',
            pt: 'Mostrar logotipo em inglês se a versão localizada estiver ausente',
            zh: '如果本地化版本缺失，则显示英文徽标'
        },
        ratings_position: {
            ru: 'Расположение рейтингов',
            en: 'Ratings position',
            uk: 'Розташування рейтингів',
            be: 'Размяшчэнне рэйтынгаў',
            bg: 'Позиция на рейтингите',
            cs: 'Umístění hodnocení',
            he: 'מיקום דירוגים',
            pt: 'Posição das classificações',
            zh: '评分位置'
        },
        ratings_position_desc: {
            ru: 'Выберите где отображать рейтинги',
            en: 'Choose where to display ratings',
            uk: 'Виберіть де відображати рейтинги',
            be: 'Выберыце дзе адлюстроўваць рэйтынгі',
            bg: 'Изберете къде да се показват рейтингите',
            cs: 'Vyberte, kde zobrazit hodnocení',
            he: 'בחר היכן להציג דירוגים',
            pt: 'Escolha onde exibir classificações',
            zh: '选择评分显示位置'
        },
        position_card: {
            ru: 'В карточке',
            en: 'In card',
            uk: 'У картці',
            be: 'У картцы',
            bg: 'В картата',
            cs: 'Na kartě',
            he: 'בכרטיס',
            pt: 'No cartão',
            zh: '在卡片中'
        },
        position_corner: {
            ru: 'В правом нижнем углу',
            en: 'Bottom right corner',
            uk: 'У правому нижньому куті',
            be: 'У правым ніжнім куце',
            bg: 'В долния десен ъгъл',
            cs: 'V pravém dolním rohu',
            he: 'בפינה הימנית התחתונה',
            pt: 'Canto inferior direito',
            zh: '右下角'
        },
        year_short: {
            ru: ' г.',
            en: '',
            uk: ' р.',
            be: ' г.',
            bg: ' г.',
            cs: '',
            he: '',
            pt: '',
            zh: '年'
        },
        logo_scale: {
            ru: 'Размер логотипа',
            en: 'Logo Size',
            uk: 'Розмір логотипу',
            be: 'Памер лагатыпа',
            bg: 'Размер на логото',
            cs: 'Velikost loga',
            he: 'גודל לוגו',
            pt: 'Tamanho do logotipo',
            zh: '徽标大小'
        },
        logo_scale_desc: {
            ru: 'Масштаб логотипа фильма',
            en: 'Movie logo scale',
            uk: 'Масштаб логотипу фільму',
            be: 'Маштаб лагатыпа фільма',
            bg: 'Мащаб на логото на филма',
            cs: 'Měřítko loga filmu',
            he: 'קנה מידה של לוגו הסרט',
            pt: 'Escala do logotipo do filme',
            zh: '电影徽标比例'
        },
        text_scale: {
            ru: 'Размер текста',
            en: 'Text Size',
            uk: 'Розмір тексту',
            be: 'Памер тэксту',
            bg: 'Размер на текста',
            cs: 'Velikost textu',
            he: 'גודל טקסט',
            pt: 'Tamanho do texto',
            zh: '文本大小'
        },
        text_scale_desc: {
            ru: 'Масштаб текста данных о фильме',
            en: 'Movie data text scale',
            uk: 'Масштаб тексту даних про фільм',
            be: 'Маштаб тэксту даных пра фільм',
            bg: 'Мащаб на текста с данни за филма',
            cs: 'Měřítko textu dat filmu',
            he: 'קנה מידה של טקסט נתוני הסרט',
            pt: 'Escala do texto de dados do filme',
            zh: '电影数据文本比例'
        },
        scale_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням',
            be: 'Па змаўчанні',
            bg: 'По подразбиране',
            cs: 'Výchozí',
            he: 'ברירת מחדל',
            pt: 'Padrão',
            zh: '默认'
        },
        spacing_scale: {
            ru: 'Отступы между строками',
            en: 'Spacing Between Lines',
            uk: 'Відступи між рядками',
            be: 'Адступы паміж радкамі',
            bg: 'Разстояние между редовете',
            cs: 'Mezery mezi řádky',
            he: 'מרווח בין שורות',
            pt: 'Espaçamento entre linhas',
            zh: '行间距'
        },
        spacing_scale_desc: {
            ru: 'Расстояние между элементами информации',
            en: 'Distance between information elements',
            uk: 'Відстань між елементами інформації',
            be: 'Адлегласць паміж элементамі інфармацыі',
            bg: 'Разстояние между информационни елементи',
            cs: 'Vzdálenost mezi informačními prvky',
            he: 'מרחק בין אלמנטי מידע',
            pt: 'Distância entre elementos de informação',
            zh: '信息元素之间的距离'
        },
        settings_title_display: {
            ru: 'Отображение',
            en: 'Display',
            uk: 'Відображення',
            be: 'Адлюстраванне',
            bg: 'Показване',
            cs: 'Zobrazení',
            he: 'תצוגה',
            pt: 'Exibição',
            zh: '显示'
        },
        settings_title_scaling: {
            ru: 'Масштабирование',
            en: 'Scaling',
            uk: 'Масштабування',
            be: 'Маштабаванне',
            bg: 'Мащабиране',
            cs: 'Škálování',
            he: 'קנה מידה',
            pt: 'Dimensionamento',
            zh: '缩放'
        },
        show_episode_count: {
            ru: 'Количество серий',
            en: 'Episode Count',
            uk: 'Кількість серій',
            be: 'Колькасць серый',
            bg: 'Брой епизоди',
            cs: 'Počet epizod',
            he: 'מספר פרקים',
            pt: 'Número de episódios',
            zh: '剧集数量'
        },
        show_episode_count_desc: {
            ru: 'Показывать общее количество серий для сериалов',
            en: 'Show total episode count for TV shows',
            uk: 'Показувати загальну кількість серій для серіалів',
            be: 'Паказваць агульную колькасць серый для серыялаў',
            bg: 'Показване на общия брой епизоди за сериали',
            cs: 'Zobrazit celkový počet epizod u seriálů',
            he: 'הצג את סך כל הפרקים עבור סדרות טלוויזיה',
            pt: 'Mostrar o número total de episódios para séries',
            zh: '显示电视剧的总剧集数'
        },
        reverse_episodes: {
            ru: 'Перевернуть список эпизодов',
            en: 'Reverse Episodes List',
            uk: 'Перевернути список епізодів',
            be: 'Перавярнуць спіс эпізодаў',
            bg: 'Обърни списъка с епизоди',
            cs: 'Obrátit seznam epizod',
            he: 'הפוך את רשימת הפרקים',
            pt: 'Inverter lista de episódios',
            zh: '反转剧集列表'
        },
        reverse_episodes_desc: {
            ru: 'Показывать эпизоды в обратном порядке (от новых к старым)',
            en: 'Show episodes in reverse order (from newest to oldest)',
            uk: 'Показувати епізоди у зворотному порядку (від нових до старих)',
            be: 'Паказваць эпізоды ў адваротным парадку (ад новых да старых)',
            bg: 'Показване на епизоди в обратен ред (от нови към стари)',
            cs: 'Zobrazit epizody v opačném pořadí (od nejnovějších po nejstarší)',
            he: 'הצג פרקים בסדר הפוך (מהחדש לישן)',
            pt: 'Mostrar episódios em ordem inversa (do mais novo ao mais antigo)',
            zh: '以相反顺序显示剧集（从新到旧）'
        },
        description_overlay: {
            ru: 'Описание в оверлее',
            en: 'Description in Overlay',
            uk: 'Опис в оверлеї',
            be: 'Апісанне ў аверлеі',
            bg: 'Описание в овърлей',
            cs: 'Popis v překryvné vrstvě',
            he: 'תיאור בשכבת על',
            pt: 'Descrição em sobreposição',
            zh: '叠加层中的描述'
        },
        description_overlay_desc: {
            ru: 'Показывать описание в отдельном окне при нажатии',
            en: 'Show description in a separate window when clicked',
            uk: 'Показувати опис в окремому вікні при натисканні',
            be: 'Паказваць апісанне ў асобным акне пры націску',
            bg: 'Показване на описанието в отделен прозорец при щракване',
            cs: 'Při kliknutí zobrazit popis v samostatném okně',
            he: 'הצג תיאור בחלון נפרד בעת לחיצה',
            pt: 'Mostrar descrição em uma janela separada quando clicado',
            zh: '点击时在单独的窗口中显示描述'
        },
        liquid_glass: {
            ru: 'Жидкое стекло',
            en: 'Liquid Glass',
            uk: 'Рідке скло',
            be: 'Вадкае шкло',
            bg: 'Течно стъкло',
            cs: 'Tekuté sklo',
            he: 'זכוכית נוזלית',
            pt: 'Vidro Líquido',
            zh: '液体玻璃'
        },
        liquid_glass_desc: {
            ru: 'Эффект «стеклянных» карточек при наведении в эпизодах и актерах',
            en: '"Glassy" card effect on focus in episodes and cast',
            uk: 'Ефект «скляних» карток при наведенні в епізодах та акторах',
            be: 'Эфект «шкляных» картак пры навядзенні ў эпизодах і акцёрах',
            bg: 'Ефект „стъклени“ карти при фокус в епизодите и актьорите',
            cs: 'Efekt "skleněných" karet při zaměření v epizodách a obsazení',
            he: 'אפקט כרטיסי "זכוכית" במיקוד בפרקים ובשחקנים',
            pt: 'Efeito de cartões "vítreos" em foco nos episódios e elenco',
            zh: '剧集和演员表中聚焦时的"玻璃"卡片效果'
        },
        about_author: {
            ru: 'Автор',
            en: 'Author',
            uk: 'Автор',
            be: 'Аўтар',
            bg: 'Автор',
            cs: 'Autor',
            he: 'מחבר',
            pt: 'Autor',
            zh: '作者'
        },
        about_description: {
            ru: 'Делает интерфейс в карточке фильма похожим на Apple TV и оптимизирует под 4K',
            en: 'Makes the movie card interface look like Apple TV and optimizes for 4K',
            uk: 'Робить інтерфейс у картці фільму схожим на Apple TV та оптимізує під 4K',
            be: 'Робіць інтэрфейс у картцы фільма падобным на Apple TV і аптымізуе пад 4K',
            bg: 'Прави интерфейса в картата на филма подобен на Apple TV и оптимизира за 4K',
            cs: 'Vytváří rozhraní karty filmu podobné Apple TV a optimalizuje pro 4K',
            he: 'הופך את ממשק כרטיס הסרט לדומה ל-Apple TV ומבצע אופטימיזציה ל-4K',
            pt: 'Torna a interface do cartão do filme semelhante à Apple TV e otimiza para 4K',
            zh: '使电影卡片界面看起来像 Apple TV 并针对 4K 进行优化'
        }
    };

    function t(key) {
        const lang = Lampa.Storage.get('language', 'ru');
        return translations[key] && translations[key][lang] || translations[key].ru;
    }

    // Применяем класс для управления эффектом жидкого стекла
    function applyLiquidGlassClass() {
        if (Lampa.Storage.get('applecation_liquid_glass', true)) {
            $('body').removeClass('applecation--no-liquid-glass');
        } else {
            $('body').addClass('applecation--no-liquid-glass');
        }
    }

    // Добавляем настройки плагина
    function addSettings() {
        // Инициализируем значения по умолчанию
        if (Lampa.Storage.get('applecation_show_ratings') === undefined) {
            Lampa.Storage.set('applecation_show_ratings', false);
        }
        if (Lampa.Storage.get('applecation_ratings_position') === undefined) {
            Lampa.Storage.set('applecation_ratings_position', 'card');
        }
        if (Lampa.Storage.get('applecation_logo_scale') === undefined) {
            Lampa.Storage.set('applecation_logo_scale', '100');
        }
        if (Lampa.Storage.get('applecation_text_scale') === undefined) {
            Lampa.Storage.set('applecation_text_scale', '100');
        }
        if (Lampa.Storage.get('applecation_spacing_scale') === undefined) {
            Lampa.Storage.set('applecation_spacing_scale', '100');
        }
        if (Lampa.Storage.get('applecation_reverse_episodes') === undefined) {
            Lampa.Storage.set('applecation_reverse_episodes', true);
        }
        if (Lampa.Storage.get('applecation_description_overlay') === undefined) {
            Lampa.Storage.set('applecation_description_overlay', true);
        }
        if (Lampa.Storage.get('applecation_show_foreign_logo') === undefined) {
            Lampa.Storage.set('applecation_show_foreign_logo', true);
        }
        if (Lampa.Storage.get('applecation_liquid_glass') === undefined) {
            Lampa.Storage.set('applecation_liquid_glass', true);
        }
        if (Lampa.Storage.get('applecation_show_episode_count') === undefined) {
            Lampa.Storage.set('applecation_show_episode_count', false);
        }

        // Создаем раздел настроек
        Lampa.SettingsApi.addComponent({
            component: 'applecation_settings',
            name: 'Applecation',
            icon: PLUGIN_ICON
        });
        
        // Добавляем информацию о плагине
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_about',
                type: 'static'
            },
            field: {
                name: '<div>Applecation v' + APPLECATION_VERSION + '</div>'
            },
            onRender: function(item) {
                item.css('opacity', '0.7');
                item.find('.settings-param__name').css({
                    'font-size': '1.2em',
                    'margin-bottom': '0.3em'
                });
                item.append('<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">' + t('about_author') + ': DarkestClouds<br>' + t('about_description') + '</div>');
            }
        });

        // Заголовок: Отображение
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_display_title',
                type: 'title'
            },
            field: {
                name: t('settings_title_display')
            }
        });

        // Показывать рейтинги (ОТКЛЮЧЕНО по умолчанию)
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_show_ratings',
                type: 'trigger',
                default: false
            },
            field: {
                name: t('show_ratings'),
                description: t('show_ratings_desc')
            },
            onChange: function(value) {
                if (value) {
                    $('body').removeClass('applecation--hide-ratings');
                } else {
                    $('body').addClass('applecation--hide-ratings');
                }
            }
        });

        // Расположение рейтингов (оставлено для совместимости)
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_ratings_position',
                type: 'select',
                values: {
                    card: t('position_card'),
                    corner: t('position_corner')
                },
                default: 'card'
            },
            field: {
                name: t('ratings_position'),
                description: t('ratings_position_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_ratings_position', value);
                $('body').removeClass('applecation--ratings-card applecation--ratings-corner');
                $('body').addClass('applecation--ratings-' + value);
                addCustomTemplate();
                Lampa.Activity.back();
            }
        });

        // Показывать реакции (дефолтная настройка Lampa)
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'card_interfice_reactions',
                type: 'trigger',
                default: true
            },
            field: {
                name: t('show_reactions'),
                description: t('show_reactions_desc')
            }
        });

        // Показывать логотип на другом языке
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_show_foreign_logo',
                type: 'trigger',
                default: true
            },
            field: {
                name: t('show_foreign_logo'),
                description: t('show_foreign_logo_desc')
            }
        });

        // Перевернуть список эпизодов
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_reverse_episodes',
                type: 'trigger',
                default: true
            },
            field: {
                name: t('reverse_episodes'),
                description: t('reverse_episodes_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_reverse_episodes', value);
            }
        });

        // Описание в оверлее
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_description_overlay',
                type: 'trigger',
                default: true
            },
            field: {
                name: t('description_overlay'),
                description: t('description_overlay_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_description_overlay', value);
            }
        });

        // Количество серий
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_show_episode_count',
                type: 'trigger',
                default: false
            },
            field: {
                name: t('show_episode_count'),
                description: t('show_episode_count_desc')
            }
        });

        // Жидкое стекло
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_liquid_glass',
                type: 'trigger',
                default: true
            },
            field: {
                name: t('liquid_glass'),
                description: t('liquid_glass_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_liquid_glass', value);
                applyLiquidGlassClass();
            }
        });

        // Заголовок: Масштабирование
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_scaling_title',
                type: 'title'
            },
            field: {
                name: t('settings_title_scaling')
            }
        });

        // Размер логотипа - ИСПРАВЛЕНО
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_logo_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': t('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%'
                },
                default: '100'
            },
            field: {
                name: t('logo_scale'),
                description: t('logo_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_logo_scale', value);
                applyScales();
            }
        });

        // Размер текста
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_text_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': t('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%'
                },
                default: '100'
            },
            field: {
                name: t('text_scale'),
                description: t('text_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_text_scale', value);
                applyScales();
            }
        });

        // Отступы между строками
        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_spacing_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': t('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%',
                    '200': '200%',
                    '250': '250%',
                    '300': '300%'
                },
                default: '100'
            },
            field: {
                name: t('spacing_scale'),
                description: t('spacing_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('applecation_spacing_scale', value);
                applyScales();
            }
        });

        // Применяем текущие настройки
        $('body').addClass('applecation--hide-ratings'); // Всегда скрываем рейтинги
        $('body').addClass('applecation--ratings-' + Lampa.Storage.get('applecation_ratings_position', 'card'));
        applyScales();
    }

    // Применяем масштабирование контента - ИСПРАВЛЕНО
    function applyScales() {
        const logoScale = parseInt(Lampa.Storage.get('applecation_logo_scale', '100'));
        const textScale = parseInt(Lampa.Storage.get('applecation_text_scale', '100'));
        const spacingScale = parseInt(Lampa.Storage.get('applecation_spacing_scale', '100'));

        // Удаляем старые стили если есть
        $('style[data-id="applecation_scales"]').remove();

        // Базовые значения
        const baseLogoWidth = 35; // vw
        const baseLogoHeight = 180; // px
        const baseTextWidth = 35; // vw

        // Рассчитываем новые значения
        const logoWidth = (baseLogoWidth * logoScale / 100);
        const logoHeight = (baseLogoHeight * logoScale / 100);
        const textWidth = (baseTextWidth * textScale / 100);

        // Создаем новые стили
        const scaleStyles = `
            <style data-id="applecation_scales">
                /* Масштаб логотипа - ИСПРАВЛЕНО */
                .applecation .applecation__logo img {
                    max-width: ${logoWidth}vw !important;
                    max-height: ${logoHeight}px !important;
                    width: auto !important;
                    height: auto !important;
                }

                /* Масштаб текста */
                .applecation .applecation__content-wrapper {
                    font-size: ${textScale}% !important;
                }

                /* Отступы между элементами */
                .applecation .applecation__meta {
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;
                }
                
                .applecation .applecation__description {
                    max-width: ${textWidth}vw !important;
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;
                }
                
                .applecation .applecation__info {
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;
                }

                /* Масштаб для оверлея */
                .applecation-description-overlay__logo img {
                    max-width: ${40 * logoScale / 100}vw !important;
                    max-height: ${150 * logoScale / 100}px !important;
                }

                .applecation-description-overlay__text {
                    font-size: ${1.2 * textScale / 100}em !important;
                }

                /* Оптимизация для Samsung TV */
                body.applecation-samsung-tv .applecation .full-episode.focus {
                    transform: scale(1.02) translateY(-4px) !important;
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }

                body.applecation-samsung-tv .applecation .full-person.focus {
                    transform: scale(1.05) translateY(-4px) !important;
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
            </style>
        `;

        $('body').append(scaleStyles);
    }

    // Регистрируем шаблон для оверлея описания - ИСПРАВЛЕНО
    function addOverlayTemplate() {
        const overlayTemplate = `
            <div class="applecation-description-overlay" style="display: none;">
                <div class="applecation-description-overlay__bg"></div>
                <div class="applecation-description-overlay__content selector">
                    <div class="applecation-description-overlay__close selector" tabindex="0" data-action="close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="applecation-description-overlay__logo"></div>
                    <div class="applecation-description-overlay__title">{title}</div>
                    <div class="applecation-description-overlay__text">{text}</div>
                    <div class="applecation-description-overlay__details">
                        <div class="applecation-description-overlay__info">
                            <div class="applecation-description-overlay__info-name">#{full_date_of_release}</div>
                            <div class="applecation-description-overlay__info-body">{relise}</div>
                        </div>
                        <div class="applecation-description-overlay__info applecation--budget">
                            <div class="applecation-description-overlay__info-name">#{full_budget}</div>
                            <div class="applecation-description-overlay__info-body">{budget}</div>
                        </div>
                        <div class="applecation-description-overlay__info applecation--countries">
                            <div class="applecation-description-overlay__info-name">#{full_countries}</div>
                            <div class="applecation-description-overlay__info-body">{countries}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        Lampa.Template.add('applecation_overlay', overlayTemplate);
    }

    // Регистрируем кастомный шаблон страницы full (без рейтингов)
    function addCustomTemplate() {
        const ratingsPosition = Lampa.Storage.get('applecation_ratings_position', 'card');
        
        // Пустой блок рейтингов (скрыт по умолчанию)
        const ratingsBlock = `<!-- Рейтинги (скрыты) -->
                    <div class="applecation__ratings" style="display: none;">
                        <!-- Рейтинги отключены -->
                    </div>`;
        
        const template = `<div class="full-start-new applecation">
        <div class="full-start-new__body">
            <div class="full-start-new__left hide">
                <div class="full-start-new__poster">
                    <img class="full-start-new__img full--poster" />
                </div>
            </div>

            <div class="full-start-new__right">
                <div class="applecation__left">
                    <div class="applecation__logo"></div>
                    
                    <div class="applecation__content-wrapper">
                        <div class="full-start-new__title" style="display: none;">{title}</div>
                        
                        <div class="applecation__meta">
                            <div class="applecation__meta-left">
                                <span class="applecation__network"></span>
                                <span class="applecation__meta-text"></span>
                                <div class="full-start__pg hide"></div>
                            </div>
                        </div>
                        
                        ${ratingsBlock}
                        
                        <div class="applecation__description-wrapper selector" tabindex="0" data-action="description">
                            <div class="applecation__description"></div>
                        </div>
                        <div class="applecation__info"></div>
                    </div>
                    
                    <!-- Скрытые оригинальные элементы -->
                    <div class="full-start-new__head" style="display: none;"></div>
                    <div class="full-start-new__details" style="display: none;"></div>

                    <div class="full-start-new__buttons">
                        <div class="full-start__button selector button--play">
                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>
                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>
                            </svg>
                            <span>#{title_watch}</span>
                        </div>

                        <div class="full-start__button selector button--book">
                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                            <span>#{settings_input_links}</span>
                        </div>

                        <div class="full-start__button selector button--reaction">
                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>
                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>
                            </svg>
                            <span>#{title_reactions}</span>
                        </div>

                        <div class="full-start__button selector button--subscribe hide">
                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
                                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>
                            </svg>
                            <span>#{title_subscribe}</span>
                        </div>

                        <div class="full-start__button selector button--options">
                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>
                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>
                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="applecation__right">
                    <div class="full-start-new__reactions selector">
                        <div>#{reactions_none}</div>
                    </div>
                    
                    ${ratingsBlock}

                    <!-- Скрытый элемент для совместимости (предотвращает выход реакций за экран) -->
                    <div class="full-start-new__rate-line">
                        <div class="full-start__status hide"></div>
                    </div>
                    
                    <!-- Пустой маркер для предотвращения вставки элементов от modss.js -->
                    <div class="rating--modss" style="display: none;"></div>
                </div>
            </div>
        </div>

        <div class="hide buttons--container">
            <div class="full-start__button view--torrent hide">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>
                </svg>
                <span>#{full_torrents}</span>
            </div>

            <div class="full-start__button selector view--trailer">
                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>
                </svg>
                <span>#{full_trailers}</span>
            </div>
        </div>
    </div>`;

        Lampa.Template.add('full_start_new', template);

        const episodeTemplate = `<div class="full-episode selector layer--visible">
            <div class="full-episode__img">
                <img />
                <div class="full-episode__time">{time}</div>
            </div>

            <div class="full-episode__body">
                <div class="full-episode__num">#{full_episode} {num}</div>
                <div class="full-episode__name">{name}</div>
                <div class="full-episode__overview">{overview}</div>
                <div class="full-episode__date">{date}</div>
            </div>
        </div>`;
        
        Lampa.Template.add('full_episode', episodeTemplate);
    }

    function disableFullDescription(e) {
        if (e.type === 'start' && e.link) {
            const rows = e.link.rows;
            const index = rows.indexOf('description');
            if (index > -1) {
                rows.splice(index, 1);
            }
        }
    }

    function addStyles() {
        const styles = `<style>
/* Основной контейнер */
.applecation {
    transition: all .3s;
}

.applecation .full-start-new__body {
    height: 80vh;
}

.applecation .full-start-new__right {
    display: flex;
    align-items: flex-end;
}

.applecation .full-start-new__title {
    font-size: 2.5em;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 0.5em;
    text-shadow: 0 0 .1em rgba(0, 0, 0, 0.3);
}

/* Логотип */
.applecation__logo {
    margin-bottom: 0.5em;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.applecation__logo.loaded {
    opacity: 1;
    transform: translateY(0);
}

.applecation__logo img {
    display: block;
    max-width: 35vw;
    max-height: 180px;
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: left center;
}

/* Контейнер для масштабируемого контента */
.applecation__content-wrapper {
    font-size: 100%;
}

/* Мета информация (Тип/Жанр/поджанр) */
.applecation__meta {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 1.1em;
    margin-bottom: 0.5em;
    line-height: 1;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    transition-delay: 0.05s;
}

.applecation__meta.show {
    opacity: 1;
    transform: translateY(0);
}

.applecation__meta-left {
    display: flex;
    align-items: center;
    line-height: 1;
}

.applecation__network {
    display: inline-flex;
    align-items: center;
    line-height: 1;
}

.applecation__network img {
    display: block;
    max-height: 0.8em;
    width: auto;
    object-fit: contain;
    filter: brightness(0) invert(1);
}

.applecation__meta-text {
    margin-left: 1em;
    line-height: 1;
}

.applecation__meta .full-start__pg {
    margin: 0 0 0 0.6em;
    padding: 0.2em 0.5em;
    font-size: 0.85em;
    font-weight: 600;
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    border-radius: 0.3em;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    line-height: 1;
    vertical-align: middle;
}

/* Рейтинги (скрыты) */
.applecation__ratings {
    display: none !important;
}

/* Обертка для описания */
.applecation__description-wrapper {
    background-color: transparent;
    padding: 0;
    border-radius: 1em;
    width: fit-content;
    opacity: 0;
    transform: translateY(15px);
    transition:
        padding 0.25s ease,
        transform 0.25s ease,
        opacity 0.4s ease-out;
    transition-delay: 0.1s;
}

.applecation__description-wrapper.show {
    opacity: 1;
    transform: translateY(0);
}

.applecation__description-wrapper.focus {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.28),
    rgba(255, 255, 255, 0.18)
  );
  padding: .15em .4em 0 .7em;
  border-radius: 1em;
  width: fit-content;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transform: scale(1.07) translateY(0);
  transition-delay: 0s;
}

/* Описание */
.applecation__description {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.95em;
    line-height: 1.5;
    margin-bottom: 0.5em;
    max-width: 35vw;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.focus .applecation__description {
  color: rgba(255, 255, 255, 0.92);
}

/* Дополнительная информация (Год/длительность) */
.applecation__info {
    color: rgba(255, 255, 255, 0.75);
    font-size: 1em;
    line-height: 1.4;
    margin-bottom: 0.5em;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    transition-delay: 0.15s;
}

.applecation__info.show {
    opacity: 1;
    transform: translateY(0);
}

/* Левая и правая части */
.applecation__left {
    flex-grow: 1;
}

.applecation__right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    position: relative;
}

/* Реакции */
.applecation .full-start-new__reactions {
    margin: 0;
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end;
}

.applecation .full-start-new__reactions > div {
    align-self: flex-end;
}

.applecation .full-start-new__reactions:not(.focus) {
    margin: 0;
}

.applecation .full-start-new__reactions:not(.focus) > div:not(:first-child) {
    display: none;
}

/* Стили первой реакции (всегда видимой) */
.applecation .full-start-new__reactions > div:first-child .reaction {
    display: flex !important;
    align-items: center !important;
    background-color: rgba(0, 0, 0, 0) !important;
    gap: 0 !important;
}

.applecation .full-start-new__reactions > div:first-child .reaction__icon {
    background-color: rgba(0, 0, 0, 0.3) !important;
    -webkit-border-radius: 5em;
    -moz-border-radius: 5em;
    border-radius: 5em;
    padding: 0.5em;
    width: 2.6em !important;
    height: 2.6em !important;
}

.applecation .full-start-new__reactions > div:first-child .reaction__count {
    font-size: 1.2em !important;
    font-weight: 500 !important;
}

/* При фокусе реакции раскрываются вверх */
.applecation .full-start-new__reactions.focus {
    gap: 0.5em;
}

.applecation .full-start-new__reactions.focus > div {
    display: block;
}

/* Скрываем стандартный rate-line (используется только для статуса) */
.applecation .full-start-new__rate-line {
    margin: 0;
    height: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
}

/* Фон - переопределяем стандартную анимацию на fade */
.full-start__background {
    height: calc(100% + 6em);
    left: 0 !important;
    opacity: 0 !important;
    transition: opacity 0.6s ease-out, filter 0.3s ease-out !important;
    animation: none !important;
    transform: none !important;
    will-change: opacity, filter;
}

.full-start__background.loaded:not(.dim) {
    opacity: 1 !important;
}

.full-start__background.dim {
  filter: blur(30px);
}

/* Удерживаем opacity при загрузке нового фона */
.full-start__background.loaded.applecation-animated {
    opacity: 1 !important;
}

body:not(.menu--open) .full-start__background {
    mask-image: none;
}

/* Отключаем стандартную анимацию Lampa для фона */
body.advanced--animation:not(.no--animation) .full-start__background.loaded {
    animation: none !important;
}

/* Скрываем статус для предотвращения выхода реакций за экран */
.applecation .full-start__status {
    display: none;
}

/* Оверлей для затемнения левого края */
.applecation__overlay {
    width: 90vw;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.792) 0%, rgba(0, 0, 0, 0.504) 25%, rgba(0, 0, 0, 0.264) 45%, rgba(0, 0, 0, 0.12) 55%, rgba(0, 0, 0, 0.043) 60%, rgba(0, 0, 0, 0) 65%);
}

/* Бейджи качества */
.applecation__quality-badges {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin-left: 0.6em;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.applecation__quality-badges.show {
    opacity: 1;
    transform: translateY(0);
}

.quality-badge {
    display: inline-flex;
    height: 0.8em;
}

.quality-badge svg {
    height: 100%;
    width: auto;
    display: block;
}

.quality-badge--res svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.quality-badge--dv svg,
.quality-badge--hdr svg,
.quality-badge--sound svg,
.quality-badge--dub svg {
    color: rgba(255, 255, 255, 0.85);
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Эпизоды Apple TV */
.applecation .full-episode--small {
    width: 20em !important;
    height: auto !important;
    margin-right: 1.5em !important;
    background: none !important;
    display: flex !important;
    flex-direction: column !important;
    transition: transform 0.3s !important;
}

.applecation .full-episode--small.focus {
    transform: scale(1.02);
}

.applecation .full-episode--next .full-episode__img::after {
  border: none !important;
}

.applecation .full-episode__img {
    padding-bottom: 56.25% !important;
    border-radius: 0.8em !important;
    margin-bottom: 1em !important;
    background-color: rgba(255,255,255,0.05) !important;
    position: relative !important;
    overflow: visible !important;
}

.applecation .full-episode__img img {
    border-radius: 0.8em !important;
    object-fit: cover !important;
}

.applecation .full-episode__time {
    position: absolute;
    bottom: 0.8em;
    left: 0.8em;
    background: rgba(0,0,0,0.6);
    padding: 0.2em 0.5em;
    border-radius: 0.4em;
    font-size: 0.75em;
    font-weight: 600;
    color: #fff;
    backdrop-filter: blur(5px);
    z-index: 2;
}

.applecation .full-episode__time:empty {
    display: none;
}

.applecation .full-episode__body {
    position: static !important;
    display: flex !important;
    flex-direction: column !important;
    background: none !important;
    padding: 0 0.5em !important;
    opacity: 0.6;
    transition: opacity 0.3s;
}

.applecation .full-episode.focus .full-episode__body {
    opacity: 1;
}

.applecation .full-episode__num {
    font-size: 0.75em !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    color: rgba(255,255,255,0.4) !important;
    margin-bottom: 0.2em !important;
    letter-spacing: 0.05em !important;
}

.applecation .full-episode__name {
    font-size: 1.1em !important;
    font-weight: 600 !important;
    color: #fff !important;
    margin-bottom: 0.4em !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    line-height: 1.4 !important;
    padding-bottom: 0.1em !important;
}

.applecation .full-episode__overview {
    font-size: 0.85em !important;
    line-height: 1.4 !important;
    color: rgba(255,255,255,0.5) !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    margin-bottom: 0.6em !important;
    height: 2.8em !important;
}

.applecation .full-episode__date {
    font-size: 0.8em !important;
    color: rgba(255,255,255,0.3) !important;
}

/* =========================================================
   БАЗА: ничего не блюрим/не затемняем без фокуса
   ========================================================= */
.applecation .full-episode{
  position: relative;
  z-index: 1;
  opacity: 1;
  filter: none;
  transition: transform .6s cubic-bezier(.16,1,.3,1);
}

/* без фокуса — вообще без эффектов */
.applecation .full-episode:not(.focus){
  transform: none;
}

/* фокус — мягкий "apple" подъём */
.applecation .full-episode.focus{
  z-index: 10;
  transform: scale(1.03) translateY(-6px);
}

/* =========================================================
   КАРТИНКА
   ========================================================= */
.applecation .full-episode__img{
  position: relative;
  overflow: hidden;
  border-radius: inherit;
  transition:
    box-shadow .6s cubic-bezier(.16,1,.3,1),
    backdrop-filter .6s cubic-bezier(.16,1,.3,1),
    transform .6s cubic-bezier(.16,1,.3,1);
}

/* =========================================================
   ЖИДКОЕ СТЕКЛО — ТОЛЬКО НА ФОКУСЕ
   ========================================================= */
.applecation .full-episode.focus .full-episode__img{
  box-shadow:
    0 0 0 1px rgba(255,255,255,.18),
    0 26px 65px rgba(0,0,0,.4) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.25) contrast(1.05);
  backdrop-filter: blur(14px) saturate(1.25) contrast(1.05);
  background: rgba(255,255,255,.06);
}

/* толщина стекла */
.applecation .full-episode.focus .full-episode__img::before{
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 2;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.22),
    inset 0 0 18px rgba(255,255,255,.12),
    inset 0 -14px 22px rgba(0,0,0,.18);
  filter: blur(.35px);
  opacity: 1;
  transition: opacity .45s ease;
}

/* блик */
.applecation .full-episode.focus .full-episode__img::after{
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 3;
  background:
    radial-gradient(120% 85% at 18% 10%,
      rgba(255,255,255,.38),
      rgba(255,255,255,.10) 38%,
      transparent 62%),
    linear-gradient(135deg,
      rgba(255,255,255,.20),
      rgba(255,255,255,0) 52%,
      rgba(255,255,255,.06));
  mix-blend-mode: screen;
  opacity: .95;
  transition:
    opacity .45s ease,
    transform .65s cubic-bezier(.16,1,.3,1);
}

/* когда фокуса нет — просто не показываем слои стекла */
.applecation .full-episode:not(.focus) .full-episode__img::before,
.applecation .full-episode:not(.focus) .full-episode__img::after{
  opacity: 0;
}

/* убрать старый оверлей */
.applecation .full-episode.focus::after{
  display: none !important;
}

.applecation .full-episode__viewed {
    top: 0.8em !important;
    right: 0.8em !important;
    background: rgba(0,0,0,0.5) !important;
    border-radius: 50% !important;
    padding: 0.3em !important;
    backdrop-filter: blur(10px) !important;
}

/* Статус следующей серии */
.applecation .full-episode--next .full-episode__img:after {
    border-radius: 0.8em !important;
}

/* Оверлей для полного описания - ИСПРАВЛЕННЫЙ */
.applecation-description-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: none;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.applecation-description-overlay.show {
    display: flex;
    opacity: 1;
    visibility: visible;
}

.applecation-description-overlay__bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
}

.applecation-description-overlay__content {
    position: relative;
    z-index: 1;
    max-width: 60vw;
    max-height: 80vh;
    overflow-y: auto;
    background: rgba(30, 30, 30, 0.9);
    border-radius: 20px;
    padding: 2em;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.applecation-description-overlay__close {
    position: absolute;
    top: 1em;
    right: 1em;
    width: 2.5em;
    height: 2.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: background 0.2s;
}

.applecation-description-overlay__close:hover,
.applecation-description-overlay__close.focus {
    background: rgba(255, 255, 255, 0.2);
}

.applecation-description-overlay__close svg {
    width: 1.2em;
    height: 1.2em;
    color: #fff;
}

.applecation-description-overlay__logo {
    text-align: center;
    margin-bottom: 1.5em;
    display: none;
}

.applecation-description-overlay__logo img {
    max-width: 40vw;
    max-height: 150px;
    width: auto;
    height: auto;
    object-fit: contain;
}

.applecation-description-overlay__title {
    font-size: 2em;
    font-weight: 600;
    margin-bottom: 1em;
    color: #fff;
    text-align: center;
}

.applecation-description-overlay__text {
    font-size: 1.2em;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    white-space: pre-wrap;
    margin-bottom: 1.5em;
}

.applecation-description-overlay__details {
    display: flex;
    flex-wrap: wrap;
    margin: -1em;
}

.applecation-description-overlay__details > * {
    margin: 1em;
}

.applecation-description-overlay__info-name {
    font-size: 1.1em;
    margin-bottom: 0.5em;
    color: rgba(255, 255, 255, 0.7);
}

.applecation-description-overlay__info-body {
    font-size: 1.2em;
    color: #fff;
}

/* Скроллбар для описания */
.applecation-description-overlay__content::-webkit-scrollbar {
    width: 0.5em;
}

.applecation-description-overlay__content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 1em;
}

.applecation-description-overlay__content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1em;
}

.applecation-description-overlay__content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* Samsung TV оптимизации */
body.applecation-samsung-tv .applecation-description-overlay__content {
    max-width: 70vw;
    max-height: 85vh;
    padding: 1.5em;
}

body.applecation-samsung-tv .applecation-description-overlay__text {
    font-size: 1.1em;
    line-height: 1.5;
}

/* =========================================================
   ПЕРСОНЫ (АКТЕРЫ И СЪЕМОЧНАЯ ГРУППА) - APPLE TV СТИЛЬ
   ========================================================= */
.applecation .full-person {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    width: 10.7em !important;
    background: none !important;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
    will-change: transform;
    -webkit-animation: none !important;
    animation: none !important;
    margin-left: 0;
}

.applecation .full-person.focus {
    transform: scale(1.08) translateY(-6px) !important;
    z-index: 10;
}

/* Фото персоны - круглое */
.applecation .full-person__photo {
    position: relative !important;
    width: 9.4em !important;
    height: 9.4em !important;
    margin: 0 0 .3em 0 !important;
    border-radius: 50% !important;
    overflow: hidden !important;
    background: rgba(255, 255, 255, 0.05) !important;
    flex-shrink: 0 !important;
    transition: 
        box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1),
        backdrop-filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),
        -webkit-backdrop-filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),
        transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
        background 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
    will-change: transform, box-shadow, backdrop-filter;
    -webkit-animation: none !important;
    animation: none !important;
}

.applecation .full-person__photo img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 50% !important;
}

/* Смещаем лицо только при высоком качестве (w500), так как там другой кроп у TMDB */
.applecation.applecation--poster-high .full-person__photo img {
    object-position: center calc(50% + 20px) !important;
}

/* Дефолтные заглушки оставляем по центру, чтобы не ломать симметрию иконок */
.applecation .full-person__photo img[src*="actor.svg"],
.applecation .full-person__photo img[src*="img_broken.svg"] {
    object-position: center !important;
}

/* ЖИДКОЕ СТЕКЛО — БАЗОВЫЕ СЛОИ (скрыты) */
.applecation .full-person__photo::before,
.applecation .full-person__photo::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
    will-change: opacity;
}

/* толщина стекла */
.applecation .full-person__photo::before {
    z-index: 2;
    box-shadow:
        inset 2px 2px 1px rgba(255, 255, 255, 0.30),
        inset -2px -2px 2px rgba(255, 255, 255, 0.30);
}

/* ореол и блик */
.applecation .full-person__photo::after {
    z-index: 3;
    background:
        radial-gradient(circle at center,
            transparent 58%,
            rgba(255, 255, 255, 0.22) 75%,
            rgba(255, 255, 255, 0.38) 90%),
        radial-gradient(120% 85% at 18% 10%,
            rgba(255, 255, 255, 0.35),
            rgba(255, 255, 255, 0.10) 38%,
            transparent 62%);
    mix-blend-mode: screen;
}

/* ЭФФЕКТЫ ПРИ ФОКУСЕ */
.applecation .full-person.focus .full-person__photo::before,
.applecation .full-person.focus .full-person__photo::after {
    opacity: 1;
}

.applecation .full-person.focus .full-person__photo::after {
    opacity: 0.9;
}

/* Текстовая информация */
.applecation .full-person__body {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    width: 100% !important;
    padding: 0 0.3em !important;
}

/* Имя персоны */
.applecation .full-person__name {
    font-size: 1em !important;
    font-weight: 600 !important;
    color: #fff !important;
    line-height: 1.3 !important;
    width: 100% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    position: relative !important;
}

/* Бегущая строка для длинных имен */
.applecation .full-person__name.marquee-active {
    text-overflow: clip !important;
    mask-image: linear-gradient(to right, #000 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, #000 92%, transparent 100%);
}

/* При фокусе (когда строка едет) прозрачность с обеих сторон */
.applecation .full-person.focus .full-person__name.marquee-active {
    mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
}

.applecation .marquee__inner {
    display: inline-block;
    white-space: nowrap;
}

.applecation .marquee__inner span {
    padding-right: 2.5em;
    display: inline-block;
}

/* Запуск анимации при фокусе */
.applecation .full-person.focus .full-person__name.marquee-active .marquee__inner {
    animation: marquee var(--marquee-duration, 5s) linear infinite;
}

@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

/* Роль персоны */
.applecation .full-person__role {
    font-size: 0.8em !important;
    font-weight: 400 !important;
    color: rgba(255, 255, 255, 0.5) !important;
    line-height: 1.3 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    width: 100% !important;
    margin-top: 0;
}

.applecation .full-person.focus .full-person__role {
    color: rgb(255, 255, 255) !important;
}

/* ОТКЛЮЧЕНИЕ ЖИДКОГО СТЕКЛА */
body.applecation--no-liquid-glass .applecation .full-episode.focus .full-episode__img,
body.applecation--no-liquid-glass .applecation .full-person.focus .full-person__photo {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: rgba(255,255,255,0.05) !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
}

body.applecation--no-liquid-glass .applecation .full-episode.focus .full-episode__img::before,
body.applecation--no-liquid-glass .applecation .full-episode.focus .full-episode__img::after,
body.applecation--no-liquid-glass .applecation .full-person.focus .full-person__photo::before,
body.applecation--no-liquid-glass .applecation .full-person.focus .full-person__photo::after {
    display: none !important;
}
</style>`;
        
        Lampa.Template.add('applecation_css', styles);
        $('body').append(Lampa.Template.get('applecation_css', {}, true));
    }

    // Патчим внутренние методы Лампы для корректной работы эпизодов и качества
    function patchApiImg() {
        const tmdbSource = Lampa.Api.sources.tmdb;

        if (!tmdbSource) return;

        // 0. Патчим формирование URL для TMDB
        if (window.Lampa && Lampa.TMDB && Lampa.TMDB.api) {
            const originalTmdbApi = Lampa.TMDB.api;
            Lampa.TMDB.api = function(url) {
                let newUrl = url;
                if (typeof newUrl === 'string' && newUrl.indexOf('append_to_response=') !== -1 && newUrl.indexOf('images') === -1) {
                    newUrl = newUrl.replace('append_to_response=', 'append_to_response=images,');
                    
                    if (newUrl.indexOf('include_image_language=') === -1) {
                        const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
                        newUrl += (newUrl.indexOf('?') === -1 ? '?' : '&') + 'include_image_language=en,null,' + lang;
                    }
                }
                return originalTmdbApi.call(Lampa.TMDB, newUrl);
            };
        }
        
        // 1. Патчим шаблонизатор
        const originalTemplateJs = Lampa.Template.js;
        Lampa.Template.js = function(name, vars) {
            if (name === 'full_episode' && vars) {
                if (vars.runtime > 0) {
                    vars.time = Lampa.Utils.secondsToTimeHuman(vars.runtime * 60).replace(/\./g, '');
                } else {
                    vars.time = '';
                }

                if (vars.air_date) {
                    const dateObj = new Date(vars.air_date.replace(/-/g, '/'));
                    const month = dateObj.getMonth() + 1;
                    const monthEnd = Lampa.Lang.translate('month_' + month + '_e');
                    const yearSuffix = t('year_short');
                    vars.date = dateObj.getDate() + ' ' + monthEnd + ' ' + dateObj.getFullYear() + yearSuffix;
                }
            }
            return originalTemplateJs.call(Lampa.Template, name, vars);
        };

        // 2. Патчим метод изображений для улучшения качества
        const originalImg = tmdbSource.img;
        tmdbSource.img = function(src, size) {
            const posterSize = Lampa.Storage.field('poster_size');

            if (size === 'w1280') {
                const backdropMap = {
                    'w200': 'w780',
                    'w300': 'w1280',
                    'w500': 'original'
                };
                size = backdropMap[posterSize] || 'w1280';
            }

            if (size === 'w300') {
                const episodeMap = {
                    'w200': 'w300',
                    'w300': 'w780',
                    'w500': 'w780'
                };
                size = episodeMap[posterSize] || 'w300';
            }

            if (size === 'w276_and_h350_face' && posterSize === 'w500') {
                size = 'w600_and_h900_face';
            }

            return originalImg.call(tmdbSource, src, size);
        };

        Lampa.Api.img = tmdbSource.img;
    }

    // Получаем качество логотипа на основе poster_size
    function getLogoQuality() {
        const posterSize = Lampa.Storage.field('poster_size');
        const qualityMap = {
            'w200': 'w300',
            'w300': 'w500',
            'w500': 'original'
        };
        return qualityMap[posterSize] || 'w500';
    }

    // Получаем локализованный тип медиа
    function getMediaType(data) {
        const lang = Lampa.Storage.get('language', 'ru');
        const isTv = !!data.name;
        
        const types = {
            ru: isTv ? 'Сериал' : 'Фильм',
            en: isTv ? 'TV Series' : 'Movie',
            uk: isTv ? 'Серіал' : 'Фільм',
            be: isTv ? 'Серыял' : 'Фільм',
            bg: isTv ? 'Сериал' : 'Филм',
            cs: isTv ? 'Seriál' : 'Film',
            he: isTv ? 'סדרה' : 'סרט',
            pt: isTv ? 'Série' : 'Filme',
            zh: isTv ? '电视剧' : '电影'
        };
        
        return types[lang] || types['en'];
    }

    // Загружаем иконку студии/сети
    function loadNetworkIcon(activity, data) {
        const networkContainer = activity.render().find('.applecation__network');
        
        if (data.networks && data.networks.length) {
            const network = data.networks[0];
            if (network.logo_path) {
                const logoUrl = Lampa.Api.img(network.logo_path, 'w200');
                networkContainer.html(`<img src="${logoUrl}" alt="${network.name}">`);
                return;
            }
        }
        
        if (data.production_companies && data.production_companies.length) {
            const company = data.production_companies[0];
            if (company.logo_path) {
                const logoUrl = Lampa.Api.img(company.logo_path, 'w200');
                networkContainer.html(`<img src="${logoUrl}" alt="${company.name}">`);
                return;
            }
        }
        
        networkContainer.remove();
    }

    // Заполняем мета информацию (Тип/Жанр/поджанр)
    function fillMetaInfo(activity, data) {
        const metaTextContainer = activity.render().find('.applecation__meta-text');
        const metaParts = [];

        metaParts.push(getMediaType(data));

        if (data.genres && data.genres.length) {
            const genres = data.genres.slice(0, 2).map(g => 
                Lampa.Utils.capitalizeFirstLetter(g.name)
            );
            metaParts.push(...genres);
        }

        metaTextContainer.html(metaParts.join(' · '));
        
        loadNetworkIcon(activity, data);
    }

    // Заполняем описание
    function fillDescription(activity, data) {
        const descContainer = activity.render().find('.applecation__description');
        const descWrapper = activity.render().find('.applecation__description-wrapper');
        const description = data.overview || '';
        const useOverlay = Lampa.Storage.get('applecation_description_overlay', true);
        
        descContainer.text(description);
        
        if (useOverlay && description.trim()) {
            // Создаем оверлей заранее
            createDescriptionOverlay(activity, data);
            
            // Добавляем обработчик клика и нажатия Enter
            descWrapper.off('hover:enter click').on('hover:enter click', function() {
                showFullDescription();
            });
            
            // Делаем описание кликабельным
            descWrapper.addClass('selector').attr('tabindex', '0');
        } else {
            descWrapper.off('hover:enter click').removeClass('selector').removeAttr('tabindex');
        }
    }
    
    // Обновляем логотип в оверлее
    function updateOverlayLogo(logoUrl) {
        const overlay = $('.applecation-description-overlay');
        
        if (!overlay.length) return;
        
        if (logoUrl) {
            const newLogoImg = $('<img>').attr('src', logoUrl);
            overlay.find('.applecation-description-overlay__logo').html(newLogoImg).css('display', 'block');
            overlay.find('.applecation-description-overlay__title').css('display', 'none');
        }
    }
    
    // Парсим страны с локализацией
    function parseCountries(movie) {
        if (!movie.production_countries) return [];
        
        return movie.production_countries.map(country => {
            const isoCode = country.iso_3166_1;
            const langKey = 'country_' + isoCode.toLowerCase();
            const translated = Lampa.Lang.translate(langKey);
            
            return translated !== langKey ? translated : country.name;
        });
    }
    
    // Создаем оверлей заранее
    function createDescriptionOverlay(activity, data) {
        const text = data.overview || '';
        const title = data.title || data.name;
        
        if (!text) return;
        
        // Удаляем старый оверлей если есть
        $('.applecation-description-overlay').remove();
        
        // Парсим данные как в Lampa
        const date = (data.release_date || data.first_air_date || '') + '';
        const relise = date.length > 3 ? Lampa.Utils.parseTime(date).full : date.length > 0 ? date : Lampa.Lang.translate('player_unknown');
        const budget = '$ ' + Lampa.Utils.numberWithSpaces(data.budget || 0);
        const countriesArr = parseCountries(data);
        const countries = countriesArr.join(', ');
        
        // Создаем оверлей через шаблон Lampa
        const overlay = $(Lampa.Template.get('applecation_overlay', {
            title: title,
            text: text,
            relise: relise,
            budget: budget,
            countries: countries
        }));
        
        // Скрываем бюджет если 0
        if (!data.budget || data.budget === 0) {
            overlay.find('.applecation--budget').remove();
        }
        
        // Скрываем страны если пусто
        if (!countries) {
            overlay.find('.applecation--countries').remove();
        }
        
        // Добавляем обработчик закрытия
        overlay.find('.applecation-description-overlay__close').on('hover:enter click', function() {
            closeDescriptionOverlay();
        });
        
        $('body').append(overlay);
    }
    
    // Показываем полное описание в оверлее - ИСПРАВЛЕНО
    function showFullDescription() {
        const overlay = $('.applecation-description-overlay');
        
        if (!overlay.length) return;
        
        // Анимация появления
        overlay.css('display', 'flex');
        setTimeout(() => {
            overlay.addClass('show');
            // Фокус на кнопку закрытия
            setTimeout(() => {
                const closeBtn = overlay.find('.applecation-description-overlay__close');
                if (closeBtn.length && Lampa.Controller) {
                    Lampa.Controller.collectionFocus(closeBtn);
                }
            }, 100);
        }, 10);
    }
    
    // Закрываем оверлей с описанием - ИСПРАВЛЕНО
    function closeDescriptionOverlay() {
        const overlay = $('.applecation-description-overlay');
        
        if (!overlay.length) return;
        
        overlay.removeClass('show');
        
        setTimeout(() => {
            overlay.css('display', 'none');
            // Возвращаем фокус на описание в карточке
            const descWrapper = $('.applecation__description-wrapper');
            if (descWrapper.length && Lampa.Controller) {
                Lampa.Controller.collectionFocus(descWrapper);
            }
        }, 300);
    }

    // Склонение сезонов с локализацией
    function formatSeasons(count) {
        const lang = Lampa.Storage.get('language', 'ru');
        
        if (['ru', 'uk', 'be', 'bg'].includes(lang)) {
            const cases = [2, 0, 1, 1, 1, 2];
            const titles = {
                ru: ['сезон', 'сезона', 'сезонов'],
                uk: ['сезон', 'сезони', 'сезонів'],
                be: ['сезон', 'сезоны', 'сезонаў'],
                bg: ['сезон', 'сезона', 'сезона']
            };
            
            const langTitles = titles[lang] || titles['ru'];
            const caseIndex = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
            
            return `${count} ${langTitles[caseIndex]}`;
        }
        
        if (lang === 'en') {
            return count === 1 ? `${count} Season` : `${count} Seasons`;
        }
        
        if (lang === 'cs') {
            if (count === 1) return `${count} série`;
            if (count >= 2 && count <= 4) return `${count} série`;
            return `${count} sérií`;
        }
        
        if (lang === 'pt') {
            return count === 1 ? `${count} Temporada` : `${count} Temporadas`;
        }
        
        if (lang === 'he') {
            if (count === 1) return `עונה ${count}`;
            if (count === 2) return `${count} עונות`;
            return `${count} עונות`;
        }
        
        if (lang === 'zh') {
            return `${count} 季`;
        }
        
        const seasonWord = Lampa.Lang.translate('full_season');
        return count === 1 ? `${count} ${seasonWord}` : `${count} ${seasonWord}s`;
    }

    // Склонение серий с локализацией
    function formatEpisodes(count) {
        const lang = Lampa.Storage.get('language', 'ru');
        
        if (['ru', 'uk', 'be', 'bg'].includes(lang)) {
            const cases = [2, 0, 1, 1, 1, 2];
            const titles = {
                ru: ['серия', 'серии', 'серий'],
                uk: ['серія', 'серії', 'серій'],
                be: ['серыя', 'серыі', 'серый'],
                bg: ['епизод', 'епизода', 'епизода']
            };
            
            const langTitles = titles[lang] || titles['ru'];
            const caseIndex = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
            
            return `${count} ${langTitles[caseIndex]}`;
        }
        
        if (lang === 'en') {
            return count === 1 ? `${count} Episode` : `${count} Episodes`;
        }
        
        if (lang === 'cs') {
            if (count === 1) return `${count} epizoda`;
            if (count >= 2 && count <= 4) return `${count} epizody`;
            return `${count} epizod`;
        }
        
        if (lang === 'pt') {
            return count === 1 ? `${count} Episódio` : `${count} Episódios`;
        }
        
        if (lang === 'he') {
            if (count === 1) return `פרק ${count}`;
            return `${count} פרקים`;
        }
        
        if (lang === 'zh') {
            return `${count} 集`;
        }
        
        const episodeWord = Lampa.Lang.translate('full_episode');
        return count === 1 ? `${count} ${episodeWord}` : `${count} ${episodeWord}s`;
    }

    // Заполняем дополнительную информацию (Год/длительность)
    function fillAdditionalInfo(activity, data) {
        const infoContainer = activity.render().find('.applecation__info');
        const infoParts = [];

        const releaseDate = data.release_date || data.first_air_date || '';
        if (releaseDate) {
            const year = releaseDate.split('-')[0];
            infoParts.push(year);
        }

        if (data.name) {
            if (data.episode_run_time && data.episode_run_time.length) {
                const avgRuntime = data.episode_run_time[0];
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');
                infoParts.push(`${avgRuntime} ${timeM}`);
            }
            
            const seasons = Lampa.Utils.countSeasons(data);
            if (seasons) {
                infoParts.push(formatSeasons(seasons));
            }

            if (Lampa.Storage.get('applecation_show_episode_count', false)) {
                const episodes = data.number_of_episodes;
                if (episodes) {
                    infoParts.push(formatEpisodes(episodes));
                }
            }
        } else {
            if (data.runtime && data.runtime > 0) {
                const hours = Math.floor(data.runtime / 60);
                const minutes = data.runtime % 60;
                const timeH = Lampa.Lang.translate('time_h').replace('.', '');
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');
                const timeStr = hours > 0 
                    ? `${hours} ${timeH} ${minutes} ${timeM}` 
                    : `${minutes} ${timeM}`;
                infoParts.push(timeStr);
            }
        }

        const textContent = infoParts.length > 0 ? infoParts.join(' · ') : '';
        infoContainer.html(textContent + '<span class="applecation__quality-badges"></span>');
    }
    
    // Обновляем бейджи качества
    function updateQualityBadges(activity, qualityInfo) {
        const badgesContainer = activity.render().find('.applecation__quality-badges');
        if (!badgesContainer.length) return;
        
        const badges = [];
        
        if (qualityInfo.quality) {
            let qualitySvg = '';
            if (qualityInfo.quality === '4K') {
                qualitySvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM113 20.9092L74.1367 82.1367V97.6367H118.818V114H137.637V97.6367H149.182V81.8633H137.637V20.9092H113ZM162.841 20.9092V114H182.522V87.5459L192.204 75.7275L217.704 114H241.25L206.296 62.5908L240.841 20.9092H217.25L183.75 61.9541H182.522V20.9092H162.841ZM119.182 81.8633H93.9541V81.1367L118.454 42.3633H119.182V81.8633Z" fill="white"/></svg>';
            } else if (qualityInfo.quality === '2K') {
                qualitySvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM110.608 19.6367C104.124 19.6367 98.3955 20.8638 93.4258 23.3184C88.4563 25.7729 84.5925 29.2428 81.835 33.7275C79.0775 38.2123 77.6992 43.5001 77.6992 49.5908H96.3809C96.3809 46.6212 96.9569 44.0607 98.1084 41.9092C99.2599 39.7578 100.896 38.1056 103.017 36.9541C105.138 35.8026 107.623 35.2275 110.472 35.2275C113.199 35.2276 115.639 35.7724 117.79 36.8633C119.941 37.9238 121.638 39.4542 122.881 41.4541C124.123 43.4238 124.744 45.7727 124.744 48.5C124.744 50.9545 124.244 53.2421 123.244 55.3633C122.244 57.4542 120.774 59.5906 118.835 61.7725C116.926 63.9543 114.562 66.4094 111.744 69.1367L78.6084 99.8184V114H144.972V97.9092H105.881V97.2725L119.472 83.9541C125.865 78.1361 130.82 73.1514 134.335 69C137.85 64.8182 140.29 61.0151 141.653 57.5908C143.047 54.1666 143.744 50.6968 143.744 47.1816C143.744 41.8182 142.366 37.0606 139.608 32.9092C136.851 28.7577 132.986 25.515 128.017 23.1816C123.077 20.8182 117.275 19.6368 110.608 19.6367ZM159.778 20.9092V114H179.46V87.5459L189.142 75.7275L214.642 114H238.188L203.233 62.5908L237.778 20.9092H214.188L180.688 61.9541H179.46V20.9092H159.778Z" fill="white"/></svg>';
            } else if (qualityInfo.quality === 'FULL HD') {
                qualitySvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 0 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM42.341 20.9092V114H62.022V75.5459H99.887V59.3184H62.022V37.1367H103.978V20.9092H42.341ZM117.216 20.9092V114H136.897V75.5459H176.853V114H196.488V20.9092H176.853V59.3184H136.897V20.9092H117.216ZM212.716 20.9092V114H245.716C255.17 114 263.291 112.136 270.079 108.409C276.897 104.682 282.125 99.333 285.762 92.3633C289.428 85.3937 291.262 77.0601 291.262 67.3633C291.262 57.6968 289.428 49.3934 285.762 42.4541C282.125 35.5149 276.928 30.1969 270.171 26.5C263.413 22.7727 255.352 20.9092 245.988 20.9092H212.716ZM244.943 37.7725C250.761 37.7725 255.655 38.8027 259.625 40.8633C263.595 42.9239 266.579 46.1364 268.579 50.5C270.609 54.8636 271.625 60.4847 271.625 67.3633C271.625 74.3026 270.609 79.9694 268.579 84.3633C266.579 88.7269 263.579 91.955 259.579 94.0459C255.609 96.1063 250.715 97.1367 244.897 97.1367H232.397V37.7725H244.943Z" fill="white"/></svg>';
            } else if (qualityInfo.quality === 'HD') {
                qualitySvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 0 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM21.278 20.9092V114H40.96V75.5459H80.915V114H100.551V20.9092H80.915V59.3184H40.96V20.9092H21.278ZM116.778 20.9092V114H149.778C159.233 114 167.354 112.136 174.142 108.409C180.96 104.682 186.188 99.333 189.824 92.3633C193.491 85.3937 195.324 77.0601 195.324 67.3633C195.324 57.6968 193.491 49.3934 189.824 42.4541C186.188 35.5149 180.991 30.1969 174.233 26.5C167.476 22.7727 159.414 20.9092 150.051 20.9092H116.778ZM149.006 37.7725C154.824 37.7725 159.718 38.8027 163.688 40.8633C167.657 42.9239 170.642 46.1364 172.642 50.5C174.672 54.8636 175.687 60.4847 175.688 67.3633C175.688 74.3026 174.672 79.9694 172.642 84.3633C170.642 88.7269 167.642 91.955 163.642 94.0459C159.672 96.1063 154.778 97.1367 148.96 97.1367H136.46V37.7725H149.006Z" fill="white"/></svg>';
            }
            if (qualitySvg) {
                badges.push(`<div class="quality-badge quality-badge--res">${qualitySvg}</div>`);
            }
        }
        
        if (qualityInfo.dv) {
            badges.push('<div class="quality-badge quality-badge--dv"><svg viewBox="0 0 1051 393" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,393) scale(0.1,-0.1)" fill="currentColor"><path d="M50 2905 l0 -1017 223 5 c146 4 244 11 287 21 361 85 638 334 753 677 39 116 50 211 44 366 -7 200 -52 340 -163 511 -130 199 -329 344 -574 419 -79 24 -102 26 -327 31 l-243 4 0 -1017z"/><path d="M2436 3904 c-443 -95 -762 -453 -806 -905 -30 -308 86 -611 320 -832 104 -99 212 -165 345 -213 133 -47 253 -64 468 -64 l177 0 0 1015 0 1015 -217 -1 c-152 0 -239 -5 -287 -15z"/><path d="M3552 2908 l3 -1013 425 0 c309 0 443 4 490 13 213 43 407 148 550 299 119 124 194 255 247 428 25 84 27 103 27 270 1 158 -2 189 -22 259 -72 251 -221 458 -424 590 -97 63 -170 97 -288 134 l-85 26 -463 4 -462 3 2 -1013z m825 701 c165 -22 283 -81 404 -199 227 -223 279 -550 133 -831 -70 -133 -176 -234 -319 -304 -132 -65 -197 -75 -490 -75 l-245 0 0 703 c0 387 3 707 7 710 11 11 425 8 510 -4z"/><path d="M7070 2905 l0 -1015 155 0 155 0 0 1015 0 1015 -155 0 -155 0 0 -1015z"/><path d="M7640 2905 l0 -1015 150 0 150 0 0 60 c0 33 2 60 5 60 2 0 33 -15 67 -34 202 -110 433 -113 648 -9 79 38 108 59 180 132 72 71 95 102 134 181 102 207 102 414 1 625 -120 251 -394 411 -670 391 -115 -8 -225 -42 -307 -93 -21 -13 -42 -23 -48 -23 -7 0 -10 125 -10 370 l0 370 -150 0 -150 0 0 -1015z m832 95 c219 -67 348 -310 280 -527 -62 -199 -268 -328 -466 -295 -96 15 -168 52 -235 119 -131 132 -164 311 -87 478 27 60 101 145 158 181 100 63 234 80 350 44z"/><path d="M6035 3286 c-253 -49 -460 -232 -542 -481 -23 -70 -26 -96 -26 -210 0 -114 3 -140 26 -210 37 -113 90 -198 177 -286 84 -85 170 -138 288 -177 67 -22 94 -26 207 -26 113 0 140 4 207 26 119 39 204 92 288 177 87 89 140 174 177 286 22 67 26 99 27 200 1 137 -14 207 -69 320 -134 277 -457 440 -760 381z m252 -284 c117 -37 206 -114 260 -229 121 -253 -38 -548 -321 -595 -258 -43 -503 183 -483 447 20 271 287 457 544 377z"/><path d="M9059 3258 c10 -24 138 -312 285 -642 l266 -598 -72 -162 c-39 -88 -78 -171 -86 -183 -37 -58 -132 -80 -208 -48 l-35 14 -18 -42 c-10 -23 -37 -84 -60 -135 -23 -52 -39 -97 -36 -102 3 -4 40 -23 83 -41 70 -31 86 -34 177 -34 93 0 105 2 167 33 76 37 149 104 180 166 29 57 799 1777 805 1799 5 16 -6 17 -161 15 l-167 -3 -185 -415 c-102 -228 -192 -431 -200 -450 l-15 -35 -201 453 -201 452 -168 0 -168 0 18 -42z"/><path d="M2650 968 c0 -2 81 -211 179 -463 l179 -460 59 -3 59 -3 178 453 c98 249 180 459 183 466 4 9 -13 12 -65 12 -47 0 -71 -4 -74 -12 -3 -7 -65 -176 -138 -375 -73 -200 -136 -363 -139 -363 -3 0 -67 168 -142 373 l-136 372 -72 3 c-39 2 -71 1 -71 0z"/><path d="M3805 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 466 0 465 -60 0 c-39 0 -62 -4 -65 -12z"/><path d="M4580 960 c-97 -16 -178 -72 -211 -145 -23 -50 -24 -143 -3 -193 32 -77 91 -117 244 -167 99 -32 146 -64 166 -112 28 -65 -11 -149 -83 -179 -78 -33 -212 -1 -261 61 l-19 24 -48 -43 -48 -42 43 -37 c121 -103 347 -112 462 -17 54 44 88 120 88 194 -1 130 -79 213 -242 256 -24 7 -71 25 -104 41 -48 22 -66 37 -79 65 -32 67 -5 138 65 174 73 37 193 18 244 -39 l20 -22 43 43 c41 40 42 43 25 61 -27 30 -102 64 -167 76 -64 12 -70 12 -135 1z"/><path d="M5320 505 l0 -465 65 0 65 0 0 465 0 465 -65 0 -65 0 0 -465z"/><path d="M6210 960 c-147 -25 -264 -114 -328 -249 -32 -65 -36 -84 -40 -175 -7 -161 33 -271 135 -367 140 -132 360 -164 541 -77 227 108 316 395 198 634 -88 177 -290 271 -506 234z m232 -132 c100 -46 165 -136 188 -261 20 -106 -18 -237 -88 -310 -101 -105 -245 -132 -377 -73 -74 33 -120 79 -157 154 -31 62 -33 74 -33 167 0 87 4 107 26 155 64 137 173 204 320 196 43 -2 85 -12 121 -28z"/><path d="M7135 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 376 c0 207 3 374 8 371 4 -2 115 -171 247 -375 l240 -371 78 0 77 0 0 465 0 465 -60 0 -60 0 -2 -372 -3 -372 -241 370 -241 369 -82 3 c-59 2 -83 -1 -86 -10z"/></g></svg></div>');
        }
        
        if (qualityInfo.hdr && qualityInfo.hdr_type) {
            badges.push('<div class="quality-badge quality-badge--hdr"><svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M27.2784 114V20.909H46.9602V59.318H86.9148V20.909H106.551V114H86.9148V75.545H46.9602V114H27.2784ZM155.778 114H122.778V20.909H156.051C165.415 20.909 173.475 22.773 180.233 26.5C186.991 30.197 192.188 35.515 195.824 42.455C199.491 49.394 201.324 57.697 201.324 67.364C201.324 77.061 199.491 85.394 195.824 92.364C192.188 99.333 186.96 104.682 180.142 108.409C173.354 112.136 165.233 114 155.778 114ZM142.46 97.136H154.96C160.778 97.136 165.672 96.106 169.642 94.045C173.642 91.955 176.642 88.727 178.642 84.364C180.672 79.97 181.688 74.303 181.688 67.364C181.688 60.485 180.672 54.864 178.642 50.5C176.642 46.136 173.657 42.924 169.688 40.864C165.718 38.803 160.824 37.773 155.006 37.773H142.46V97.136ZM215.903 114V20.909H252.631C259.661 20.909 265.661 22.167 270.631 24.682C275.631 27.167 279.434 30.697 282.04 35.273C284.676 39.818 285.994 45.167 285.994 51.318C285.994 57.5 284.661 62.818 281.994 67.273C279.328 71.697 275.464 75.091 270.403 77.455C265.373 79.818 259.282 81 252.131 81H227.54V65.182H248.949C252.706 65.182 255.828 64.667 258.312 63.636C260.797 62.606 262.646 61.061 263.858 59C265.1 56.939 265.722 54.379 265.722 51.318C265.722 48.227 265.1 45.621 263.858 43.5C262.646 41.379 260.782 39.773 258.267 38.682C255.782 37.561 252.646 37 248.858 37H235.585V114H215.903ZM266.176 71.636L289.312 114H267.585L244.949 71.636H266.176Z" fill="currentColor"/></svg></div>');
        }
        
        if (qualityInfo.sound) {
            let soundSvg = '';
            if (qualityInfo.sound === '7.1') {
                soundSvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M91.6023 114L130.193 37.636V37H85.2386V20.909H150.557V37.227L111.92 114H91.6023ZM159.545 115.182C156.545 115.182 153.97 114.121 151.818 112C149.697 109.848 148.636 107.273 148.636 104.273C148.636 101.303 149.697 98.758 151.818 96.636C153.97 94.515 156.545 93.455 159.545 93.455C162.455 93.455 165 94.515 167.182 96.636C169.364 98.758 170.455 101.303 170.455 104.273C170.455 106.273 169.939 108.106 168.909 109.773C167.909 111.409 166.591 112.727 164.955 113.727C163.318 114.697 161.515 115.182 159.545 115.182ZM215.045 20.909V114H195.364V39.591H194.818L173.5 52.955V35.5L196.545 20.909H215.045Z" fill="currentColor"/></svg>';
            } else if (qualityInfo.sound === '5.1') {
                soundSvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M143.733 115.273C137.309 115.273 131.581 114.091 126.551 111.727C121.551 109.364 117.581 106.106 114.642 101.955C111.703 97.803 110.172 93.045 110.051 87.682H129.142C129.354 91.288 130.869 94.212 133.688 96.455C136.506 98.697 139.854 99.818 143.733 99.818C146.824 99.818 149.551 99.136 151.915 97.773C154.309 96.379 156.172 94.455 157.506 92C158.869 89.515 159.551 86.667 159.551 83.455C159.551 80.182 158.854 77.303 157.46 74.818C156.097 72.333 154.203 70.394 151.778 69C149.354 67.606 146.581 66.894 143.46 66.864C140.733 66.864 138.081 67.424 135.506 68.545C132.96 69.667 130.975 71.197 129.551 73.136L112.051 70L116.46 20.909H173.369V37H132.688L130.278 60.318H130.824C132.46 58.015 134.93 56.106 138.233 54.591C141.536 53.076 145.233 52.318 149.324 52.318C154.93 52.318 159.93 53.636 164.324 56.273C168.718 58.909 172.188 62.53 174.733 67.136C177.278 71.712 178.536 76.985 178.506 82.955C178.536 89.227 177.081 94.803 174.142 99.682C171.233 104.53 167.157 108.348 161.915 111.136C156.703 113.894 150.642 115.273 143.733 115.273ZM200.733 115.182C197.733 115.182 195.157 114.121 193.006 112C190.884 109.848 189.824 107.273 189.824 104.273C189.824 101.303 190.884 98.758 193.006 96.636C195.157 94.515 197.733 93.455 200.733 93.455C203.642 93.455 206.188 94.515 208.369 96.636C210.551 98.758 211.642 101.303 211.642 104.273C211.642 106.273 211.127 108.106 210.097 109.773C209.097 111.409 207.778 112.727 206.142 113.727C204.506 114.697 202.703 115.182 200.733 115.182ZM256.233 20.909V114H236.551V39.591H236.006L214.688 52.955V35.5L237.733 20.909H256.233Z" fill="currentColor"/></svg>';
            } else if (qualityInfo.sound === '2.0') {
                soundSvg = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M62.983 114V99.818L96.119 69.136C98.938 66.409 101.301 63.955 103.21 61.773C105.15 59.591 106.619 57.455 107.619 55.364C108.619 53.242 109.119 50.955 109.119 48.5C109.119 45.773 108.498 43.424 107.256 41.455C106.013 39.455 104.316 37.924 102.165 36.864C100.013 35.773 97.574 35.227 94.847 35.227C91.998 35.227 89.513 35.803 87.392 36.955C85.271 38.106 83.634 39.758 82.483 41.909C81.331 44.061 80.756 46.621 80.756 49.591H62.074C62.074 43.5 63.453 38.212 66.21 33.727C68.968 29.242 72.831 25.773 77.801 23.318C82.771 20.864 88.498 19.636 94.983 19.636C101.65 19.636 107.453 20.818 112.392 23.182C117.362 25.515 121.225 28.758 123.983 32.909C126.741 37.061 128.119 41.818 128.119 47.182C128.119 50.697 127.422 54.167 126.028 57.591C124.665 61.015 122.225 64.818 118.71 69C115.195 73.152 110.241 78.136 103.847 83.955L90.256 97.273V97.909H129.347V114H62.983ZM155.108 115.182C152.108 115.182 149.532 114.121 147.381 112C145.259 109.848 144.199 107.273 144.199 104.273C144.199 101.303 145.259 98.758 147.381 96.636C149.532 94.515 152.108 93.455 155.108 93.455C158.017 93.455 160.563 94.515 162.744 96.636C164.926 98.758 166.017 101.303 166.017 104.273C166.017 106.273 165.502 108.106 164.472 109.773C163.472 111.409 162.153 112.727 160.517 113.727C158.881 114.697 157.078 115.182 155.108 115.182ZM214.483 116.045C206.665 116.015 199.938 114.091 194.301 110.273C188.695 106.455 184.377 100.924 181.347 93.682C178.347 86.439 176.862 77.727 176.892 67.545C176.892 57.394 178.392 48.742 181.392 41.591C184.422 34.439 188.741 29 194.347 25.273C199.983 21.515 206.695 19.636 214.483 19.636C222.271 19.636 228.968 21.515 234.574 25.273C240.21 29.03 244.544 34.485 247.574 41.636C250.604 48.758 252.104 57.394 252.074 67.545C252.074 77.758 250.559 86.485 247.528 93.727C244.528 100.97 240.225 106.5 234.619 110.318C229.013 114.136 222.301 116.045 214.483 116.045ZM214.483 99.727C219.816 99.727 224.074 97.045 227.256 91.682C230.438 86.318 232.013 78.273 231.983 67.545C231.983 60.485 231.256 54.606 229.801 49.909C228.377 45.212 226.347 41.682 223.71 39.318C221.104 36.955 218.028 35.773 214.483 35.773C209.18 35.773 204.938 38.424 201.756 43.727C198.574 49.03 196.968 56.97 196.938 67.545C196.938 74.697 197.65 80.667 199.074 85.455C200.528 90.212 202.574 93.788 205.21 96.182C207.847 98.545 210.938 99.727 214.483 99.727Z" fill="currentColor"/></svg>';
            }
            if (soundSvg) {
                badges.push(`<div class="quality-badge quality-badge--sound">${soundSvg}</div>`);
            }
        }
        
        if (qualityInfo.dub) {
            badges.push('<div class="quality-badge quality-badge--dub"><svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M60.5284 114H27.5284V20.909H60.8011C70.1648 20.909 78.2254 22.773 84.983 26.5C91.7405 30.197 96.9375 35.515 100.574 42.455C104.241 49.394 106.074 57.697 106.074 67.364C106.074 77.061 104.241 85.394 100.574 92.364C96.9375 99.333 91.7102 104.682 84.892 108.409C78.1042 112.136 69.983 114 60.5284 114ZM47.2102 97.136H59.7102C65.5284 97.136 70.4223 96.106 74.392 94.045C78.392 91.955 81.392 88.727 83.392 84.364C85.4223 79.97 86.4375 74.303 86.4375 67.364C86.4375 60.485 85.4223 54.864 83.392 50.5C81.392 46.136 78.4072 42.924 74.4375 40.864C70.4678 38.803 65.5739 37.773 59.7557 37.773H47.2102V97.136ZM178.153 20.909H197.835V81.364C197.835 88.152 196.214 94.091 192.972 99.182C189.759 104.273 185.259 108.242 179.472 111.091C173.684 113.909 166.941 115.318 159.244 115.318C151.517 115.318 144.759 113.909 138.972 111.091C133.184 108.242 128.684 104.273 125.472 99.182C122.259 94.091 120.653 88.152 120.653 81.364V20.909H140.335V79.682C140.335 83.227 141.108 86.379 142.653 89.136C144.229 91.894 146.441 94.061 149.29 95.636C152.138 97.212 155.456 98 159.244 98C163.063 98 166.381 97.212 169.199 95.636C172.047 94.061 174.244 91.894 175.79 89.136C177.366 86.379 178.153 83.227 178.153 79.682V20.909ZM214.028 114V20.909H251.301C258.15 20.909 263.862 21.924 268.438 23.955C273.013 25.985 276.453 28.803 278.756 32.409C281.059 35.985 282.21 40.106 282.21 44.773C282.21 48.409 281.483 51.606 280.028 54.364C278.574 57.091 276.574 59.333 274.028 61.091C271.513 62.818 268.634 64.045 265.392 64.773V65.682C268.938 65.833 272.256 66.833 275.347 68.682C278.468 70.53 280.998 73.121 282.938 76.455C284.877 79.758 285.847 83.697 285.847 88.273C285.847 93.212 284.619 97.621 282.165 101.5C279.741 105.348 276.15 108.394 271.392 110.636C266.634 112.879 260.771 114 253.801 114H214.028ZM233.71 97.909H249.756C255.241 97.909 259.241 96.864 261.756 94.773C264.271 92.652 265.528 89.833 265.528 86.318C265.528 83.742 264.907 81.47 263.665 79.5C262.422 77.53 260.65 75.985 258.347 74.864C256.074 73.742 253.362 73.182 250.21 73.182H233.71V97.909ZM233.71 59.864H248.301C250.998 59.864 253.392 59.394 255.483 58.455C257.604 57.485 259.271 56.121 260.483 54.364C261.725 52.606 262.347 50.5 262.347 48.045C262.347 44.682 261.15 41.97 258.756 39.909C256.392 37.848 253.028 36.818 248.665 36.818H233.71V59.864Z" fill="currentColor"/></svg></div>');
        }
        
        if (badges.length > 0) {
            badgesContainer.html(badges.join(''));
            badgesContainer.addClass('show');
        }
    }

    // Загружаем логотип фильма
    function loadLogo(event) {
        const data = event.data.movie;
        const activity = event.object.activity;
        
        if (!data || !activity) return;

        fillMetaInfo(activity, data);
        fillDescription(activity, data);
        fillAdditionalInfo(activity, data);

        waitForBackgroundLoad(activity, () => {
            if (!isAlive(activity)) return;

            activity.render().find('.applecation__meta').addClass('show');
            
            const useOverlay = Lampa.Storage.get('applecation_description_overlay', true);
            const descWrapper = activity.render().find('.applecation__description-wrapper').addClass('show');
            
            if (useOverlay) {
                descWrapper.addClass('selector');
                if (window.Lampa && Lampa.Controller) {
                    Lampa.Controller.collectionAppend(descWrapper);
                }
            }
            
            activity.render().find('.applecation__info').addClass('show');
        });

        const logoContainer = activity.render().find('.applecation__logo');
        const titleElement = activity.render().find('.full-start-new__title');

        const renderLogo = (logoPath) => {
            const quality = getLogoQuality();
            const logoUrl = Lampa.TMDB.image(`/t/p/${quality}${logoPath}`);

            const img = new Image();
            img.onload = () => {
                if (!isAlive(activity)) return;

                logoContainer.html(`<img src="${logoUrl}" alt="" />`);
                waitForBackgroundLoad(activity, () => {
                    if (!isAlive(activity)) return;
                    logoContainer.addClass('loaded');
                });
                
                updateOverlayLogo(logoUrl);
            };
            img.src = logoUrl;
        };

        if (data.images && data.images.logos && data.images.logos.length > 0) {
            const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
            let logo = data.images.logos.find(l => l.iso_639_1 === lang);
            
            if (!logo && Lampa.Storage.get('applecation_show_foreign_logo', true)) {
                logo = data.images.logos.find(l => l.iso_639_1 === 'en');
                if (!logo) logo = data.images.logos.find(l => !l.iso_639_1);
                if (!logo) logo = data.images.logos[0];
            }

            if (logo && logo.file_path) {
                return renderLogo(logo.file_path);
            }
        }

        const mediaType = data.name ? 'tv' : 'movie';
        const apiUrl = Lampa.TMDB.api(
            `${mediaType}/${data.id}/images?api_key=${Lampa.TMDB.key()}&language=${Lampa.Storage.get('language')}`
        );

        $.get(apiUrl, (imagesData) => {
            if (!isAlive(activity)) return;

            if (imagesData.logos && imagesData.logos.length > 0) {
                const lang = Lampa.Storage.field('tmdb_lang') || Lampa.Storage.get('language') || 'ru';
                let logo = imagesData.logos.find(l => l.iso_639_1 === lang);

                if (!logo && Lampa.Storage.get('applecation_show_foreign_logo', true)) {
                    logo = imagesData.logos.find(l => l.iso_639_1 === 'en') || imagesData.logos.find(l => !l.iso_639_1) || imagesData.logos[0];
                }

                if (logo && logo.file_path) {
                    return renderLogo(logo.file_path);
                }
            }
            
            titleElement.show();
            waitForBackgroundLoad(activity, () => {
                logoContainer.addClass('loaded');
            });
        }).fail(() => {
            titleElement.show();
            waitForBackgroundLoad(activity, () => {
                logoContainer.addClass('loaded');
            });
        });
    }

    // Ждем загрузки и появления фона
    function waitForBackgroundLoad(activity, callback) {
        const background = activity.render().find('.full-start__background:not(.applecation__overlay)');
        
        if (!background.length) {
            callback();
            return;
        }

        if (background.hasClass('loaded') && background.hasClass('applecation-animated')) {
            callback();
            return;
        }

        if (background.hasClass('loaded')) {
            setTimeout(() => {
                background.addClass('applecation-animated');
                callback();
            }, 350);
            return;
        }

        const checkInterval = setInterval(() => {
            if (!isAlive(activity)) {
                clearInterval(checkInterval);
                return;
            }

            if (background.hasClass('loaded')) {
                clearInterval(checkInterval);
                setTimeout(() => {
                    if (!isAlive(activity)) return;
                    
                    background.addClass('applecation-animated');
                    callback();
                }, 650);
            }
        }, 50);

        setTimeout(() => {
            clearInterval(checkInterval);
            if (!background.hasClass('applecation-animated')) {
                background.addClass('applecation-animated');
                callback();
            }
        }, 2000);
    }

    // Добавляем оверлей рядом с фоном
    function addOverlay(activity) {
        const background = activity.render().find('.full-start__background');
        if (background.length && !background.next('.applecation__overlay').length) {
            background.after('<div class="full-start__background loaded applecation__overlay"></div>');
        }
    }

    // Применяем размытие фона при прокрутке
    function attachScrollBlur(activity) {
        const background = activity.render().find('.full-start__background:not(.applecation__overlay)')[0];
        const scrollBody = activity.render().find('.scroll__body')[0];
        
        if (!background || !scrollBody) return;
        
        let isBlurred = false;
        
        const originalDescriptor = Object.getOwnPropertyDescriptor(scrollBody.style, '-webkit-transform') || 
                                   Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'webkitTransform');
        
        Object.defineProperty(scrollBody.style, '-webkit-transform', {
            set: function(value) {
                if (value) {
                    const yStart = value.indexOf(',') + 1;
                    const yEnd = value.indexOf(',', yStart);
                    if (yStart > 0 && yEnd > yStart) {
                        const yValue = parseFloat(value.substring(yStart, yEnd));
                        const shouldBlur = yValue < 0;
                        
                        if (shouldBlur !== isBlurred) {
                            isBlurred = shouldBlur;
                            background.classList.toggle('dim', shouldBlur);
                        }
                    }
                }
                
                if (originalDescriptor && originalDescriptor.set) {
                    originalDescriptor.set.call(this, value);
                } else {
                    this.setProperty('-webkit-transform', value);
                }
            },
            get: function() {
                if (originalDescriptor && originalDescriptor.get) {
                    return originalDescriptor.get.call(this);
                }
                return this.getPropertyValue('-webkit-transform');
            },
            configurable: true
        });
    }

    // Добавляем бегущую строку для длинных имен персон
    function attachPersonMarquee(activity) {
        const render = activity.render();
        const names = render.find('.full-person__name');
        
        names.each(function() {
            const nameElement = $(this);
            if (nameElement.hasClass('marquee-processed')) {
                const originalText = nameElement.find('span').first().text();
                if (originalText) {
                    nameElement.text(originalText);
                    nameElement.removeClass('marquee-processed marquee-active');
                    nameElement.css('--marquee-duration', '');
                }
            }
        });

        function isTextOverflowing(element) {
            return element.scrollWidth > element.clientWidth + 1;
        }
        
        setTimeout(() => {
            if (!isAlive(activity)) return;

            names.each(function() {
                const nameElement = $(this);
                const text = nameElement.text().trim();
                
                if (!text) return;
                
                if (isTextOverflowing(nameElement[0])) {
                    const duration = Math.min(Math.max(text.length * 0.25, 5), 20);
                    
                    nameElement.addClass('marquee-processed marquee-active');
                    nameElement.css('--marquee-duration', duration + 's');
                    
                    const span1 = $('<span>').text(text);
                    const span2 = $('<span>').text(text);
                    const inner = $('<div class="marquee__inner">').append(span1).append(span2);
                    
                    nameElement.empty().append(inner);
                } else {
                    nameElement.addClass('marquee-processed');
                }
            });
        }, 100);
    }

    // Подключаем загрузку логотипов
    function attachLogoLoader() {
        Lampa.Listener.follow('full', (event) => {
            if (Lampa.Storage.get('applecation_description_overlay', true)) {
                disableFullDescription(event);
            }
            
            if (event.type === 'complite') {
                const activity = event.object.activity;
                const render = activity.render();
                
                render.addClass('applecation');

                activity.__destroyed = false;
                
                var originalDestroy = activity.destroy;
                activity.destroy = function() {
                    activity.__destroyed = true;
                    if (originalDestroy) originalDestroy.apply(activity, arguments);
                };

                const posterSize = Lampa.Storage.field('poster_size');
                render.toggleClass('applecation--poster-high', posterSize === 'w500');

                addOverlay(activity);
                loadLogo(event);
                attachScrollBlur(activity);
                attachPersonMarquee(activity);

                const data = event.data;
                const movie = data && data.movie;
                if (movie) {
                    analyzeContentQualities(movie, activity);
                }
            }
        });
    }

    // Регистрация плагина в манифесте
    var pluginManifest = {
        type: 'other',
        version: APPLECATION_VERSION,
        name: 'Applecation',
        description: 'Делает интерфейс в карточке фильма похожим на Apple TV и оптимизирует под 4K',
        author: '@darkestclouds',
        icon: PLUGIN_ICON
    };

    // Регистрируем плагин
    if (Lampa.Manifest && Lampa.Manifest.plugins) {
        Lampa.Manifest.plugins = pluginManifest;
    }

    // Запуск плагина
    if (window.appready) {
        initializePlugin();
    } else {
        Lampa.Listener.follow('app', (event) => {
            if (event.type === 'ready') {
                initializePlugin();
            }
        });
    }

})();
