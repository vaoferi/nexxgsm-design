# SPEC.md — поточний стан проєкту NexxGSM Design

Оновлено: 2026-09-10. Формат — за розділом 5 AGENTS.md.

---

**Ціль:** публічний лендінг «Dell BIOS Unlock Tool» (NexxGSM Service Point S.R.L.), який конвертує відвідувача в покупку коду ($28.20) або звернення через Telegram-бот; далі — мовні/культурні копії з канонічної версії.

**Контекст:** одна канонічна версія `versions/en-US-landing/` (стратегія «довести до результату → розмножити»). **Платформене рішення (2026-09-09):** продакшн переїжджає на **Cloudflare Pages** під бойовим доменом **https://biosunlocktool.com/** — монорепо `vaoferi/biosunlocktool` з i18n-версіями та короткими market-subdomains: `us`/`ca`/`in` → canonical English landing, `de` → de-DE, `pl` → pl-PL, `af` → af-ZA; `in` вмикає India-атмосферу через host-aware CSS, старий `en-IN` лишається legacy stub без маршрутизації. Free план дає Universal SSL. **Міграція виконана (2026-09-09): Pages прийняв трафік — https://biosunlocktool.com/ це основний продакшн.** NAS **http://nlmhelp.keenetic.link:18080/** (bind-mount, редагування = миттєвий ефект) — тестовий поверх: уся перевірка змін перед деплоєм робиться там; у прод розкочується лише перевірене (синк канону → push у `vaoferi/biosunlocktool` → зелений Action). Деталі — `README.md` (Production) та `docs/architecture-decisions.md`. Правила роботи агента — `AGENTS.md`.

**Поточний стан (що вже працює):**
- канонічний лендінг: hero в один екран, WebGL-фон, сітка продуктів (заголовок окремо, картки в один ряд), бургер-меню ≤900px, акордеон з 8 статтями + 3 FAQ, scroll-spy, OG-мета;
- фон: один CSS-градієнт у глибокій navy-палітрі американського прапора `linear-gradient(45deg, #0b2e55, #071d39, #01050d)` із 200% полотном та 12-секундною анімацією працює на всіх viewport; понад 700px прозора сцена додає монітор і клавіатуру поверх нього, а mobile не запускає WebGL;
- motion layer: `scroll-progress` і reveal-анімації карток/кроків/гайдів використовують native CSS Scroll-Driven Animations, а старі браузери — IntersectionObserver fallback; reduced-motion залишає контент видимим і статичним;
- India market: канонічний короткий host `in.biosunlocktool.com` (старий `india.biosunlocktool.com` лишається compatibility alias) використовує той самий English canonical landing, але host-aware `data-market="india"` вмикає окрему абстрактну атмосферу з indigo/navy, saffron і dark green; US apex та невідомі host-и лишаються без цього override;
- Poland market: `pl.biosunlocktool.com` редіректиться на локальну повну копію `locales/pl-PL/`, яка зберігає 8FC8-структуру та купівельний шлях, але перекладає основний UI польською і вмикає радикально іншу host-aware атмосферу `data-market="poland"` — графіт, теплий паперовий відтінок, кармінне світло й тонку діагональну фактуру;
- Germany market: `de.biosunlocktool.com` редіректиться на локальну повну копію `locales/de-DE/`, яка перекладає основний UI німецькою і вмикає `data-market="germany"` — steel-blue інженерне поле, amber-сигнал і креслярську сітку з контрольованим червоним діагональним маркером;
- Africa market: `af.biosunlocktool.com` редіректиться на локальну повну копію `locales/af-ZA/` з англійським UI для міжрегіонального використання та вмикає `data-market="africa"` — глибокий indigo, теракотове світло, охряний акцент і стриманий геометричний textile-ритм; це оборотний дизайн-експеримент, а не спроба представляти весь континент однією культурою;
- зафіксовано `$impeccable critique`: 25/36 за 9 застосовними евристиками, без P0, чотири P1 для наступної ітерації; контраст і overflow перевірені браузером;
- NAS `http://nlmhelp.keenetic.link:18080/` — staging із bind-mount (зміна файлу видима одразу); короткі market-host-и `us.nlmhelp.keenetic.link:18080`, `ca.nlmhelp.keenetic.link:18080`, `in.nlmhelp.keenetic.link:18080`, `de.nlmhelp.keenetic.link:18080`, `pl.nlmhelp.keenetic.link:18080`, `af.nlmhelp.keenetic.link:18080` використовують той самий порт; production оновлюється окремим sync → Cloudflare deploy циклом;
- canonical/og:url, favicon, selected-plan sync і чесний PayPal coming-soon стан перевірені на production після Action `2f69c19`.

