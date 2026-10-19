/**
 * Landing-page copy in English and Urdu. The page shows ONE language at a
 * time (English by default); only the hero tagline is intentionally bilingual.
 */
export type Lang = "en" | "ur";

export const NAV_COPY: Record<Lang, Record<string, string>> = {
  en: { "/explore": "City Explorer", "/services": "Home Services", "/new-resident": "New Resident", "/about": "About & Data" },
  ur: { "/explore": "شہر کا نقشہ", "/services": "گھریلو خدمات", "/new-resident": "نئے رہائشی", "/about": "تعارف اور ڈیٹا" },
};

export const UI_COPY = {
  en: { soundOn: "Sound on", soundOff: "Sound off", menuOpen: "Open menu", menuClose: "Close menu" },
  ur: { soundOn: "آواز چالو", soundOff: "آواز بند", menuOpen: "مینو کھولیں", menuClose: "مینو بند کریں" },
} as const;

export const FOOTER_COPY = {
  en: {
    data: "Map data ©",
    osm: "OpenStreetMap contributors",
    rest: ", available under the ODbL. City illustrations are decorative, not real locations.",
    proto: "Non-commercial prototype ·",
    how: "How CityMate uses data",
  },
  ur: {
    data: "نقشے کا ڈیٹا ©",
    osm: "اوپن اسٹریٹ میپ کے معاونین",
    rest: "، ODbL کے تحت دستیاب۔ شہر کی تصاویر صرف آرائشی ہیں، اصل مقامات نہیں۔",
    proto: "غیر تجارتی پروٹوٹائپ ·",
    how: "سٹی میٹ ڈیٹا کیسے استعمال کرتا ہے",
  },
} as const;

export const HERO_COPY = {
  en: {
    tagline: "آپ کا شہر، آپ کی ضرورت، آپ کا ساتھی",
    taglineLang: "ur" as Lang,
    badge: "Piloting in Islamabad, Rawalpindi & Kotli",
    headline: ["Your", "City.", "Your", "Needs.", "Your", "AI", "Companion."],
    accent: "Companion.",
    sub: "Ask Mate for what you need, from a late-night pharmacy to the nearest ATM or a good place to eat. Results come from real OpenStreetMap data, shown on a live map.",
    label: "Ask CityMate",
    placeholder: "I just landed in Islamabad and need cash and dinner…",
    ask: "Ask Mate",
    story: "Begin Sara's story",
    explorer: "Open the city explorer →",
    hi: "Hi, I'm Mate 👋",
    where: "Where are we exploring?",
    quickLabel: "Quick explore",
  },
  ur: {
    tagline: "Your City. Your Needs. Your AI Companion.",
    taglineLang: "en" as Lang,
    badge: "اسلام آباد، راولپنڈی اور کوٹلی میں آزمائشی آغاز",
    headline: ["آپ", "کا", "شہر،", "آپ", "کی", "ضرورت،", "آپ", "کا", "ساتھی"],
    accent: "ساتھی",
    sub: "میٹ سے وہ سب پوچھیں جو آپ کو چاہیے: رات گئے کھلی فارمیسی سے لے کر قریب ترین اے ٹی ایم یا کھانے کی اچھی جگہ تک۔ تمام نتائج اوپن اسٹریٹ میپ کے اصل ڈیٹا سے، براہِ راست نقشے پر۔",
    label: "سٹی میٹ سے پوچھیں",
    placeholder: "مثلاً: مجھے قریب ترین اے ٹی ایم اور کھانا چاہیے…",
    ask: "میٹ سے پوچھیں",
    story: "سارہ کی کہانی شروع کریں",
    explorer: "شہر کا نقشہ کھولیں ←",
    hi: "السلام علیکم، میں میٹ ہوں 👋",
    where: "آج کہاں چلیں؟",
    quickLabel: "فوری تلاش",
  },
};

type Chapter = { kicker: string; title: string; body: string[] };

export const STORY_COPY: Record<
  Lang,
  {
    illustration: string;
    chapters: [Chapter, Chapter, Chapter, Chapter];
    listTitle: string;
    needs: string[];
    question: string;
    chips: string[];
    results: { t: string; d: string }[];
    noPlumber: string;
    altLabel: string;
    altText: string;
    checklistTitle: string;
    tasks: string[];
  }
