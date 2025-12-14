# Back Button - Quick Start Guide

## ⚡ TL;DR - Just Do This

Add this blank div anywhere on your page:

```html
<div id="back-button-url" data-url="YOUR_PREVIOUS_PAGE_URL"></div>
```

**That's it!** URL parameters (userId, contactId, resourceId) are automatically added to the URL!

**🚨 CRITICAL:** This div is REQUIRED - without it, back buttons will NOT be created at all!

**🚨 IMPORTANT:** Back buttons only show if:
- User came from another page (has referrer), OR
- You define a custom back URL (recommended - the div above!), OR
- You force show with `data-back-button="true"` on the div, OR
- You force show with `data-show-back-button="true"` on the body tag

**If user navigates directly to the page (no referrer) and you didn't define a custom URL = No back button shows.** This is smart - no point showing a useless back button!

---

## 📋 Copy-Paste Templates

### Template 1: Simple (Auto-Appends Parameters)
```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2"></div>
```
**Result:** `https://my.rapidfunnel.com/course/lesson-2?userId=XXX&contactId=YYY&resourceId=ZZZ`

### Template 2: With Placeholders (Custom Control)
```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2?userId={userId}&contactId={contactId}"></div>
```
**Result:** `https://my.rapidfunnel.com/course/lesson-2?userId=XXX&contactId=YYY`

### Template 3: Show Buttons Immediately (Without Waiting for Video)

**Option A: Using the div (Recommended)**
```html
<div id="back-button-url" data-back-button="true" data-url="https://my.rapidfunnel.com/course/lesson-2"></div>
```

**Option B: Using the body tag**
```html
<body data-show-back-button="true">
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2"></div>
</body>
```

**💡 Pro Tip:** Both methods add parameters! Template 1 is simpler, Template 2 gives you more control.

---

## 🎯 Real-World Example

**Current Page:** Lesson 3
**Previous Page:** Lesson 2

```html
<!DOCTYPE html>
<html>
<head>
  <title>Lesson 3</title>
</head>
<body>

  <!-- ⭐ Add this blank div with the back button URL -->
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/module-1/lesson-2?userId={userId}&contactId={contactId}"></div>

  <h1>Lesson 3</h1>

  <!-- Your video -->
  <div class="wistia_embed wistia_async_abc123" data-resource-id="12345"></div>

</body>
</html>
```

When users have URL parameters like:
```
?userId=54321&contactId=98765
```

The back button will navigate to:
```
https://my.rapidfunnel.com/course/module-1/lesson-2?userId=54321&contactId=98765
```

**The div can be placed anywhere on the page - it's completely invisible!**

---

## ✅ What Works

These domains are whitelisted and will work:
- `rapidfunnel.com` (and all subdomains)
- `kajabi.com` (and all subdomains)
- `twtmentorship.com` (and all subdomains)
- `thrivewithtwtapp.com` (and all subdomains)

---

## ❌ Common Mistakes

**DON'T DO THIS:**
```html
<!-- ❌ Missing id attribute -->
<div data-url="https://example.com/page"></div>

<!-- ❌ Wrong id name -->
<div id="back-url" data-url="https://example.com/page"></div>

<!-- ❌ Using untrusted domain -->
<div id="back-button-url" data-url="https://random-site.com/page"></div>

<!-- ❌ Using relative URL -->
<div id="back-button-url" data-url="/previous-page"></div>
```

**DO THIS:**
```html
<!-- ✅ Correct id and full URL -->
<div id="back-button-url" data-url="https://my.rapidfunnel.com/page"></div>

<!-- ✅ Whitelisted domain -->
<div id="back-button-url" data-url="https://twtmentorship.com/page"></div>

<!-- ✅ With dynamic parameters -->
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-1?userId={userId}&contactId={contactId}"></div>
```

---

## 🐛 Troubleshooting

### Buttons not showing?
1. Check browser console (F12) for errors
2. Make sure you have a Wistia video on the page
3. Wait for video to reach 90% OR add `data-show-back-button="true"`

### Button goes to wrong page?
1. Check the URL in `data-back-button-url`
2. Make sure quotes are correct
3. Check browser console - it logs where it's going

### "Blocked by security policy" error?
- Your URL domain is not whitelisted
- Use one of the approved domains
- Contact developer to add your domain to whitelist

---

## 💡 Pro Tips

1. **Always use full URLs** (including https://)
2. **Test placeholders** before deploying
3. **Check console logs** for debugging
4. **Use dynamic parameters** to track users across pages
5. **Remember to update URLs** when changing lesson order

---

## 🆘 Need More Help?

See the full documentation: `BACK_BUTTON_USAGE.md`

Or check the example file: `back-button-example.html`
