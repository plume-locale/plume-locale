/**
 * Plume Locale - Utilities Index
 * Central reference for all utility modules
 * 
 * Usage:
 *   - DOM Utilities: DOMUtils.query(), DOMUtils.addClass(), etc.
 *   - Text Utilities: TextUtils.escapeHtml(), TextUtils.truncate(), etc.
 *   - Date Utilities: DateUtils.format(), DateUtils.addDays(), etc.
 *   - Validator Utilities: ValidatorUtils.isEmail(), ValidatorUtils.isUrl(), etc.
 *   - Array/Object Utilities: ArrayObjectUtils.unique(), ArrayObjectUtils.merge(), etc.
 *   - Event Utilities: EventUtils.debounce(), EventUtils.throttle(), etc.
 */

// ============================================
// DOM UTILITIES
// ============================================

/**
 * DOMUtils - DOM manipulation and querying
 * 
 * Key Methods:
 *   - query(selector) - Select single element
 *   - queryAll(selector) - Select multiple elements
 *   - createElement(tag, options) - Create element with options
 *   - addClass/removeClass/toggleClass - Class manipulation
 *   - show/hide/toggleVisibility - Visibility control
 *   - getFormData(form) - Extract form data as object
 *   - setFormData(form, data) - Populate form from object
 */

// ============================================
// TEXT UTILITIES
// ============================================

/**
 * TextUtils - Text formatting and manipulation
 * 
 * Key Methods:
 *   - escapeHtml(text) - Escape HTML special chars
 *   - capitalize(str) - Capitalize first letter
 *   - toTitleCase(str) - Convert to Title Case
 *   - toSlug(str) - Convert to URL slug
 *   - truncate(text, length) - Truncate with ellipsis
 *   - wordCount(text) - Count words
 *   - similarity(str1, str2) - Calculate similarity (0-1)
 *   - extractMentions/extractHashtags/extractUrls
 */

// ============================================
// DATE UTILITIES
// ============================================

/**
 * DateUtils - Date formatting and manipulation
 * 
 * Key Methods:
 *   - format(date, options) - Format to locale string
 *   - formatDateTime(date) - Format date and time
 *   - formatRelative(date) - Format as relative time (e.g., "2 hours ago")
 *   - daysBetween(date1, date2) - Days between dates
 *   - addDays/addMonths/addYears - Date arithmetic
 *   - startOfDay/endOfDay/startOfMonth/endOfMonth
 *   - isToday/isPast/isFuture - Date comparisons
 *   - getWeekNumber(date) - Get week number
 */

// ============================================
// VALIDATOR UTILITIES
// ============================================

/**
 * ValidatorUtils - Data validation
 * 
 * Key Methods:
 *   - isEmail(email) - Validate email
 *   - isUrl(url) - Validate URL
 *   - isPhoneNumber(phone) - Validate phone
 *   - isNumber/isInteger/isFloat - Number validation
 *   - isAlpha/isAlphanumeric/isNumeric - Character validation
 *   - lengthBetween(str, min, max) - String length validation
 *   - isEmpty/isRequired - Presence validation
 *   - isColor/isDate/isTimeFormat - Format validation
 *   - isJSON - JSON validation
 */

// ============================================
// ARRAY/OBJECT UTILITIES
// ============================================

/**
 * ArrayObjectUtils - Array and object manipulation
 * 
 * Array Methods:
 *   - unique(arr) - Remove duplicates
 *   - flatten(arr, depth) - Flatten nested arrays
 *   - chunk(arr, size) - Split into chunks
 *   - shuffle(arr) - Random order
 *   - sum/average/min/max - Aggregate functions
 *   - groupBy(arr, key) - Group by property
 *   - sortBy(arr, key, order) - Sort by property
 *   - paginate(arr, page, pageSize) - Pagination
 *   - first/last - Get first/last N elements
 * 
 * Object Methods:
 *   - deepClone(obj) - Deep copy
 *   - merge(target, ...sources) - Merge objects
 *   - pick(obj, keys) - Pick specific keys
 *   - omit(obj, keys) - Exclude specific keys
 *   - getByPath/setByPath - Access nested properties
 *   - mapValues/filterObject - Transform objects
 *   - equals(obj1, obj2) - Deep comparison
 */

