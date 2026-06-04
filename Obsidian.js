(function() {
    'use strict';
    
    // Стилі для відображення серії та якості
    const style = document.createElement('style');
    style.textContent = `
        /* Стилі для серії */
        .obsidian-season-episode {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 8px 0;
            padding: 4px 0;
        }
        .obsidian-season, .obsidian-episode {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            background: rgba(0,0,0,0.7);
            color: #ff9800;
        }
        /* Стилі для якості */
        .obsidian-quality {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin: 0 5px;
        }
        .obsidian-quality-video, .obsidian-quality-audio {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .obsidian-quality-video {
            background: #2c3e50;
            color: #3498db;
        }
        .obsidian-quality-audio {
            background: #2c3e50;
            color: #2ecc71;
        }
    `;
    document.head.appendChild(style);

    // Функція для відображення серії (сезон/епізод)
    function displaySeasonEpisode(card, data) {
        if (!card || !data) return;
        
        const season = data.season;
        const episode = data.episode;
        
        if (season !== undefined || episode !== undefined) {
            // Видаляємо старий блок, якщо є
            const oldBlock = card.querySelector('.obsidian-season-episode');
            if (oldBlock) oldBlock.remove();
            
            // Створюємо новий блок
            const block = document.createElement('div');
            block.className = 'obsidian-season-episode';
            
            if (season !== undefined) {
                const seasonEl = document.createElement('span');
                seasonEl.className = 'obsidian-season';
                seasonEl.textContent = `S${String(season).padStart(2, '0')}`;
                block.appendChild(seasonEl);
            }
            
            if (episode !== undefined) {
                const episodeEl = document.createElement('span');
                episodeEl.className = 'obsidian-episode';
                episodeEl.textContent = `E${String(episode).padStart(2, '0')}`;
                block.appendChild(episodeEl);
            }
            
            // Додаємо в картку
            const titleContainer = card.querySelector('.title-container, .info, .movie-info');
            if (titleContainer) {
                titleContainer.appendChild(block);
            } else {
                card.appendChild(block);
            }
        }
    }

    // Функція для відображення якості
    function displayQuality(card, data) {
        if (!card || !data) return;
        
        const videoQuality = data.quality || data.video_quality;
        const audioQuality = data.audio_quality;
        
        if (videoQuality || audioQuality) {
            // Видаляємо старий блок, якщо є
            const oldBlock = card.querySelector('.obsidian-quality');
            if (oldBlock) oldBlock.remove();
            
            // Створюємо новий блок
            const block = document.createElement('div');
            block.className = 'obsidian-quality';
            
            if (videoQuality) {
                const videoEl = document.createElement('span');
                videoEl.className = 'obsidian-quality-video';
                videoEl.textContent = videoQuality.toString().toUpperCase();
                block.appendChild(videoEl);
            }
            
            if (audioQuality) {
                const audioEl = document.createElement('span');
                audioEl.className = 'obsidian-quality-audio';
                audioEl.textContent = audioQuality.toString().toUpperCase();
                block.appendChild(audioEl);
            }
            
            // Додаємо в картку поруч з рейтингом або в кінець info блоку
            const ratingBlock = card.querySelector('.rating, .rating-block');
            if (ratingBlock) {
                ratingBlock.insertAdjacentElement('afterend', block);
            } else {
                const infoBlock = card.querySelector('.info, .movie-info');
                if (infoBlock) {
                    infoBlock.appendChild(block);
                } else {
                    card.appendChild(block);
                }
            }
        }
    }

    // Головна функція обробки картки
    function processCard(card, data) {
        if (!card) return;
        
        // Відображаємо серію (сезон/епізод)
        displaySeasonEpisode(card, data);
        
        // Відображаємо якість
        displayQuality(card, data);
    }

    // Перехоплюємо створення карток в Lampa
    if (window.Lampa && window.Lampa.Component && window.Lampa.Component.MovieCard) {
        const originalRender = window.Lampa.Component.MovieCard.prototype.render;
        
        window.Lampa.Component.MovieCard.prototype.render = function(data) {
            const result = originalRender.call(this, data);
            
            setTimeout(() => {
                if (this.$el && data) {
                    processCard(this.$el, data);
                }
            }, 50);
            
            return result;
        };
    }

    // Слідкуємо за появою нових карток в DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // Якщо це картка фільму
                        if (node.classList && (node.classList.contains('movie-card') || node.classList.contains('item-card'))) {
                            setTimeout(() => {
                                // Спроба отримати дані з атрибутів
                                const data = {
                                    season: node.getAttribute('data-season'),
                                    episode: node.getAttribute('data-episode'),
                                    quality: node.getAttribute('data-quality'),
                                    video_quality: node.getAttribute('data-video-quality'),
                                    audio_quality: node.getAttribute('data-audio-quality')
                                };
                                processCard(node, data);
                            }, 50);
                        }
                        // Якщо всередині є картки
                        else if (node.querySelector) {
                            const cards = node.querySelectorAll('.movie-card, .item-card');
                            cards.forEach(card => {
                                setTimeout(() => {
                                    const data = {
                                        season: card.getAttribute('data-season'),
                                        episode: card.getAttribute('data-episode'),
                                        quality: card.getAttribute('data-quality'),
                                        video_quality: card.getAttribute('data-video-quality'),
                                        audio_quality: card.getAttribute('data-audio-quality')
                                    };
                                    processCard(card, data);
                                }, 50);
                            });
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Обробка подій Lampa
    if (window.Lampa && window.Lampa.Events) {
        window.Lampa.Events.on('ready', function() {
            setTimeout(() => {
                document.querySelectorAll('.movie-card, .item-card').forEach(card => {
                    const data = {
                        season: card.getAttribute('data-season'),
                        episode: card.getAttribute('data-episode'),
                        quality: card.getAttribute('data-quality'),
                        video_quality: card.getAttribute('data-video-quality'),
                        audio_quality: card.getAttribute('data-audio-quality')
                    };
                    processCard(card, data);
                });
            }, 200);
        });
        
        window.Lampa.Events.on('movie:card:open', function(card) {
            setTimeout(() => {
                if (card && card.$el) {
                    const data = card.data || {};
                    processCard(card.$el, data);
                }
            }, 50);
        });
    }

    // Ініціалізація при завантаженні
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                document.querySelectorAll('.movie-card, .item-card').forEach(card => {
                    const data = {
                        season: card.getAttribute('data-season'),
                        episode: card.getAttribute('data-episode'),
                        quality: card.getAttribute('data-quality'),
                        video_quality: card.getAttribute('data-video-quality'),
                        audio_quality: card.getAttribute('data-audio-quality')
                    };
                    processCard(card, data);
                });
            }, 200);
        });
    } else {
        setTimeout(() => {
            document.querySelectorAll('.movie-card, .item-card').forEach(card => {
                const data = {
                    season: card.getAttribute('data-season'),
                    episode: card.getAttribute('data-episode'),
                    quality: card.getAttribute('data-quality'),
                    video_quality: card.getAttribute('data-video-quality'),
                    audio_quality: card.getAttribute('data-audio-quality')
                };
                processCard(card, data);
            });
        }, 200);
    }
    
    console.log('Obsidian plugin loaded - Only season/episode and quality display');
})();
