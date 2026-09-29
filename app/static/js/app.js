(() => {
  'use strict';

  const contracts = window.TakaTrackContracts;
  if (!contracts) throw new Error('API response contract validators did not load.');

  const translations = {
    en: {
      'brand.tagline': 'SHOP MONEY, MADE CLEAR', 'nav.workspace': 'WORKSPACE', 'nav.overview': 'Overview', 'nav.transactions': 'Transactions', 'nav.settings': 'Settings', 'nav.open': 'Open navigation',
      'privacy.local.title': 'Private to this browser', 'privacy.local.short': 'Your ledger is only visible in this browser.', 'privacy.title': 'WHERE YOUR DATA LIVES', 'privacy.full': "Your transactions are saved on the server and linked only to this browser, so nobody else can see them. Clearing your browser data or switching browser or device starts a new, empty ledger, so export a CSV/PDF backup now and then. If regex parsing is uncertain and Gemini is configured, that SMS is sent to Google Gemini.", 'privacy.learn': 'How parsing works', 'sidebar.local': 'Installation database',
      'hero.eyebrow': 'YOUR SHOP, IN SYNC', 'hero.title': 'A clearer view of your money.', 'hero.subtitle': 'Every mobile-money move, brought together in one calm place.', 'hero.add': 'Add SMS transactions', 'hero.snapshot': 'SHOP SNAPSHOT', 'hero.net': 'net flow', 'hero.organized': 'All caught up',
      'overview.eyebrow': 'MONEY AT A GLANCE', 'overview.title': 'Your overview', 'period.day': 'Day', 'period.week': 'Week', 'period.month': 'Month', 'period.today': 'Today', 'period.this_week': 'This week', 'period.this_month': 'This month',
      'metric.inflow': 'Inflow', 'metric.outflow': 'Outflow', 'metric.cost': 'Cost', 'metric.net': 'Net', 'metric.received': 'Total received', 'metric.spent': 'Total spent', 'metric.fees': 'Total fees', 'metric.net_balance': 'Net balance', 'metric.money_in': 'Money in', 'metric.money_out': 'Money out', 'metric.service_fees': 'Service fees', 'metric.in_minus_out': 'Received minus spent', 'metric.received_short': 'Received', 'metric.spent_short': 'Spent',
      'chart.eyebrow': 'CASH FLOW', 'chart.title': 'Money movement', 'chart.empty': 'Your money movement will show up here.', 'category.eyebrow': 'SPENDING MIX', 'category.title': 'By category', 'category.empty': 'Add a few transactions to see your spending mix.',
      'category.food': 'Food', 'category.transport': 'Transport', 'category.recharge': 'Recharge', 'category.bills': 'Bills', 'category.shopping': 'Shopping', 'category.other': 'Other',
      'counterparty.eyebrow': 'WHERE IT GOES', 'counterparty.title': 'Top counterparties', 'counterparty.empty': 'Your regular payees will appear here.', 'common.view_all': 'View all', 'common.cancel': 'Cancel', 'common.done': 'Done', 'common.or': 'or', 'common.unknown_currency': 'Unknown currency', 'common.no_currency': 'No currency', 'common.no_date': 'No date', 'common.no_name': 'Not identified', 'common.request_error': 'Something went wrong. Please try again.',
      'transactions.latest': 'LATEST ACTIVITY', 'transactions.recent': 'Recent transactions', 'transactions.eyebrow': 'YOUR LEDGER', 'transactions.title': 'Transactions', 'transactions.subtitle': 'Search, review, and keep every entry just right.',
      'table.date': 'Date', 'table.type': 'Type', 'table.counterparty': 'Counterparty', 'table.category': 'Category', 'table.amount': 'Amount', 'table.status': 'Status', 'table.reference': 'Reference', 'type.received': 'Received', 'type.sent': 'Sent', 'type.cashin': 'Cash-in', 'type.cashout': 'Cash-out', 'type.payment': 'Payment', 'type.recharge': 'Recharge', 'status.review': 'Needs review', 'status.ai': 'Gemini assist', 'status.parsed': 'Parsed', 'action.edit': 'Edit transaction', 'action.delete': 'Delete transaction',
      'empty.title': 'Your money story starts here.', 'empty.body': "Paste your first SMS and we'll turn it into a tidy transaction.", 'empty.add': 'Paste your first SMS', 'empty.demo': 'Or explore sample transactions', 'footer.note': 'Made for the everyday hustle.', 'footer.status': 'System status',
      'filter.search': 'Search a shop or reference...', 'filter.type': 'Type', 'filter.all_types': 'All types', 'filter.category': 'Category', 'filter.all_categories': 'All categories', 'filter.from': 'From', 'filter.to': 'To', 'filter.clear': 'Clear filters', 'ledger.no_results': 'No matching transactions', 'ledger.no_results_hint': 'Try another search or clear your filters.', 'ledger.count_one': '1 transaction', 'ledger.count_many': '{count} transactions',
      'export.csv': 'Export CSV', 'export.pdf': 'Export PDF', 'settings.open': 'Open settings', 'settings.currency.title': 'Display currency', 'settings.currency.help': 'Original transaction amounts stay unchanged. Totals convert for display only.', 'settings.eyebrow': 'MAKE IT YOURS', 'settings.title': 'Settings', 'settings.subtitle': "Choose how your shop's money is shown.", 'settings.language': 'Language', 'settings.manual.eyebrow': 'OFFLINE CONTROL', 'settings.manual.title': 'Manual exchange rate', 'settings.manual.help': 'Set how many display-currency units equal 1 unit of another currency. Manual rates take priority over online rates.', 'settings.manual.from': 'From', 'settings.manual.to': 'To', 'settings.manual.rate': 'Rate', 'settings.manual.save': 'Save rate', 'settings.manual.remove': 'Remove', 'settings.rate.note': 'Online reference rates are keyless, cached once retrieved, and can be stale. Check a rate before relying on converted totals.',
      'rates.unconverted': 'could not be converted. Add a manual rate in Settings to include these totals.', 'rates.stale': 'One or more exchange rates are stale. Check Settings before relying on converted totals.',
      'import.eyebrow': 'QUICK ENTRY', 'import.title': 'Bring in your SMS', 'import.subtitle': "Paste one or more transaction messages. We'll take care of the sorting.", 'import.paste': 'Paste SMS messages', 'import.placeholder': 'Paste a bKash, Nagad, Rocket or bank SMS here…', 'import.multiple': 'Separate multiple messages with a blank line.', 'import.upload': 'Upload a .txt or .csv file', 'import.upload_hint': 'Choose a file up to 1 MB', 'import.privacy': "Saved privately for this browser only. Uncertain messages are sent to Gemini only when the site owner has enabled it.", 'import.parsing': 'Reading your messages…', 'import.save': 'Parse & save', 'import.saved': '{saved} saved · {duplicates} duplicates · {failed} need a closer look.', 'import.nothing': 'No messages were saved. Check the text and try again.', 'import.file_selected': 'Selected: {name}', 'import.need_text': 'Paste at least one SMS or choose a .txt/.csv file.', 'import.demo_loaded': 'Sample transactions added to your ledger.',
      'edit.eyebrow': 'REVIEW ENTRY', 'edit.title': 'Fine-tune this entry', 'edit.subtitle': 'You can correct the transaction without changing its original SMS values.', 'edit.original': 'Original SMS values: {amount}', 'edit.show_sms': 'View original SMS', 'edit.save': 'Save changes', 'field.amount': 'Amount', 'field.currency': 'Currency (ISO code)', 'field.type': 'Type', 'field.category': 'Category', 'field.counterparty': 'Counterparty', 'field.fee': 'Fee', 'field.balance': 'Balance after transaction', 'field.reference': 'Transaction ID', 'field.date': 'Date & time',
      'confirm.delete': 'Delete this transaction from your ledger? This cannot be undone.', 'toast.saved': 'Your changes are saved.', 'toast.deleted': 'Transaction deleted.', 'toast.imported': 'Import finished.', 'toast.settings': 'Settings updated.', 'toast.rate_saved': 'Manual rate saved.', 'toast.rate_removed': 'Manual rate removed.', 'toast.demo': 'Demo messages imported.', 'toast.language': 'Language updated.', 'toast.currency': 'Dashboard updated in {currency}.', 'toast.load_error': 'Could not load the latest data. Please refresh and try again.', 'privacy.toast': 'Regex parsing runs on this app. If the Gemini key is configured, only uncertain SMS messages are sent to Google for fallback extraction.'
    },
    bn: {
      'brand.tagline': 'দোকানের হিসাব, সহজভাবে', 'nav.workspace': 'কর্মক্ষেত্র', 'nav.overview': 'সারসংক্ষেপ', 'nav.transactions': 'লেনদেন', 'nav.settings': 'সেটিংস', 'nav.open': 'নেভিগেশন খুলুন',
      'privacy.local.title': 'শুধু এই ব্রাউজারের জন্য', 'privacy.local.short': 'আপনার খাতা শুধু এই ব্রাউজারেই দেখা যায়।', 'privacy.title': 'আপনার ডেটা কোথায় থাকে', 'privacy.full': 'আপনার লেনদেন সার্ভারে সংরক্ষিত হয় এবং শুধু এই ব্রাউজারের সাথে যুক্ত থাকে, তাই অন্য কেউ দেখতে পায় না। ব্রাউজারের ডেটা মুছলে বা অন্য ব্রাউজার/ডিভাইসে ঢুকলে নতুন ফাঁকা খাতা শুরু হবে, তাই মাঝে মাঝে CSV/PDF ব্যাকআপ নিন। Regex পার্সিং অনিশ্চিত হলে এবং Gemini চালু থাকলে সেই SMS Google Gemini-তে পাঠানো হয়।', 'privacy.learn': 'পার্সিং কীভাবে হয়', 'sidebar.local': 'ইনস্টলেশনের ডেটাবেস',
      'hero.eyebrow': 'আপনার দোকান, একসাথে', 'hero.title': 'আপনার টাকার আরও পরিষ্কার হিসাব।', 'hero.subtitle': 'মোবাইল মানির প্রতিটি লেনদেন—একটি শান্ত, গোছানো জায়গায়।', 'hero.add': 'SMS লেনদেন যোগ করুন', 'hero.snapshot': 'দোকানের সারাংশ', 'hero.net': 'নিট প্রবাহ', 'hero.organized': 'সব হিসাব ঠিক আছে',
      'overview.eyebrow': 'এক নজরে টাকার হিসাব', 'overview.title': 'আপনার সারসংক্ষেপ', 'period.day': 'দিন', 'period.week': 'সপ্তাহ', 'period.month': 'মাস', 'period.today': 'আজ', 'period.this_week': 'এই সপ্তাহ', 'period.this_month': 'এই মাস',
      'metric.inflow': 'জমা', 'metric.outflow': 'খরচ', 'metric.cost': 'চার্জ', 'metric.net': 'নিট', 'metric.received': 'মোট জমা', 'metric.spent': 'মোট খরচ', 'metric.fees': 'মোট ফি', 'metric.net_balance': 'নিট ব্যালেন্স', 'metric.money_in': 'টাকা এসেছে', 'metric.money_out': 'টাকা গেছে', 'metric.service_fees': 'সার্ভিস ফি', 'metric.in_minus_out': 'জমা থেকে খরচ বাদ', 'metric.received_short': 'জমা', 'metric.spent_short': 'খরচ',
      'chart.eyebrow': 'টাকার প্রবাহ', 'chart.title': 'লেনদেনের গতি', 'chart.empty': 'আপনার টাকার প্রবাহ এখানে দেখা যাবে।', 'category.eyebrow': 'খরচের ধরন', 'category.title': 'খাত অনুযায়ী', 'category.empty': 'খরচের ধরন দেখতে কয়েকটি লেনদেন যোগ করুন।',
      'category.food': 'খাবার', 'category.transport': 'যাতায়াত', 'category.recharge': 'রিচার্জ', 'category.bills': 'বিল', 'category.shopping': 'কেনাকাটা', 'category.other': 'অন্যান্য',
      'counterparty.eyebrow': 'কোথায় খরচ', 'counterparty.title': 'শীর্ষ প্রাপক', 'counterparty.empty': 'নিয়মিত প্রাপকেরা এখানে দেখা যাবে।', 'common.view_all': 'সব দেখুন', 'common.cancel': 'বাতিল', 'common.done': 'সম্পন্ন', 'common.or': 'অথবা', 'common.unknown_currency': 'অজানা মুদ্রা', 'common.no_currency': 'মুদ্রা নেই', 'common.no_date': 'তারিখ নেই', 'common.no_name': 'শনাক্ত করা যায়নি', 'common.request_error': 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      'transactions.latest': 'সর্বশেষ কার্যকলাপ', 'transactions.recent': 'সাম্প্রতিক লেনদেন', 'transactions.eyebrow': 'আপনার হিসাবখাতা', 'transactions.title': 'লেনদেন', 'transactions.subtitle': 'খুঁজুন, যাচাই করুন এবং প্রতিটি হিসাব ঠিক রাখুন।',
      'table.date': 'তারিখ', 'table.type': 'ধরন', 'table.counterparty': 'প্রাপক/প্রেরক', 'table.category': 'খাত', 'table.amount': 'পরিমাণ', 'table.status': 'অবস্থা', 'table.reference': 'রেফারেন্স', 'type.received': 'জমা', 'type.sent': 'পাঠানো', 'type.cashin': 'ক্যাশ-ইন', 'type.cashout': 'ক্যাশ-আউট', 'type.payment': 'পেমেন্ট', 'type.recharge': 'রিচার্জ', 'status.review': 'যাচাই প্রয়োজন', 'status.ai': 'Gemini সহায়তা', 'status.parsed': 'পড়া হয়েছে', 'action.edit': 'লেনদেন সম্পাদনা', 'action.delete': 'লেনদেন মুছুন',
      'empty.title': 'আপনার টাকার গল্প এখানেই শুরু।', 'empty.body': 'প্রথম SMS পেস্ট করুন—আমরা সেটিকে গোছানো লেনদেনে পরিণত করব।', 'empty.add': 'প্রথম SMS পেস্ট করুন', 'empty.demo': 'অথবা নমুনা লেনদেন দেখুন', 'footer.note': 'প্রতিদিনের পরিশ্রমের জন্য তৈরি।', 'footer.status': 'সিস্টেমের অবস্থা',
      'filter.search': 'দোকান বা রেফারেন্স খুঁজুন...', 'filter.type': 'ধরন', 'filter.all_types': 'সব ধরন', 'filter.category': 'খাত', 'filter.all_categories': 'সব খাত', 'filter.from': 'থেকে', 'filter.to': 'পর্যন্ত', 'filter.clear': 'ফিল্টার মুছুন', 'ledger.no_results': 'মিলছে এমন লেনদেন নেই', 'ledger.no_results_hint': 'অন্যভাবে খুঁজুন অথবা ফিল্টার মুছে দেখুন।', 'ledger.count_one': '১টি লেনদেন', 'ledger.count_many': '{count}টি লেনদেন',
      'export.csv': 'CSV ডাউনলোড', 'export.pdf': 'PDF ডাউনলোড', 'settings.open': 'সেটিংস খুলুন', 'settings.currency.title': 'প্রদর্শনের মুদ্রা', 'settings.currency.help': 'মূল লেনদেনের পরিমাণ অপরিবর্তিত থাকে। শুধু প্রদর্শনের জন্য মোট রূপান্তর হয়।', 'settings.eyebrow': 'নিজের মতো সাজান', 'settings.title': 'সেটিংস', 'settings.subtitle': 'দোকানের টাকার হিসাব কীভাবে দেখবেন ঠিক করুন।', 'settings.language': 'ভাষা', 'settings.manual.eyebrow': 'অফলাইন নিয়ন্ত্রণ', 'settings.manual.title': 'নিজে বিনিময় হার দিন', 'settings.manual.help': 'অন্য মুদ্রার ১ এককের বিপরীতে প্রদর্শন মুদ্রার পরিমাণ দিন। নিজে দেওয়া হার অনলাইন হারের আগে ব্যবহার হবে।', 'settings.manual.from': 'থেকে', 'settings.manual.to': 'এ', 'settings.manual.rate': 'হার', 'settings.manual.save': 'হার সংরক্ষণ', 'settings.manual.remove': 'সরান', 'settings.rate.note': 'অনলাইন রেফারেন্স হার বিনা API কী-তে পাওয়া যায়, পরে ক্যাশে থাকে এবং পুরোনো হতে পারে। রূপান্তরিত মোটের ওপর নির্ভর করার আগে হার যাচাই করুন।',
      'rates.unconverted': 'রূপান্তর করা যায়নি। মোটে যুক্ত করতে Settings-এ নিজে হার দিন।', 'rates.stale': 'এক বা একাধিক বিনিময় হার পুরোনো। রূপান্তরিত মোটের ওপর নির্ভর করার আগে Settings-এ যাচাই করুন।',
      'import.eyebrow': 'দ্রুত যোগ করুন', 'import.title': 'SMS যোগ করুন', 'import.subtitle': 'এক বা একাধিক লেনদেনের বার্তা পেস্ট করুন। বাকিটা আমরা গুছিয়ে দেব।', 'import.paste': 'SMS বার্তা পেস্ট করুন', 'import.placeholder': 'bKash, Nagad, Rocket বা ব্যাংকের SMS এখানে পেস্ট করুন…', 'import.multiple': 'একাধিক বার্তার মাঝে একটি ফাঁকা লাইন দিন।', 'import.upload': '.txt বা .csv ফাইল আপলোড করুন', 'import.upload_hint': 'সর্বোচ্চ ১ MB ফাইল বাছুন', 'import.privacy': 'শুধু এই ব্রাউজারের জন্য ব্যক্তিগতভাবে সংরক্ষিত হয়। সাইটের মালিক Gemini চালু করলেই শুধু অনিশ্চিত বার্তা সেখানে পাঠানো হয়।', 'import.parsing': 'আপনার বার্তা পড়া হচ্ছে…', 'import.save': 'পড়ুন ও সংরক্ষণ', 'import.saved': '{saved}টি সংরক্ষিত · {duplicates}টি নকল · {failed}টি আরেকবার দেখুন।', 'import.nothing': 'কোনো বার্তা সংরক্ষণ হয়নি। লেখা যাচাই করে আবার চেষ্টা করুন।', 'import.file_selected': 'নির্বাচিত: {name}', 'import.need_text': 'অন্তত একটি SMS পেস্ট করুন অথবা .txt/.csv ফাইল বাছুন।', 'import.demo_loaded': 'নমুনা লেনদেন আপনার খাতায় যোগ হয়েছে।',
      'edit.eyebrow': 'লেনদেন যাচাই', 'edit.title': 'লেনদেন ঠিক করুন', 'edit.subtitle': 'মূল SMS-এর তথ্য না বদলিয়েই লেনদেন সংশোধন করতে পারেন।', 'edit.original': 'মূল SMS-এর পরিমাণ: {amount}', 'edit.show_sms': 'মূল SMS দেখুন', 'edit.save': 'পরিবর্তন সংরক্ষণ', 'field.amount': 'পরিমাণ', 'field.currency': 'মুদ্রা (ISO কোড)', 'field.type': 'ধরন', 'field.category': 'খাত', 'field.counterparty': 'প্রাপক/প্রেরক', 'field.fee': 'ফি', 'field.balance': 'লেনদেনের পর ব্যালেন্স', 'field.reference': 'লেনদেন ID', 'field.date': 'তারিখ ও সময়',
      'confirm.delete': 'খাতা থেকে এই লেনদেন মুছবেন? এটি ফিরিয়ে আনা যাবে না।', 'toast.saved': 'পরিবর্তন সংরক্ষিত হয়েছে।', 'toast.deleted': 'লেনদেন মুছে ফেলা হয়েছে।', 'toast.imported': 'আমদানি সম্পন্ন।', 'toast.settings': 'সেটিংস আপডেট হয়েছে।', 'toast.rate_saved': 'নিজস্ব হার সংরক্ষিত হয়েছে।', 'toast.rate_removed': 'নিজস্ব হার সরানো হয়েছে।', 'toast.demo': 'নমুনা বার্তা যোগ হয়েছে।', 'toast.language': 'ভাষা আপডেট হয়েছে।', 'toast.currency': 'ড্যাশবোর্ড {currency} মুদ্রায় আপডেট হয়েছে।', 'toast.load_error': 'সর্বশেষ তথ্য লোড হয়নি। রিফ্রেশ করে আবার চেষ্টা করুন।', 'privacy.toast': 'Regex পার্সিং এই অ্যাপেই হয়। Gemini কী থাকলে শুধু অনিশ্চিত SMS Google-এ পাঠানো হয়।'
    }
  };

  const fallbackCurrencies = [
    { code: 'BDT', name: 'Bangladeshi Taka' }, { code: 'USD', name: 'US Dollar' }, { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' }, { code: 'INR', name: 'Indian Rupee' }, { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'AED', name: 'UAE Dirham' }, { code: 'PKR', name: 'Pakistani Rupee' }, { code: 'NPR', name: 'Nepalese Rupee' },
    { code: 'CAD', name: 'Canadian Dollar' }, { code: 'AUD', name: 'Australian Dollar' }, { code: 'JPY', name: 'Japanese Yen' }
  ];
  const categoryKeys = { food: 'category.food', transport: 'category.transport', recharge: 'category.recharge', bills: 'category.bills', shopping: 'category.shopping', other: 'category.other' };
  const typeKeys = { received: 'type.received', sent: 'type.sent', 'cash-in': 'type.cashin', 'cash-out': 'type.cashout', payment: 'type.payment', recharge: 'type.recharge' };
  const fieldKeys = { date: 'table.date', transaction_type: 'table.type', counterparty: 'table.counterparty', category: 'table.category', amount: 'table.amount', transaction_id: 'table.reference', status: 'table.status' };
  const state = {
    language: localStorage.getItem('takatrack.language') || 'en',
    theme: localStorage.getItem('takatrack.theme') || 'light',
    page: 'overview', period: 'monthly', baseCurrency: 'BDT', currencies: fallbackCurrencies,
    dashboard: null, transactions: [], transactionTotal: 0, settings: null, currentEdit: null,
    searchTimer: null, previousTotals: {}, lastDashboardCurrency: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const t = (key) => (translations[state.language] && translations[state.language][key]) || translations.en[key] || key;
  const interpolate = (template, values = {}) => Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
  const locale = () => state.language === 'bn' ? 'bn-BD' : 'en-US';
  const isReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function numberFormat(value, options = {}) {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return '—';
    return new Intl.NumberFormat(locale(), { maximumFractionDigits: 2, ...options }).format(amount);
  }

  function money(value, currency = state.baseCurrency) {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return '—';
    if (!currency) return `${numberFormat(amount)} ${t('common.no_currency')}`;
    try {
      return new Intl.NumberFormat(locale(), { style: 'currency', currency: String(currency).toUpperCase() }).format(amount);
    } catch {
      return `${numberFormat(amount)} ${String(currency).toUpperCase()}`;
    }
  }

  function displayDate(value, options = { month: 'short', day: 'numeric' }) {
    if (!value) return t('common.no_date');
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return t('common.no_date');
    try { return new Intl.DateTimeFormat(locale(), options).format(parsed); } catch { return value; }
  }

  function toast(message, isError = false) {
    const stack = $('#toast-stack');
    const item = document.createElement('div');
    item.className = `toast${isError ? ' is-error' : ''}`;
    const dot = document.createElement('span'); dot.className = 'toast-dot';
    const text = document.createElement('span'); text.textContent = message;
    item.append(dot, text); stack.append(item);
    window.setTimeout(() => { item.style.opacity = '0'; item.style.transform = 'translateY(8px)'; window.setTimeout(() => item.remove(), 240); }, 3600);
  }

  async function request(url, options = {}) {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      const detail = payload && typeof payload === 'object' ? payload.detail : '';
      const fieldMessages = payload && typeof payload === 'object' && Array.isArray(payload.fields) ? payload.fields.map((field) => field.message).join(' · ') : '';
      throw new Error(fieldMessages || (typeof detail === 'string' && detail) || t('common.request_error'));
    }
    return payload;
  }

  function applyLanguage() {
    document.documentElement.lang = state.language === 'bn' ? 'bn' : 'en';
    $$('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
    $$('[data-i18n-placeholder]').forEach((node) => { node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder)); });
    $$('[data-i18n-title]').forEach((node) => { node.setAttribute('title', t(node.dataset.i18nTitle)); });
    $('#language-short').textContent = state.language === 'bn' ? 'বাং' : 'EN';
    $('#today-label').textContent = new Intl.DateTimeFormat(locale(), { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
    updateBreadcrumb();
    if (state.dashboard) renderDashboard(state.dashboard, { animate: false });
    renderTransactionTables();
    if (state.settings) renderManualRates(state.settings.manual_rates || []);
    updateLedgerCount();
  }

  function setTheme(theme) {
    state.theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = state.theme;
    localStorage.setItem('takatrack.theme', state.theme);
    $('#theme-toggle').setAttribute('aria-label', state.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function setPage(page) {
    if (!['overview', 'transactions'].includes(page)) return;
    state.page = page;
    $('#overview-view').hidden = page !== 'overview';
    $('#transactions-view').hidden = page !== 'transactions';
    const currentView = page === 'overview' ? $('#overview-view') : $('#transactions-view');
    currentView.classList.remove('view-enter');
    void currentView.offsetWidth;
    currentView.classList.add('view-enter');
    $$('[data-view]').forEach((button) => {
      const isCurrent = button.dataset.view === page;
      if (button.classList.contains('nav-item')) {
        button.classList.toggle('is-active', isCurrent);
        if (isCurrent) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
      }
    });
    updateBreadcrumb();
    closeSidebar();
    window.scrollTo({ top: 0, behavior: isReducedMotion() ? 'auto' : 'smooth' });
  }

  function updateBreadcrumb() {
    const node = $('#breadcrumb-current');
    if (node) node.textContent = t(state.page === 'transactions' ? 'nav.transactions' : 'nav.overview');
  }

  function closeSidebar() {
    $('#sidebar').classList.remove('is-open');
    $('#sidebar-backdrop').hidden = true;
  }

  function setPeriod(period) {
    if (!['daily', 'weekly', 'monthly'].includes(period)) return;
    state.period = period;
    $$('.period-button').forEach((button) => button.classList.toggle('is-active', button.dataset.period === period));
    loadDashboard();
  }

  function animateValue(node, target, currency, startValue = 0) {
    if (!node) return;
    const end = Number(target || 0);
    if (!Number.isFinite(end)) { node.textContent = '—'; return; }
    if (isReducedMotion()) { node.textContent = money(end, currency); return; }
    const start = Number.isFinite(startValue) ? startValue : 0;
    const began = performance.now();
    const duration = 640;
    const tick = (now) => {
      const fraction = Math.min(1, (now - began) / duration);
      const eased = 1 - (1 - fraction) ** 3;
      node.textContent = money(start + (end - start) * eased, currency);
      if (fraction < 1) requestAnimationFrame(tick);
      else node.textContent = money(end, currency);
    };
    requestAnimationFrame(tick);
  }

  function drawLine(path, values, maxValue, width = 640, height = 200) {
    if (!values.length) { path.setAttribute('d', ''); return; }
    const left = 32, right = 624, top = 24, bottom = 200;
    const usableW = right - left, usableH = bottom - top;
    const denominator = Math.max(maxValue, 1);
    const points = values.map((raw, index) => {
      const x = values.length === 1 ? left + usableW / 2 : left + (index / (values.length - 1)) * usableW;
      const y = bottom - Math.max(0, Number(raw) || 0) / denominator * usableH;
      return [x, y];
    });
    let line = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for (let index = 1; index < points.length; index += 1) {
      const [x0, y0] = points[index - 1]; const [x1, y1] = points[index];
      const middle = ((x0 + x1) / 2).toFixed(1);
      line += ` C ${middle} ${y0.toFixed(1)}, ${middle} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    path.setAttribute('d', line);
  }

  function animateChartLine(path, hasValues) {
    path.classList.remove('is-animating');
    if (!hasValues || !state.dashboard?.has_transactions || isReducedMotion()) return;
    void path.getBoundingClientRect();
    path.classList.add('is-animating');
  }

  function drawArea(path, values, maxValue) {
    if (!values.length) { path.setAttribute('d', ''); return; }
    const left = 32, right = 624, bottom = 200;
    const denominator = Math.max(maxValue, 1);
    const points = values.map((raw, index) => {
      const x = values.length === 1 ? left + (right - left) / 2 : left + (index / (values.length - 1)) * (right - left);
      const y = bottom - Math.max(0, Number(raw) || 0) / denominator * (bottom - 24);
      return [x, y];
    });
    const line = points.map(([x, y], index) => `${index ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    path.setAttribute('d', `${line} L ${right} ${bottom} L ${left} ${bottom} Z`);
  }

  function renderChart(flow = []) {
    const received = flow.map((item) => Number(item.received) || 0);
    const spent = flow.map((item) => Number(item.spent) || 0);
    const maxValue = Math.max(0, ...received, ...spent) * 1.16 || 1;
    drawArea($('#received-area'), received, maxValue);
    drawArea($('#spent-area'), spent, maxValue);
    drawLine($('#received-line'), received, maxValue);
    drawLine($('#spent-line'), spent, maxValue);
    animateChartLine($('#received-line'), received.length > 0);
    animateChartLine($('#spent-line'), spent.length > 0);
    const labels = $('#chart-labels'); labels.replaceChildren();
    if (flow.length) {
      const positions = [...new Set([0, Math.round((flow.length - 1) / 4), Math.round((flow.length - 1) / 2), Math.round(3 * (flow.length - 1) / 4), flow.length - 1])];
      positions.forEach((index) => { const label = document.createElement('span'); label.textContent = flow[index].label; labels.append(label); });
    }
    const empty = !state.dashboard || !state.dashboard.has_transactions;
    $('#chart-empty').hidden = !empty;
  }

  function renderCategories(items = []) {
    const host = $('#category-list'); host.replaceChildren();
    const positives = items.filter((item) => Number(item.amount) > 0);
    const maxValue = Math.max(1, ...positives.map((item) => Number(item.amount)));
    $('#category-empty').hidden = positives.length > 0;
    positives.forEach((item) => {
      const row = document.createElement('div'); row.className = 'category-row';
      const top = document.createElement('div'); top.className = 'category-row-top';
      const nameWrap = document.createElement('span'); nameWrap.className = 'category-name-wrap';
      const icon = document.createElement('span'); icon.className = 'category-icon'; icon.textContent = ({ food: 'F', transport: '↗', recharge: '⌁', bills: '▤', shopping: '◇', other: '·' })[item.category] || '·';
      const name = document.createElement('span'); name.textContent = t(categoryKeys[item.category] || 'category.other');
      nameWrap.append(icon, name);
      const amount = document.createElement('span'); amount.className = 'category-row-amount'; amount.textContent = money(item.amount);
      top.append(nameWrap, amount);
      const track = document.createElement('div'); track.className = 'category-track'; track.setAttribute('role', 'progressbar'); track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', '100');
      const progress = document.createElement('div'); progress.className = 'category-progress'; progress.style.width = `${Math.min(100, Number(item.amount) / maxValue * 100)}%`; track.setAttribute('aria-valuenow', String(Math.round(Number(item.amount) / maxValue * 100))); track.append(progress);
      row.append(top, track); host.append(row);
    });
  }

  function renderCounterparties(items = []) {
    const host = $('#counterparty-list'); host.replaceChildren();
    $('#counterparty-empty').hidden = items.length > 0;
    const maxValue = Math.max(1, ...items.map((item) => Number(item.amount) || 0));
    items.forEach((item, index) => {
      const row = document.createElement('div'); row.className = 'counterparty-row';
      const initials = document.createElement('span'); initials.className = 'counterparty-avatar'; initials.textContent = (item.name || '?').trim().slice(0, 1);
      if (index % 3 === 1) { initials.style.background = 'var(--green-soft)'; initials.style.color = 'var(--emerald-strong)'; }
      if (index % 3 === 2) { initials.style.background = '#eaf4fb'; initials.style.color = '#4787be'; }
      const name = document.createElement('span'); name.className = 'counterparty-name'; name.textContent = item.name || t('common.no_name');
      const track = document.createElement('span'); track.className = 'counterparty-track';
      const bar = document.createElement('span'); bar.className = 'counterparty-progress'; bar.style.width = `${Math.max(4, Number(item.amount) / maxValue * 100)}%`; track.append(bar);
      const amount = document.createElement('span'); amount.className = 'counterparty-amount'; amount.textContent = money(item.amount);
      row.append(initials, name, track, amount); host.append(row);
    });
  }

  function renderDashboard(summary, { animate = true } = {}) {
    if (!summary || typeof summary !== 'object') return;
    summary = contracts.dashboard(summary);
    state.dashboard = summary;
    state.baseCurrency = summary.base_currency || state.baseCurrency;
    $('#base-currency-label').textContent = state.baseCurrency;
    const changedCurrency = state.lastDashboardCurrency !== null && state.lastDashboardCurrency !== state.baseCurrency;
    const keys = ['total_received', 'total_spent', 'total_fees', 'net_balance'];
    keys.forEach((key) => {
      const node = $(`[data-total="${key}"]`);
      const current = Number(summary[key] || 0);
      const start = changedCurrency ? 0 : (state.previousTotals[key] ?? 0);
      if (animate) animateValue(node, current, state.baseCurrency, start); else node.textContent = money(current, state.baseCurrency);
      state.previousTotals[key] = current;
    });
    $('#hero-balance').textContent = money(summary.net_balance || 0, state.baseCurrency);
    $('#period-caption').textContent = t(({ daily: 'period.today', weekly: 'period.this_week', monthly: 'period.this_month' })[summary.period] || 'period.this_month');
    $$('.period-button').forEach((button) => button.classList.toggle('is-active', button.dataset.period === summary.period));
    $('#nav-transaction-count').textContent = numberFormat(summary.transaction_count || 0, { maximumFractionDigits: 0 });
    renderChart(summary.cash_flow || []);
    renderCategories(summary.category_breakdown || []);
    renderCounterparties(summary.top_counterparties || []);
    const unconverted = summary.unconverted_currencies || [];
    const statuses = Object.values(summary.rate_status || {});
    const warning = $('#rate-warning');
    if (unconverted.length) {
      $('#rate-warning-text').textContent = `${unconverted.join(', ')} ${t('rates.unconverted')}`;
      warning.hidden = false;
    } else if (statuses.includes('stale')) {
      $('#rate-warning-text').textContent = t('rates.stale');
      warning.hidden = false;
    } else warning.hidden = true;
    state.lastDashboardCurrency = state.baseCurrency;
    if (state.settings) $('#base-currency-select').value = state.baseCurrency;
  }

  async function loadDashboard({ animate = true } = {}) {
    try {
      const result = await request(`/api/dashboard?period=${encodeURIComponent(state.period)}`);
      renderDashboard(result, { animate });
    } catch (error) {
      toast(error.message || t('toast.load_error'), true);
    }
  }

  function transactionStatus(row) {
    if (row.needs_review) return { label: t('status.review'), className: 'status-pill' };
    if (row.parse_source === 'gemini') return { label: t('status.ai'), className: 'status-pill status-ai' };
    return { label: t('status.parsed'), className: 'status-pill status-ok' };
  }

  function tableCell(row, field, value, className = '') {
    const cell = document.createElement('td');
    cell.dataset.label = t(fieldKeys[field] || field);
    if (className) cell.className = className;
    if (value instanceof Node) cell.append(value); else cell.textContent = value == null || value === '' ? '—' : String(value);
    return cell;
  }

  function makeIconButton(action, label, id) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = `row-action${action === 'delete' ? ' danger' : ''}`;
    button.dataset.action = action; button.dataset.id = String(id); button.setAttribute('aria-label', label); button.title = label;
    button.innerHTML = action === 'edit'
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>';
    return button;
  }

  function createTransactionRow(item, tableKind) {
    const row = document.createElement('tr'); row.dataset.id = String(item.id);
    const time = item.occurred_at || item.created_at;
    const formattedDate = time ? displayDate(time, { month: 'short', day: 'numeric', year: '2-digit' }) : t('common.no_date');
    row.append(tableCell(item, 'date', formattedDate, 'table-date'));
    const type = document.createElement('span');
    const incoming = ['received', 'cash-in'].includes(item.transaction_type);
    type.className = `type-pill ${incoming ? 'type-in' : ['sent', 'cash-out'].includes(item.transaction_type) ? 'type-out' : 'type-other'}`;
    type.textContent = t(typeKeys[item.transaction_type] || 'type.payment');
    row.append(tableCell(item, 'transaction_type', type));
    const party = document.createElement('span'); party.className = 'table-party';
    const initials = document.createElement('span'); initials.className = 'party-mini'; initials.textContent = (item.counterparty || '?').trim().slice(0, 1);
    const partyText = document.createElement('span'); partyText.className = 'party-text'; partyText.textContent = item.counterparty || t('common.no_name');
    party.append(initials, partyText);
    row.append(tableCell(item, 'counterparty', party));
    const category = document.createElement('span'); category.className = 'category-pill'; category.textContent = t(categoryKeys[item.category] || 'category.other');
    row.append(tableCell(item, 'category', category));
    row.append(tableCell(item, 'amount', money(item.amount, item.currency), `amount-cell${incoming ? ' is-in' : ''}`));
    if (tableKind === 'ledger') row.append(tableCell(item, 'transaction_id', item.transaction_id || '—'));
    const status = transactionStatus(item); const statusNode = document.createElement('span'); statusNode.className = status.className; statusNode.textContent = status.label;
    row.append(tableCell(item, 'status', statusNode));
    const actions = document.createElement('div'); actions.className = 'row-actions';
    actions.append(makeIconButton('edit', t('action.edit'), item.id), makeIconButton('delete', t('action.delete'), item.id));
    row.append(tableCell(item, 'actions', actions));
    return row;
  }

  function renderRows(host, rows, tableKind) {
    host.replaceChildren();
    rows.forEach((item) => host.append(createTransactionRow(item, tableKind)));
  }

  function renderTransactionTables() {
    const items = state.transactions || [];
    renderRows($('#transactions-body'), items, 'ledger');
    renderRows($('#recent-body'), items.slice(0, 5), 'recent');
    const empty = items.length === 0;
    $('#ledger-empty').hidden = !empty;
    $('.ledger-table-wrap').hidden = empty;
    $('#overview-empty').hidden = items.length > 0;
    $('.recent-card .table-wrap').hidden = items.length === 0;
  }

  function updateLedgerCount() {
    const count = state.transactionTotal || 0;
    $('#ledger-count').textContent = count === 1 ? t('ledger.count_one') : interpolate(t('ledger.count_many'), { count: numberFormat(count, { maximumFractionDigits: 0 }) });
  }

  function transactionQueryString() {
    const params = new URLSearchParams();
    const search = $('#search-input').value.trim();
    const type = $('#type-filter').value;
    const category = $('#category-filter').value;
    const from = $('#date-from').value;
    const to = $('#date-to').value;
    if (search) params.set('search', search);
    if (type) params.set('transaction_type', type);
    if (category) params.set('category', category);
    if (from) params.set('start_date', from);
    if (to) params.set('end_date', to);
    params.set('limit', '100');
    return params.toString();
  }

  async function loadTransactions() {
    try {
      const result = contracts.transactionList(await request(`/api/transactions?${transactionQueryString()}`));
      state.transactions = Array.isArray(result.items) ? result.items : [];
      state.transactionTotal = Number(result.total || 0);
      renderTransactionTables(); updateLedgerCount();
      $('#nav-transaction-count').textContent = numberFormat(state.transactionTotal, { maximumFractionDigits: 0 });
    } catch (error) {
      toast(error.message || t('toast.load_error'), true);
    }
  }

  function scheduleTransactionSearch() {
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(loadTransactions, 220);
  }

  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  function closeDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
  }

  function clearImportFeedback() {
    $('#import-error').hidden = true;
    $('#import-error').textContent = '';
    $('#import-result').hidden = true;
  }

  function openImport() {
    $('#import-form').reset();
    $('#file-label').textContent = t('import.upload_hint');
    $('#parse-skeleton').hidden = true;
    $('#import-submit').disabled = false;
    clearImportFeedback();
    openDialog('import-dialog');
    window.setTimeout(() => $('#sms-input').focus(), 40);
  }

  function splitMessages(text) {
    const normalized = text.replace(/\r\n?/g, '\n').trim();
    if (!normalized) return [];
    const blocks = normalized.split(/\n\s*\n+/).map((entry) => entry.trim()).filter(Boolean);
    if (blocks.length > 1) return blocks;
    const lines = normalized.split('\n').map((entry) => entry.trim()).filter(Boolean);
    return lines.length > 1 ? lines : [normalized];
  }

  async function submitImport(event) {
    event.preventDefault();
    clearImportFeedback();
    const file = $('#sms-file').files[0];
    const sms = $('#sms-input').value;
    if (!file && !sms.trim()) {
      $('#import-error').textContent = t('import.need_text'); $('#import-error').hidden = false; return;
    }
    const button = $('#import-submit'); button.disabled = true;
    $('#parse-skeleton').hidden = false;
    try {
      let result;
      if (file) {
        const data = new FormData(); data.append('file', file);
        result = await request('/api/transactions/upload', { method: 'POST', body: data });
      } else {
        result = await request('/api/transactions/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: splitMessages(sms) }) });
      }
      result = contracts.importResult(result);
      $('#parse-skeleton').hidden = true;
      const failed = result.failed.length;
      const summary = interpolate(t('import.saved'), { saved: numberFormat(result.saved_count || 0, { maximumFractionDigits: 0 }), duplicates: numberFormat(result.duplicate_count || 0, { maximumFractionDigits: 0 }), failed: numberFormat(failed, { maximumFractionDigits: 0 }) });
      $('#import-result-text').textContent = summary;
      $('#import-result').hidden = false;
      if (Number(result.saved_count || 0) === 0 && Number(result.duplicate_count || 0) === 0) {
        $('#import-error').textContent = t('import.nothing'); $('#import-error').hidden = false;
      }
      if (Number(result.saved_count || 0) > 0) {
        await Promise.all([loadTransactions(), loadDashboard()]);
      }
      toast(t('toast.imported'), false);
    } catch (error) {
      $('#parse-skeleton').hidden = true;
      $('#import-error').textContent = error.message || t('common.request_error');
      $('#import-error').hidden = false;
    } finally {
      button.disabled = false;
    }
  }

  function localDateTimeValue(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const pad = (number) => String(number).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
  }

  function openEdit(transaction) {
    state.currentEdit = transaction;
    $('#edit-id').value = transaction.id;
    $('#edit-amount').value = transaction.amount ?? '';
    $('#edit-currency').value = transaction.currency || '';
    $('#edit-type').value = transaction.transaction_type || 'payment';
    $('#edit-category').value = transaction.category || 'other';
    $('#edit-counterparty').value = transaction.counterparty || '';
    $('#edit-fee').value = transaction.fee_amount || '';
    $('#edit-balance').value = transaction.balance_amount || '';
    $('#edit-reference').value = transaction.transaction_id || '';
    $('#edit-date').value = localDateTimeValue(transaction.occurred_at);
    $('#edit-raw').textContent = transaction.raw_sms || '';
    $('#original-note').textContent = interpolate(t('edit.original'), { amount: money(transaction.original_amount, transaction.original_currency) });
    $('#edit-error').hidden = true;
    openDialog('edit-dialog');
  }

  async function submitEdit(event) {
    event.preventDefault();
    const id = $('#edit-id').value;
    const payload = {
      amount: $('#edit-amount').value,
      currency: $('#edit-currency').value.trim().toUpperCase() || null,
      transaction_type: $('#edit-type').value,
      category: $('#edit-category').value,
      counterparty: $('#edit-counterparty').value.trim() || null,
      fee_amount: $('#edit-fee').value || '0',
      balance_amount: $('#edit-balance').value || null,
      transaction_id: $('#edit-reference').value.trim() || null,
      occurred_at: $('#edit-date').value || null
    };
    const button = $('#edit-form button[type="submit"]'); button.disabled = true;
    $('#edit-error').hidden = true;
    try {
      contracts.transaction(await request(`/api/transactions/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
      closeDialog('edit-dialog');
      await Promise.all([loadTransactions(), loadDashboard()]);
      toast(t('toast.saved'));
    } catch (error) {
      $('#edit-error').textContent = error.message || t('common.request_error'); $('#edit-error').hidden = false;
    } finally { button.disabled = false; }
  }

  async function deleteTransaction(id) {
    if (!window.confirm(t('confirm.delete'))) return;
    try {
      await request(`/api/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await Promise.all([loadTransactions(), loadDashboard()]);
      toast(t('toast.deleted'));
    } catch (error) { toast(error.message || t('common.request_error'), true); }
  }

  function populateCurrencySelect(select, currencies, selected) {
    const existing = new Set(currencies.map((currency) => currency.code));
    if (selected && !existing.has(selected)) currencies = [{ code: selected, name: selected }, ...currencies];
    select.replaceChildren();
    currencies.forEach((currency) => {
      const option = document.createElement('option'); option.value = currency.code;
      option.textContent = `${currency.code} — ${currency.name}`; select.append(option);
    });
    select.value = selected || currencies[0]?.code || 'BDT';
  }

  function renderManualRates(rates = []) {
    const host = $('#manual-rate-list'); host.replaceChildren();
    rates.forEach((rate) => {
      const row = document.createElement('div'); row.className = 'manual-rate-row';
      const description = document.createElement('span');
      const strong = document.createElement('strong'); strong.textContent = `1 ${rate.from_currency} = ${numberFormat(rate.rate, { maximumFractionDigits: 8 })} ${rate.to_currency}`;
      const date = document.createElement('span'); date.textContent = rate.rate_date ? ` · ${rate.rate_date}` : '';
      description.append(strong, date);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-rate'; remove.dataset.from = rate.from_currency; remove.dataset.to = rate.to_currency; remove.textContent = t('settings.manual.remove');
      row.append(description, remove); host.append(row);
    });
  }

  async function loadSettings() {
    try {
      const settings = contracts.settings(await request('/api/settings'));
      const priorCurrency = state.baseCurrency;
      state.settings = settings;
      state.currencies = Array.isArray(settings.currencies) && settings.currencies.length ? settings.currencies : fallbackCurrencies;
      state.baseCurrency = settings.base_currency || 'BDT';
      if (!localStorage.getItem('takatrack.language')) state.language = settings.language || state.language;
      populateCurrencySelect($('#base-currency-select'), state.currencies, state.baseCurrency);
      $('#language-select').value = state.language;
      renderManualRates(settings.manual_rates || []);
      applyLanguage();
      if (priorCurrency !== state.baseCurrency) await loadDashboard({ animate: false });
    } catch (error) {
      state.currencies = fallbackCurrencies;
      populateCurrencySelect($('#base-currency-select'), state.currencies, state.baseCurrency);
      if (state.settings) renderManualRates(state.settings.manual_rates || []);
    }
  }

  async function saveSettings({ currency = $('#base-currency-select').value, language = state.language } = {}) {
    try {
      const updated = contracts.settingsUpdate(await request('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base_currency: currency, language }) }));
      const changedCurrency = state.baseCurrency !== updated.base_currency;
      state.baseCurrency = updated.base_currency; state.language = updated.language;
      localStorage.setItem('takatrack.language', state.language);
      $('#base-currency-label').textContent = state.baseCurrency;
      $('#base-currency-select').value = state.baseCurrency; $('#language-select').value = state.language;
      applyLanguage();
      await loadDashboard({ animate: true });
      if (changedCurrency) toast(interpolate(t('toast.currency'), { currency: state.baseCurrency })); else toast(t('toast.settings'));
      return true;
    } catch (error) {
      $('#settings-error').textContent = error.message || t('common.request_error'); $('#settings-error').hidden = false;
      return false;
    }
  }

  async function submitManualRate(event) {
    event.preventDefault();
    const from_currency = $('#rate-from').value.trim().toUpperCase();
    const to_currency = $('#rate-to').value.trim().toUpperCase() || state.baseCurrency;
    const rate = $('#rate-value').value;
    $('#settings-error').hidden = true;
    try {
      contracts.manualRate(await request('/api/settings/manual-rate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from_currency, to_currency, rate }) }));
      $('#rate-from').value = from_currency; $('#rate-to').value = to_currency; $('#rate-value').value = '';
      await Promise.all([loadSettings(), loadDashboard()]);
      toast(t('toast.rate_saved'));
    } catch (error) {
      $('#settings-error').textContent = error.message || t('common.request_error'); $('#settings-error').hidden = false;
    }
  }

  async function removeManualRate(from, to) {
    try {
      const params = new URLSearchParams({ from_currency: from, to_currency: to });
      await request(`/api/settings/manual-rate?${params}`, { method: 'DELETE' });
      await Promise.all([loadSettings(), loadDashboard()]);
      toast(t('toast.rate_removed'));
    } catch (error) { $('#settings-error').textContent = error.message || t('common.request_error'); $('#settings-error').hidden = false; }
  }

  function openSettings() {
    $('#settings-error').hidden = true;
    $('#base-currency-select').value = state.baseCurrency;
    $('#language-select').value = state.language;
    if (state.settings) renderManualRates(state.settings.manual_rates || []);
    openDialog('settings-dialog');
  }

  function exportUrl(format) {
    const params = new URLSearchParams();
    const search = $('#search-input').value.trim();
    const type = $('#type-filter').value; const category = $('#category-filter').value;
    const from = $('#date-from').value; const to = $('#date-to').value;
    if (search) params.set('search', search);
    if (type) params.set('transaction_type', type); if (category) params.set('category', category);
    if (from) params.set('start_date', from); if (to) params.set('end_date', to);
    const query = params.toString(); return `/api/exports/${format}${query ? `?${query}` : ''}`;
  }

  function bindEvents() {
    $$('[data-view]').forEach((button) => button.addEventListener('click', () => setPage(button.dataset.view)));
    $$('.period-button').forEach((button) => button.addEventListener('click', () => setPeriod(button.dataset.period)));
    $('#menu-toggle').addEventListener('click', () => { $('#sidebar').classList.add('is-open'); $('#sidebar-backdrop').hidden = false; });
    $('#sidebar-backdrop').addEventListener('click', closeSidebar);
    $('#theme-toggle').addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));
    $('#language-toggle').addEventListener('click', async () => {
      const newLanguage = state.language === 'en' ? 'bn' : 'en';
      state.language = newLanguage; localStorage.setItem('takatrack.language', newLanguage); applyLanguage();
      try { contracts.settingsUpdate(await request('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: newLanguage }) })); toast(t('toast.language')); }
      catch (error) { toast(error.message || t('common.request_error'), true); }
    });
    $('#settings-open').addEventListener('click', openSettings);
    $('#top-settings').addEventListener('click', openSettings);
    $('#currency-quick').addEventListener('click', openSettings);
    $('#warning-settings').addEventListener('click', openSettings);
    $('#open-import').addEventListener('click', openImport);
    $('#transactions-add').addEventListener('click', openImport);
    $('#empty-add').addEventListener('click', openImport);
    $('#import-form').addEventListener('submit', submitImport);
    $('#edit-form').addEventListener('submit', submitEdit);
    $('#manual-rate-form').addEventListener('submit', submitManualRate);
    $('#sms-file').addEventListener('change', () => {
      const file = $('#sms-file').files[0]; $('#file-label').textContent = file ? interpolate(t('import.file_selected'), { name: file.name }) : t('import.upload_hint'); clearImportFeedback();
    });
    $('#sms-input').addEventListener('input', clearImportFeedback);
    $('#search-input').addEventListener('input', scheduleTransactionSearch);
    ['type-filter', 'category-filter', 'date-from', 'date-to'].forEach((id) => $(`#${id}`).addEventListener('change', loadTransactions));
    $('#clear-filters').addEventListener('click', () => { $('#search-input').value = ''; $('#type-filter').value = ''; $('#category-filter').value = ''; $('#date-from').value = ''; $('#date-to').value = ''; loadTransactions(); });
    $('#base-currency-select').addEventListener('change', () => saveSettings({ currency: $('#base-currency-select').value }));
    $('#language-select').addEventListener('change', () => saveSettings({ language: $('#language-select').value }));
    $('#privacy-more').addEventListener('click', () => toast(t('privacy.toast')));
    $$('[data-export]').forEach((button) => button.addEventListener('click', () => { window.location.href = exportUrl(button.dataset.export); }));
    document.addEventListener('click', (event) => {
      const close = event.target.closest('[data-close]');
      if (close) closeDialog(close.dataset.close);
      const action = event.target.closest('[data-action]');
      if (action) {
        const transaction = state.transactions.find((item) => String(item.id) === action.dataset.id) || (state.dashboard && state.transactions.find((item) => String(item.id) === action.dataset.id));
        if (action.dataset.action === 'edit' && transaction) openEdit(transaction);
        if (action.dataset.action === 'delete') deleteTransaction(action.dataset.id);
      }
      const removeRate = event.target.closest('.remove-rate');
      if (removeRate) removeManualRate(removeRate.dataset.from, removeRate.dataset.to);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 760) closeSidebar(); });
  }

  async function init() {
    setTheme(state.theme);
    applyLanguage();
    bindEvents();
    await Promise.all([loadDashboard({ animate: true }), loadTransactions(), loadSettings()]);
    if (localStorage.getItem('takatrack.language') && state.settings && state.settings.language !== state.language) {
      request('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: state.language }) }).catch(() => {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
