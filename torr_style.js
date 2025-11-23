(function(){
    // РЎРїРёСЃРѕРє С‚РµРєСЃС‚РѕРІРёС… Р·Р°РјС–РЅ
    const REPLACEMENTS = {
        'Р”СѓР±Р»РёСЂРѕРІР°РЅРЅС‹Р№': 'Р”СѓР±Р»СЊРѕРІР°РЅРёР№',
        'Ukr': 'РЈРєСЂР°С—РЅСЃСЊРєРѕСЋ',
        'Р”СѓР±Р»СЏР¶': 'Р”СѓР±Р»СЊРѕРІР°РЅРёР№',
        'РћСЂРёРіРёРЅР°Р»СЊРЅС‹Р№': 'РћСЂРёРіС–РЅР°Р»СЊРЅРёР№',
        'РЎСѓР±С‚РёС‚СЂС‹': 'РЎСѓР±С‚РёС‚СЂРё',
        'РњРЅРѕРіРѕРіРѕР»РѕСЃС‹Р№': 'Р‘Р°РіР°С‚РѕРіРѕР»РѕСЃРёР№',
        'РќРµРѕС„РёС†РёР°Р»СЊРЅС‹Р№': 'РќРµРѕС„С–С†С–Р№РЅРёР№',
        'РЈРєСЂР°РёРЅСЃРєРёР№': 'РЈРєСЂР°С—РЅСЃСЊРєРѕСЋ',
        'РџСЂРѕС„РµСЃСЃРёРѕРЅР°Р»СЊРЅС‹Р№ РјРЅРѕРіРѕРіРѕР»РѕСЃС‹Р№': 'РџСЂРѕС„РµСЃС–Р№РЅРёР№ Р±Р°РіР°С‚РѕРіРѕР»РѕСЃРёР№',
        'Zetvideo': 'UaFlix',
        'РќРµС‚ РёСЃС‚РѕСЂРёРё РїСЂРѕСЃРјРѕС‚СЂР°': 'Р†СЃС‚РѕСЂС–СЏ РїРµСЂРµРіР»СЏРґСѓ РІС–РґСЃСѓС‚РЅСЏ'
    };

    // РљРѕРЅС„С–РіСѓСЂР°С†С–СЏ СЃС‚РёР»С–РІ
    const STYLES = {
        '.torrent-item__seeds span.high-seeds': {
            color: '#00ff00',
            'font-weight': 'bold'
        },
        '.torrent-item__bitrate span.high-bitrate': {
            color: '#ff0000',
            'font-weight': 'bold'
        },
        '.torrent-item__tracker.utopia': {
            color: '#9b59b6',
            'font-weight': 'bold'
        },
        '.torrent-item__tracker.toloka': {
            color: '#2ecc71',
            'font-weight': 'bold'
        },
        // РќРѕРІС– СЃС‚РёР»С– РґР»СЏ РѕР±РІРѕРґРєРё Р·Р°Р»РµР¶РЅРѕ РІС–Рґ РєС–Р»СЊРєРѕСЃС‚С– seeds
        '.torrent-item.low-seeds': {
            border: '2px solid #ff0000',
            'border-radius': '8px'
        },
        '.torrent-item.medium-seeds': {
            border: '2px solid #0000ff',
            'border-radius': '8px'
        },
        '.torrent-item.high-seeds': {
            border: '2px solid #ffff00',
            'border-radius': '8px'
        },
        '.torrent-item.very-high-seeds': {
            border: '2px solid #006400',
            'border-radius': '8px'
        },
        '.torrent-item.low-seeds .torrent-item__seeds span': {
            color: '#ff0000',
            'font-weight': 'bold'
        },
        '.torrent-item.medium-seeds .torrent-item__seeds span': {
            color: '#0000ff',
            'font-weight': 'bold'
        },
        '.torrent-item.high-seeds .torrent-item__seeds span': {
            color: '#ffff00',
            'font-weight': 'bold'
        },
        '.torrent-item.very-high-seeds .torrent-item__seeds span': {
            color: '#006400',
            'font-weight': 'bold'
        }
    };

    // Р”РѕРґР°С”РјРѕ CSS-СЃС‚РёР»С–
    let style = document.createElement('style');
    style.innerHTML = Object.entries(STYLES).map(([selector, props]) => {
        return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
    }).join('\n');
    document.head.appendChild(style);

    // Р¤СѓРЅРєС†С–СЏ РґР»СЏ Р·Р°РјС–РЅРё С‚РµРєСЃС‚С–РІ Сѓ РІРєР°Р·Р°РЅРёС… РєРѕРЅС‚РµР№РЅРµСЂР°С…
    function replaceTexts() {
        // РЎРїРёСЃРѕРє СЃРµР»РµРєС‚РѕСЂС–РІ, РґРµ РїРѕС‚СЂС–Р±РЅРѕ С€СѓРєР°С‚Рё С‚РµРєСЃС‚Рё РґР»СЏ Р·Р°РјС–РЅРё
        const containers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info'
        ];

        containers.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                // Р—Р°РјС–РЅСЏС”РјРѕ С‚РµРєСЃС‚ Сѓ РІСЃС–С… РІСѓР·Р»Р°С…-РЅР°С‰Р°РґРєР°С…
                const walker = document.createTreeWalker(
                    container,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );

                let node;
                while (node = walker.nextNode()) {
                    let text = node.nodeValue;
                    Object.entries(REPLACEMENTS).forEach(([original, replacement]) => {
                        if (text.includes(original)) {
                            text = text.replace(new RegExp(original, 'g'), replacement);
                        }
                    });
                    node.nodeValue = text;
                }
            });
        });
    }

    // Р¤СѓРЅРєС†С–СЏ РґР»СЏ РѕРЅРѕРІР»РµРЅРЅСЏ СЃС‚РёР»С–РІ С‚РѕСЂРµРЅС‚С–РІ
    function updateTorrentStyles() {
        // Seeds > 19
        document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
            span.classList.toggle('high-seeds', (parseInt(span.textContent) || 0) > 19);
        });

        // Р‘С–С‚СЂРµР№С‚ > 50
        document.querySelectorAll('.torrent-item__bitrate span').forEach(span => {
            span.classList.toggle('high-bitrate', (parseFloat(span.textContent) || 0) > 50);
        });

        // РўСЂРµРєРµСЂРё
        document.querySelectorAll('.torrent-item__tracker').forEach(tracker => {
            const text = tracker.textContent.trim();
            tracker.classList.remove('utopia', 'toloka');
            
            if (text.includes('UTOPIA (API)')) tracker.classList.add('utopia');
            else if (text.includes('Toloka')) tracker.classList.add('toloka');
        });

        // РќРѕРІР° Р»РѕРіС–РєР° РґР»СЏ РѕР±РІРѕРґРєРё Р·Р°Р»РµР¶РЅРѕ РІС–Рґ РєС–Р»СЊРєРѕСЃС‚С– seeds
        document.querySelectorAll('.torrent-item').forEach(torrentItem => {
            const seedsSpan = torrentItem.querySelector('.torrent-item__seeds span');
            if (!seedsSpan) return;

            const seedsCount = parseInt(seedsSpan.textContent) || 0;
            
            // Р’РёРґР°Р»СЏС”РјРѕ РІСЃС– РїРѕРїРµСЂРµРґРЅС– РєР»Р°СЃРё
            torrentItem.classList.remove('low-seeds', 'medium-seeds', 'high-seeds', 'very-high-seeds');
            
            // Р”РѕРґР°С”РјРѕ РІС–РґРїРѕРІС–РґРЅРёР№ РєР»Р°СЃ Р·Р°Р»РµР¶РЅРѕ РІС–Рґ РєС–Р»СЊРєРѕСЃС‚С– seeds
            if (seedsCount >= 0 && seedsCount <= 10) {
                torrentItem.classList.add('low-seeds');
            } else if (seedsCount >= 11 && seedsCount <= 25) {
                torrentItem.classList.add('medium-seeds');
            } else if (seedsCount >= 26 && seedsCount <= 50) {
                torrentItem.classList.add('high-seeds');
            } else if (seedsCount > 50) {
                torrentItem.classList.add('very-high-seeds');
            }
        });
    }

    // РћСЃРЅРѕРІРЅР° С„СѓРЅРєС†С–СЏ РѕРЅРѕРІР»РµРЅРЅСЏ
    function updateAll() {
        replaceTexts();
        updateTorrentStyles();
    }

    // РћРїС‚РёРјС–Р·РѕРІР°РЅРёР№ СЃРїРѕСЃС‚РµСЂС–РіР°С‡
    const observer = new MutationObserver(mutations => {
        if (mutations.some(m => m.addedNodes.length)) {
            updateAll();
        }
    });

    // Р†РЅС–С†С–Р°Р»С–Р·Р°С†С–СЏ
    observer.observe(document.body, { childList: true, subtree: true });
    updateAll();
})();

Lampa.Platform.tv();
