# Back Button - Quick Start Guide

## ⚡ TL;DR - Just Do This

Add this blank div anywhere on your page:

```html
<div id="back-button-url" data-url="YOUR_PREVIOUS_PAGE_URL"></div>
```

**That's it!** The back button will now navigate to that URL.

---

## 📋 Copy-Paste Templates

### Template 1: Simple Static URL
```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2"></div>
```

### Template 2: URL with User Parameters (Recommended)
```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2?userId={userId}&contactId={contactId}"></div>
```

### Template 3: Show Buttons Immediately (Without Waiting for Video)
```html
<body data-show-back-button="true">
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2"></div>
</body>
```

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
