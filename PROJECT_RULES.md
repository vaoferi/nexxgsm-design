# PROJECT_RULES.md — NexxGSM Design

Проєктні факти цього репо. Центральний `AGENTS.md` лишається універсальним
контрактом; цей файл лише вказує, де саме живе правда про проєкт, і фіксує
виміряні платформні факти.

## Що це за проєкт

Канонічний лендінг `en-US-landing` (статичні HTML/CSS/JS). Ринкові версії сайту
(us / ca / in / de / pl / af) — окремі поверхні в репо `vaoferi/biosunlocktool`,
вони походять від цього canonical лендінгу, а не навпаки.

## Авторитети документів (не дублювати сюди)

- `PRODUCT.md` — продуктовий контекст і аудиторія;
- `SPEC.md` — поточний стан проєкту;
- `docs/architecture-decisions.md` — ADR: 2026-09-08 (NAS-контейнер і порт
  18080), 2026-09-09 (продакшн — Cloudflare Pages у монорепо
  `vaoferi/biosunlocktool`), 2026-09-10 (градієнт + 3D-сцена,
  scroll-driven motion як progressive enhancement);
- `docs/*-theme-research.md` — дослідження ринкових тем;
- `DEFINITION_OF_DONE.md` — центральний контракт готовості.

## Платформенні факти (виміряно 2026-09-25)

- Клас рантайму: static, `devRequired=false`. Node DEV-сервер тут не потрібен і
  не винаходиться; `testing/` — інструменти перевірки, не рантайм сайту.
- Публічна превʼю-поверхня: `http://nlmhelp.keenetic.link:18080/`, контейнер
  `nexxgsm-landing` (`nginx:1.27-alpine`, `--restart unless-stopped`).
- Web-root контейнера — піддерево `versions/en-US-landing/`, змонтоване
  read-only. Тобто для цього піддерева «зміна файлу = деплой» живої превʼю, без
  білда. Файли поза `versions/en-US-landing/` (доки, `AGENTS.md`, `.vaoferi/`)
  сервійовану поверхню не змінюють.
- Healthcheck реєстру: `expectedText=NexxGSM` (у сервійованому
  `index.html` заголовок містить `NexxGSM`).
- Ідентифіратор у реєстрі платформи — `nexxgsm` (не `nexxgsm-design`);
  `projectctl doctor nexxgsm` = PASS, `Overall: PASS`, exit 0.

## Межі публікації

- У цьому репо немає жодного GitHub Actions workflow, тому push у `main` нічого
  не деплоїть через Actions; але злиття змінює живу превʼю-поверхню, якщо воно
  зачіпає `versions/en-US-landing/`.
- Продакшн (Cloudflare Pages) публікується з `vaoferi/biosunlocktool`, і його
  workflow тригериться на push у `main` — це окрема команда власника.

## Чого не робити

- Redesign без явного запитання власника; поточна правка — інфраструктура й
  документація.
- Не переносити ринкові локалі назад у це репо: вони належать поверхні BIOS.
- Не тримати `node_modules/` у сервійованому чи спільному дереві як рантайм.