**Що змінюємо:** у поточній ітерації стабілізуємо візуальний фон на mobile/desktop: зберігаємо ПК-wow-ефект на широких екранах, прибираємо строкатий procedural noise і даємо mobile той самий легкий анімований CSS-градієнт; остання корекція користувача — приблизно вдвічі темніша палітра без затемнення ПК. Окремі India, Poland, Germany і Africa ітерації додають host-aware атмосфери та повні локальні UI-копії без зміни конверсійного сценарію. У цій ітерації також зафіксовані canonical/og:url, monitor-with-code favicon, data-pick → pay-row sync, sticky-anchor правила, PRODUCT.md і nexxgsm-workflow skill.

**Що не змінюємо:** структуру `versions/en-US-landing/`; bind-mount деплой на NAS (не перетворювати на copied image); зайняті публічні порти 18080/18082/18083/18084/18085/18088/18090/18091; правило форвардингу `nexxgsm-landing` на зовнішньому Keenetic; **не прибирати NAS-деплой** — це тестовий поверх перед кожним релізом у прод; не перебазовувати git-remote у `vaoferi/biosunlocktool` без окремої команди. Admin→frontend даних немає — контент редагується прямо у файлах версії.

**Ризики:**
- **Порядок тестування не порушувати** — у прод має потрапляти лише перевірене на NAS: зміна → перевірка на 18080 → синк у CF-репо → push → зелений Action → перевірка апекса. Пропуск стадії NAS = неперевірений прод.
- **Ручне подвійне існування канону** (nexxgsm-design + biosunlocktool) — поки синк ручний, ризик «забули скопіювати» живий; перевіряти byte-identity перед кожним пушем у CF.
- `og:image` уже доступний як `versions/en-US-landing/og-cover.jpg`; додаткове покращення прев'ю не є блокером цього релізу.
- `testing/node_modules` на цьому зовнішньому томі пошкоджений (ломає великі JS-бандли при записі) — `npx backstop test` локально не запуститься, поки не перевстановити на здоровому томі; smoke-тести натомість через Playwright з `/tmp`.
- Публічний простір 180xx спільний з іншими застосунками ланцюжка роутерів — перед новим деплоєм перевіряти і NAS (`netstat`), і зовнішню доступність порту.
- Внутрішній Keenetic (192.168.2.1) не в ланцюжку публічних сайтів — його форвардинги (3000, 18085) ззовні не відкриваються; це норма, не поломка.
- Реальний mobile hardware/WebKit у цій ітерації не підключений до перевірки; staging перевірений через in-app browser на вузькому viewport, а фізичні iPhone/Android залишаються окремим smoke-тестом.

**План:**
1. ~~Міграція на Cloudflare Pages~~ — **виконано 2026-09-09**: biosunlocktool.com віддає канон (апекс/www), Action зелений; NAS лишається тестовим поверхом.
2. Перша мовна копія з канону за `shared/keywords-research.md` → адаптація тексту/валют/контактів → деплой як окрема i18n-версія монорепо. India experiment поки що навмисно не є мовною копією: спочатку вимірюємо реакцію на атмосферу.
3. ~~canonical/og:url прошити на biosunlocktool.com~~ — виконано в каноні, root і `locales/en-US/`; перед наступним sync перевіряти обидва absolute URLs.
4. og:image банер у візуальній мові «8FC8» + `twitter:card summary_large_image`.