// ============================================
// EVENT UTILITIES
// ============================================

/**
 * EventUtils - Event handling and async utilities
 * 
 * Key Methods:
 *   - debounce(fn, delay) - Wait for inactivity
 *   - throttle(fn, delay) - Limit execution frequency
 *   - once(fn) - Execute only once
 *   - before/after - Execute after N calls
 *   - compose/pipe - Function composition
 *   - memoize(fn) - Cache function results
 *   - retry(fn, options) - Retry failed promises
 *   - timeout(promise, ms) - Promise with timeout
 *   - parallelLimit(tasks, limit) - Parallel execution
 *   - batch(tasks, batchSize) - Execute in batches
 */

// ============================================
// IMPORT STATEMENT
// ============================================

/**
 * All utilities must be included in the HTML head:
 * 
 *   <script src="js/07-utils/dom-utils.js"></script>
 *   <script src="js/07-utils/text-utils.js"></script>
 *   <script src="js/07-utils/date-utils.js"></script>
 *   <script src="js/07-utils/validator-utils.js"></script>
 *   <script src="js/07-utils/array-object-utils.js"></script>
 *   <script src="js/07-utils/event-utils.js"></script>
 */

// ============================================
// COMMON USAGE EXAMPLES
// ============================================

/**
 * Example: DOM Operations
 * 
 *   const btn = DOMUtils.query('.submit-btn');
 *   DOMUtils.addClass(btn, 'disabled');
 *   DOMUtils.hide(btn);
 *   
 *   const form = DOMUtils.query('form');
 *   const data = DOMUtils.getFormData(form);
 */

/**
 * Example: Text Processing
 * 
 *   const safe = TextUtils.escapeHtml(userInput);
 *   const slug = TextUtils.toSlug('My Title');
 *   const summary = TextUtils.truncate(longText, 100);
 *   const mentions = TextUtils.extractMentions('@john @jane');
 */

/**
 * Example: Date Handling
 * 
 *   const formatted = DateUtils.format(new Date());
 *   const tomorrow = DateUtils.addDays(new Date(), 1);
 *   const daysAgo = DateUtils.daysBetween(pastDate, new Date());
 *   const relative = DateUtils.formatRelative(timestamp);
 */

/**
 * Example: Validation
 * 
 *   if (ValidatorUtils.isEmail(email)) { /* valid */ }
 *   if (ValidatorUtils.lengthBetween(password, 8, 32)) { /* valid */ }
 *   if (!ValidatorUtils.isEmpty(value)) { /* has value */ }
 */

/**
 * Example: Array Operations
 * 
 *   const unique = ArrayObjectUtils.unique([1, 1, 2, 3]);
 *   const grouped = ArrayObjectUtils.groupBy(users, 'role');
 *   const sorted = ArrayObjectUtils.sortBy(items, 'name', 'asc');
 *   const paginated = ArrayObjectUtils.paginate(items, 2, 10);
 */

/**
 * Example: Object Operations
 * 
 *   const cloned = ArrayObjectUtils.deepClone(original);
 *   const merged = ArrayObjectUtils.merge(obj1, obj2, obj3);
 *   const filtered = ArrayObjectUtils.pick(obj, ['name', 'email']);
 *   const nested = ArrayObjectUtils.getByPath(obj, 'user.profile.name');
 */

/**
 * Example: Event Handling
 * 
 *   const debouncedSearch = EventUtils.debounce(search, 300);
 *   const throttledScroll = EventUtils.throttle(handleScroll, 500);
 *   const oneTime = EventUtils.once(initialize);
 *   
 *   EventUtils.retry(fetchData, { maxAttempts: 3 });
 *   await EventUtils.batch(tasks, 5);
 */

console.log('✓ UI Utilities loaded successfully');
