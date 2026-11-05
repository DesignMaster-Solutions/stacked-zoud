// Every line Stacked shows, in English and Arabic (RTL). No DOM: game.js and tests/i18n.test.mjs share it.
// The Arabic was drafted with an AI assistant; a native-speaker review is in the budget before any release outside the jam.
export const LANGS = ['en', 'ar'];
export const STORAGE_KEY = 'stacked.lang';

export function pickLang(search, stored, deviceLang = '') {
  const q = new URLSearchParams(search).get('lang');
  if (LANGS.includes(q)) return q;
  if (LANGS.includes(stored)) return stored;
  return /^ar\b/i.test(deviceLang) ? 'ar' : 'en';
}

export const STR = {
  title: ['STACKED', 'مُكدَّس'],
  tagline: ['Every "pay in 4" lands on a payday you have not lived yet.', 'كل "ادفع على 4" يقع على راتب لم تعشه بعد.'],
  how1: ['Sale season in Dubai. Offers arrive three a month: pay now, split in 4, or skip.',
    'موسم التخفيضات في دبي. تصل ثلاثة عروض كل شهر: ادفع الآن، أو قسّم على 4، أو تخطَّ.'],
  how2: ['Split: one quarter leaves today. The other three drop onto your next three paydays, and you can see them.',
    'التقسيم: يُدفع ربع واحد اليوم. وتسقط الأرباع الثلاثة على رواتبك الثلاثة القادمة، وتراها أمامك.'],
  how3: ['On payday, a column taller than your money misses an instalment: a late fee, and the plan goes red on your credit report.',
    'يوم الراتب، العمود الأطول من مالك يعني قسطاً فائتاً: رسوم تأخير، ويتحول القسط إلى الأحمر في تقريرك الائتماني.'],
  how4: ['After 8 months a bank reads that report. Keep it clean, meet your needs, and have some good days.',
    'بعد 8 أشهر يقرأ بنك هذا التقرير. حافظ عليه نظيفاً، وتدبّر احتياجاتك، واستمتع ببعض الأيام الجميلة.'],
  start: ['Start the season', 'ابدأ الموسم'],
  settings: ['Settings, saved on this device', 'الإعدادات، تُحفظ على هذا الجهاز'],
  a11y_large: ['Large text', 'نص كبير'],
  a11y_contrast: ['High contrast', 'تباين عالٍ'],
  a11y_calm: ['Calm (no timer)', 'هادئ (بلا مؤقت)'],
  a11y_plain: ['Plain words', 'كلمات بسيطة'],
  a11y_mute: ['Sound off', 'بلا صوت'],
  pause: ['Pause', 'إيقاف مؤقت'],
  paused: ['Paused', 'متوقف مؤقتاً'],
  resume: ['Resume', 'متابعة'],
  month: ['Month {n} of 8', 'الشهر {n} من 8'],
  wallet: ['Wallet', 'المحفظة'],
  owed: ['Owed on plans', 'المستحق على الأقساط'],
  goodDays: ['Good days', 'أيام جميلة'],
  future: ['Your next paydays', 'رواتبك القادمة'],
  yourMoney: ['your money: {x}', 'مالك: {x}'],
  pay: ['P{n}', 'ر{n}'],
  need: ['NEED', 'ضرورة'],
  want: ['WANT', 'رغبة'],
  payNow: ['Pay {x}', 'ادفع {x}'],
  split: ['Split 4 × {x}', 'قسّم 4 × {x}'],
  skip: ['Skip', 'تخطَّ'],
  ghost: ['Dashed blocks: where the split would land.', 'المربعات المتقطعة: أين سيقع التقسيم.'],
  offerOf: ['Offer {i} of 3', 'العرض {i} من 3'],
  why_noCash: ['Not enough in the wallet', 'لا يكفي ما في المحفظة'],
  why_paused: ['Split paused: a plan is late', 'التقسيم متوقف: قسط متأخر'],
  why_limit: ['Over the app limit', 'تجاوزت حد التطبيق'],
  skipNeed: ['Skipping a need costs {x} next payday', 'تخطّي الضرورة يكلّف {x} في الراتب القادم'],
  nextOffer: ['Back to the sales', 'العودة إلى التخفيضات'],
  paydayTitle: ['Payday {n}', 'الراتب {n}'],
  income: ['Money for the month', 'مال الشهر'],
  makeDo: ['Making do without it', 'التدبّر بدونها'],
  paidInst: ['{item}: instalment paid', '{item}: القسط مدفوع'],
  missedInst: ['{item}: MISSED, late fee {fee}', '{item}: فات، رسوم تأخير {fee}'],
  collapse: ['The stack fell over.', 'انهار الكوم.'],
  clean: ['All instalments paid.', 'كل الأقساط مدفوعة.'],
  report: ['Credit report', 'التقرير الائتماني'],
  reportEmpty: ['No pay-later plans yet.', 'لا توجد أقساط بعد.'],
  onTime: ['on time', 'في موعده'],
  late: ['late', 'متأخر'],
  closed: ['paid off', 'مسدَّد'],
  bankCar: ['The car loan', 'قرض السيارة'],
  bankLease: ['The lease renewal', 'تجديد عقد الإيجار'],
  bankReads: ['{bank}: the bank reads your credit report.', '{bank}: البنك يقرأ تقريرك الائتماني.'],
  dec_approved: ['APPROVED', 'موافقة'],
  dec_conditions: ['APPROVED, WITH CONDITIONS', 'موافقة بشروط'],
  dec_declined: ['DECLINED', 'مرفوض'],
  why_approved: ['Every instalment on time and little still owed.', 'كل الأقساط في موعدها والقليل ما زال مستحقاً.'],
  why_conditions: ['One late instalment, or a lot still owed on plans: a bigger deposit first.', 'قسط متأخر واحد، أو مبلغ كبير ما زال مستحقاً: دفعة أولى أكبر أولاً.'],
  why_declined: ['Late instalments, or more owed on plans than the bank will accept.', 'أقساط متأخرة، أو مستحقات أكثر مما يقبله البنك.'],
  sumCommitted: ['Average payday already spent before it arrived', 'متوسط الراتب المصروف قبل وصوله'],
  sumNext: ['Next month already spent', 'الشهر القادم المصروف مسبقاً'],
  sumFees: ['Late fees paid', 'رسوم التأخير المدفوعة'],
  sumBought: ['Things bought', 'أشياء اشتريتها'],
  sumSkipped: ['Needs skipped', 'ضرورات تخطيتها'],
  sumOwed: ['Still owed on plans', 'ما زال مستحقاً على الأقساط'],
  sumCash: ['Left in the wallet', 'المتبقي في المحفظة'],
  sumJoy: ['Good days', 'أيام جميلة'],
  again: ['Play another season', 'العب موسماً آخر'],
  illustrative: ['Prices, income, fees and the bank rule are illustrative game rules. Shops, the app and the bank are fictional.',
    'الأسعار والدخل والرسوم وقاعدة البنك قواعد توضيحية للعبة. المتاجر والتطبيق والبنك خيالية.'],
  trueTitle: ['What is true in the UAE', 'ما هو صحيح في الإمارات'],
  true1: ['Pay-later plans are short-term credit under the Central Bank of the UAE rules: no interest, an affordability check, and all fees on a plan, late fees included, at most 30% of the price.',
    'خطط الدفع لاحقاً ائتمان قصير الأجل وفق قواعد مصرف الإمارات العربية المتحدة المركزي: بلا فوائد، مع تقييم القدرة على السداد، ومجموع الرسوم على الخطة، ومنها رسوم التأخير، لا يتجاوز 30% من السعر.'],
  true2: ['The most you can owe across these plans is AED 20,000 or three months of your net income, whichever is lower.',
    'أقصى ما يمكن أن تدين به في هذه الخطط هو 20,000 درهم أو دخلك الصافي لثلاثة أشهر، أيهما أقل.'],
  true3: ['Since July 2026, pay-later plans appear on UAE credit reports. Under the current model they do not change your credit score, but lenders can see them.',
    'منذ يوليو 2026 تظهر خطط الدفع لاحقاً في التقارير الائتمانية في الإمارات. لا تغيّر درجتك الائتمانية في النموذج الحالي، لكن المُقرضين يرونها.'],
  askTitle: ['Before you split, ask', 'قبل أن تقسّم، اسأل'],
  ask1: ['What is the total, and when is the last payment?', 'كم المبلغ الإجمالي، ومتى آخر دفعة؟'],
  ask2: ['What are all the fees, as an amount and as a % of the price?', 'ما كل الرسوم، كمبلغ وكنسبة من السعر؟'],
  ask3: ['How is a late fee worked out? Ask for an example.', 'كيف تُحسب رسوم التأخير؟ اطلب مثالاً.'],
  ask4: ['What happens if I miss a payment?', 'ماذا يحدث إذا فاتتني دفعة؟'],
  ask5: ['Will this go to the credit bureau, and how does paying late show on my report?', 'هل يصل هذا إلى مكتب الائتمان، وكيف يظهر التأخير في تقريري؟'],
  ask6: ['What help is there if money gets tight?', 'ما المساعدة المتاحة إذا ضاق المال؟'],
  askSource: ['Based on what UAE rules require providers to tell you (CBUAE Finance Companies Regulation C 3/2023, Art. 24 and 29). Not an official checklist.',
    'مبنية على ما تُلزم القواعد الإماراتية مقدّمي الخدمة بإخبارك به (نظام شركات التمويل C 3/2023، المادتان 24 و29). ليست قائمة رسمية.'],
  // items
  i_sneakers: ['Sneakers', 'حذاء رياضي'], i_concert: ['Concert tickets', 'تذاكر حفلة'], i_headphones: ['Headphones', 'سماعات'],
  i_watch: ['Smart watch', 'ساعة ذكية'], i_console: ['Game console', 'جهاز ألعاب'], i_phone: ['New phone', 'هاتف جديد'],
  i_sofa: ['Sofa', 'أريكة'], i_trip: ['Weekend trip', 'رحلة نهاية الأسبوع'], i_perfume: ['Perfume', 'عطر'],
  i_jacket: ['Jacket', 'سترة'], i_dinner: ['Dinner out', 'عشاء في الخارج'], i_tv: ['Big TV', 'تلفاز كبير'],
  i_car: ['Car repair', 'إصلاح السيارة'], i_fridge: ['The fridge died', 'تعطّلت الثلاجة'], i_school: ['School fees', 'رسوم المدرسة'],
};

export function t(key, lang, vars = {}) {
  const row = STR[key];
  if (!row) throw new Error(`missing string ${key}`);
  let s = row[lang === 'ar' ? 1 : 0];
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}
export function aed(x, lang) {
  const n = Math.round(x).toLocaleString('en-US');
  return lang === 'ar' ? `${n} درهم` : `AED ${n}`;
}
