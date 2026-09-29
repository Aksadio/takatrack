(function exposeContracts(root) {
  'use strict';

  const transactionTypes = new Set(['sent', 'received', 'cash-in', 'cash-out', 'payment', 'recharge']);
  const categories = new Set(['food', 'transport', 'recharge', 'bills', 'shopping', 'other']);
  const periods = new Set(['daily', 'weekly', 'monthly']);
  const decimalPattern = /^-?\d+(?:\.\d+)?$/;

  function record(value, label) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
    return value;
  }
  function string(value, label, nullable = false) {
    if (nullable && value === null) return value;
    if (typeof value !== 'string') throw new TypeError(`${label} must be a string${nullable ? ' or null' : ''}.`);
    return value;
  }
  function currency(value, label, nullable = false) {
    string(value, label, nullable);
    if (value !== null && !/^[A-Z]{3}$/.test(value)) throw new TypeError(`${label} must be a three-letter uppercase currency code.`);
    return value;
  }
  function decimal(value, label, nullable = false) {
    if (nullable && value === null) return value;
    const valid = (typeof value === 'string' && decimalPattern.test(value)) || (typeof value === 'number' && Number.isFinite(value));
    if (!valid) throw new TypeError(`${label} must be a decimal string or finite number${nullable ? ' or null' : ''}.`);
    return value;
  }
  function array(value, label) {
    if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
    return value;
  }
  function integer(value, label, minimum = 0) {
    if (!Number.isInteger(value) || value < minimum) throw new TypeError(`${label} must be an integer of at least ${minimum}.`);
    return value;
  }

  function transaction(value) {
    const row = record(value, 'transaction');
    integer(row.id, 'transaction.id', 1);
    decimal(row.amount, 'transaction.amount');
    currency(row.currency, 'transaction.currency', true);
    decimal(row.original_amount, 'transaction.original_amount');
    currency(row.original_currency, 'transaction.original_currency', true);
    if (typeof row.is_corrected !== 'boolean') throw new TypeError('transaction.is_corrected must be boolean.');
    if (row.transaction_id !== null) string(row.transaction_id, 'transaction.transaction_id');
    if (!transactionTypes.has(row.transaction_type)) throw new TypeError('transaction.transaction_type is unsupported.');
    string(row.counterparty, 'transaction.counterparty', true);
    decimal(row.fee_amount, 'transaction.fee_amount');
    decimal(row.balance_amount, 'transaction.balance_amount', true);
    string(row.occurred_at, 'transaction.occurred_at', true);
    if (!categories.has(row.category)) throw new TypeError('transaction.category is unsupported.');
    string(row.raw_sms, 'transaction.raw_sms');
    if (typeof row.parse_confidence !== 'number' || !Number.isFinite(row.parse_confidence) || row.parse_confidence < 0 || row.parse_confidence > 1) throw new TypeError('transaction.parse_confidence must be between 0 and 1.');
    if (!['regex', 'gemini'].includes(row.parse_source)) throw new TypeError('transaction.parse_source is unsupported.');
    if (typeof row.needs_review !== 'boolean') throw new TypeError('transaction.needs_review must be boolean.');
    string(row.created_at, 'transaction.created_at', true);
    string(row.updated_at, 'transaction.updated_at', true);
    return row;
  }

  function dashboard(value) {
    const data = record(value, 'dashboard');
    if (!periods.has(data.period)) throw new TypeError('dashboard.period is unsupported.');
    string(data.period_label, 'dashboard.period_label');
    currency(data.base_currency, 'dashboard.base_currency');
    for (const key of ['total_received', 'total_spent', 'total_fees', 'net_balance']) decimal(data[key], `dashboard.${key}`);
    integer(data.transaction_count, 'dashboard.transaction_count');
    array(data.cash_flow, 'dashboard.cash_flow').forEach((point, index) => {
      record(point, `dashboard.cash_flow[${index}]`);
      string(point.label, `dashboard.cash_flow[${index}].label`);
      decimal(point.received, `dashboard.cash_flow[${index}].received`);
      decimal(point.spent, `dashboard.cash_flow[${index}].spent`);
    });
    array(data.category_breakdown, 'dashboard.category_breakdown').forEach((item, index) => {
      record(item, `dashboard.category_breakdown[${index}]`);
      if (!categories.has(item.category)) throw new TypeError(`dashboard.category_breakdown[${index}].category is unsupported.`);
      decimal(item.amount, `dashboard.category_breakdown[${index}].amount`);
    });
    array(data.top_counterparties, 'dashboard.top_counterparties').forEach((item, index) => {
      record(item, `dashboard.top_counterparties[${index}]`);
      string(item.name, `dashboard.top_counterparties[${index}].name`);
      decimal(item.amount, `dashboard.top_counterparties[${index}].amount`);
    });
    record(data.rate_status, 'dashboard.rate_status');
    Object.entries(data.rate_status).forEach(([code, status]) => { currency(code, 'dashboard.rate_status currency'); string(status, `dashboard.rate_status.${code}`); });
    array(data.unconverted_currencies, 'dashboard.unconverted_currencies').forEach((code, index) => string(code, `dashboard.unconverted_currencies[${index}]`));
    if (typeof data.has_transactions !== 'boolean') throw new TypeError('dashboard.has_transactions must be boolean.');
    return data;
  }

  function transactionList(value) {
    const data = record(value, 'transaction list');
    array(data.items, 'transaction list.items').forEach(transaction);
    integer(data.total, 'transaction list.total');
    integer(data.limit, 'transaction list.limit', 1);
    integer(data.offset, 'transaction list.offset');
    return data;
  }

  function settings(value) {
    const data = record(value, 'settings');
    currency(data.base_currency, 'settings.base_currency');
    if (!['en', 'bn'].includes(data.language)) throw new TypeError('settings.language must be en or bn.');
    array(data.currencies, 'settings.currencies').forEach((item, index) => {
      record(item, `settings.currencies[${index}]`);
      currency(item.code, `settings.currencies[${index}].code`);
      string(item.name, `settings.currencies[${index}].name`);
    });
    if (typeof data.currency_list_live !== 'boolean') throw new TypeError('settings.currency_list_live must be boolean.');
    array(data.manual_rates, 'settings.manual_rates').forEach((item, index) => {
      record(item, `settings.manual_rates[${index}]`);
      currency(item.from_currency, `settings.manual_rates[${index}].from_currency`);
      currency(item.to_currency, `settings.manual_rates[${index}].to_currency`);
      decimal(item.rate, `settings.manual_rates[${index}].rate`);
      string(item.rate_date, `settings.manual_rates[${index}].rate_date`, true);
    });
    return data;
  }

  function settingsUpdate(value) {
    const data = record(value, 'settings update');
    currency(data.base_currency, 'settings update.base_currency');
    if (!['en', 'bn'].includes(data.language)) throw new TypeError('settings update.language must be en or bn.');
    return data;
  }

  function importResult(value) {
    const data = record(value, 'import result');
    array(data.saved, 'import result.saved').forEach(transaction);
    integer(data.saved_count, 'import result.saved_count');
    integer(data.duplicate_count, 'import result.duplicate_count');
    array(data.failed, 'import result.failed').forEach((item, index) => {
      record(item, `import result.failed[${index}]`);
      string(item.message, `import result.failed[${index}].message`);
      string(item.error, `import result.failed[${index}].error`);
    });
    if (data.saved_count !== data.saved.length) throw new TypeError('import result.saved_count does not match saved transactions.');
    return data;
  }

  function manualRate(value) {
    const data = record(value, 'manual rate');
    currency(data.from_currency, 'manual rate.from_currency');
    currency(data.to_currency, 'manual rate.to_currency');
    decimal(data.rate, 'manual rate.rate');
    if (data.status !== 'manual') throw new TypeError('manual rate.status must be manual.');
    string(data.rate_date, 'manual rate.rate_date');
    return data;
  }

  const contracts = Object.freeze({ dashboard, transaction, transactionList, settings, settingsUpdate, importResult, manualRate });
  if (typeof module !== 'undefined' && module.exports) module.exports = contracts;
  if (root && typeof root === 'object') root.TakaTrackContracts = contracts;
})(typeof globalThis === 'undefined' ? this : globalThis);
