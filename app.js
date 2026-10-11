/* ==========================================================================
   IE Toolkit — app.js
   1. Conversion data      (edit here to add units or categories)
   2. Translations         (one dictionary for every user-facing string)
   3. Pure functions       (unit conversion, number parsing/formatting, OEE)
   4. ConvertLab UI        (full converter + hero preview)
   5. OEE calculator UI
   6. Site UI              (language, theme, mobile nav, scroll reveal, footer year)
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Conversion data
     Linear units carry a `factor` to the category's base unit.
     Temperature units carry `toBase` / `fromBase` functions (base: kelvin).
     Unit and category names live in the translation dictionary (section 2).
     ------------------------------------------------------------------------ */
  const unit = (id, symbol, factor) => ({ id, symbol, factor });

  const CATEGORIES = [
    {
      id: 'length',
      defaults: ['m', 'ft'],
      warnNegative: true,
      units: [
        unit('mm', 'mm', 0.001),
        unit('cm', 'cm', 0.01),
        unit('m', 'm', 1),
        unit('km', 'km', 1000),
        unit('in', 'in', 0.0254),
        unit('ft', 'ft', 0.3048),
        unit('yd', 'yd', 0.9144),
        unit('mi', 'mi', 1609.344),
      ],
    },
    {
      id: 'mass',
      defaults: ['kg', 'lb'],
      warnNegative: true,
      units: [
        unit('mg', 'mg', 1e-6),
        unit('g', 'g', 0.001),
        unit('kg', 'kg', 1),
        unit('t', 't', 1000),
        unit('oz', 'oz', 0.028349523125),
        unit('lb', 'lb', 0.45359237),
        unit('ton', 'ton', 907.18474),
      ],
    },
    {
      id: 'pressure',
      defaults: ['bar', 'psi'],
      units: [
        unit('pa', 'Pa', 1),
        unit('kpa', 'kPa', 1e3),
        unit('mpa', 'MPa', 1e6),
        unit('bar', 'bar', 1e5),
        unit('atm', 'atm', 101325),
        unit('psi', 'psi', 6894.757293168),
        unit('mmhg', 'mmHg', 133.322387415),
      ],
    },
    {
      id: 'energy',
      defaults: ['kwh', 'mj'],
      units: [
        unit('j', 'J', 1),
        unit('kj', 'kJ', 1e3),
        unit('mj', 'MJ', 1e6),
        unit('wh', 'Wh', 3600),
        unit('kwh', 'kWh', 3.6e6),
        unit('cal', 'cal', 4.184),
        unit('kcal', 'kcal', 4184),
        unit('btu', 'BTU', 1055.05585262),
      ],
    },
    {
      id: 'temperature',
      defaults: ['c', 'f'],
      absolute: true,
      units: [
        { id: 'c', symbol: '°C', toBase: (v) => v + 273.15, fromBase: (k) => k - 273.15 },
        { id: 'f', symbol: '°F', toBase: (v) => ((v + 459.67) * 5) / 9, fromBase: (k) => (k * 9) / 5 - 459.67 },
        { id: 'k', symbol: 'K', toBase: (v) => v, fromBase: (k) => k },
        { id: 'r', symbol: '°R', toBase: (v) => (v * 5) / 9, fromBase: (k) => (k * 9) / 5 },
      ],
    },
  ];

  const THEME_KEY = 'ie-toolkit-theme';
  const LANG_KEY = 'ie-toolkit-lang';
  const DEFAULT_LANG = 'en';
  const SIGNIFICANT_DIGITS = 6;
  const EMPTY_RESULT = '—';

  // Number conventions per language. Calculations never depend on these;
  // they only decide how numbers are typed and displayed.
  const LOCALES = {
    en: { tag: 'en-US', decimal: '.', group: ',' },
    tr: { tag: 'tr-TR', decimal: ',', group: '.' },
  };

  /* ------------------------------------------------------------------------
     2. Translations
     HTML elements point at these keys with data-i18n="key" (text) or
     data-i18n-attr="attribute:key" (attributes such as aria-label).
     "IE Toolkit", "ConvertLab" and "OEE" are names and stay untranslated.
     ------------------------------------------------------------------------ */
  const I18N = {
    en: {
      'meta.title': 'IE Toolkit — Industrial Engineering Workspace',
      'meta.description': 'IE Toolkit is an engineering workspace for industrial engineering students and professionals, starting with the ConvertLab unit converter.',

      'a11y.skip': 'Skip to content',
      'a11y.home': 'IE Toolkit home',
      'a11y.menu': 'Menu',
      'a11y.mainNav': 'Main',
      'a11y.footerNav': 'Footer',
      'a11y.theme': 'Dark theme',
      'a11y.language': 'Language',

      'nav.modules': 'Modules',
      'nav.pricing': 'Pricing',
      'nav.open': 'Open ConvertLab',

      'hero.label': 'Industrial Engineering Toolkit',
      'hero.title': 'Your engineering workspace.',
      'hero.lead': 'Practical tools for industrial engineers, from unit conversions to production performance.',
      'hero.explore': 'Explore Modules',
      'spec.tools': 'Tools',
      'spec.of': 'of 04',
      'spec.categories': 'Categories',
      'spec.units': 'Units',

      'preview.label': 'Tool 01 · Preview',
      'preview.length': 'Length',
      'preview.result': 'Result',
      'preview.empty': 'Enter a length in kilometers',
      'preview.caption': 'Fig. 00 — km / mi scale comparison',
      'preview.open': 'Open full converter',

      'status.available': 'Available',
      'status.soon': 'Coming Soon',

      'modules.label': 'Sec. 01 — Tool directory',
      'modules.title': 'Modules',
      'modules.intro': 'Two tools are available today. Two more are in development on the same foundation.',
      'tool.word': 'Tool',
      'tool.open': 'Open tool',
      'tool1.desc': 'Unit converter for length, mass, pressure, energy and temperature.',
      'tool2.title': 'Production Efficiency & OEE',
      'tool2.desc': 'Availability, performance and quality combined into overall equipment effectiveness.',
      'tool3.title': 'Inventory Management',
      'tool3.desc': 'Order quantities, reorder points and safety stock with worked results.',
      'tool4.title': 'Capacity Planning',
      'tool4.desc': 'Available time against demand, bottlenecks, shifts and resources.',

      'cl.label': 'Sec. 02 — Tool 01',
      'cl.intro': 'Pick a category, enter a value, and the result updates as you type.',
      'cl.tabs': 'Conversion category',
      'cl.from': 'From',
      'cl.to': 'To',
      'cl.fromUnit': 'From unit',
      'cl.toUnit': 'To unit',
      'cl.swap': 'Swap units',

      'error.invalid': 'Enter a valid number, for example 12.5',
      'error.tooLarge': 'That number is too large to convert',
      'error.absoluteZero': 'Below absolute zero (0 K) — enter a higher temperature',
      'note.negative': 'Negative values are unusual for {category}',

      'oee.label': 'Sec. 03 — Tool 02',
      'oee.intro': 'Enter the figures for one production run to see availability, performance, quality and OEE.',
      'oee.inputs': 'Production inputs',
      'oee.planned': 'Planned production time',
      'oee.downtime': 'Downtime',
      'oee.cycle': 'Ideal cycle time',
      'oee.units': 'Total units produced',
      'oee.defects': 'Defective units',
      'oee.unit.min': 'min',
      'oee.unit.minPerUnit': 'min/unit',
      'oee.unit.units': 'units',
      'oee.overall': 'Overall equipment effectiveness',
      'oee.formulaLabel': 'Availability × Performance × Quality',
      'oee.availability': 'Availability',
      'oee.performance': 'Performance',
      'oee.quality': 'Quality',
      'oee.lowestTag': 'Lowest',
      'oee.detail.availability': '{a} of {b} min operating',
      'oee.detail.performance': '{a} of {b} possible units',
      'oee.detail.quality': '{a} good of {b} units',
      'oee.operating': 'Operating time',
      'oee.good': 'Good units',
      'oee.analysis': 'Performance analysis',
      'oee.analysis.lowest': 'Lowest component: {component} ({value})',
      'oee.suggest.availability': 'Review downtime causes, equipment failures and maintenance scheduling.',
      'oee.suggest.performance': 'Review cycle times, minor stops and production speed losses.',
      'oee.suggest.quality': 'Review defective products, process variation and quality control.',
      'oee.disclaimer': 'These suggestions are general guidance, not a definitive diagnosis.',
      'oee.warning.over100': 'Performance is above 100%. More units were produced than the ideal cycle time allows in the operating time, so the inputs may be inconsistent. Check the ideal cycle time, unit count and downtime. The value is shown as calculated, not capped.',
      'oee.invalid.title': 'Results unavailable',
      'oee.invalid.text': 'Correct the highlighted inputs to see the results.',
      'oee.error.required': 'Enter a value',
      'oee.error.negative': 'Must not be negative',
      'oee.error.wholeNumber': 'Enter a whole number — units are counted individually',
      'oee.error.plannedZero': 'Planned time must be greater than 0',
      'oee.error.cycleZero': 'Ideal cycle time must be greater than 0',
      'oee.error.unitsZero': 'Total units must be greater than 0',
      'oee.error.downtimeOver': 'Downtime cannot exceed planned production time',
      'oee.error.noOperatingTime': 'Downtime equals planned time, leaving no operating time',
      'oee.error.defectsOver': 'Defective units cannot exceed total units produced',

      'pricing.label': 'Sec. 04 — Plans',
      'pricing.title': 'Pricing',
      'pricing.demoStrong': 'Demonstration only.',
      'pricing.demoText': 'These plans are examples. No payments or subscriptions are available.',
      'plan.student': 'Student',
      'plan.pro': 'Pro',
      'plan.period': '/month',
      'plan.button': 'Demo plan',
      'student.desc': 'For coursework and labs.',
      'student.f1': 'ConvertLab unit converter',
      'student.f2': 'All five conversion categories',
      'student.f3': 'Works in any modern browser',
      'pro.desc': 'Every module as it ships.',
      'pro.f1': 'Everything in Student',

      'footer.note': 'IE Toolkit. Built for industrial engineers.',

      'svg.fig': 'FIG.',
      'svg.flow': 'FLOW →',
      'svg.max': 'MAX',
      'svg.rop': 'ROP',
      'svg.dwg': 'DWG. CL-01',
      'svg.scale': 'SCALE 1:1',
      'svg.rule': 'FIG. 01 — SCALE RULE',
      'svg.dimCard': 'L = 160.0',
      'svg.dimRule': '280.0 mm',

      'category.length': 'Length',
      'category.mass': 'Mass',
      'category.pressure': 'Pressure',
      'category.energy': 'Energy',
      'category.temperature': 'Temperature',

      'unit.mm': 'Millimeter',
      'unit.cm': 'Centimeter',
      'unit.m': 'Meter',
      'unit.km': 'Kilometer',
      'unit.in': 'Inch',
      'unit.ft': 'Foot',
      'unit.yd': 'Yard',
      'unit.mi': 'Mile',
      'unit.mg': 'Milligram',
      'unit.g': 'Gram',
      'unit.kg': 'Kilogram',
      'unit.t': 'Metric ton',
      'unit.oz': 'Ounce',
      'unit.lb': 'Pound',
      'unit.ton': 'US short ton',
      'unit.pa': 'Pascal',
      'unit.kpa': 'Kilopascal',
      'unit.mpa': 'Megapascal',
      'unit.bar': 'Bar',
      'unit.atm': 'Standard atmosphere',
      'unit.psi': 'Pound per square inch',
      'unit.mmhg': 'Millimeter of mercury',
      'unit.j': 'Joule',
      'unit.kj': 'Kilojoule',
      'unit.mj': 'Megajoule',
      'unit.wh': 'Watt-hour',
      'unit.kwh': 'Kilowatt-hour',
      'unit.cal': 'Calorie (thermochemical)',
      'unit.kcal': 'Kilocalorie',
      'unit.btu': 'British thermal unit (IT)',
      'unit.c': 'Celsius',
      'unit.f': 'Fahrenheit',
      'unit.k': 'Kelvin',
      'unit.r': 'Rankine',
    },

    tr: {
      'meta.title': 'IE Toolkit — Endüstri Mühendisliği Çalışma Alanı',
      'meta.description': 'IE Toolkit, endüstri mühendisliği öğrencileri ve profesyonelleri için bir mühendislik çalışma alanıdır; ilk aracı ConvertLab birim dönüştürücüdür.',

      'a11y.skip': 'İçeriğe geç',
      'a11y.home': 'IE Toolkit ana sayfa',
      'a11y.menu': 'Menü',
      'a11y.mainNav': 'Ana gezinme',
      'a11y.footerNav': 'Alt bilgi',
      'a11y.theme': 'Koyu tema',
      'a11y.language': 'Dil',

      'nav.modules': 'Modüller',
      'nav.pricing': 'Fiyatlandırma',
      'nav.open': 'ConvertLab’i Aç',

      'hero.label': 'Endüstri Mühendisliği Araç Seti',
      'hero.title': 'Mühendislik çalışma alanınız.',
      'hero.lead': 'Endüstri mühendisleri için birim dönüşümlerinden üretim performansına uzanan pratik araçlar.',
      'hero.explore': 'Modülleri Keşfet',
      'spec.tools': 'Araçlar',
      'spec.of': '/ 04',
      'spec.categories': 'Kategoriler',
      'spec.units': 'Birimler',

      'preview.label': 'Araç 01 · Önizleme',
      'preview.length': 'Uzunluk',
      'preview.result': 'Sonuç',
      'preview.empty': 'Kilometre cinsinden bir uzunluk girin',
      'preview.caption': 'Şek. 00 — km / mi ölçek karşılaştırması',
      'preview.open': 'Tam dönüştürücüyü aç',

      'status.available': 'Kullanılabilir',
      'status.soon': 'Yakında',

      'modules.label': 'Böl. 01 — Araç dizini',
      'modules.title': 'Modüller',
      'modules.intro': 'Bugün iki araç kullanıma hazır. Aynı temel üzerinde iki araç daha geliştiriliyor.',
      'tool.word': 'Araç',
      'tool.open': 'Aracı aç',
      'tool1.desc': 'Uzunluk, kütle, basınç, enerji ve sıcaklık için birim dönüştürücü.',
      'tool2.title': 'Üretim Verimliliği ve OEE',
      'tool2.desc': 'Kullanılabilirlik, performans ve kalitenin genel ekipman etkinliğinde birleşimi.',
      'tool3.title': 'Envanter Yönetimi',
      'tool3.desc': 'Sipariş miktarları, yeniden sipariş noktaları ve emniyet stoğu; örnek sonuçlarla.',
      'tool4.title': 'Kapasite Planlama',
      'tool4.desc': 'Talebe karşı kullanılabilir süre, darboğazlar, vardiyalar ve kaynaklar.',

      'cl.label': 'Böl. 02 — Araç 01',
      'cl.intro': 'Bir kategori seçin, bir değer girin; sonuç siz yazdıkça güncellenir.',
      'cl.tabs': 'Dönüşüm kategorisi',
      'cl.from': 'Kaynak',
      'cl.to': 'Hedef',
      'cl.fromUnit': 'Kaynak birim',
      'cl.toUnit': 'Hedef birim',
      'cl.swap': 'Birimleri değiştir',

      'error.invalid': 'Geçerli bir sayı girin, örneğin 12,5',
      'error.tooLarge': 'Bu sayı dönüştürmek için çok büyük',
      'error.absoluteZero': 'Mutlak sıfırın (0 K) altında — daha yüksek bir sıcaklık girin',
      'note.negative': 'Negatif değerler {category} için olağan dışıdır',

      'oee.label': 'Böl. 03 — Araç 02',
      'oee.intro': 'Bir üretim dönemine ait değerleri girin; kullanılabilirlik, performans, kalite ve OEE hesaplansın.',
      'oee.inputs': 'Üretim girdileri',
      'oee.planned': 'Planlanan üretim süresi',
      'oee.downtime': 'Duruş süresi',
      'oee.cycle': 'İdeal çevrim süresi',
      'oee.units': 'Üretilen toplam adet',
      'oee.defects': 'Hatalı adet',
      'oee.unit.min': 'dk',
      'oee.unit.minPerUnit': 'dk/adet',
      'oee.unit.units': 'adet',
      'oee.overall': 'Genel ekipman etkinliği',
      'oee.formulaLabel': 'Kullanılabilirlik × Performans × Kalite',
      'oee.availability': 'Kullanılabilirlik',
      'oee.performance': 'Performans',
      'oee.quality': 'Kalite',
      'oee.lowestTag': 'En düşük',
      'oee.detail.availability': 'Planlanan {b} dk içinde {a} dk çalışma',
      'oee.detail.performance': 'Olası {b} adetten {a} adet',
      'oee.detail.quality': '{b} adetten {a} sağlam adet',
      'oee.operating': 'Çalışma süresi',
      'oee.good': 'Sağlam adet',
      'oee.analysis': 'Performans analizi',
      'oee.analysis.lowest': 'En düşük bileşen: {component} ({value})',
      'oee.suggest.availability': 'Duruş nedenlerini, ekipman arızalarını ve bakım planlamasını gözden geçirin.',
      'oee.suggest.performance': 'Çevrim sürelerini, küçük duruşları ve üretim hızı kayıplarını gözden geçirin.',
      'oee.suggest.quality': 'Hatalı ürünleri, süreç değişkenliğini ve kalite kontrolü gözden geçirin.',
      'oee.disclaimer': 'Bu öneriler genel yönlendirmedir; kesin bir teşhis değildir.',
      'oee.warning.over100': 'Performans %100’ün üzerinde. Çalışma süresinde, ideal çevrim süresinin izin verdiğinden fazla adet üretilmiş görünüyor; girdiler tutarsız olabilir. İdeal çevrim süresini, adet sayısını ve duruş süresini kontrol edin. Değer sınırlandırılmadan, hesaplandığı gibi gösterilmektedir.',
      'oee.invalid.title': 'Sonuçlar gösterilemiyor',
      'oee.invalid.text': 'Sonuçları görmek için işaretli girdileri düzeltin.',
      'oee.error.required': 'Bir değer girin',
      'oee.error.negative': 'Negatif olamaz',
      'oee.error.wholeNumber': 'Tam sayı girin — adetler tek tek sayılır',
      'oee.error.plannedZero': 'Planlanan süre 0’dan büyük olmalıdır',
      'oee.error.cycleZero': 'İdeal çevrim süresi 0’dan büyük olmalıdır',
      'oee.error.unitsZero': 'Toplam adet 0’dan büyük olmalıdır',
      'oee.error.downtimeOver': 'Duruş süresi planlanan üretim süresini aşamaz',
      'oee.error.noOperatingTime': 'Duruş süresi planlanan süreye eşit; çalışma süresi kalmıyor',
      'oee.error.defectsOver': 'Hatalı adet, üretilen toplam adedi aşamaz',

      'pricing.label': 'Böl. 04 — Planlar',
      'pricing.title': 'Fiyatlandırma',
      'pricing.demoStrong': 'Yalnızca gösterim amaçlıdır.',
      'pricing.demoText': 'Bu planlar örnektir. Ödeme veya abonelik alınmamaktadır.',
      'plan.student': 'Öğrenci',
      'plan.pro': 'Pro',
      'plan.period': '/ay',
      'plan.button': 'Demo planı',
      'student.desc': 'Dersler ve laboratuvarlar için.',
      'student.f1': 'ConvertLab birim dönüştürücü',
      'student.f2': 'Beş dönüşüm kategorisinin tümü',
      'student.f3': 'Tüm modern tarayıcılarda çalışır',
      'pro.desc': 'Yayınlandıkça her modül.',
      'pro.f1': 'Öğrenci planındaki her şey',

      'footer.note': 'IE Toolkit. Endüstri mühendisleri için geliştirildi.',

      'svg.fig': 'ŞEK.',
      'svg.flow': 'AKIŞ →',
      'svg.max': 'MAKS',
      'svg.rop': 'YSN',
      'svg.dwg': 'ÇİZ. CL-01',
      'svg.scale': 'ÖLÇEK 1:1',
      'svg.rule': 'ŞEK. 01 — ÖLÇEK CETVELİ',
      'svg.dimCard': 'L = 160,0',
      'svg.dimRule': '280,0 mm',

      'category.length': 'Uzunluk',
      'category.mass': 'Kütle',
      'category.pressure': 'Basınç',
      'category.energy': 'Enerji',
      'category.temperature': 'Sıcaklık',

      'unit.mm': 'Milimetre',
      'unit.cm': 'Santimetre',
      'unit.m': 'Metre',
      'unit.km': 'Kilometre',
      'unit.in': 'İnç',
      'unit.ft': 'Fit',
      'unit.yd': 'Yarda',
      'unit.mi': 'Mil',
      'unit.mg': 'Miligram',
      'unit.g': 'Gram',
      'unit.kg': 'Kilogram',
      'unit.t': 'Metrik ton',
      'unit.oz': 'Ons',
      'unit.lb': 'Libre',
      'unit.ton': 'ABD kısa tonu',
      'unit.pa': 'Paskal',
      'unit.kpa': 'Kilopaskal',
      'unit.mpa': 'Megapaskal',
      'unit.bar': 'Bar',
      'unit.atm': 'Standart atmosfer',
      'unit.psi': 'Libre/inç kare',
      'unit.mmhg': 'Milimetre cıva',
      'unit.j': 'Joule',
      'unit.kj': 'Kilojoule',
      'unit.mj': 'Megajoule',
      'unit.wh': 'Watt-saat',
      'unit.kwh': 'Kilowatt-saat',
      'unit.cal': 'Kalori (termokimyasal)',
      'unit.kcal': 'Kilokalori',
      'unit.btu': 'İngiliz ısı birimi (IT)',
      'unit.c': 'Celsius',
      'unit.f': 'Fahrenheit',
      'unit.k': 'Kelvin',
      'unit.r': 'Rankine',
    },
  };

  const localeOf = (lang) => LOCALES[lang] || LOCALES[DEFAULT_LANG];

  // Looks up `key` in `lang`, falling back to English, then to the key itself.
  function translate(lang, key, params) {
    const dictionary = I18N[lang] || I18N[DEFAULT_LANG];
    let text = dictionary[key];
    if (text === undefined) text = I18N[DEFAULT_LANG][key];
    if (text === undefined) return key;
    if (params) {
      Object.keys(params).forEach((name) => {
        text = text.replace('{' + name + '}', params[name]);
      });
    }
    return text;
  }

  /* ------------------------------------------------------------------------
     3. Pure functions
     ------------------------------------------------------------------------ */
  const getCategory = (categoryId) => CATEGORIES.find((c) => c.id === categoryId);
  const getUnit = (category, unitId) => category.units.find((u) => u.id === unitId);

  const toBase = (u, value) => (u.toBase ? u.toBase(value) : value * u.factor);
  const fromBase = (u, base) => (u.fromBase ? u.fromBase(base) : base / u.factor);

  function convert(categoryId, value, fromId, toId) {
    const category = getCategory(categoryId);
    const from = category && getUnit(category, fromId);
    const to = category && getUnit(category, toId);
    if (!from || !to) return NaN;
    if (from === to) return value;
    const result = fromBase(to, toBase(from, value));
    // Offset conversions leave float residue (e.g. 5.7e-14 instead of 0).
    return category.absolute ? Math.round(result * 1e9) / 1e9 : result;
  }

  // Turns typed text into a plain numeric string ("1234.5", "-2.5e3").
  // Returns '' for empty input and null for text that is not a number.
  //   en: "2.5", "1,000.5"      tr: "2,5", "1.000,5"
  // A lone separator of the other kind is read as a decimal point ("2.5" in
  // Turkish, "2,5" in English) unless it forms a valid thousands group.
  function normalizeInput(raw, lang) {
    const { decimal, group } = localeOf(lang);
    const text = String(raw).trim().replace(/\s+/g, '').replace('−', '-');
    if (text === '') return '';

    const match = /^([+-]?)([\d.,]+?)(e[+-]?\d+)?$/i.exec(text);
    if (!match || !/\d/.test(match[2])) return null;

    const body = match[2];
    const d = '\\' + decimal;
    const g = '\\' + group;
    let plain;
    if (new RegExp('^(\\d+|\\d{1,3}(' + g + '\\d{3})+)?(' + d + '\\d*)?$').test(body)) {
      plain = body.split(group).join('').replace(decimal, '.');
    } else if (new RegExp('^\\d*' + g + '\\d*$').test(body)) {
      plain = body.replace(group, '.');
    } else {
      return null;
    }
    return match[1] + plain + (match[3] || '');
  }

  // Returns { status: 'empty' | 'invalid' | 'ok', value }.
  function parseInput(raw, lang) {
    const plain = normalizeInput(raw, lang);
    if (plain === '') return { status: 'empty', value: null };
    if (plain === null) return { status: 'invalid', value: null };
    return { status: 'ok', value: Number(plain) };
  }

  // Rewrites typed text from one language's number format to another's without
  // changing its value or precision ("2,5" tr -> "2.5" en). Unparseable text is kept.
  function localizeInput(raw, fromLang, toLang) {
    const plain = normalizeInput(raw, fromLang);
    if (!plain) return raw;
    return plain.replace('.', localeOf(toLang).decimal);
  }

  const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

  // Rounded to SIGNIFICANT_DIGITS, as an ungrouped string parseInput can read back.
  function toPlainString(n, lang) {
    const rounded = Number(n.toPrecision(SIGNIFICANT_DIGITS));
    return String(rounded === 0 ? 0 : rounded).replace('.', localeOf(lang).decimal);
  }

  function formatNumber(n, lang) {
    if (!Number.isFinite(n)) return EMPTY_RESULT;
    const locale = localeOf(lang);
    const rounded = Number(n.toPrecision(SIGNIFICANT_DIGITS));
    if (rounded === 0) return '0';
    const abs = Math.abs(rounded);
    let text;
    if (abs >= 1e9 || abs < 1e-6) {
      const [mantissa, exponent] = abs.toExponential().split('e');
      const power = String(Number(exponent)).split('').map((ch) => SUPERSCRIPT[ch]).join('');
      text = mantissa.replace('.', locale.decimal) + ' × 10' + power;
    } else {
      text = abs.toLocaleString(locale.tag, { maximumFractionDigits: 12 });
    }
    return (rounded < 0 ? '−' : '') + text;
  }

  // Full pipeline for one conversion: parse, validate, convert.
  // options.lang       language whose number format `raw` is typed in (default English)
  // options.exactValue replaces the parsed number when `raw` is only a rounded display of it
  // Returns { status: 'empty' | 'error' | 'ok', value?, input?, messageKey?, noteKey? };
  // message and note keys are looked up in the translation dictionary by the UI.
  function evaluate(categoryId, raw, fromId, toId, options) {
    const { lang, exactValue } = options || {};
    const parsed = typeof exactValue === 'number' ? { status: 'ok', value: exactValue } : parseInput(raw, lang);
    if (parsed.status === 'empty') return { status: 'empty' };
    if (parsed.status === 'invalid') return { status: 'error', messageKey: 'error.invalid' };
    if (!Number.isFinite(parsed.value)) return { status: 'error', messageKey: 'error.tooLarge' };

    const category = getCategory(categoryId);
    const from = getUnit(category, fromId);
    if (category.absolute && toBase(from, parsed.value) < -1e-9) {
      return { status: 'error', messageKey: 'error.absoluteZero' };
    }

    const value = convert(categoryId, parsed.value, fromId, toId);
    if (!Number.isFinite(value)) return { status: 'error', messageKey: 'error.tooLarge' };

    const noteKey = category.warnNegative && parsed.value < 0 ? 'note.negative' : '';
    return { status: 'ok', value, input: parsed.value, noteKey };
  }

  /* --- OEE (Overall Equipment Effectiveness) --- */

  const OEE_FIELDS = ['plannedTime', 'downtime', 'idealCycleTime', 'totalUnits', 'defectiveUnits'];
  const OEE_COUNT_FIELDS = ['totalUnits', 'defectiveUnits']; // product counts: whole numbers only
  const OEE_COMPONENTS = ['availability', 'performance', 'quality'];

  // All results are full-precision ratios (0.875, not 87.5). Nothing is rounded
  // or capped here; performance may legitimately come out above 1.
  function calculateOee({ plannedTime, downtime, idealCycleTime, totalUnits, defectiveUnits }) {
    const operatingTime = plannedTime - downtime;
    const goodUnits = totalUnits - defectiveUnits;
    const availability = operatingTime / plannedTime;
    const performance = (idealCycleTime * totalUnits) / operatingTime;
    const quality = goodUnits / totalUnits;
    return { operatingTime, goodUnits, availability, performance, quality, oee: availability * performance * quality };
  }

  // Checks parsed numbers against the OEE rules. Returns { field: messageKey }
  // for each field that breaks one; fields that are missing are skipped.
  function validateOeeInputs(values) {
    const errors = {};
    const has = (field) => typeof values[field] === 'number';
    const flag = (field, key) => {
      if (!errors[field]) errors[field] = key;
    };

    OEE_FIELDS.forEach((field) => {
      if (has(field) && values[field] < 0) flag(field, 'oee.error.negative');
    });
    OEE_COUNT_FIELDS.forEach((field) => {
      if (has(field) && !Number.isInteger(values[field])) flag(field, 'oee.error.wholeNumber');
    });
    if (values.plannedTime === 0) flag('plannedTime', 'oee.error.plannedZero');
    if (values.idealCycleTime === 0) flag('idealCycleTime', 'oee.error.cycleZero');
    if (values.totalUnits === 0) flag('totalUnits', 'oee.error.unitsZero');

    if (has('plannedTime') && has('downtime') && !errors.plannedTime && !errors.downtime) {
      if (values.downtime > values.plannedTime) flag('downtime', 'oee.error.downtimeOver');
      else if (values.downtime === values.plannedTime) flag('downtime', 'oee.error.noOperatingTime');
    }
    if (has('totalUnits') && has('defectiveUnits') && !errors.totalUnits && !errors.defectiveUnits) {
      if (values.defectiveUnits > values.totalUnits) flag('defectiveUnits', 'oee.error.defectsOver');
    }
    return errors;
  }

  // The weakest of the three components; on an exact tie the earlier one wins.
  function lowestOeeComponent(result) {
    return OEE_COMPONENTS.reduce((lowest, name) => (result[name] < result[lowest] ? name : lowest));
  }

  // Full pipeline: parse the five typed inputs, validate, calculate.
  // rawInputs: { plannedTime: '480', ... } as typed, in `lang` number format.
  // Returns { status: 'ok', values, result, lowest, performanceOver100 }
  //      or { status: 'error', fieldErrors } — never a result built on bad input.
  function evaluateOee(rawInputs, lang) {
    const values = {};
    const fieldErrors = {};
    OEE_FIELDS.forEach((field) => {
      const parsed = parseInput(rawInputs[field] === undefined ? '' : rawInputs[field], lang);
      if (parsed.status === 'empty') fieldErrors[field] = 'oee.error.required';
      else if (parsed.status === 'invalid') fieldErrors[field] = 'error.invalid';
      else if (!Number.isFinite(parsed.value)) fieldErrors[field] = 'error.tooLarge';
      else values[field] = parsed.value;
    });
    Object.assign(fieldErrors, validateOeeInputs(values));
    if (Object.keys(fieldErrors).length > 0) return { status: 'error', fieldErrors };

    const result = calculateOee(values);
    if (!OEE_COMPONENTS.every((name) => Number.isFinite(result[name]))) {
      return { status: 'error', fieldErrors: { idealCycleTime: 'error.tooLarge' } };
    }
    return {
      status: 'ok',
      values,
      result,
      lowest: lowestOeeComponent(result),
      performanceOver100: result.performance > 1 + 1e-9,
    };
  }

  // Ratio -> percentage with two decimals: "87.50%" (en), "%87,50" (tr).
  function formatPercent(ratio, lang) {
    if (!Number.isFinite(ratio)) return EMPTY_RESULT;
    return ratio.toLocaleString(localeOf(lang).tag, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Lets the calculation logic be tested from Node without a browser.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      CATEGORIES, I18N, translate, convert, normalizeInput, parseInput, localizeInput, formatNumber, toPlainString, evaluate,
      calculateOee, validateOeeInputs, lowestOeeComponent, evaluateOee, formatPercent,
    };
  }
  if (typeof document === 'undefined') return;

  /* ------------------------------------------------------------------------
     4. ConvertLab UI
     ------------------------------------------------------------------------ */

  // localStorage can be unavailable (private mode, blocked site data).
  function readStore(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* preference simply is not remembered */
    }
  }

  // Current language, and the callbacks to run when it changes. Each callback
  // receives the previous language so it can re-format what the user typed.
  let lang = I18N[readStore(LANG_KEY)] ? readStore(LANG_KEY) : DEFAULT_LANG;
  const languageListeners = [];
  const t = (key, params) => translate(lang, key, params);

  const unitLabel = (u) => t('unit.' + u.id) + ' (' + u.symbol + ')';
  const equation = (input, from, value, to) =>
    formatNumber(input, lang) + ' ' + from.symbol + ' = ' + formatNumber(value, lang) + ' ' + to.symbol;

  function initConvertLab() {
    const tabList = document.getElementById('cl-tabs');
    if (!tabList) return;

    const panel = document.getElementById('cl-panel');
    const valueInput = document.getElementById('cl-value');
    const fromSelect = document.getElementById('cl-from');
    const toSelect = document.getElementById('cl-to');
    const resultOutput = document.getElementById('cl-result');
    const swapButton = document.getElementById('cl-swap');
    const messageEl = document.getElementById('cl-message');
    const summaryEl = document.getElementById('cl-summary');

    let activeCategory = CATEGORIES[0];
    let lastResult = null;
    // After a swap the input shows a rounded number; this keeps the exact value
    // behind it so swapping back and forth does not accumulate rounding error.
    let carried = null;

    const tabs = CATEGORIES.map((category) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'tab';
      tab.id = 'cl-tab-' + category.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'cl-panel');
      tab.textContent = t('category.' + category.id);
      tab.addEventListener('click', () => selectCategory(category));
      tabList.appendChild(tab);
      return tab;
    });

    function fillSelect(select, selectedId) {
      select.textContent = '';
      activeCategory.units.forEach((u) => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = unitLabel(u);
        select.appendChild(option);
      });
      select.value = selectedId;
    }

    function selectCategory(category) {
      activeCategory = category;
      carried = null;
      tabs.forEach((tab, index) => {
        const selected = CATEGORIES[index] === category;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', 'cl-tab-' + category.id);
      fillSelect(fromSelect, category.defaults[0]);
      fillSelect(toSelect, category.defaults[1]);
      update();
    }

    function update() {
      if (carried && carried.text !== valueInput.value) carried = null;
      const outcome = evaluate(activeCategory.id, valueInput.value, fromSelect.value, toSelect.value, {
        lang,
        exactValue: carried ? carried.value : undefined,
      });
      const isError = outcome.status === 'error';

      lastResult = outcome.status === 'ok' ? outcome.value : null;
      resultOutput.textContent = lastResult === null ? EMPTY_RESULT : formatNumber(lastResult, lang);
      valueInput.setAttribute('aria-invalid', String(isError));
      messageEl.classList.toggle('is-error', isError);
      if (isError) {
        messageEl.textContent = t(outcome.messageKey);
      } else if (outcome.noteKey) {
        const categoryName = t('category.' + activeCategory.id).toLocaleLowerCase(localeOf(lang).tag);
        messageEl.textContent = t(outcome.noteKey, { category: categoryName });
      } else {
        messageEl.textContent = '';
      }

      if (lastResult === null) {
        summaryEl.textContent = '';
        return;
      }
      const from = getUnit(activeCategory, fromSelect.value);
      const to = getUnit(activeCategory, toSelect.value);
      summaryEl.textContent = equation(outcome.input, from, lastResult, to);
    }

    function swap() {
      const previousFrom = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = previousFrom;
      if (lastResult !== null) {
        carried = { text: toPlainString(lastResult, lang), value: lastResult };
        valueInput.value = carried.text;
      }
      swapButton.classList.toggle('is-flipped');
      update();
    }

    // Relabels in place so the entered value, units and category survive.
    function onLanguageChange(previousLang) {
      tabs.forEach((tab, index) => {
        tab.textContent = t('category.' + CATEGORIES[index].id);
      });
      [fromSelect, toSelect].forEach((select) => {
        Array.prototype.forEach.call(select.options, (option) => {
          option.textContent = unitLabel(getUnit(activeCategory, option.value));
        });
      });
      const wasCarried = carried && carried.text === valueInput.value;
      valueInput.value = localizeInput(valueInput.value, previousLang, lang);
      if (wasCarried) carried.text = valueInput.value;
      update();
    }

    tabList.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      const last = tabs.length - 1;
      const next = {
        ArrowRight: current === last ? 0 : current + 1,
        ArrowLeft: current === 0 ? last : current - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      selectCategory(CATEGORIES[next]);
    });

    valueInput.addEventListener('input', update);
    fromSelect.addEventListener('change', update);
    toSelect.addEventListener('change', update);
    swapButton.addEventListener('click', swap);
    languageListeners.push(onLanguageChange);

    selectCategory(activeCategory);
  }

  // Compact km → mi read-out in the hero. Runs on the same evaluate() pipeline
  // as ConvertLab, so no conversion factor is repeated here.
  function initHeroPreview() {
    const input = document.getElementById('hp-value');
    if (!input) return;

    const resultOutput = document.getElementById('hp-result');
    const lineEl = document.getElementById('hp-line');
    const length = getCategory('length');
    const from = getUnit(length, 'km');
    const to = getUnit(length, 'mi');

    function update() {
      const outcome = evaluate(length.id, input.value, from.id, to.id, { lang });
      const isOk = outcome.status === 'ok';
      const isError = outcome.status === 'error';

      input.setAttribute('aria-invalid', String(isError));
      resultOutput.textContent = isOk ? formatNumber(outcome.value, lang) : EMPTY_RESULT;
      lineEl.classList.toggle('is-error', isError);
      if (isOk) {
        lineEl.textContent = equation(outcome.input, from, outcome.value, to);
      } else {
        lineEl.textContent = isError ? t(outcome.messageKey) : t('preview.empty');
      }
    }

    input.addEventListener('input', update);
    languageListeners.push((previousLang) => {
      input.value = localizeInput(input.value, previousLang, lang);
      update();
    });
    update();
  }

  /* ------------------------------------------------------------------------
     5. OEE calculator UI
     ------------------------------------------------------------------------ */
  function initOee() {
    const form = document.getElementById('oee-form');
    if (!form) return;

    const byId = (id) => document.getElementById(id);
    const inputs = {
      plannedTime: byId('oee-planned'),
      downtime: byId('oee-downtime'),
      idealCycleTime: byId('oee-cycle'),
      totalUnits: byId('oee-units'),
      defectiveUnits: byId('oee-defects'),
    };
    const overallValue = byId('oee-value');
    const overallBar = byId('oee-bar');
    const formulaEl = byId('oee-formula');
    const operatingEl = byId('oee-operating');
    const goodEl = byId('oee-good');
    const analysisTitle = byId('oee-analysis-title');
    const analysisText = byId('oee-analysis-text');
    const warningEl = byId('oee-warning');
    const disclaimerEl = byId('oee-disclaimer');

    // The bar is only a picture of the number beside it: it stops at full
    // width, and is-over marks a value above 100% (the number is never capped).
    function setMeter(meter, ratio) {
      const shown = Number.isFinite(ratio) ? Math.min(Math.max(ratio, 0), 1) : 0;
      meter.firstElementChild.style.width = shown * 100 + '%';
      meter.classList.toggle('is-over', Number.isFinite(ratio) && ratio > 1 + 1e-9);
    }

    function showFieldErrors(fieldErrors) {
      OEE_FIELDS.forEach((field) => {
        const key = fieldErrors[field];
        inputs[field].setAttribute('aria-invalid', String(Boolean(key)));
        byId(inputs[field].id + '-error').textContent = key ? t(key) : '';
      });
    }

    function showComponent(name, ratio, detail, isLowest) {
      byId('oee-' + name + '-value').textContent = formatPercent(ratio, lang);
      byId('oee-' + name + '-detail').textContent = detail;
      byId('oee-' + name + '-card').classList.toggle('is-lowest', isLowest);
      byId('oee-' + name + '-tag').hidden = !isLowest;
      setMeter(byId('oee-' + name + '-bar'), ratio);
    }

    function update() {
      const raw = {};
      OEE_FIELDS.forEach((field) => {
        raw[field] = inputs[field].value;
      });
      const outcome = evaluateOee(raw, lang);
      const isOk = outcome.status === 'ok';
      const number = (n) => formatNumber(n, lang);

      showFieldErrors(isOk ? {} : outcome.fieldErrors);
      warningEl.hidden = !(isOk && outcome.performanceOver100);
      disclaimerEl.hidden = !isOk;

      if (!isOk) {
        overallValue.textContent = EMPTY_RESULT;
        setMeter(overallBar, NaN);
        formulaEl.textContent = '';
        operatingEl.textContent = EMPTY_RESULT;
        goodEl.textContent = EMPTY_RESULT;
        OEE_COMPONENTS.forEach((name) => showComponent(name, NaN, '', false));
        analysisTitle.textContent = t('oee.invalid.title');
        analysisText.textContent = t('oee.invalid.text');
        return;
      }

      const { values, result, lowest } = outcome;
      const details = {
        availability: t('oee.detail.availability', { a: number(result.operatingTime), b: number(values.plannedTime) }),
        performance: t('oee.detail.performance', {
          a: number(values.totalUnits),
          b: number(result.operatingTime / values.idealCycleTime),
        }),
        quality: t('oee.detail.quality', { a: number(result.goodUnits), b: number(values.totalUnits) }),
      };

      overallValue.textContent = formatPercent(result.oee, lang);
      setMeter(overallBar, result.oee);
      formulaEl.textContent =
        OEE_COMPONENTS.map((name) => formatPercent(result[name], lang)).join(' × ') + ' = ' + formatPercent(result.oee, lang);
      operatingEl.textContent = number(result.operatingTime);
      goodEl.textContent = number(result.goodUnits);
      OEE_COMPONENTS.forEach((name) => showComponent(name, result[name], details[name], name === lowest));
      analysisTitle.textContent = t('oee.analysis.lowest', {
        component: t('oee.' + lowest),
        value: formatPercent(result[lowest], lang),
      });
      analysisText.textContent = t('oee.suggest.' + lowest);
    }

    OEE_FIELDS.forEach((field) => inputs[field].addEventListener('input', update));
    form.addEventListener('submit', (event) => event.preventDefault());
    languageListeners.push((previousLang) => {
      OEE_FIELDS.forEach((field) => {
        inputs[field].value = localizeInput(inputs[field].value, previousLang, lang);
      });
      update();
    });
    update();
  }

  /* ------------------------------------------------------------------------
     6. Site UI
     ------------------------------------------------------------------------ */

  // Writes the current language into every element marked with data-i18n
  // (text) or data-i18n-attr ("attribute:key", several separated by ";").
  function applyTranslations() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      element.getAttribute('data-i18n-attr').split(';').forEach((pair) => {
        const [attribute, key] = pair.split(':');
        element.setAttribute(attribute.trim(), t(key.trim()));
      });
    });
  }

  function initLanguage() {
    const buttons = document.querySelectorAll('[data-lang]');

    function markActive() {
      buttons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-lang') === lang));
      });
    }

    function setLanguage(next) {
      if (!I18N[next] || next === lang) return;
      const previous = lang;
      lang = next;
      writeStore(LANG_KEY, lang);
      applyTranslations();
      markActive();
      languageListeners.forEach((listener) => listener(previous));
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.getAttribute('data-lang')));
    });
    applyTranslations();
    markActive();
  }

  // The inline script in index.html sets data-theme before first paint;
  // this wires the switch and keeps following the system until the user chooses.
  function initTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    if (!themeSwitch) return;

    const root = document.documentElement;
    const systemDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const hasSavedTheme = () => ['light', 'dark'].includes(readStore(THEME_KEY));

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      themeSwitch.setAttribute('aria-checked', String(theme === 'dark'));
    }

    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    themeSwitch.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      writeStore(THEME_KEY, next);
    });

    if (systemDark && systemDark.addEventListener) {
      systemDark.addEventListener('change', (event) => {
        if (!hasSavedTheme()) applyTheme(event.matches ? 'dark' : 'light');
      });
    }
  }

  function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item) => observer.observe(item));
  }

  function initFooterYear() {
    const year = document.getElementById('footer-year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  // Reveal styles only apply once JS is running, so content is never hidden without it.
  document.documentElement.classList.add('js');
  initLanguage();
  initConvertLab();
  initHeroPreview();
  initOee();
  initTheme();
  initNav();
  initReveal();
  initFooterYear();
})();
