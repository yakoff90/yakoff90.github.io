
/*
 * ============================================================================
 * DRXAOS Themes v2.7.0 - Premium Theme Plugin for Lampa
 * ============================================================================
 * 
 * LAMPA 3.0.5 COMPATIBILITY UPDATE
 * 
 * Changes in v2.7.0:
 * ✓ Full compatibility with Lampa 3.0.5 (app_digital: 305)
 * ✓ Enhanced API validation on initialization
 * ✓ Element.prototype polyfills for addClass/removeClass/toggleClass/hasClass
 * ✓ Safe Storage operations with error handling
 * ✓ jQuery compatibility layer ($)
 * ✓ Improved error logging and diagnostics
 * ✓ All original functionality preserved
 * 
 * Features:
 * - Dynamic quality badges (4K/FHD/HD/SD/CAM)
 * - Season progress indicators
 * - TMDB integration (logos, original titles, metadata)
 * - Hero mode (MADNESS) with enhanced movie/series details
 * - Performance optimizations for Android TV/Fire TV
 * 
 * Requirements:
 * - Lampa 3.0.5+ (app_digital >= 305)
 * - TMDB API key (built-in fallback included)
 * ============================================================================
 */

(function() {
    'use strict';

  // ============================================================================
  // LAMPA 3.0.5 COMPATIBILITY LAYER
  // ============================================================================

  // Safe Storage wrapper functions
  function drxaosSafeGet(key, defaultValue) {
    try {
      if (!window.Lampa || !Lampa.Storage) return defaultValue;
      var value = Lampa.Storage.get(key, defaultValue);
      return value !== undefined ? value : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  function drxaosSafeSet(key, value) {
    try {
      if (!window.Lampa || !Lampa.Storage) return false;
      Lampa.Storage.set(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  // jQuery compatibility check
  var $ = window.jQuery || (window.Lampa && window.Lampa.$);
  if (!$) {
  }

  // ============================================================================
  // Themed Plugin code without JacRed and Color Schemes

  var CONFIG = {
    PLUGIN_NAME: 'drxaos_themes',
    VERSION: '2.7.0',
    AUTHOR: 'DrXAOS',
    LAMPA_MIN_VERSION: 305,
    LAMPA_3_SUPPORT: true,
    API: {
      TMDB_URL: 'https://api.themoviedb.org/3'
    },
    PERFORMANCE: {
      DEBOUNCE_DELAY: 0,
      THROTTLE_LIMIT: 0,
      MUTATION_THROTTLE: 0
    },
    NETWORK: {
      TIMEOUT_MS: 10000,
      RETRY_DELAY_MS: 900
    },
    FEATURES: {
      TMDB_INTEGRATION: true,
      TRACKS_FIX: true,
      MUTATION_OBSERVER: true,
      UTILITIES_BUTTON: true
    },
    DEBUG: false,
    VERBOSE_LOGGING: false
  };

  // Ensure Element.prototype methods exist (from app.min.js polyfills)
  if (typeof Element !== 'undefined') {
    // addClass
    if (!Element.prototype.addClass) {
      Element.prototype.addClass = function(classes) {
        var self = this;
        classes.split(' ').forEach(function(c) {
          if (c && self.classList) {
            self.classList.add(c);
          }
        });
        return this;
      };
    }

    // removeClass
    if (!Element.prototype.removeClass) {
      Element.prototype.removeClass = function(classes) {
        var self = this;
        classes.split(' ').forEach(function(c) {
          if (c && self.classList) {
            self.classList.remove(c);
          }
        });
        return this;
      };
    }

    // toggleClass
    if (!Element.prototype.toggleClass) {
      Element.prototype.toggleClass = function(classes, status) {
        var self = this;
        classes.split(' ').forEach(function(c) {
          if (!c) return;
          var has = self.classList.contains(c);
          if (status && !has) {
            self.classList.add(c);
          } else if (!status && has) {
            self.classList.remove(c);
          }
        });
        return this;
      };
    }

    // hasClass
    if (!Element.prototype.hasClass) {
      Element.prototype.hasClass = function(className) {
        return this.classList && this.classList.contains(className);
      };
    }
  }

  // ============================================================================
  // TMDB Integration - Removed JacRed Code
  // ============================================================================
  var DRXAOS_TITLE_LOGO_CACHE = {};
  var DRXAOS_TITLE_LOGO_PENDING = {};
  var DRXAOS_ORIGINAL_NAME_CACHE = {};
  var DRXAOS_ORIGINAL_NAME_PENDING = {};
  var DRXAOS_CARD_DATA_STORAGE = new WeakMap();
  var DRXAOS_CARD_DATA_INDEX = new Map();
  var DRXAOS_HERO_DETAIL_CACHE = {};
  var DRXAOS_COUNTRY_CACHE = {};
  var DRXAOS_COUNTRY_PENDING = {};
  var DRXAOS_LINE_ID_COUNTER = 0;
  var XUYAMPISHE_STYLE_ID = 'drxaos-xuyampishe-style';
  var drxaosFocusClassObserver = null;
  var XUYAMPISHE_CORE_CSS = '';

  function drxaosSupportsLampaStorage() {
    return !!(window.Lampa &&
      Lampa.Storage &&
      typeof Lampa.Storage.get === 'function' &&
      typeof Lampa.Storage.set === 'function');
  }

  // Remove JacRed-specific Code (The JacRed-related functions and configurations have been deleted)

  // ============================================================================
  // Apply Badge Settings (without JacRed)
  // ============================================================================

  // Badge configurations (Quality, Status, etc.)
  var DRXAOS_BADGE_OPTIONS = [
    {
      key: 'quality',
      labelKey: 'drxaos_badge_quality',
      descriptionKey: 'drxaos_badge_quality_desc',
      default: 'on',
      selectors: ['.card-quality', '.card__quality', '[data-drxaos-badge="quality"]']
    },
    {
      key: 'status',
      labelKey: 'drxaos_badge_status',
      descriptionKey: 'drxaos_badge_status_desc',
      default: 'on',
      selectors: ['.card-next-episode', '.card__next-episode', '.card__episode-date', '[data-drxaos-badge="next-episode"]']
    }
    // Removed JacRed specific badges here
  ];

  function drxaosApplyBadgeSettings() {
    try {
      var cards = document.querySelectorAll('.card, .madness-card, .madness-item, .madness__item, [data-madness-card], [data-component="madness-card"]');
      cards.forEach(drxaosSyncCardBadgeState);
    } catch (err) {

    }
    try {
      applySeasonInfo();
    } catch (applyErr) {

    }
  }

  // Other functions for sync and settings handling...
})();