> = {
  en: {
    illustration: "Illustration",
    chapters: [
      {
        kicker: "Chapter 1",
        title: "10 pm. A new city.",
        body: [
          "Sara has just moved to Rawalpindi for a new job. Her phone is on 12%, the shops are closing, and she doesn't know a single street yet.",
          "She needs three things: cash, something for a headache, and someone to fix the tap dripping in her new flat.",
        ],
      },
      {
        kicker: "Chapter 2",
        title: "One question. Three needs.",
        body: [
          "She types it the way she'd say it. No menus, no hunting through categories.",
          "Mate understands that one sentence holds three separate needs, and searches for each of them.",
        ],
      },
      {
        kicker: "Chapter 3",
        title: "Only real places. Honestly.",
        body: [
          "Mate shows real ATMs and pharmacies from OpenStreetMap, with honest straight-line distances.",
          "No plumbers are listed nearby, and Mate says so plainly. Instead it suggests hardware shops that sell parts, clearly labelled as alternatives. Nothing is ever invented.",
        ],
      },
      {
        kicker: "Chapter 4",
        title: "And the new city starts to feel like home.",
        body: [
          "By the weekend Sara has ticked off most of her settling-in checklist: groceries, a pharmacy, a park for Sunday walks.",
          "Mate remembers her progress on her own phone. No account, no sign-up.",
        ],
      },
    ],
    listTitle: "Sara's list tonight",
    needs: ["Cash", "Headache medicine", "Someone to fix a tap"],
    question: "I need cash, headache medicine and a plumber",
    chips: ["🏧 ATMs & Banks", "💊 Pharmacies", "🔧 Plumbers"],
    results: [
      { t: "ATM", d: "≈ 350 m away (straight line)" },
      { t: "Pharmacy", d: "≈ 600 m away (straight line)" },
    ],
    noPlumber: "No plumbers are listed nearby.",
    altLabel: "Alternative · not a confirmed provider",
    altText: "Hardware shop that sells plumbing parts",
    checklistTitle: "Settling-in checklist",
    tasks: ["Find a grocery store", "Locate the nearest pharmacy", "Find a park for Sunday walks", "Find an electrician"],
  },
  ur: {
    illustration: "تمثیلی منظر",
    chapters: [
      {
        kicker: "باب ۱",
        title: "رات کے دس بجے، ایک نیا شہر",
        body: [
          "سارہ نئی نوکری کے لیے ابھی ابھی راولپنڈی منتقل ہوئی ہے۔ فون کی بیٹری بارہ فیصد رہ گئی ہے، دکانیں بند ہو رہی ہیں، اور وہ ابھی کسی گلی کو نہیں جانتی۔",
          "اسے تین چیزیں چاہییں: پیسے، سر درد کی دوا، اور نئے فلیٹ کا ٹپکتا نلکا ٹھیک کرنے والا کوئی۔",
        ],
      },
      {
        kicker: "باب ۲",
        title: "ایک سوال، تین ضرورتیں",
        body: [
          "وہ ویسے ہی لکھتی ہے جیسے بولتی ہے۔ نہ کوئی مینو، نہ زمروں میں تلاش۔",
          "میٹ سمجھ جاتا ہے کہ ایک جملے میں تین الگ ضرورتیں ہیں، اور ہر ایک کو الگ سے ڈھونڈتا ہے۔",
        ],
      },
      {
        kicker: "باب ۳",
        title: "صرف سچی معلومات",
        body: [
          "میٹ اوپن اسٹریٹ میپ سے اصل اے ٹی ایم اور فارمیسیاں دکھاتا ہے، سیدھی لکیر کے اندازاً فاصلے کے ساتھ۔",
          "قریب کوئی پلمبر درج نہیں، اور میٹ صاف صاف بتا دیتا ہے۔ اس کے بجائے وہ پرزے بیچنے والی ہارڈویئر کی دکانیں دکھاتا ہے، واضح طور پر متبادل لکھ کر۔ کچھ بھی گھڑا نہیں جاتا۔",
        ],
      },
      {
        kicker: "باب ۴",
        title: "نیا شہر، اپنا سا لگنے لگا",
        body: [
          "ہفتے کے آخر تک سارہ اپنی فہرست کے زیادہ تر کام مکمل کر چکی ہے: سودا سلف، فارمیسی، اور اتوار کی سیر کے لیے پارک۔",
          "میٹ اس کی پیش رفت اسی کے فون پر یاد رکھتا ہے۔ نہ اکاؤنٹ، نہ سائن اپ۔",
        ],
      },
    ],
    listTitle: "آج رات سارہ کی فہرست",
    needs: ["پیسے", "سر درد کی دوا", "نلکا ٹھیک کرنے والا"],
    question: "مجھے پیسے، سر درد کی دوا اور پلمبر چاہیے",
    chips: ["🏧 اے ٹی ایم اور بینک", "💊 فارمیسی", "🔧 پلمبر"],
    results: [
      { t: "اے ٹی ایم", d: "≈ 350 میٹر دور (سیدھی لکیر)" },
      { t: "فارمیسی", d: "≈ 600 میٹر دور (سیدھی لکیر)" },
    ],
    noPlumber: "قریب کوئی پلمبر درج نہیں۔",
    altLabel: "متبادل · تصدیق شدہ فراہم کنندہ نہیں",
    altText: "پلمبنگ کا سامان بیچنے والی ہارڈویئر کی دکان",
    checklistTitle: "نئے گھر کی فہرست",
    tasks: ["گروسری اسٹور ڈھونڈیں", "قریب ترین فارمیسی", "اتوار کی سیر کے لیے پارک", "الیکٹریشن ڈھونڈیں"],
  },
};