**Перевірка:**
- після кожної зміни: спочатку **NAS-staging** — `curl -w "%{http_code}" http://nlmhelp.keenetic.link:18080/` + spot-check контенту (bind-mount = ефект одразу);
- реліз у прод: синк канону в `vaoferi/biosunlocktool` (корінь + `locales/en-US/`, byte-identity) → push → дочекатись зеленого Action (`gh run list -R vaoferi/biosunlocktool`) → `curl https://biosunlocktool.com/` + маркери актуальної зміни;
- UI: скріншот/geometry-перевірки на 320/390/768/1280 (+ проміжні 360/480/600/900/1100), нуль overflow, консоль чиста; `testing/layout-gutter.js` контролює однакові page gutters для products/steps/guides/CTA/footer при breakpoint reflow;
- регресії: `node testing/quick-test.js` (overflow-свуп; очікує сервер на :8080 з `versions/`);
- текстові файли: UTF-8 без BOM, скан на mojibake (Рџ/РЅ/�).
- India smoke: у браузері `in.biosunlocktool.com` має `data-market="india"`, saffron `--accent`, завантажений `main.css?v=20260910u`, чисту консоль і canonical `https://biosunlocktool.com/`; apex має `data-market="us"`.
- Poland smoke: у браузері `pl.biosunlocktool.com` після 308 має `lang="pl-PL"`, `data-market="poland"`, кармінний `--accent`, CSS `main.css?v=20260910w`, польські hero/products/steps і чисту консоль; на staging `pl.nlmhelp.keenetic.link:18080` перевіряється саме host-aware фон.
- Germany smoke: у браузері `de.biosunlocktool.com` після 308 має `lang="de-DE"`, `data-market="germany"`, amber `--accent`, CSS `main.css?v=20260910w`, німецькі hero/products/steps і чисту консоль; на staging `de.nlmhelp.keenetic.link:18080` перевіряється саме host-aware фон.
- Africa smoke: у браузері `af.biosunlocktool.com` після 308 має `lang="en-ZA"`, `data-market="africa"`, ochre `--accent`, CSS `main.css?v=20260910x`, Africa hero/trust copy і чисту консоль; на staging `af.nlmhelp.keenetic.link:18080` перевіряється саме indigo/terracotta host-aware фон.
- NAS host smoke: `in.nlmhelp.keenetic.link:18080` має `data-market="india"`, `af.nlmhelp.keenetic.link:18080` — `data-market="africa"`, а root/`us`/`ca`/`de`/`pl` на тому самому порту мають US baseline.

**Критерії готовності поточного етапу (виконані):**
- [x] канонічна версія консолідована, неканонічні видалені;
- [x] лендінг працює публічно, всі ассети 200;
- [x] critique без червоних пунктів;
- [x] інфраструктура і конвенції задокументовані (README, architecture-decisions);
- [ ] вихід за межі етапу = початок роботи над мовними копіями / HTTPS / og:image.
- [x] India market experiment опубліковано на `in.biosunlocktool.com`; старий alias і код/дослідницьке обґрунтування зафіксовані в `docs/india-theme-research.md`.
- [x] Poland market experiment опубліковано в `locales/pl-PL/` з окремою атмосферою та польським UI; production smoke на `pl.biosunlocktool.com` пройдено для redirect, мови, акценту, canonical і overflow.
- [x] Germany market experiment опубліковано в `locales/de-DE/` з окремою атмосферою та німецьким UI; production smoke на `de.biosunlocktool.com` пройдено для redirect, мови, акценту, canonical і overflow.
- [ ] Africa market experiment опубліковано в `locales/af-ZA/` з окремою атмосферою та англійським UI; production smoke на `af.biosunlocktool.com` ще має пройти для redirect, мови, акценту, canonical і overflow.
