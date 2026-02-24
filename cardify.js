(function () {
    "use strict";

    // Спрощена система стану
    function State(object) {
        this.state = object.state;
        this.start = function () { this.dispath(this.state); };
        this.dispath = function (name) {
            var action = object.transitions[name];
            if (action) action.call(this, this);
        };
    }

    var Player = (function () {
        function Player(object, video) {
            var _this = this;
            this.html = $(
                '<div class="cardify-trailer">' +
                    '<div class="cardify-trailer__youtube">' +
                        '<div class="cardify-trailer__youtube-iframe"></div>' +
                    '</div>' +
                    '<div class="cardify-trailer__controlls">' +
                        '<div class="cardify-trailer__title"></div>' +
                        '<div class="cardify-trailer__remote">' +
                            '<div class="cardify-trailer__remote-text">' + Lampa.Lang.translate("cardify_enable_sound") + '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );

            if (typeof YT !== "undefined" && YT.Player) {
                this.youtube = new YT.Player(this.html.find(".cardify-trailer__youtube-iframe")[0], {
                    height: '100%',
                    width: '100%',
                    videoId: video.id,
                    playerVars: { controls: 0, autoplay: 0, mute: 1, playsinline: 1, rel: 0 },
                    events: {
                        onReady: function() { _this.loaded = true; Lampa.Subscribe().send("loaded"); },
                        onStateChange: function(e) { if (e.data == YT.PlayerState.PLAYING && window.cardify_first_unmute) _this.unmute(); }
                    }
                });
            }
        }
        Player.prototype.play = function() { try { this.youtube.playVideo(); } catch(e){} };
        Player.prototype.pause = function() { try { this.youtube.pauseVideo(); } catch(e){} };
        Player.prototype.show = function() { this.html.addClass("display"); };
        Player.prototype.hide = function() { this.html.removeClass("display"); };
        Player.prototype.destroy = function() { try { this.youtube.destroy(); } catch(e){} this.html.remove(); };
        Player.prototype.render = function() { return this.html; };
        return Player;
    })();

    var Main = {
        fixUI: function(e) {
            var render = e.object.activity.render();
            render.find(".full-start__background").addClass("cardify__background");
            
            // Встановлення оригінального постера
            if (e.data && e.data.movie && e.data.movie.backdrop_path) {
                var originalUrl = "https://image.tmdb.org/t/p/original" + e.data.movie.backdrop_path;
                render.find("img.full-start__background").attr("src", originalUrl);
            }

            // Додавання слогану (максимально просто)
            if (e.data && e.data.movie && e.data.movie.tagline) {
                render.find('.full-start-new__tagline').remove();
                var tagline = $('<div class="full-start-new__tagline">' + e.data.movie.tagline + '</div>');
                render.find('.full-start-new__title').after(tagline);
            }

            // Налаштування статусів
            if (!Lampa.Storage.field("cardify_show_status")) render.find(".full-start__status").hide();
            if (!Lampa.Storage.field("cardify_show_rating")) render.find(".full-start-new__rate-line.rate-fix").hide();
        }
    };

    function startPlugin() {
        Lampa.Lang.add({
            cardify_enable_sound: { uk: "Увімкнути звук", ru: "Включить звук", en: "Enable sound" },
            cardify_enable_trailer: { uk: "Показувати трейлер", ru: "Показывать трейлер", en: "Show trailer" }
        });

        Lampa.Template.add("full_start_new", 
            '<div class="full-start-new cardify">' +
            '<div class="full-start-new__body">' +
                '<div class="full-start-new__right">' +
                    '<div class="cardify__left">' +
                        '<div class="full-start-new__title">{title}</div>' +
                        '<div class="full-start-new__rate-line rate-fix">' +
                            '<div class="full-start__rate"><div>{rating}</div><div class="source--name">TMDB</div></div>' +
                        '</div>' +
                        '<div class="full-start-new__details"></div>' +
                        '<div class="full-start-new__buttons">' +
                            '<div class="full-start__button selector button--play"><span>#{title_watch}</span></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '</div>'
        );

        // Полегшені стилі
        var style = '<style>' +
            '.full-start-new__tagline { font-size: 1.5em !important; font-style: italic; color: rgba(255,255,255,0.7); margin: 5px 0 15px 0; display: block; }' +
            '.cardify__background { mask-image: linear-gradient(to bottom, white 50%, transparent 100%); }' +
            '.cardify-trailer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 0.3s; pointer-events: none; }' +
            '.cardify-trailer.display { opacity: 1; }' +
            '</style>';
        $('body').append(style);

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complete') {
                Main.fixUI(e);
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
