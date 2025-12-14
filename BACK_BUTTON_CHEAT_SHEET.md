# Back Button - One-Page Cheat Sheet

## ⚡ Copy This Code

Add this blank div anywhere on your page:

```html
<div id="back-button-url" data-url="PASTE_YOUR_URL_HERE"></div>
```

---

## 📋 Examples

### Basic Example (Parameters Auto-Added)
```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/previous-lesson"></div>
```
**Result:** `https://my.rapidfunnel.com/course/previous-lesson?userId=12345&contactId=67890&resourceId=999`
*(Parameters are automatically appended!)*

### With Placeholders (For Custom Positioning)
```html
<div id="back-button-url" data-url="https://my.rapidfunnel.com/course/previous-lesson?userId={userId}&contactId={contactId}"></div>
```
**Result:** `https://my.rapidfunnel.com/course/previous-lesson?userId=12345&contactId=67890`
*(Placeholders are replaced with actual values)*

---

## ✅ Must-Know Rules

1. **ID must be exactly:** `id="back-button-url"`
2. **URL must be in:** `data-url="..."`
3. **Use full URLs:** Include `https://`
4. **Div is invisible:** Place it anywhere on the page
5. **Parameters are ALWAYS added:** Either via placeholders OR auto-appended

---

## 🔄 How Parameters are Added

The script automatically handles URL parameters in two ways:

### Option 1: Auto-Append (Simple)
Just provide the base URL - parameters are added automatically:
```html
<div id="back-button-url" data-url="https://example.com/lesson-1"></div>
```
↓ Becomes ↓
```
https://example.com/lesson-1?userId=12345&contactId=67890&resourceId=999
```

### Option 2: Placeholders (Control)
Use placeholders to control where/which parameters are added:
```html
<div id="back-button-url" data-url="https://example.com/lesson-1?userId={userId}"></div>
```
↓ Becomes ↓
```
https://example.com/lesson-1?userId=12345
```
*(Only userId is added because only {userId} placeholder was used)*

---

## 🎯 Real Example - 3 Lesson Course

**Lesson 1** (first lesson - no back button needed):
```html
<body>
  <h1>Lesson 1</h1>
  <!-- No div needed -->
</body>
```

**Lesson 2** (back to Lesson 1) - **SIMPLE METHOD**:
```html
<body>
  <!-- Parameters auto-added! -->
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-1"></div>
  <h1>Lesson 2</h1>
</body>
```
Back button goes to: `https://my.rapidfunnel.com/course/lesson-1?userId=XXX&contactId=YYY&resourceId=ZZZ`

**Lesson 3** (back to Lesson 2) - **PLACEHOLDER METHOD**:
```html
<body>
  <!-- Placeholders replaced with actual values -->
  <div id="back-button-url" data-url="https://my.rapidfunnel.com/course/lesson-2?userId={userId}&contactId={contactId}"></div>
  <h1>Lesson 3</h1>
</body>
```
Back button goes to: `https://my.rapidfunnel.com/course/lesson-2?userId=XXX&contactId=YYY`

**Both methods work! Choose whichever you prefer.**

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