export const ASK_COPY = {
  en: {
    kicker: "Your turn",
    title: "Now ask Mate yourself",
    desc: "Ask in English or Urdu. Mate answers in your language and shows only real places.",
    soundHint: " Turn sound on to hear Mate read the answer aloud.",
    soundOn: " Mate will read the answer aloud.",
    placeholder: "Type your question…",
    label: "Your question",
    ask: "Ask",
    prompts: ["I need cash and dinner in Islamabad", "My AC has stopped cooling", "Somewhere for kids to play in Pindi"],
  },
  ur: {
    kicker: "آپ کی باری",
    title: "اب خود میٹ سے پوچھیں",
    desc: "اردو یا انگریزی میں پوچھیں۔ میٹ آپ ہی کی زبان میں جواب دیتا ہے اور صرف اصل جگہیں دکھاتا ہے۔",
    soundHint: " جواب سننے کے لیے آواز چالو کریں۔",
    soundOn: " میٹ جواب پڑھ کر سنائے گا۔",
    placeholder: "اپنا سوال لکھیں…",
    label: "اپنا سوال",
    ask: "پوچھیں",
    prompts: ["اسلام آباد میں قریب ترین فارمیسی", "میرا نلکا لیک ہو رہا ہے", "راولپنڈی میں بچوں کے لیے پارک"],
  },
} as const;

export const HOW_COPY = {
  en: {
    kicker: "How it works",
    title: "Understand. Search. Explain.",
    steps: [
      { t: "Understand", b: "Mate reads your need, even described as a problem, in English or Urdu." },
      { t: "Search", b: "Our server searches real OpenStreetMap data. The AI never invents places." },
      { t: "Explain", b: "Mate explains what it found, and what's missing, in your language." },
    ],
  },
  ur: {
    kicker: "یہ کیسے کام کرتا ہے",
    title: "سمجھنا، ڈھونڈنا، بتانا",
    steps: [
      { t: "سمجھنا", b: "میٹ آپ کی ضرورت سمجھتا ہے، چاہے آپ مسئلہ بیان کریں، اردو میں یا انگریزی میں۔" },
      { t: "ڈھونڈنا", b: "ہمارا سرور اوپن اسٹریٹ میپ کے اصل ڈیٹا میں تلاش کرتا ہے۔ اے آئی کبھی جگہیں نہیں گھڑتا۔" },
      { t: "بتانا", b: "میٹ آپ کی زبان میں بتاتا ہے کہ کیا ملا، اور کیا نہیں ملا۔" },
    ],
  },
} as const;

