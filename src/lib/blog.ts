// Файловий блог: статті зберігаються тут (без БД). Щоб додати статтю —
// додайте об'єкт у масив `articles`. Кожне поле має 3 мови (ua/ru/en).

export type Lang = "ua" | "ru" | "en";

export interface ArticleSection {
  h?: Record<Lang, string>;
  p: Record<Lang, string[]>;
}

export interface BlogArticle {
  slug: string;
  date: string; // ISO, напр. "2026-06-01"
  cover?: string; // URL обкладинки (необов'язково)
  readMinutes: number;
  title: Record<Lang, string>;
  excerpt: Record<Lang, string>;
  body: ArticleSection[];
}

export const articles: BlogArticle[] = [
  {
    slug: "how-to-charge-ev-at-home",
    date: "2026-05-20",
    readMinutes: 5,
    title: {
      ua: "Як заряджати електромобіль вдома: повний гайд",
      ru: "Как заряжать электромобиль дома: полный гайд",
      en: "How to charge an EV at home: a complete guide",
    },
    excerpt: {
      ua: "Розетка чи wallbox, скільки коштує зарядка та як усе підключити безпечно.",
      ru: "Розетка или wallbox, сколько стоит зарядка и как всё подключить безопасно.",
      en: "Socket or wallbox, how much charging costs and how to set it up safely.",
    },
    body: [
      {
        h: { ua: "Розетка чи wallbox?", ru: "Розетка или wallbox?", en: "Socket or wallbox?" },
        p: {
          ua: [
            "Звичайна побутова розетка (220 В) заряджає повільно — повний заряд може зайняти 12–20 годин. Це підходить як резервний варіант, але не як основний.",
            "Домашня станція (wallbox) на 7–22 кВт заряджає у 3–6 разів швидше та має захист від перевантаження. Це оптимальний вибір для щоденного використання.",
          ],
          ru: [
            "Обычная бытовая розетка (220 В) заряжает медленно — полный заряд может занять 12–20 часов. Подходит как резервный вариант, но не как основной.",
            "Домашняя станция (wallbox) на 7–22 кВт заряжает в 3–6 раз быстрее и защищена от перегрузки. Это оптимальный выбор для ежедневного использования.",
          ],
          en: [
            "A regular household socket (220 V) charges slowly — a full charge can take 12–20 hours. It works as a backup, but not as your main option.",
            "A home wallbox (7–22 kW) charges 3–6× faster and is protected against overload. It's the best choice for daily use.",
          ],
        },
      },
      {
        h: { ua: "Скільки коштує зарядка", ru: "Сколько стоит зарядка", en: "How much charging costs" },
        p: {
          ua: [
            "Орієнтовно для повного заряду батареї 60 кВт·год потрібно ~60 кВт·год електроенергії. За нічним тарифом це у кілька разів дешевше, ніж заправка бензином на ту саму відстань.",
            "Поради: заряджайте вночі за пільговим тарифом і тримайте заряд у межах 20–80% для довшого терміну служби батареї.",
          ],
          ru: [
            "Ориентировочно для полного заряда батареи 60 кВт·ч нужно ~60 кВт·ч электроэнергии. По ночному тарифу это в несколько раз дешевле, чем заправка бензином на то же расстояние.",
            "Советы: заряжайте ночью по льготному тарифу и держите заряд в пределах 20–80% для более долгого срока службы батареи.",
          ],
          en: [
            "Roughly, a full charge of a 60 kWh battery needs ~60 kWh of electricity. On a night tariff that's several times cheaper than petrol for the same distance.",
            "Tips: charge at night on the off-peak tariff and keep the charge between 20–80% for a longer battery life.",
          ],
        },
      },
      {
        h: { ua: "Безпечне підключення", ru: "Безопасное подключение", en: "Safe installation" },
        p: {
          ua: [
            "Wallbox має встановлювати кваліфікований електрик з окремою лінією та автоматом захисту. Не підключайте потужну станцію до старої проводки без перевірки.",
            "Ми підбираємо та встановлюємо зарядні станції під ключ — від розрахунку потужності до запуску.",
          ],
          ru: [
            "Wallbox должен устанавливать квалифицированный электрик с отдельной линией и автоматом защиты. Не подключайте мощную станцию к старой проводке без проверки.",
            "Мы подбираем и устанавливаем зарядные станции под ключ — от расчёта мощности до запуска.",
          ],
          en: [
            "A wallbox must be installed by a qualified electrician on a dedicated line with a protective breaker. Don't connect a powerful station to old wiring without an inspection.",
            "We select and install charging stations turnkey — from power calculation to commissioning.",
          ],
        },
      },
    ],
  },
  {
    slug: "ev-winter-range",
    date: "2026-05-28",
    readMinutes: 4,
    title: {
      ua: "Запас ходу взимку: чому падає і як зберегти",
      ru: "Запас хода зимой: почему падает и как сохранить",
      en: "Winter range: why it drops and how to keep it",
    },
    excerpt: {
      ua: "Холод знижує запас ходу на 15–30%. Розбираємо причини та практичні поради.",
      ru: "Холод снижает запас хода на 15–30%. Разбираем причины и практические советы.",
      en: "Cold cuts range by 15–30%. We break down the causes and practical tips.",
    },
    body: [
      {
        h: { ua: "Чому падає запас ходу", ru: "Почему падает запас хода", en: "Why range drops" },
        p: {
          ua: [
            "На холоді хімічні процеси в батареї сповільнюються, а значна частина енергії йде на обігрів салону та самої батареї. Через це реальний пробіг узимку зазвичай на 15–30% менший за паспортний.",
          ],
          ru: [
            "На холоде химические процессы в батарее замедляются, а значительная часть энергии уходит на обогрев салона и самой батареи. Из-за этого реальный пробег зимой обычно на 15–30% меньше паспортного.",
          ],
          en: [
            "In the cold, the battery's chemical processes slow down, and a large share of energy goes to heating the cabin and the battery itself. As a result, real winter range is usually 15–30% lower than the rated figure.",
          ],
        },
      },
      {
        h: { ua: "Як зберегти пробіг", ru: "Как сохранить пробег", en: "How to preserve range" },
        p: {
          ua: [
            "Прогрівайте авто від мережі перед поїздкою (передкондиціювання) — так енергія батареї не витрачається на старті.",
            "Користуйтеся підігрівом сидінь і керма замість обігріву всього салону — це значно економніше.",
            "Тримайте помірну швидкість і використовуйте рекуперацію — на гальмуванні частина енергії повертається в батарею.",
          ],
          ru: [
            "Прогревайте авто от сети перед поездкой (предкондиционирование) — так энергия батареи не тратится на старте.",
            "Пользуйтесь подогревом сидений и руля вместо обогрева всего салона — это значительно экономнее.",
            "Держите умеренную скорость и используйте рекуперацию — при торможении часть энергии возвращается в батарею.",
          ],
          en: [
            "Pre-condition the car from the grid before driving — this way battery energy isn't spent at the start.",
            "Use heated seats and steering wheel instead of heating the whole cabin — it's far more efficient.",
            "Keep a moderate speed and use regenerative braking — some energy returns to the battery when slowing down.",
          ],
        },
      },
    ],
  },
  {
    slug: "ev-customs-ukraine",
    date: "2026-06-02",
    readMinutes: 4,
    title: {
      ua: "Розмитнення електромобіля в Україні: що варто знати",
      ru: "Растаможка электромобиля в Украине: что нужно знать",
      en: "Importing an EV to Ukraine: what to know",
    },
    excerpt: {
      ua: "Пільги для електрокарів, документи та як ми беремо оформлення на себе.",
      ru: "Льготы для электрокаров, документы и как мы берём оформление на себя.",
      en: "EV import benefits, paperwork, and how we handle clearance for you.",
    },
    body: [
      {
        h: { ua: "Пільги для електромобілів", ru: "Льготы для электромобилей", en: "EV import benefits" },
        p: {
          ua: [
            "Для електромобілів в Україні діють податкові пільги порівняно з авто на ДВЗ. Конкретні ставки та умови час від часу змінюються, тому актуальні цифри завжди уточнюйте перед покупкою.",
          ],
          ru: [
            "Для электромобилей в Украине действуют налоговые льготы по сравнению с авто на ДВС. Конкретные ставки и условия время от времени меняются, поэтому актуальные цифры всегда уточняйте перед покупкой.",
          ],
          en: [
            "EVs in Ukraine enjoy tax benefits compared with combustion cars. The exact rates and conditions change from time to time, so always confirm the current figures before buying.",
          ],
        },
      },
      {
        h: { ua: "Оформлення під ключ", ru: "Оформление под ключ", en: "Turnkey clearance" },
        p: {
          ua: [
            "Ми беремо на себе повний супровід: підбір авто, доставку, розмитнення та переоформлення. Усі витрати прозоро прописані в договорі — без прихованих платежів.",
            "Залиште заявку — менеджер розрахує повну вартість «під ключ» саме для вашого авто.",
          ],
          ru: [
            "Мы берём на себя полное сопровождение: подбор авто, доставку, растаможку и переоформление. Все расходы прозрачно прописаны в договоре — без скрытых платежей.",
            "Оставьте заявку — менеджер рассчитает полную стоимость «под ключ» именно для вашего авто.",
          ],
          en: [
            "We handle the full process: car selection, delivery, customs clearance and re-registration. All costs are transparently stated in the contract — no hidden fees.",
            "Leave a request — a manager will calculate the full turnkey cost for your specific car.",
          ],
        },
      },
    ],
  },
];

export function getArticle(slug: string): BlogArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function sortedArticles(): BlogArticle[] {
  return [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
}
