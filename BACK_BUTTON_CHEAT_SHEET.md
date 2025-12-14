# Back Button - One-Page Cheat Sheet

## ⚡ Copy This Code

Add this blank div anywhere on your page:

```html
<div id="back-button-url" data-url="PASTE_YOUR_URL_HERE"></div>
```

---

## 📋 Examples

### Basic Example
```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/previous-lesson"></div>
```

### With Dynamic Parameters (Recommended)
```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/previous-lesson?userId={userId}&contactId={contactId}"></div>
```

---

## ✅ Must-Know Rules

1. **ID must be exactly:** `id="back-button-url"`
2. **URL must be in:** `data-url="..."`
3. **Use full URLs:** Include `https://`
4. **Div is invisible:** Place it anywhere on the page

---

## 🎯 Real Example - 3 Lesson Course

**Lesson 1** (first lesson - no back button needed):
```html
<body>
  <h1>Lesson 1</h1>
  <!-- No div needed -->
</body>
```

**Lesson 2** (back to Lesson 1):
```html
<body>
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-1?userId={userId}&contactId={contactId}"></div>
  <h1>Lesson 2</h1>
</body>
```

**Lesson 3** (back to Lesson 2):
```html
<body>
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2?userId={userId}&contactId={contactId}"></div>
  <h1>Lesson 3</h1>
</body>
```

---

## 🔥 Power Tips

### Use Placeholders for Dynamic URLs
These get auto-replaced:
- `{userId}` → Current user ID
- `{contactId}` → Current contact ID
- `{resourceId}` → Current page ID

### Force Buttons to Show Immediately
Add to `<body>` tag:
```html
<body data-show-back-button="true">
```

---

## ❌ Common Mistakes

**DON'T:**
```html
<!-- ❌ Wrong ID -->
<div id="back-url" data-url="..."></div>

<!-- ❌ Missing ID -->
<div data-url="..."></div>

<!-- ❌ Relative URL -->
<div id="back-button-url" data-url="/previous"></div>
```

**DO:**
```html
<!-- ✅ Correct -->
<div id="back-button-url" data-url="https://my.rapidfunnel.com/previous"></div>
```

---

## 🆘 Troubleshooting

**Buttons not showing?**
- Press F12 → Console tab
- Look for `[Back Button]` messages
- Make sure video reaches 90%

**Wrong URL?**
- Check spelling of `id="back-button-url"`
- Verify URL domain is whitelisted
- Check console for "blocked" messages

---

## 📱 Allowed Domains

These domains work (including subdomains):
- ✅ rapidfunnel.com
- ✅ kajabi.com
- ✅ twtmentorship.com
- ✅ thrivewithtwtapp.com

---

That's it! Just add the div with your URL and you're done. 🎉
