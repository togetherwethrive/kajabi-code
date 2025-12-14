# Show Button on Video Completion - Troubleshooting Guide

## Overview
The `showButtonOnVideoCompletion.js` script displays a hidden button (with ID `videoButton`) when the last video on the page reaches 90% completion or ends.

---

## ✅ Recent Fixes Applied

### 1. **Button Detection with Retry**
- **Problem:** Button might not exist in DOM when script initializes
- **Fix:** Script now retries up to 5 times (1 second apart) to find the button
- **Benefit:** Works even if button loads dynamically

### 2. **Improved Video Detection**
- **Problem:** 2-second delay might not be enough for slow-loading videos
- **Fix:** Increased to 3 seconds + better timeout handling
- **Benefit:** More reliable on slow connections

### 3. **Better Progress Checking**
- **Problem:** Pause event would stop checking permanently
- **Fix:** Checking resumes when play event fires again
- **Benefit:** Works even if user pauses near 90%

### 4. **Initial State Check**
- **Problem:** Script didn't check if video was already past 90% on page load
- **Fix:** Immediately checks current progress and video state
- **Benefit:** Button shows instantly if video already completed

### 5. **Safety Fallback**
- **Problem:** Wistia events might not always fire reliably
- **Fix:** Added 5-second interval safety check that runs regardless of events
- **Benefit:** Button will show even if events fail

### 6. **End Event Handling**
- **Problem:** End event might not always trigger button display
- **Fix:** Explicit end event binding with logging
- **Benefit:** More reliable detection of video completion

---

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Reload the page

### Step 2: Look for These Messages

**✅ Expected Success Messages:**
```
[Button Display] Script loaded
[Button Display] Initializing...
[Button Display] ✓ Button found with ID 'videoButton'
[Button Display] Continuing with video detection...
[Button Display] Video detected: abc123xyz
[Button Display] Video detection complete - found 1 video(s)
[Button Display] ✓ Identified last video: abc123xyz (1 total videos on page)
[Button Display] Initial video progress: 0%
[Button Display] Current video state: beforeplay
```

**During Video Playback:**
```
[Button Display] Video abc123xyz started playing - monitoring progress
[Button Display] Progress checking started
[Button Display] Progress check: 35%
[Button Display] Progress check: 67%
[Button Display] Progress check: 92%
[Button Display] 90% threshold reached - showing button
[Button Display] showButton() called with videoId: abc123xyz
[Button Display] ✅ Button is now visible!
```

---

## ❌ Common Issues & Solutions

### Issue 1: "Button with ID 'videoButton' not found"

**Console Shows:**
```
[Button Display] ⚠️ Button with ID 'videoButton' not found (attempt 1/5)
[Button Display] ❌ Button still not found after 5 attempts - aborting
```

**Solutions:**
1. Make sure you have an element with **exactly** `id="videoButton"` on your page
2. The button must be hidden with CSS: `style="display: none;"`
3. Check for typos in the ID (case-sensitive!)

**HTML Example:**
```html
<button id="videoButton" style="display: none;" href="https://example.com/next-page">
  Next Lesson
</button>
```

---

### Issue 2: "No videos detected"

**Console Shows:**
```
[Button Display] ❌ No videos detected after 5 seconds
```

**Solutions:**
1. Make sure you have Wistia video embeds on the page
2. Check that Wistia script is loaded: `https://fast.wistia.com/assets/external/E-v1.js`
3. Verify video embeds have proper class names (e.g., `wistia_embed`, `wistia_async_abc123`)

**HTML Example:**
```html
<div class="wistia_embed wistia_async_abc123xyz"
     data-resource-id="12345"
     style="height:360px;width:640px">
</div>
```

---

### Issue 3: Button shows immediately (before video starts)

**Cause:** Button was previously unlocked and saved in localStorage

**Solution:**
1. This is expected behavior (user-friendly)
2. To reset: Clear localStorage for this page
3. Or clear cache: `localStorage.removeItem('kajabi_button_unlocked')`

**How to Reset in Console:**
```javascript
localStorage.removeItem('kajabi_button_unlocked');
location.reload();
```

---

### Issue 4: Button doesn't show at 90% or end

**Debugging Steps:**

