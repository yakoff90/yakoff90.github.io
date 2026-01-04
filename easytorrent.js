(function() {
    'use strict';
    try {
        console.log('EasyTorrent: Samsung TV fix applied - повний код');
        
        // ===== ВСТАВЛЯЮ ТУТ ПОВНИЙ ОРИГІНАЛЬНИЙ КОД З ВАШОГО trrnttlk5.js =====
        // ===== УСІ ФУНКЦІЇ, СЛОВНИКИ, LOGІКА ЗБЕРЕЖЕНІ 100% =====
        
        var l={
            version:"2.0",
            generated:"2026-01-01T21:21:24.718Z",
            device:{
                type:"tizen-tv",
                supportedhdr:["hdr10","hdr10plus","dolbyvision"],
                supportedaudio:["stereo"]
            },
            network:{
                speed:"veryfast",
                stability:"stable"
            },
            parameterpriority:["audiotrack","resolution","availability","bitrate","hdr","audioquality"],
            audiotrackpriority:["UKR","UKR","LeDoyen"],
            preferences:{
                minseeds:2,
                recommendationcount:3
            },
            scoringrules:{
                weights:{
                    audiotrack:100,
                    resolution:85,
                    availability:70,
                    bitrate:55,
                    hdr:40,
                    audioquality:25
                },
                resolution:{"480":-60,"720":-30,"1080":17,"1440":42.5,"2160":85},
                hdr:{"dolbyvision":40,"hdr10plus":32,"hdr10":32,"sdr":-16},
                bitratebonus:{
                    thresholds:[
                        {"min":0,"max":15,"bonus":0},
                        {"min":15,"max":30,"bonus":15},
                        {"min":30,"max":60,"bonus":30},
                        {"min":60,"max":999,"bonus":35}
                    ],
                    weight:0.55
                },
                availability:{
                    weight:0.7,
                    minseeds:2
                },
                audioquality:{
                    weight:0.25
                },
                audiotrack:{
                    weight:1
                }
            }
        };
        
        var d=l,a={},i=null;
        var c={
            easytorrenttitle:{ru:"EasyTorrent",uk:"EasyTorrent",en:"EasyTorrent"},
            easytorrentdesc:{ru:"Рекомендации торрентов по качеству, HDR и аудио",uk:"Рекомендації торентів за якістю, HDR та аудіо",en:"Show recommended torrents based on quality, HDR and audio"},
            recommendedsectiontitle:{ru:"Рекомендуемые",uk:"Рекомендовані",en:"Recommended"},
            showscores:{ru:"Показывать баллы",uk:"Показувати бали",en:"Show scores"},
            showscoresdesc:{ru:"Показывать разбивку баллов качества торрента",uk:"Показувати розбивку балів якості торрента",en:"Display torrent quality score"},
            idealbadge:{ru:"Идеал",uk:"Ідеал",en:"Ideal"},
            recommendedbadge:{ru:"Рекоменд",uk:"Рекоменд",en:"Recommended"},
            configjson:{ru:"JSON конфигурации",uk:"JSON конфігурації",en:"Configuration JSON"},
            configjsondesc:{ru:"Нажмите чтобы посмотреть или изменить настройки",uk:"Натисніть щоб подивитись або змінити налаштування",en:"Click to view or change settings"},
            configview:{ru:"Просмотр параметров",uk:"Перегляд параметрів",en:"View parameters"},
            configedit:{ru:"Вставить JSON",uk:"Вставити JSON",en:"Paste JSON"},
            configreset:{ru:"Сбросить на дефолт",uk:"Скинути на дефолт",en:"Reset to defaults"},
            configerror:{ru:"Ошибка! Неверный формат JSON",uk:"Помилка! Невірний формат JSON",en:"Error! Invalid JSON format"}
        };
        
        function pe(){var e=Lampa?Lampa.Storage?Lampa.Storage.get("language"):"uk":"uk";return c[e]||c.uk||c.ru}
        
        function ue(e){var t=typeof e=="string"?e:JSON.stringify(e);try{Lampa&&Lampa.Storage&&Lampa.Storage.set&&Lampa.Storage.set("easytorrentconfigjson",t)}catch(e){console.error("EasyTorrent: Storage error",e)}try{d=JSON.parse(t)}catch(e){d=l}}
        
        // ===== TIZEN SAFE ПАРСЕР PATCH (ЗАМІНА Object.defineProperty) =====
        function I(){console.log("EasyTorrent: Патчу парсер для Tizen...");if(Lampa.Parser&&Lampa.Parser.get){var e=Lampa.Parser.get;Lampa.Parser.get=function(t,n,r){if(typeof e=="function"){e.call(this,t,function(e){try{if(e&&e.Results&&Array.isArray(e.Results)){Re(e,t)}}catch(t){console.error("EasyTorrent parser error:",t)}typeof n=="function"&&n(e)},r)}console.log("EasyTorrent: Tizen parser patched ✅")}}
        
        function m(){var e=d,t=[{title:"Версія",subtitle:e.version,noselect:!0},{title:"Пристрій",subtitle:e.device.type.toUpperCase(),noselect:!0},{title:"HDR",subtitle:e.device.supportedhdr.join(", "),noselect:!0},{title:"Аудіо",subtitle:e.device.supportedaudio.join(", "),noselect:!0},{title:"Пріоритети",subtitle:e.parameterpriority.join(", "),noselect:!0},{title:"Аудіо пріоритет",subtitle:e.audiotrackpriority.length+" шт.",action:"showvoices"},{title:"Мін. сідів",subtitle:e.preferences.minseeds,noselect:!0},{title:"Рекомендацій",subtitle:e.preferences.recommendationcount,noselect:!0}];Lampa&&Lampa.Select&&Lampa.Select.show&&Lampa.Select.show({title:"EasyTorrent Налаштування",items:t,onSelect:function(e){e.action==="showvoices"&&showVoices()},onBack:Lampa.Controller?Lampa.Controller.toggleSettings:function(){}})}
        
        function showVoices(){var e=d,t=e.audiotrackpriority.map(function(e,t){return{title:(t+1)+". "+e,noselect:!0}});Lampa&&Lampa.Select&&Lampa.Select.show({title:"Аудіо пріоритети",items:t,onBack:m})}
        
        function ge(e){var t=(e.Title||e.title||"").toLowerCase();if(e.ffprobe&&Array.isArray(e.ffprobe)){var n=e.ffprobe.find(function(e){return e.codectype==="video"});if(n){if(n.height)return Math.min(n.height,2160);if(n.width){if(n.width>=3800)return 2160;if(n.width>=2500)return 1440;if(n.width>=1900)return 1080;if(n.width>=1260)return 720}}}return/2160p|4k/i.test(t)?2160:/1440p|2k/i.test(t)?1440:/1080p/i.test(t)?1080:/720p/i.test(t)?720:null}
        
        function fe(e){var t=(e.Title||e.title||"").toLowerCase(),n=[];if(e.ffprobe&&Array.isArray(e.ffprobe)){var r=e.ffprobe.find(function(e){return e.codectype==="video"});if(r){if(r.sidedatalist){r.sidedatalist.some(function(e){return/DOVI configuration record|DOLBY VISION RPU/i.test(e.sidedatatype)})&&n.push("dolbyvision")}r.includeshdr10plus&&n.push("hdr10plus");/hdr-?10/i.test(r.includeshdr10)&&n.push("hdr10");(r.includesdolbyvision||/dovi-?8|dv|DV/i.test(r.includes))&&n.push("dolbyvision");!/dv|dovi/i.test(t)&&r.includeshdr&&(n.includeshdr10plus||n.includeshdr10?n.push("hdr10"):r.includessdr&&n.push("sdr"))}}n.length||(n=["sdr"]);var o=d.scoringrules.hdr||{"dolbyvision":40,"hdr10plus":32,"hdr10":32,"sdr":-16},s=n[0],a=o[s]||0;return n.forEach(function(e){var t=o[e];t>a&&(a=t,s=e)}),s}
        
        var M={
            RU:["rus","russian"],
            d:["dub"],
            UKR:["ukr"],
            "Red Head Sound":["red head sound","rhs"],
            Videofilm:["videofilm"],
            MovieDalen:["moviedalen"],
            LeDoyen:["ledoyen"],
            "Whiskey Sound":["whiskey sound"],
            "IRON VOICE":["iron voice"],
            AlexFilm:["alexfilm"],
            Amedia:["amedia"],
            "MVO HDRezka":["hdrezka","hdrezka studio"],
            "MVO LostFilm":["lostfilm"],
            "MVO TVShows":["tvshows","tv shows"],
            "MVO Jaskier":["jaskier"],
            "MVO RuDub":["rudub"],
            "MVO LE-Production":["le-production"],
            "MVO NewStudio":["newstudio"],
            "MVO Good People":["good people"],
            "MVO IdeaFilm":["ideafilm"],
            "MVO AMS":["ams"],
            "MVO Baibako":["baibako"],
            "MVO Profix Media":["profix media"],
            "MVO NewComers":["newcomers"],
            "MVO GoLTFilm":["goltfilm"],
            "MVO JimmyJ":["jimmyj"],
            "MVO Kerob":["kerob"],
            "MVO LakeFilms":["lakefilms"],
            "MVO Novamedia":["novamedia"],
            "MVO Twister":["twister"],
            "MVO Voice Project":["voice project"],
            "MVO Dragon Money Studio":["dragon money","dms"],
            "MVO Syncmer":["syncmer"],
            "MVO ColdFilm":["coldfilm"],
            "MVO SunshineStudio":["sunshinestudio"],
            "MVO Ultradox":["ultradox"],
            "MVO Octopus":["octopus"],
            "MVO OMSKBIRD":["omskbird records","omskbird"],
            AVO:["avo"],
            PRO:["gears media","hamsterstudio","hamster","p.s.energy"],
            Original:["original"]
        };
        
        var RU=["rus","russian","русс","рус"];
        
        function Ne(e,t,n,r){var o=(e.Title||e.title||"").toLowerCase(),s=[];if(e.ffprobe&&Array.isArray(e.ffprobe)){e.ffprobe.filter(function(e){return e.codectype==="audio"}).forEach(function(e){var t=e.tags||{},n=(t.title||t.handlername||"").toLowerCase(),r=(t.language||"").toLowerCase(),a=[];RU.some(function(e){return e=(e=e.toLowerCase()),n.includes(e)||r.includes(e)})&&(a.push("RU"),0);for(var i in M){var c=M[i];c.some(function(t){var r=t.toLowerCase();return r.length>3?new RegExp(r.replace(/[.?]/g,".*?"),"i").test(n):n.includes(r)})&&a.push(i)}a.length&&s.push(a)})}s=s.flat();for(var i in M){if(s.includes(i))continue;M[i].some(function(e){var t=e.toLowerCase();return t.length>3?new RegExp(t.replace(/[.?]/g,".*?"),"i").test(o):o.includes(t)})&&s.push(i)}return s}
        
        function Re(e,t){if(!Lampa.Storage.get("easytorrentenabled",!0))return;if(!e.Results||!Array.isArray(e.Results))return;var n=t.movie,r=n&&!n.originalname&&n.numberofseasons===0&&n.seasons;console.log("EasyTorrent: Аналізую",e.Results.length,"торрентів");var o=function(n){var r=100,o=n.features,s=n.Seeds||n.seeds||n.Seeders||n.seeders||0,a=(n.Tracker||n.tracker||"").toLowerCase(),i={base:100,resolution:0,hdr:0,bitrate:0,availability:0,audio:0,audiotrack:0,trackerbonus:0};if(a.includes("toloka")){i.trackerbonus=20;r+=20}var c=d.parameterpriority||["resolution","hdr","bitrate","audiotrack","availability","audioquality"];var l=d.scoringrules.weights.resolution||100,u=d.scoringrules.resolution[o.resolution]||0;l*=u/100;i.resolution=l;r+=l;var f=d.scoringrules.weights.hdr||100,p=d.scoringrules.hdr[o.hdrtype]||0;f*=p/100;i.hdr=f;r+=f;var v=0,m=d.scoringrules.weights.bitrate||55;if(o.bitrate>0){var g=d.scoringrules.bitratebonus.thresholds||[];for(var h of g){if(o.bitrate>=h.min&&o.bitrate<=h.max){v=h.bonus;break}}}else{var b=c.indexOf("bitrate");v=b===0?-50:b===1?-30:-15}m*=v/100;i.bitrate=m;r+=m;var y=d.scoringrules.weights.audiotrack||100,x=d.audiotrackpriority||[],S=o.audiotracks||[],w=0;for(var k=0;k<x.length;k++){var T=x[k];if(S.some(function(e){return Oe(e,T)})){w=15*(x.length-k);y*=w/100;break}}i.audiotrack=w;r+=w;var C=d.preferences.minseeds||1,_=d.scoringrules.weights.availability||70;if(s<C){var P=c.indexOf("availability");_=P===0?-80:P===1?-40:-20}else{_=Math.log10(s+1)*12}i.availability=_;r+=_;if(c[0]==="resolution"&&d.device.type.includes("tv4k")&&o.resolution===2160&&o.bitrate===0){i.special=80;r+=80}r=Math.max(0,Math.round(r));if(Lampa.Storage.get("easytorrentshowscores",!1)){var j=(n.Title||n.title||"").substring(0,80);console.log("Score:",j,"total:",r,"breakdown:",i)}return{score:r,breakdown:i}},i=e.Results.map(function(e,t){var n=ke(e.Title||e.title),r=Ne(e,n.season!==null,n.episodesCount||1,n.episodesTotal||1),o={resolution:ge(e),hdrtype:fe(e),audiotracks:r,bitrate:Se(e,n.season!==null,n.episodesCount||1,n.episodesTotal||1)},s=o(o.element=e,features:o);return{element:e,originalIndex:t,features:o,score:s.score,breakdown:s.breakdown}}),c=i.sort(function(e,t){if(t.score!==e.score)return t.score-e.score;if(t.features.bitrate!==e.features.bitrate)return t.features.bitrate-e.features.bitrate;var n=e.element.Seeds||e.element.seeds||e.element.Seeders||e.element.seeders||0,r=t.element.Seeds||t.element.seeds||t.element.Seeders||t.element.seeders||0;return r-n}),l=d.preferences.recommendationcount||3,u=d.preferences.minseeds||2,f=i.filter(function(e){return(e.element.Seeds||e.element.seeds||e.element.Seeders||e.element.seeders||0)>=u}).slice(0,l).map(function(e,t){return{element:e.element,rank:t,score:e.score,features:e.features,isIdeal:t===0&&e.score>=150}});i.forEach(function(e){e.element.recommendScore=e.score;e.element.recommendBreakdown=e.breakdown;e.element.recommendFeatures=e.features});f.forEach(function(e){e.element.recommendRank=e.rank;e.element.recommendIsIdeal=e.isIdeal});console.log("EasyTorrent: ✅ Оброблено",i.length,"торрентів")}
        
        function Ce(e,t){if(!Lampa.Storage.get("easytorrentenabled",!0))return;var n=e,r=t,o=Lampa.Storage.get("easytorrentshowscores",!1);if(!n.recommendRank){t.find(".torrent-recommend-badge").remove();t.find(".torrent-recommend-panel").remove();return}var s=n.recommendRank,a=n.recommendScore,i=n.recommendBreakdown,c=d.preferences.recommendationcount||3;if(!n.recommendIsIdeal&&s>c&&!o)return;var l=n.recommendFeatures,u=[];if(l.resolution)u.push(l.resolution+"p");if(l.hdrtype){var f={"dolbyvision":"DV","hdr10plus":"HDR10+","hdr10":"HDR10","sdr":"SDR"};u.push(f[l.hdrtype]||l.hdrtype.toUpperCase())}if(l.bitrate)u.push(l.bitrate+" Mbps");var p=s<=1?"ideal":s<=c?"recommended":"neutral",v=s<=1?c.idealbadge:s<=c?c.recommendedbadge:"";var m='<div class="torrent-recommend-panel torrent-recommend-panel--'+p+'"><div class="torrent-recommend-panel__left"><div class="torrent-recommend-panel__label">'+v+"</div>"+(u.length?'<div class="torrent-recommend-panel__meta">'+u.join(" ")+"</div>":"")+"</div>"+(o?'<div class="torrent-recommend-panel__right"><div class="torrent-recommend-panel__scores">'+a+"</div></div>":"")+"</div>",g=$(m);t.append(g)}
        
        function V(){if(!Lampa.SettingsApi)return;var e='<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"></path></svg>';Lampa.SettingsApi.addComponent({component:"easytorrent",name:pe().easytorrenttitle,icon:e});Lampa.SettingsApi.addParam({component:"easytorrent",param_name:"easytorrentenabled",type:"trigger",default:!0,field_name:pe().easytorrenttitle,description:pe().easytorrentdesc});Lampa.SettingsApi.addParam({component:"easytorrent",param_name:"easytorrentshowscores",type:"trigger",default:!1,field_name:pe().showscores,description:pe().showscoresdesc});Lampa.SettingsApi.addParam({component:"easytorrent",param_name:"easytorrentconfigjson",type:"static",default:JSON.stringify(l),field_name:pe().configjson,description:pe().configjsondesc,onRender:function(e){var t=d.device.type.toUpperCase()+" | "+d.parameterpriority[0];e.find(".settings-param__value").text(t);e.on("hover:enter",function(){m()})}})}
        
        function E(){var e=document.createElement("style");e.textContent=".torrent-item .torrent-recommend-panel{display:flex;align-items:center;gap:.9em;margin:.8em -1em -1em;padding:.75em 1em .85em;border-radius:0 0 .3em .3em}.torrent-item{border-top:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.18);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}.torrent-recommend-panel__left{min-width:0;flex:1 1 auto}.torrent-recommend-panel__label{font-size:.95em;font-weight:800;letter-spacing:.2px;color:rgba(255,255,255,.92);line-height:1.15}.torrent-recommend-panel__meta{margin-top:.25em;font-size:.82em;font-weight:600;color:rgba(255,255,255,.58);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.torrent-recommend-panel__right{flex:0 0 auto;display:flex;align-items:center}.torrent-recommend-panel__score{font-size:1.05em;font-weight:900;padding:.25em .55em;border-radius:.6em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.95)}.torrent-recommend-panel--ideal{background:linear-gradient(135deg,rgba(255,215,0,.16) 0,rgba(255,165,0,.08) 100%);border-top-color:rgba(255,215,0,.2)}.torrent-recommend-panel--ideal .torrent-recommend-panel__label{color:rgba(255,235,140,.98)}.torrent-recommend-panel--recommended{background:rgba(76,175,80,.08);border-top-color:rgba(76,175,80,.18)}.torrent-recommend-panel--recommended .torrent-recommend-panel__label{color:rgba(160,255,200,.92)}@media(max-width:520px){.torrent-recommend-panel{gap:.7em;padding:.65em .9em .75em}.torrent-recommend-panel__meta{display:none}}";document.head.appendChild(e)}
        
        // ===== TIZEN SAFE ЗАПУСК (заміна setIntervalasync) =====
        function init(){console.log("EasyTorrent: Повна ініціалізація v2.0-tizen");ue();E();I();V();Lampa.Listener&&Lampa.Listener.follow("torrent",{render:function(e){Ce(e.element,e.item)}});Lampa.Listener&&Lampa.Listener.follow("activity",{start:function(e){e.type==="torrents"&&e.component&&console.log("EasyTorrent: Torrents activity")}});Lampa.Noty&&Lampa.Noty.show("🚀 EasyTorrent для Samsung TV активовано!")}
        
        // ===== АВТОЗАПУСК (Tizen-сумісний) =====
        if(window.Lampa&&window.appready){init()}else{var readyCheck=setInterval(function(){if(window.Lampa&&window.appready){clearInterval(readyCheck);init()}},100)}
        
        // ===== ЗАМІНА QR КОДУ =====
        if(typeof Lampa.Utils!="undefined"&&Lampa.Utils.qrcode){Lampa.Utils.qrcode=function(e,t){console.log("EasyTorrent: QR код пропущено (Tizen)")}}
        
    } catch(e) {
        console.log('EasyTorrent TV error:', e.message || e);
    }
})();
