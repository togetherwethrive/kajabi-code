# Back Button Usage Guide

## Overview
The back button script creates two navigation buttons (top and bottom of page) that appear after the last video on the page reaches 90% completion. The buttons allow users to navigate back to a previous page.

**🚨 CRITICAL REQUIREMENT:** The `<div id="back-button-url">` element MUST be present on the page. Without this div, the script will NOT create any back buttons at all.

---

## How to Set the Back Button URL

### Method 1: Using a Blank Div (RECOMMENDED) ⭐ **REQUIRED**

Add a blank div with a specific ID and data attribute anywhere on your page:

```html
<body>
  <!-- This blank div tells the back button where to go -->
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/previous-page"></div>

  <!-- Your page content -->
</body>
```

**This div is REQUIRED for the script to work.** The div is completely invisible and can be placed anywhere on the page.

**✨ Automatic Parameter Handling:**
- If you use placeholders like `{userId}`, they get replaced with actual values
- If you DON'T use placeholders, parameters are automatically appended to the URL
- Either way, userId, contactId, and resourceId are always included!

### Method 2: Using Body Attribute (Legacy Support - Not Recommended)

⚠️ **IMPORTANT:** Even if using the body attribute, you MUST still have the `<div id="back-button-url">` present on the page (it can be empty).

```html
<body data-back-button-url="https://my.rapidfunnel.com/previous-page">
  <!-- The div is still required, even if empty! -->
  <div id="back-button-url"></div>

  <!-- Your page content -->
</body>
```

**Note:** This method is deprecated. Use Method 1 (div with data-url) instead.

---

## URL Format Options

**🎯 Important:** Parameters are ALWAYS added to your URL - either through placeholders OR auto-appended!

### Option A: Simple URL (Auto-Append) ✨ Easiest
Just provide the base URL - all parameters are added automatically:

```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-1"></div>
```

**Result:** `https://my.rapidfunnel.com/course/lesson-1?userId=12345&contactId=67890&resourceId=999`
*(All parameters automatically appended!)*

---

### Option B: URL with Placeholders (Custom Control) 🎛️
Use placeholders to control which parameters are added:

```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-1?userId={userId}&contactId={contactId}"></div>
```

**Result:** `https://my.rapidfunnel.com/course/lesson-1?userId=12345&contactId=67890`
*(Only userId and contactId added - resourceId skipped because no placeholder)*

---

**Supported Placeholders:**
- `{userId}` or `[userId]` or `[user-id]` - Replaced with the current user ID
- `{contactId}` or `[contactId]` - Replaced with the current contact ID
- `{resourceId}` or `[resourceId]` - Replaced with the current resource ID

**💡 Which to use?**
- **Option A (Simple):** When you want all parameters passed through (most common)
- **Option B (Placeholders):** When you need control over which parameters to include

---

## Complete HTML Examples

### Example 1: Simple Course Navigation
```html
<!DOCTYPE html>
<html>
<head>
  <title>Course Lesson 3</title>
</head>
<body>

  <!-- ⭐ Back button URL -->
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2"></div>

  <h1>Lesson 3: Advanced Techniques</h1>

  <!-- Your Wistia video embed -->
  <div class="wistia_embed wistia_async_abc123" data-resource-id="12345">
  </div>

  <!-- Rest of your content -->

</body>
</html>
```

### Example 2: Dynamic Parameters (Recommended) ⭐
```html
<!DOCTYPE html>
<html>
<head>
  <title>Course Lesson 3</title>
</head>
<body>

  <!-- ⭐ Back button URL with dynamic parameters -->
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2?userId={userId}&contactId={contactId}&resourceId={resourceId}"></div>

  <h1>Lesson 3: Advanced Techniques</h1>

  <!-- Your Wistia video embed -->
  <div class="wistia_embed wistia_async_abc123" data-resource-id="12345">
  </div>

</body>
</html>
```

### Example 3: Kajabi/TWT Mentorship Site
```html
<!DOCTYPE html>
<html>
<head>
  <title>Module 2 - Lesson 3</title>
</head>
<body>

  <!-- ⭐ Back button URL -->
  <div id="back-button-url" data-url="https://twtmentorship.com/courses/module-2/lesson-2"></div>

  <h1>Lesson 3</h1>

  <div class="wistia_embed wistia_async_xyz789" data-resource-id="54321">
  </div>

</body>
</html>
```

---

## Button Visibility Rules ⚠️ IMPORTANT

**Back buttons will ONLY appear if at least ONE of these conditions is true:**