1. **Check console for progress messages:**
   - Should see: `[Button Display] Progress check: XX%`
   - If missing, video events might not be firing

2. **Manually trigger button (testing):**
   ```javascript
   // In browser console:
   document.getElementById('videoButton').style.display = 'inline-block';
   ```

3. **Check video state:**
   ```javascript
   // In browser console:
   console.log(window._allVideos);
   console.log(window._allVideos[0].state());
   console.log(window._allVideos[0].percentWatched());
   ```

4. **Look for safety check messages:**
   - Every 5 seconds, should see safety check if button not yet shown
   - If missing, JavaScript error might be preventing execution

---

### Issue 5: URL parameters not added to button

**Console Shows:**
```
[Button Display] URL blocked by security policy: https://untrusted-site.com
```

**Solution:**
- Button URL must be from whitelisted domain
- Allowed: rapidfunnel.com, kajabi.com, twtmentorship.com, thrivewithtwtapp.com
- Add your domain to whitelist in script if needed

---

## 🎯 Testing Checklist

Use this checklist to verify everything works:

- [ ] Button with `id="videoButton"` exists on page
- [ ] Button is hidden: `style="display: none;"`
- [ ] Wistia video embed exists on page
- [ ] Wistia script loaded (check Network tab)
- [ ] Console shows "Button found" message
- [ ] Console shows "Video detected" message
- [ ] Play video - see "started playing - monitoring progress"
- [ ] See progress checks every second while playing
- [ ] At 90% - button appears
- [ ] Console shows "Button is now visible!"
- [ ] Button has correct URL with parameters

---

## 🔧 Advanced Debugging

### Check Video Progress Manually
```javascript
// In console while video is playing:
const video = window._allVideos[window._allVideos.length - 1];
console.log('Video ID:', video.hashedId());
console.log('Progress:', Math.floor(video.percentWatched() * 100) + '%');
console.log('State:', video.state());
```

### Force Show Button (for testing)
```javascript
// Show button manually:
const btn = document.getElementById('videoButton');
btn.style.display = 'inline-block';
```

### Check Button URL
```javascript
// Verify URL was processed correctly:
const btn = document.getElementById('videoButton');
console.log('href:', btn.getAttribute('href'));
console.log('onclick:', btn.getAttribute('onclick'));
```

### Clear Cached State
```javascript
// Reset everything:
localStorage.removeItem('kajabi_button_unlocked');
delete window._allVideos;
location.reload();
```

---

## 📝 How It Works (Technical)

1. **Initialization:**
   - Script loads and checks for button (retries if not found)
   - Sets up Wistia API queue (`window._wq`)

2. **Video Detection:**
   - Wistia calls `_all` function for each video
   - Script stores all videos in `window._allVideos`
   - After 3 seconds, identifies last video

3. **Progress Monitoring:**
   - Binds to `play`, `pause`, and `end` events
   - Checks progress every 1 second while playing
   - Safety check every 5 seconds (regardless of events)

4. **Button Display:**
   - Shows button at 90% completion OR on video end
   - Processes URL parameters (replaces placeholders or appends)
   - Saves state to localStorage
   - Shows immediately on next page load

---

## 🆘 Still Having Issues?

1. **Check Browser Compatibility:**
   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - JavaScript enabled
   - localStorage enabled (not in Private/Incognito mode)

2. **Check for Conflicts:**
   - Other scripts using `window._allVideos`
   - Multiple versions of showButtonOnVideoCompletion.js loaded
   - Wistia embedded multiple times

3. **Verify HTML Structure:**
   - Button ID is exactly: `videoButton`
   - Button has display none style
   - Wistia embed has proper classes

4. **Console Errors:**
   - Look for red error messages
   - JavaScript syntax errors
   - Network errors loading Wistia

---

## 💡 Best Practices

1. **Always check console** when debugging
2. **Use exact ID:** `id="videoButton"` (case-sensitive)
3. **Hide button initially:** `style="display: none;"`
4. **Use whitelisted domains** for button URLs
5. **Test in incognito mode** to verify fresh state
6. **Clear localStorage** when testing changes

---

If you're still experiencing issues after checking everything above, copy the console output and review it for specific error messages. The script provides detailed logging to help identify exactly where the problem occurs.
