
(function () {
    'use strict';

    // --- Check if the plugin is already initialized ---
    if (window.superPlugin && window.superPlugin.__initialized) return;
    window.superPlugin = window.superPlugin || {};
    window.superPlugin.__initialized = true;

    // === Plugin Configuration (Enable/Disable Settings) ===
    var pluginConfig = {
        logosEnabled: true,
        platformsEnabled: true,
        qualityEnabled: true,
        seasonsEnabled: true,
        themesEnabled: true
    };

    // === 1. Logos Plugin ===
    var logosPlugin = {
        id: 'logos',
        title: 'Логотипи',
        category: 'Оформлення',
        enabled: pluginConfig.logosEnabled,
        init: function() {
            if (!this.enabled) return;
            // Code for logos plugin
            console.log('Logos Plugin Initialized');
        }
    };

    // === 2. Platforms Plugin ===
    var platformsPlugin = {
        id: 'platforms',
        title: 'Платформи',
        category: 'Оформлення',
        enabled: pluginConfig.platformsEnabled,
        init: function() {
            if (!this.enabled) return;
            // Code for platforms plugin
            console.log('Platforms Plugin Initialized');
        }
    };

    // === 3. Quality Plugin ===
    var qualityPlugin = {
        id: 'quality',
        title: 'Якість',
        category: 'Оформлення',
        enabled: pluginConfig.qualityEnabled,
        init: function() {
            if (!this.enabled) return;
            // Code for quality plugin
            console.log('Quality Plugin Initialized');
        }
    };

    // === 4. Seasons Plugin ===
    var seasonsPlugin = {
        id: 'seasons',
        title: 'Сезони',
        category: 'Оформлення',
        enabled: pluginConfig.seasonsEnabled,
        init: function() {
            if (!this.enabled) return;
            // Code for seasons plugin
            console.log('Seasons Plugin Initialized');
        }
    };

    // === 5. Themes Plugin ===
    var themesPlugin = {
        id: 'themes',
        title: 'Теми',
        category: 'Оформлення',
        enabled: pluginConfig.themesEnabled,
        init: function() {
            if (!this.enabled) return;
            // Code for themes plugin
            console.log('Themes Plugin Initialized');
        }
    };

    // === Plugins Collection ===
    var plugins = [logosPlugin, platformsPlugin, qualityPlugin, seasonsPlugin, themesPlugin];

    // === Initialize Plugins ===
    plugins.forEach(function(plugin) {
        if (plugin.enabled) {
            plugin.init();
        }
    });

    // === Add "Оформлення" Settings Section ===
    Lampa.SettingsApi.addComponent({
        component: 'interface',
        name: 'Оформлення',
        icon: 'paint-brush'
    });

    // === Add each plugin's setting toggle to "Оформлення" section ===
    plugins.forEach(function(plugin) {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: plugin.id,
                type: 'button',
                values: {
                    '1': plugin.title
                },
                default: plugin.enabled ? '1' : '0'
            },
            field: {
                name: plugin.title
            },
            onChange: function(value) {
                plugin.enabled = value === '1';
                if (plugin.enabled) {
                    plugin.init();
                }
            }
        });
    });

})();
