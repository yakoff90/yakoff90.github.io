(function(){'use strict';
try{
function getRender(){try{if(typeof Lampa==='undefined'||!Lampa.Activity||!Lampa.Activity.active)return null;var a=Lampa.Activity.active();return a&&a.activity&&typeof a.activity.render==='function'?a.activity.render():null}catch(e){return null;}}

Lampa.Lang.add({
ratimg_omdb_avg:{ru:'ИТОГ',en:'TOTAL',uk:'Середній ⭐'},
loading_dots:{ru:'Загрузка рейтингов',en:'Loading ratings',uk:'Завантаження рейтингів ...'},
maxsm_omdb_oscars:{ru:'Оскары',en:'Oscars',uk:'Оскари 🏆'},
source_imdb:{ru:'IMDB',en:'IMDB',uk:'IMDb 🎬'},
source_tmdb:{ru:'TMDB',en:'TMDB',uk:'TMDB 🎥'},
source_rt:{ru:'Rotten Tomatoes',en:'Rotten Tomatoes',uk:'Rotten Tomatoes 🍅'},
source_mc:{ru:'Metacritic',en:'Metacritic',uk:'Metacritic 🎯'}
});

var style='<style id="maxsm_omdb_rating">.full-start-new__rate-line{visibility:hidden;flex-wrap:wrap;gap:.4em 0}.full-start-new__rate-line>*{margin-left:0!important;margin-right:.6em!important}.rate--avg.rating--green{color:#4caf50}.rate--avg.rating--lime{color:#3399ff}.rate--avg.rating--orange{color:#ff9933}.rate--avg.rating--red{color:#f44336}.rate--oscars{color:gold}.source--imdb{color:#f5c518}.source--tmdb{color:#01d277}.source--rt{color:#fa320a}.source--mc{color:#66ccff}.source--oscars{color:gold}.source--avg{color:violet}</style>';
if(typeof Lampa!=='undefined'&&Lampa.Template){Lampa.Template.add('card_css',style);try{$('body').append(Lampa.Template.get('card_css',{},true));}catch(e){}}

var CACHE_TIME=3*24*60*60*1000,OMDB_CACHE='maxsm_rating_omdb',ID_MAPPING_CACHE='maxsm_rating_id_mapping';
var OMDB_API_KEY=(typeof window!=='undefined'&&window.RATINGS_PLUGIN_TOKENS&&window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEY)?window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEY:'12c9249c';
var AGE_RATINGS={'G':'3+','PG':'6+','PG-13':'13+','R':'17+','NC-17':'18+','TV-Y':'0+','TV-Y7':'7+','TV-G':'3+','TV-PG':'6+','TV-14':'14+','TV-MA':'17+'};
var WEIGHTS={imdb:0.4,tmdb:0.4,mc:0.1,rt:0.1};

function parseOscars(t){if(typeof t!=='string')return null;var m=t.match(/Won (\d+) Oscars?/i);return m&&m[1]?parseInt(m[1],10):null}

function addLoadingAnimation(){var render=getRender();if(!render)return;var rateLine=$('.full-start-new__rate-line',render);if(!rateLine.length||$('.loading-dots-container',rateLine).length)return;try{rateLine.append('<div class="loading-dots-container"><div class="loading-dots"><span class="loading-dots__text">'+Lampa.Lang.translate("loading_dots")+'</span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span></div></div>');$('.loading-dots-container',rateLine).css({opacity:1,visibility:'visible'});}catch(e){}}
function removeLoadingAnimation(){var render=getRender();if(!render)return;try{$('.loading-dots-container',render).remove();}catch(e){}}

function getCardType(card){var t=card&&(card.media_type||card.type);if(t==='movie'||t==='tv')return t;return card&&(card.name||card.original_name)?'tv':'movie'}
function getRatingClass(r){if(r>=8)return'rating--green';if(r>=6)return'rating--lime';if(r>=5.5)return'rating--orange';return'rating--red'}

function fetchAdditionalRatings(card){var render=getRender();if(!render)return;
var normalizedCard={id:card&&card.id,imdb_id:(card&&(card.imdb_id||card.imdb))||null,title:card&&(card.title||card.name)||'',original_title:card&&(card.original_title||card.original_name)||'',type:getCardType(card||{}),release_date:card&&(card.release_date||card.first_air_date)||''};
var rateLine=$('.full-start-new__rate-line',render);if(rateLine.length){rateLine.css('visibility','hidden');addLoadingAnimation()}
var cacheKey=normalizedCard.type+'_'+(normalizedCard.imdb_id||normalizedCard.id),cachedData=getOmdbCache(cacheKey),ratingsData={};
var imdbElement=$('.rate--imdb:not(.hide)',render);
if(imdbElement.length>0&&!!imdbElement.find('> div').eq(0).text().trim()){if(typeof processNextStep==='function')try{processNextStep();}catch(e){};return}

if(cachedData){ratingsData.rt=cachedData.rt;ratingsData.mc=cachedData.mc;ratingsData.imdb=cachedData.imdb;ratingsData.ageRating=cachedData.ageRating;ratingsData.oscars=cachedData.oscars;updateUI();}
else if(normalizedCard.imdb_id){fetchOmdbRatings(normalizedCard,cacheKey,function(omdbData){if(omdbData){ratingsData.rt=omdbData.rt;ratingsData.mc=omdbData.mc;ratingsData.imdb=omdbData.imdb;ratingsData.ageRating=omdbData.ageRating;ratingsData.oscars=omdbData.oscars;saveOmdbCache(cacheKey,omdbData)}updateUI()})}
else{getImdbIdFromTmdb(normalizedCard.id,normalizedCard.type,function(newImdbId){if(newImdbId){normalizedCard.imdb_id=newImdbId;cacheKey=normalizedCard.type+'_'+newImdbId;fetchOmdbRatings(normalizedCard,cacheKey,function(omdbData){if(omdbData){ratingsData.rt=omdbData.rt;ratingsData.mc=omdbData.mc;ratingsData.imdb=omdbData.imdb;ratingsData.ageRating=omdbData.ageRating;ratingsData.oscars=omdbData.oscars;saveOmdbCache(cacheKey,omdbData)}updateUI()})}else updateUI()})}

function updateUI(){insertRatings(ratingsData.rt,ratingsData.mc,ratingsData.oscars);updateHiddenElements(ratingsData);calculateAverageRating()}
}

function getOmdbCache(key){var cache=(typeof Lampa!=='undefined'&&Lampa.Storage)?Lampa.Storage.get(OMDB_CACHE)||{}:{};var item=cache[key];return item&&(Date.now()-item.timestamp<CACHE_TIME)?item:null}
function saveOmdbCache(key,data){var hasValidRating=((data&&data.rt&&data.rt!=="N/A")||(data&&data.mc&&data.mc!=="N/A")||(data&&data.imdb&&data.imdb!=="N/A"));var hasValidAgeRating=(data&&data.ageRating&&data.ageRating!=="N/A"&&data.ageRating!=="Not Rated");var hasOscars=data&&typeof data.oscars==='number'&&data.oscars>0;if(!hasValidRating&&!hasValidAgeRating&&!hasOscars)return;var cache=(typeof Lampa!=='undefined'&&Lampa.Storage)?Lampa.Storage.get(OMDB_CACHE)||{}:{};cache[key]={rt:data.rt,mc:data.mc,imdb:data.imdb,ageRating:data.ageRating,oscars:data.oscars||null,timestamp:Date.now()};try{Lampa.Storage.set(OMDB_CACHE,cache);}catch(e){}}

function getImdbIdFromTmdb(tmdbId,type,cb){if(!tmdbId)return cb(null);var cleanType=type==='movie'?'movie':'tv';var cacheKey=cleanType+'_'+tmdbId;var cache=(typeof Lampa!=='undefined'&&Lampa.Storage)?Lampa.Storage.get(ID_MAPPING_CACHE)||{}:{};if(cache[cacheKey]&&(Date.now()-cache[cacheKey].timestamp<CACHE_TIME))return cb(cache[cacheKey].imdb_id);var url='https://api.themoviedb.org/3/'+cleanType+'/'+tmdbId+'/external_ids?api_key='+(Lampa&&Lampa.TMDB&&Lampa.TMDB.key?Lampa.TMDB.key():'');var makeRequest=function(u,success,error){try{new Lampa.Reguest().silent(u,success,function(){new Lampa.Reguest().native(u,function(data){try{success(typeof data==='string'?JSON.parse(data):data)}catch(e){error()}},error,false,{dataType:'json'})});}catch(e){error()}};makeRequest(url,function(data){if(data&&data.imdb_id){cache[cacheKey]={imdb_id:data.imdb_id,timestamp:Date.now()};try{Lampa.Storage.set(ID_MAPPING_CACHE,cache);}catch(e){};cb(data.imdb_id)}else{if(cleanType==='tv'){var alt='https://api.themoviedb.org/3/tv/'+tmdbId+'?api_key='+(Lampa&&Lampa.TMDB&&Lampa.TMDB.key?Lampa.TMDB.key():'');makeRequest(alt,function(altD){var imdbId=(altD&&altD.external_ids&&altD.external_ids.imdb_id)||null;if(imdbId){cache[cacheKey]={imdb_id:imdbId,timestamp:Date.now()};try{Lampa.Storage.set(ID_MAPPING_CACHE,cache);}catch(e){} }cb(imdbId)},function(){cb(null)})}else cb(null)}} ,function(){cb(null)})}

function fetchOmdbRatings(card,cacheKey,cb){if(!card||!card.imdb_id)return cb(null);var typeParam=(card.type==='tv')?'&type=series':'';var url='https://www.omdbapi.com/?apikey='+OMDB_API_KEY+'&i='+card.imdb_id+typeParam;try{new Lampa.Reguest().silent(url,function(data){if(data&&data.Response==='True'&&(data.Ratings||data.imdbRating)){cb({rt:extractRating(data.Ratings,'Rotten Tomatoes'),mc:extractRating(data.Ratings,'Metacritic'),imdb:data.imdbRating||null,ageRating:data.Rated||null,oscars:parseOscars(data.Awards||'')});}else cb(null);},function(){cb(null);});}catch(e){cb(null)}}

function updateHiddenElements(ratings){var render=getRender();if(!render||!render[0])return;var pgElement=$('.full-start__pg.hide',render);if(pgElement.length&&ratings&&ratings.ageRating){var invalid=['N/A','Not Rated','Unrated'];var isValid=invalid.indexOf(ratings.ageRating)===-1;if(isValid){var localized=AGE_RATINGS[ratings.ageRating]||ratings.ageRating;pgElement.removeClass('hide').text(localized)}}var imdbContainer=$('.rate--imdb',render);if(imdbContainer.length){var imdbDivs=imdbContainer.children('div');if(ratings&&ratings.imdb&&!isNaN(ratings.imdb)){imdbContainer.removeClass('hide');if(imdbDivs.length>=2){imdbDivs.eq(0).text(parseFloat(ratings.imdb).toFixed(1));imdbDivs.eq(1).addClass('source--imdb').html(Lampa.Lang.translate('source_imdb'))}}else{imdbContainer.addClass('hide')}}var tmdbContainer=$('.rate--tmdb',render);if(tmdbContainer.length){tmdbContainer.find('> div:nth-child(2)').addClass('source--tmdb').html(Lampa.Lang.translate('source_tmdb'))}}

function extractRating(ratings,source){if(!ratings||!Array.isArray(ratings))return null;for(var i=0;i<ratings.length;i++){if(ratings[i].Source===source){try{return source==='Rotten Tomatoes'?parseFloat(ratings[i].Value.replace('%',''))/10:parseFloat(ratings[i].Value.split('/')[0])/10;}catch(e){try{console.error('parse err',e)}catch(e2){}return null}}}return null}

function insertRatings(rt,mc,osc){var render=getRender();if(!render)return;var rateLine=$('.full-start-new__rate-line',render);if(!rateLine.length)return;var lastRate=$('.full-start__rate:last',rateLine);try{if(rt&&!isNaN(rt)&&!$('.rate--rt',rateLine).length){var rv=rt.toFixed(1);var el=$('<div class="full-start__rate rate--rt"><div>'+rv+'</div><div class="source--name source--rt"></div></div>');el.find('.source--name').html(Lampa.Lang.translate('source_rt'));if(lastRate.length)el.insertAfter(lastRate);else rateLine.prepend(el)}if(mc&&!isNaN(mc)&&!$('.rate--mc',rateLine).length){var mv=mc.toFixed(1);var ins=$('.rate--rt',rateLine).length?$('.rate--rt',rateLine):lastRate;var el2=$('<div class="full-start__rate rate--mc"><div>'+mv+'</div><div class="source--name source--mc"></div></div>');el2.find('.source--name').html(Lampa.Lang.translate('source_mc'));if(ins.length)el2.insertAfter(ins);else rateLine.prepend(el2)}if(osc&&!isNaN(osc)&&osc>0&&!$('.rate--oscars',rateLine).length){var el3=$('<div class="full-start__rate rate--oscars"><div>'+osc+'</div><div class="source--name source--oscars"></div></div>');el3.find('.source--name').html(Lampa.Lang.translate('maxsm_omdb_oscars'));rateLine.prepend(el3)}}catch(e){}}

function calculateAverageRating(){var render=getRender();if(!render)return;var rateLine=$('.full-start-new__rate-line',render);if(!rateLine.length)return;var ratings={imdb:parseFloat($('.rate--imdb div:first',rateLine).text())||0,tmdb:parseFloat($('.rate--tmdb div:first',rateLine).text())||0,mc:parseFloat($('.rate--mc div:first',rateLine).text())||0,rt:parseFloat($('.rate--rt div:first',rateLine).text())||0};var totalWeight=0,weightedSum=0,ratingsCount=0;for(var k in ratings){if(ratings.hasOwnProperty(k)&&!isNaN(ratings[k])&&ratings[k]>0){weightedSum+=ratings[k]*WEIGHTS[k];totalWeight+=WEIGHTS[k];ratingsCount++}}$('.rate--avg',rateLine).remove();if(ratingsCount>1&&totalWeight>0){var avg=weightedSum/totalWeight;var cls=getRatingClass(avg);var avgEl=$('<div class="full-start__rate rate--avg '+cls+'"><div>'+avg.toFixed(1)+'</div><div class="source--name source--avg">'+Lampa.Lang.translate("ratimg_omdb_avg")+'</div></div>');$('.full-start__rate:first',rateLine).before(avgEl)}removeLoadingAnimation();rateLine.css('visibility','visible')}

function startPlugin(){window.combined_ratings_plugin=true;Lampa.Listener.follow('full',function(e){if(e.type==='complite'){setTimeout(function(){try{fetchAdditionalRatings(e.data.movie)}catch(err){}},500)}})}

if(!window.combined_ratings_plugin)startPlugin();

}catch(e){try{console.error('omdb plugin init error',e)}catch(e){}}
})();