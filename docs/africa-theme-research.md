# Africa market experiment

## Межі рішення

`Africa` — це ринковий label, а не твердження, що весь континент має одну культуру або одну мову. Тому перша версія лишає UI англійським: це безпечна базова мова для міжрегіонального сценарію, поки не з'являться окремі мовні вимоги. Візуальна частина — оборотна A/B-гіпотеза, а не локалізація під конкретну країну.

## Дизайн-гіпотеза

Для відмінності від US, India, Poland і Germany використано глибокий indigo як поле, теракотове світло як теплий контрапункт, ochre як conversion accent і приглушений зелений як другий сигнал. На поверхні додано дуже легкий повторюваний diamond/chevron-ритм; він не перекриває скло, заголовок або 8FC8-сцену.

Музейні описи indigo-текстилів із Гамбії, Нігерії, Сенегалу та інших регіонів показують повторювані геометричні та resist-dye мотиви. Це надихнуло на ритм фактури, але не використовується як спрощений «символ Африки»:

- [The Metropolitan Museum of Art — The Essential Art of African Textiles](https://www.metmuseum.org/exhibitions/listings/2008/african-textiles/photo-gallery)
- [British Museum — indigo okorepi cloth](https://www.britishmuseum.org/collection/object/E_Af1991-24-1)
- [British Museum — indigo geometric wrapper from Senegal](https://www.britishmuseum.org/collection/object/E_Af1934-0307-244)

## Що лишається спільним

- 8FC8 hero, monitor, product cards, buy-flow, anchors і accessibility не змінюються;
- canonical та `og:url` лишаються `https://biosunlocktool.com/`;
- `af.biosunlocktool.com/` внутрішньо обслуговує `/locales/af-ZA/`, але не показує цей каталог у браузері;
- `prefers-reduced-motion` вимикає дві нові фонові анімації;
- mobile не вимагає WebGL і зберігає той самий фон через CSS.

## Критерій перевірки

На staging і production перевіряються clean root URL, `lang="en-ZA"`, `data-market="africa"`, ochre `--accent`, CSS stamp `20260910y`, legacy `/locales/af-ZA/` → clean-root redirect, відсутність horizontal overflow, читабельність скла та робочі якорі. Якщо реакція ринку буде слабкою, тему можна прибрати одним CSS override без зміни структури сторінки.