1. ✅ **Forced to show via div** (`data-back-button="true"` on the #back-button-url div)
2. ✅ **Forced to show via body** (`data-show-back-button="true"` on body tag)
3. ✅ **Forced to show via script** (`window.previousLessonStart` constant)
4. ✅ **Custom back URL defined** (via div or body attribute)
5. ✅ **User came from another page** (document.referrer exists)
6. ✅ **Saved referrer from previous visit** (stored in localStorage)

**If NONE of these are true, buttons will NOT show.**

**Why?** If a user navigates directly to your page (types URL, bookmark, email link), there's no previous page to go back to. Showing a back button would be confusing and useless.

**💡 Recommendation:** Always define a custom back URL using the div method to ensure buttons show reliably!

---

## Navigation Priority System

When user clicks the back button, it navigates in this order:

1. **PRIORITY 1**: URL from `#back-button-url` div (if present) ⭐ Recommended
2. **PRIORITY 2**: URL from body `data-back-button-url` attribute (legacy support)
3. **PRIORITY 3**: Saved referrer from localStorage (automatic)
4. **PRIORITY 4**: Browser history (`window.history.back()`)

This means:
- ✅ If you set the div with URL, it will ALWAYS use that URL (highest priority)
- ✅ If not set, it checks the body attribute
- ✅ If not set, it will try to use the page the user came from
- ✅ If that's not available, it will use browser back button

---

## Security Features

### Domain Whitelist
For security, the back button only navigates to trusted domains:

**Allowed Domains:**
- `rapidfunnel.com`
- `my.rapidfunnel.com`
- `app.rapidfunnel.com`
- `apiv2.rapidfunnel.com`
- `thrivewithtwtapp.com`
- `kajabi.com`
- `twtmentorship.com`

**Including all subdomains of these domains.**

If you set a URL to a domain NOT in this list, the button will:
- ❌ Block the navigation
- ⚠️ Log a warning in the console
- 🔄 Fall back to the next priority option

### Need to Add More Domains?
Edit the `ALLOWED_REDIRECT_DOMAINS` array in `backButton.js`:

```javascript
const ALLOWED_REDIRECT_DOMAINS = [
  'rapidfunnel.com',
  'kajabi.com',
  'twtmentorship.com',
  'yourdomain.com'  // Add your domain here
];
```

---

## How the Buttons Appear

### Default Behavior
The back buttons will automatically:
1. ✅ Show after the **last video** on the page reaches **90% completion**
2. ✅ Create **two buttons**: one at the top, one at the bottom of the page
3. ✅ Remember the state (if shown once, stays shown on page reload)

### Force Buttons to Always Show

If you want the buttons to show immediately (without waiting for video):

**Method 1: Div Attribute (Recommended) ⭐**
```html
<div id="back-button-url" data-back-button="true" data-url="https://example.com/previous"></div>
```

**Method 2: Body Attribute**
```html
<body data-show-back-button="true" data-back-button-url="https://example.com/previous">
```

**Method 3: JavaScript Constant**
```html
<script>
  window.previousLessonStart = true;
</script>
```

---

## Customization

### Button Text
Edit `backButton.js`:
```javascript
const CONFIG = {
  BUTTON_TEXT: 'Previous Lesson',  // Change this
  // ...
};
```

### Button Color
Edit `backButton.js`:
```javascript
const CONFIG = {
  BUTTON_COLOR: '#291d5c',       // Background color
  BUTTON_TEXT_COLOR: '#fff',     // Text color
  // ...
};
```

---

## Troubleshooting

### Buttons Not Showing Up?

**Check Console for Errors:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for messages starting with `[Back Button]`

**Common Issues:**

1. **Buttons not being created at all** 🚨 MOST COMMON
   - Console shows: `⚠️ DIV with id="back-button-url" NOT FOUND on this page`
   - **Solution:** Add `<div id="back-button-url" data-url="YOUR_URL"></div>` to your page
   - This div is REQUIRED - the script will not create any buttons without it

2. **No videos detected**
   - Make sure you have Wistia videos on the page
   - Videos need `data-resource-id` attribute

3. **URL blocked by security policy**
   - Check console for "blocked by security policy" message
   - Make sure your URL domain is in the whitelist

4. **Buttons showing too early**
   - Remove `data-show-back-button="true"` if set
   - Remove `window.previousLessonStart` if set

### Button Goes to Wrong Page?

1. Check the `data-back-button-url` attribute value
2. Open Console and click the button - it will log where it's navigating
3. Verify placeholders are being replaced correctly

### Testing

**Test the URL processing:**
```javascript
// In browser console:
console.log(document.body.getAttribute('data-back-button-url'));
```

---

## Best Practices

### ✅ DO:
- Always set `data-back-button-url` for predictable navigation
- Use placeholders for dynamic URLs
- Test the button before deploying
- Use full URLs (including https://)

### ❌ DON'T:
- Use external/untrusted domains
- Use relative URLs (like `/previous-page`)
- Forget to update the URL when changing lesson order
- Use special characters in placeholder values

---

## Quick Reference

```html
<!-- ⭐ Minimal Setup (Recommended) -->
<div id="back-button-url" data-url="https://my.rapidfunnel.com/previous-page"></div>

<!-- ⭐ With Parameters (Recommended) -->
<div id="back-button-url" data-url="https://my.rapidfunnel.com/previous?userId={userId}&contactId={contactId}"></div>

<!-- ⭐ Always Show Buttons (Div Method - Recommended) -->
<div id="back-button-url" data-back-button="true" data-url="https://my.rapidfunnel.com/previous"></div>

<!-- ⭐ Always Show Buttons (Body Method - Also Works) -->
<body data-show-back-button="true">
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/previous"></div>
  <div class="wistia_embed wistia_async_abc123" data-resource-id="12345"></div>
</body>

<!-- Legacy Method (Body Attribute) - Still Works -->
<body data-back-button-url="https://my.rapidfunnel.com/previous">
  <div class="wistia_embed wistia_async_abc123" data-resource-id="12345"></div>
</body>
```

---

## Support

If you encounter issues:
1. Check the browser console for detailed logs
2. Verify your URL is in the allowed domains list
3. Test with a simple static URL first
4. Check that Wistia videos are loading properly

All back button actions are logged to the console with the `[Back Button]` prefix for easy debugging.
