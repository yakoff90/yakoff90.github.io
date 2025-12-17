---
layout: default
title: "Плагины Lampa"
description: "Каталог расширений для Lampa: онлайн-просмотр, IPTV, торренты."
keywords: "Lampa, плагины, каталог, расширения, онлайн, торренты, IPTV"
og_title: "Плагины Lampa"
og_description: "Каталог расширений для Lampa."
twitter_title: "Плагины Lampa"
twitter_description: "Каталог расширений для Lampa."
---
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h2>🧩 Каталог плагинов Lampa</h2>
        <p class="hero-description">
          Полная коллекция плагинов и расширений для Lampa. Более 120 проверенных плагинов 
          с подробными описаниями и прямыми ссылками для установки.
        </p>
        <div class="hero-features">
          <div class="feature-item">
            <span class="feature-icon">📦</span>
            <span>120+ плагинов</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✅</span>
            <span>Проверенные ссылки</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📖</span>
            <span>Подробные описания</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔄</span>
            <span>Регулярные обновления</span>
          </div>
        </div>
      </div>
    </section>



    <!-- Навигация по категориям -->
    <nav class="category-nav">
      <h3>Категории плагинов:</h3>
      <div class="category-grid">
        <a href="#online-plugins" class="category-link">🎬 Онлайн-просмотр</a>
        <a href="#torrent-plugins" class="category-link">🌐 Торренты</a>
        <a href="#tv-plugins" class="category-link">📺 IPTV и ТВ</a>
        <a href="#interface-plugins" class="category-link">🎨 Интерфейс</a>
        <a href="#tools-plugins" class="category-link">🛠️ Инструменты</a>
        <a href="#stores-plugins" class="category-link">🏪 Магазины</a>
        <a href="#radio-plugins" class="category-link">📻 Радио</a>
        <a href="#special-plugins" class="category-link">🚀 Специальные</a>
        <a href="#adult-plugins" class="category-link">🔞 18+</a>
      </div>
    </nav>

    <!-- Важная информация -->
    <section class="important-info">
      <h2>⚠️ Важная информация</h2>
      <div class="info-cards">
        <div class="info-card">
          <h3>📝 Как установить плагин</h3>
          <ol>
            <li>Откройте Lampa</li>
            <li>Перейдите в Настройки → Расширения</li>
            <li>Нажмите "Добавить плагин"</li>
            <li>Скопируйте и вставьте URL плагина</li>
            <li>Нажмите "Готово" и перезапустите приложение</li>
          </ol>
        </div>
        <div class="info-card">
          <h3>🛡️ Безопасность</h3>
          <p>Все плагины устанавливаются на ваш страх и риск. Используйте только проверенные источники и не устанавливайте слишком много плагинов одновременно. Для дополнительной безопасности рекомендуем использовать <a href="https://getblancvpn.deals/?ref=yahor" target="_blank" rel="noopener noreferrer" class="vpn-link">надёжный VPN-сервис</a>.</p>
        </div>
        <div class="info-card">
          <h3>🔄 Обновления</h3>
          <p>Ссылки на плагины могут изменяться. Если плагин не работает более 3 дней, проверьте актуальные ссылки или обратитесь к разработчикам.</p>
        </div>
      </div>
    </section>

    <!-- Плагины из коллекции -->
    {% assign online_plugins = site.plugins | where: "category", "Онлайн-просмотр" %}
    {% assign torrent_plugins = site.plugins | where: "category", "Торренты" %}
    {% assign tv_plugins = site.plugins | where: "category", "IPTV и ТВ" %}
    {% assign interface_plugins = site.plugins | where: "category", "Интерфейс" %}
    {% assign system_plugins = site.plugins | where: "category", "Система" %}
    {% assign tools_plugins = site.plugins | where: "category", "Инструменты" %}
    {% assign store_plugins = site.plugins | where: "category", "Магазины" %}
    {% assign radio_plugins = site.plugins | where: "category", "Радио" %}
    {% assign special_plugins = site.plugins | where: "category", "Специальные" %}
    {% assign adult_plugins = site.plugins | where: "category", "18+" %}

    <!-- Онлайн-просмотр -->
    <section id="online-plugins" class="plugin-category">
      <h2>🎬 Плагины для онлайн-просмотра</h2>
      <p>Плагины для просмотра фильмов и сериалов из различных онлайн-источников.</p>
      
      <div class="plugin-grid">
        {% for plugin in online_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Активен' %}active{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}
        
        <!-- Дополнительные плагины без отдельных страниц -->
        
      </div>
    </section>

    <!-- Торрент-плагины -->
    <section id="torrent-plugins" class="plugin-category">
      <h2>🌐 Торрент-плагины</h2>
      <p>Плагины для работы с торрентами и TorrServer.</p>
      
      <div class="plugin-grid">
        {% for plugin in torrent_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Активен' %}active{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}
        
        <!-- Дополнительные торрент-плагины без отдельных страниц -->
        
      </div>
    </section>

    <!-- IPTV и ТВ -->
    <section id="tv-plugins" class="plugin-category">
      <h2>📺 IPTV и ТВ-плагины</h2>
      <p>Плагины для просмотра телевизионных каналов и IPTV.</p>
      
      <div class="plugin-grid">
        {% for plugin in tv_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Активен' %}active{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}

                 <!-- Дополнительные ТВ-плагины без отдельных страниц -->
        </div>
      </section>

    <!-- Интерфейс -->
    <section id="interface-plugins" class="plugin-category">
      <h2>🎨 Плагины интерфейса</h2>
      <p>Плагины для изменения внешнего вида и функциональности интерфейса.</p>
      
      <div class="plugin-grid">
        {% for plugin in interface_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Активен' %}active{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}

        <!-- Дополнительные плагины интерфейса без отдельных страниц -->
      </div>
    </section>

    <!-- Инструменты -->
    <section id="tools-plugins" class="plugin-category">
      <h2>🛠️ Инструменты и утилиты</h2>
      <p>Вспомогательные плагины для улучшения функциональности.</p>
      
      <div class="plugin-grid">
        {% for plugin in tools_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Активен' %}active{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}

        <!-- Дополнительные инструменты без отдельных страниц -->
        <div class="plugin-card">
          <h3>🔒 Settings Protection</h3>
          <p>Защита доступа к настройкам</p>
          <code>http://193.233.134.21/plugins/setprotect</code>
          <span class="plugin-status active">Активен</span>
        </div>




      </div>
    </section>

    <!-- Магазины -->
    <section id="stores-plugins" class="plugin-category">
      <h2>🏪 Магазины плагинов</h2>
      <p>Альтернативные магазины для удобной установки плагинов.</p>
      
      <div class="plugin-grid">
        {% for plugin in store_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Активен' %}active{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}

        <!-- Дополнительные магазины без отдельных страниц -->
      </div>
    </section>

    <!-- Радио -->
    <section id="radio-plugins" class="plugin-category">
      <h2>📻 Радио-плагины</h2>
      <p>Плагины для прослушивания радиостанций.</p>
      
      <div class="plugin-grid">
        {% for plugin in radio_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Активен' %}active{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}

        <!-- Дополнительные радио-плагины без отдельных страниц -->
      </div>
    </section>

    <!-- 18+ контент -->
    <section id="adult-plugins" class="plugin-category">
      <h2>🔞 Плагины 18+</h2>
      <p>Плагины для взрослого контента (только для совершеннолетних).</p>
      
      <div class="warning-notice">
        <h3>⚠️ Предупреждение</h3>
        <p>Данные плагины содержат контент для взрослых. Убедитесь, что вам исполнилось 18 лет и использование такого контента разрешено в вашей юрисдикции.</p>
      </div>
      
      <div class="plugin-grid">
        {% for plugin in adult_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == '18+' %}warning{% else %}active{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}
      </div>
    </section>

    <!-- Специальные проекты -->
    <section id="special-plugins" class="plugin-category">
      <h2>🚀 Специальные проекты</h2>
      <p>Уникальные плагины от различных разработчиков.</p>
      
      <div class="plugin-grid">
        {% for plugin in special_plugins %}
        <div class="plugin-card">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Активен' %}active{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}

        <!-- Дополнительные специальные плагины без отдельных страниц -->




      </div>
    </section>

    <!-- Системные плагины -->
    <section id="system-plugins" class="important-plugins">
      <h2>🌟 Важные системные плагины</h2>
      <div class="plugin-grid">
        {% for plugin in system_plugins %}
        <div class="plugin-card featured">
          <h3><a href="{{ plugin.url }}" class="plugin-link">{{ plugin.icon }} {{ plugin.title }}</a></h3>
          <p>{{ plugin.description }}</p>
          <code>{{ plugin.url_plugin }}</code>
          <span class="plugin-status {% if plugin.status == 'Обязательный' %}required{% else %}warning{% endif %}">{{ plugin.status }}</span>
        </div>
        {% endfor %}


      </div>
    </section>

      <!-- Контакты и поддержка -->
      <section class="support-section">
        <h2>💬 Поддержка и сообщество</h2>
        <div class="support-cards">
          <div class="support-card">
            <h3>💡 Предложить плагин</h3>
            <p>Если вы знаете о полезном плагине, которого нет в каталоге, напишите нам!</p>
          </div>
          <div class="support-card">
            <h3>🐛 Сообщить о проблеме</h3>
            <p>Если плагин не работает, сообщите об этом через форму обратной связи.</p>
          </div>
          <div class="support-card">
            <h3>📚 Нужна помощь?</h3>
            <p>Посетите раздел FAQ или обратитесь к нашим руководствам по установке.</p>
          </div>
        </div>
      </section>



    <style>
      .plugin-link {
        color: inherit;
        text-decoration: none;
        transition: color 0.2s;
      }
      
      .plugin-link:hover {
        color: #007bff;
        text-decoration: underline;
      }
      
      .plugin-card h3 {
        margin-bottom: 10px;
      }
    </style>