export const FLAGSHIP_COPY = {
  en: {
    open: "Open →",
    items: [
      { k: "AI City Assistant", t: "Ask in your own words", b: "“Need cash and dinner”, “my child has a fever”. Mate understands the need and shows real places on a live map." },
      { k: "Home Services", t: "Describe the problem, not the trade", b: "Leaking tap, AC not cooling, fans to install. Mate finds the right kind of help and is honest when listings are missing." },
      { k: "New Resident Assistant", t: "Settle in, step by step", b: "A friendly welcome, the essentials near your new home, and a checklist that remembers your progress." },
    ],
  },
  ur: {
    open: "کھولیں ←",
    items: [
      { k: "اے آئی سٹی اسسٹنٹ", t: "اپنے الفاظ میں پوچھیں", b: "«پیسے اور کھانا چاہیے»، «بچے کو بخار ہے»۔ میٹ ضرورت سمجھ کر نقشے پر اصل جگہیں دکھاتا ہے۔" },
      { k: "گھریلو خدمات", t: "مسئلہ بتائیں، کاریگر نہیں", b: "نلکا لیک، اے سی ٹھنڈک نہیں دے رہا، پنکھے لگوانے ہیں۔ میٹ صحیح مدد ڈھونڈتا ہے اور معلومات نہ ہوں تو صاف بتاتا ہے۔" },
      { k: "نئے رہائشی", t: "قدم بہ قدم بسیں", b: "گرمجوش خوش آمدید، نئے گھر کے قریب ضروری جگہیں، اور ایک فہرست جو آپ کی پیش رفت یاد رکھتی ہے۔" },
    ],
  },
} as const;

export const CITIES_COPY = {
  en: {
    kicker: "Where Mate lives",
    title: "Three cities. One companion.",
    places: "real places mapped on OpenStreetMap",
    note: "Only lightly mapped so far. Help by adding places on OpenStreetMap.",
    explore: (n: string) => `Explore ${n} →`,
    regions: { islamabad: "Islamabad Capital Territory", rawalpindi: "Punjab", kotli: "Azad Jammu & Kashmir" } as Record<string, string>,
  },
  ur: {
    kicker: "ہمارے شہر",
    title: "تین شہر، ایک ساتھی",
    places: "اوپن اسٹریٹ میپ پر درج اصل جگہیں",
    note: "ابھی بہت کم نقشہ بندی ہوئی ہے۔ اوپن اسٹریٹ میپ پر جگہیں شامل کر کے مدد کریں۔",
    explore: (n: string) => `${n} دیکھیں ←`,
    regions: { islamabad: "اسلام آباد کیپیٹل ٹیریٹری", rawalpindi: "پنجاب", kotli: "آزاد جموں و کشمیر" } as Record<string, string>,
  },
};

export const PROMISE_COPY = {
  en: {
    kicker: "Our promise",
    title: "A guide you can trust to be honest",
    items: [
      { t: "Nothing is invented", b: "Every place comes from OpenStreetMap. No fake names, numbers, ratings or prices." },
      { t: "Honest about gaps", b: "If data is missing, Mate says so, and labels alternatives as alternatives." },
      { t: "Your location, your choice", b: "Location is used only when you allow it, and is never stored." },
      { t: "Free and open", b: "No account and no fees. Open data, credited to its volunteer mappers." },
    ],
  },
  ur: {
    kicker: "ہمارا وعدہ",
    title: "ایسا رہنما جو ہمیشہ سچ بتائے",
    items: [
      { t: "کوئی جگہ گھڑی نہیں جاتی", b: "ہر جگہ اوپن اسٹریٹ میپ سے آتی ہے۔ کوئی جعلی نام، نمبر، ریٹنگ یا قیمت نہیں۔" },
      { t: "کمی ہو تو صاف بتانا", b: "اگر معلومات موجود نہ ہوں تو میٹ صاف بتاتا ہے، اور متبادل کو متبادل ہی کہتا ہے۔" },
      { t: "آپ کا مقام، آپ کی مرضی", b: "آپ کا مقام صرف آپ کی اجازت سے استعمال ہوتا ہے، اور کبھی محفوظ نہیں کیا جاتا۔" },
      { t: "مفت اور کھلا ڈیٹا", b: "نہ اکاؤنٹ، نہ فیس۔ کھلا ڈیٹا، رضاکار نقشہ سازوں کے نام کے ساتھ۔" },
    ],
  },
} as const;

export const CLOSING_COPY = {
  en: { title: "Start exploring your city tonight.", explorer: "Open the City Explorer", moved: "I've just moved here" },
  ur: { title: "آج ہی اپنا شہر دریافت کریں", explorer: "شہر کا نقشہ کھولیں", moved: "ابھی ابھی یہاں منتقل ہوئے ہیں؟" },
} as const;
