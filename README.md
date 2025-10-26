# RapidFunnel Integration Scripts - Complete Documentation

This README provides comprehensive documentation for all JavaScript tracking and integration scripts used in RapidFunnel landing pages.

---

## Table of Contents

1. [Overview](#overview)
2. [URL Parameters](#url-parameters)
3. [User Data Loading Script](#1-user-data-loading-script)
4. [CTA Tracking Buttons Script](#2-cta-tracking-buttons-script)
5. [CTA Notification Buttons Script](#3-cta-notification-buttons-script)
6. [Video Tracking Script](#4-video-tracking-script)
7. [Asset Download Script](#5-asset-download-script)
8. [Implementation Guide](#implementation-guide)
9. [Troubleshooting](#troubleshooting)

---

## Overview

These scripts work together to provide:
- Dynamic user profile data loading
- CTA button click tracking with email notifications
- Video engagement tracking (Wistia integration)
- Asset download functionality with tracking

All scripts rely on URL parameters passed to the landing page for user and contact identification.

---

## URL Parameters

All scripts expect the following URL parameters:

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `userId` | Yes | The user/agent ID | `?userId=12345` |
| `contactId` | Optional | The contact/lead ID | `&contactId=67890` |
| `resourceId` | Optional | Resource identifier | `&resourceId=111` |

**Example URL:**
```
https://yourpage.com/landing?userId=12345&contactId=67890&resourceId=111
```

---

## 1. User Data Loading Script

### Purpose
Fetches user profile data from the RapidFunnel API and dynamically populates the landing page with personalized information.

### Features
- Loads user profile image, name, email, phone number
- Populates social media links
- Handles custom booking links
- Hides elements when data is unavailable

### API Endpoint
```
GET https://apiv2.rapidfunnel.com/v2/users-details/{userId}
```

### HTML Element Mapping

The script looks for HTML elements with IDs matching the API response keys:

```html
<!-- Profile Information -->
<img id="profileImage" src="" alt="Profile">
<span id="firstName"></span>
<span id="lastName"></span>
<a id="email" href=""></a>
<a id="phoneNumber" href=""></a>

<!-- Alternative class-based selectors -->
<span class="firstName"></span>
<span class="lastName"></span>

<!-- Custom Booking Link -->
<a id="customBookingLink" href=""></a>
<a class="custom_custombookinglink" href=""></a>
<div class="alternate-text">Shown when no booking link</div>

<!-- Social Media Links -->
<div class="footer-social-links">
  <a id="facebookUrl" href=""></a>
  <a id="twitterUrl" href=""></a>
  <a id="linkedinUrl" href=""></a>
  <a id="instagramUrl" href=""></a>
</div>
```

### Behavior

1. **Profile Image**: Sets `src` attribute, falls back to default icon if empty
2. **Email**: Sets `href="mailto:..."` and displays email text
3. **Phone Number**: Sets `href="tel:..."`, hides parent if empty
4. **Custom Booking Link**: 
   - Updates all elements with matching ID/class
   - Hides alternate text when available
   - Triggers `customBookingLinkUpdated` event
5. **Social Links**: Hides links if URL not provided

### Global Data Storage

The script stores the custom booking link globally:
```javascript
window.sharedData.customBookingLink = userData.customBookingLink;
```

### Events Triggered

```javascript
// Custom event when booking link is updated
$(document).trigger('customBookingLinkUpdated');
```

---

## 2. CTA Tracking Buttons Script

### Purpose
Handles CTA buttons that require tracking URL generation and click tracking with email notifications.

### Features
- Dynamically generates tracking URLs from resource IDs
- Sends click notification emails
- Prevents duplicate submissions
- Handles redirects (same window or new tab)
- Graceful error handling

### Button Configuration

Buttons must have an ID starting with `ctaTrackingButton` and include data attributes:

```html
<button 
  id="ctaTrackingButton1"
  data-cta-tracking-id="12345"
  data-cta-tracking-location="Hero Section"
  href="#"
  target="_blank">
  Click Here
</button>
```

### Data Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `id` | Yes | Must start with `ctaTrackingButton` |
| `data-cta-tracking-id` | Yes | Resource ID for tracking URL |
| `data-cta-tracking-location` | No | Description of button location |
| `target` | No | `_blank` for new tab, omit for same window |

### API Endpoints Used

1. **Get Tracking URL:**
```
GET https://app.rapidfunnel.com/api/api/resources/resource-details/
Parameters: userId, resourceId, contactId
```

2. **Get Contact Details:**
```
GET https://apiv2.rapidfunnel.com/v2/contact-details/{contactId}
```

3. **Send Notification Email:**
```
POST https://app.rapidfunnel.com/api/mail/send-cta-email
Body: {
  legacyUserId, contactFirstName, contactLastName,
  contactPhoneNumber, contactEmail, ctaLocation, ctaPageName
}
```

### Tracking URL Format

Generated URL structure:
```
{resourceUrl}/{userId}/{contactId}
```

Example:
```
https://track.rapidfunnel.com/click/12345/67890
```

### Behavior Flow

1. **On Page Load**: Fetches tracking URLs for all CTA tracking buttons
2. **On Click**: 
   - Prevents default action
   - Checks for duplicate processing
   - Fetches contact details (if contactId exists)
   - Sends notification email
   - Redirects to tracking URL

### Error Handling

- Disabled buttons or `#` hrefs are not processed
- Failed API calls still allow redirect
- 5-second timeout on contact details fetch
- Buttons marked as disabled if tracking URL fetch fails

---

## 3. CTA Notification Buttons Script

### Purpose
Handles simple CTA buttons that send email notifications without requiring tracking URL generation.

### Features
- Simpler than tracking buttons (no resource ID needed)
- Sends email notification on click
- Supports custom redirect URLs
- Works with or without contact information

### Button Configuration

Buttons must have an ID starting with `ctaButton`:

```html
<button 
  id="ctaButton1"
  data-description="Download Brochure"
  href="https://example.com/thank-you"
  target="_blank">
  Download Now
</button>
```

### Data Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `id` | Yes | Must start with `ctaButton` |
| `data-description` | No | Button location/description (falls back to ID) |
| `href` | Yes | Redirect URL after notification |
| `target` | No | `_blank` for new tab |

### API Endpoints Used

1. **Get Contact Details:**
```
GET https://apiv2.rapidfunnel.com/v2/contact-details/{contactId}
```

2. **Send Notification Email:**
```
POST https://app.rapidfunnel.com/api/mail/send-cta-email
```

### Behavior Flow

1. **On Click**:
   - Prevents default action
   - Fetches contact details (if contactId available)
   - Sends notification email with contact info
   - Redirects to specified URL

### Fallback Behavior

- If contactId missing: Sends notification with "No contact ID found"
- If contact fetch fails: Sends notification with "System failed to answer"
- Redirect happens regardless of email success/failure

---

## 4. Video Tracking Script

### Purpose
Tracks video engagement on Wistia-embedded videos and sends viewing data to RapidFunnel.

### Features
- Tracks play, pause, and completion events
- Sends periodic progress updates (every 15 seconds)
- Prevents duplicate tracking
- Supports multiple videos on same page
- Each video can have its own resource ID

### Requirements

- Wistia video player embedded on page
- Valid `userId` and `contactId` in URL
- Each video container must have `data-resource-id` attribute

### HTML Configuration

```html
<!-- Wistia video embed -->
<div class="wistia_embed wistia_async_ABC123" 
     data-resource-id="12345">
</div>

<!-- Optional: Hidden webinar field -->
<input type="hidden" id="webinar" value="Spring 2024 Webinar">
```

### Configuration

```javascript
const TRACK_INTERVAL_MS = 15000; // Send updates every 15 seconds
```

### API Endpoint

```
POST https://my.rapidfunnel.com/landing/resource/push-to-sqs
```

### Payload Structure

```javascript
{
  resourceId: "12345",
  contactId: "67890",
  userId: "11111",
  percentageWatched: 25,    // 0-100
  mediaHash: "ABC123",      // Wistia video ID
  duration: 120,            // Video duration in seconds
  visitorKey: "...",        // Wistia visitor key
  eventKey: "...",          // Wistia event key
  delayProcess: 1,
  webinar: "Spring 2024"    // Optional
}
```

### Tracking Events

1. **On Play**: 
   - Sends initial tracking data
   - Starts interval tracking every 15 seconds
   
2. **During Playback**:
   - Checks progress every 15 seconds
   - Sends update if percentage increased
   
3. **On Pause**:
   - Stops interval tracking
   
4. **On End**:
   - Sends final 100% tracking
   - Stops all tracking

### Validation

Script only activates if:
- `contactId` is present and numeric
- `userId` is present and numeric
- Video has valid `data-resource-id` attribute

### Multiple Videos

Each video independently tracks its own resource ID:
```html
<div class="wistia_embed wistia_async_VIDEO1" data-resource-id="101"></div>
<div class="wistia_embed wistia_async_VIDEO2" data-resource-id="102"></div>
<div class="wistia_embed wistia_async_VIDEO3" data-resource-id="103"></div>
```

---

## 5. Asset Download Script

### Purpose
Enables asset downloads through buttons with automatic tracking and configuration via data attributes.

### Features
- Configurable via HTML data attributes
- Supports multiple download buttons
- Two download methods (simple & fetch)
- Shows loading state during download
- Automatic button detection

### Button Configuration

#### Method 1: ID Prefix
Buttons with ID starting with `downloadButton`:

```html
<button 
  id="downloadButton1"
  data-url="https://example.com/assets/guide.pdf"
  data-file-name="marketing-guide.pdf"
  data-download-method="simple">
  Download Guide
</button>
```

#### Method 2: Data Attribute
Any button with `data-url` attribute:

```html
<button 
  id="my-custom-id"
  data-url="https://example.com/assets/template.zip"
  data-file-name="template.zip">
  Download Template
</button>
```

### Data Attributes

| Attribute | Required | Description | Default |
|-----------|----------|-------------|---------|
| `data-url` | Yes | URL of asset to download | - |
| `data-file-name` | No | Filename to save as | `"download"` |
| `data-download-method` | No | `"simple"` or `"fetch"` | `"simple"` |

### Download Methods

#### Simple Method (Default)
- Direct download using anchor element
- Works for direct file URLs
- Fast and straightforward
- Best for public, direct-access files

```html
data-download-method="simple"
```

#### Fetch Method
- Uses Fetch API for more control
- Better error handling
- Shows console feedback
- Useful for CORS-enabled resources

```html
data-download-method="fetch"
```

### Behavior

1. **Button Detection**: Automatically finds all download buttons on page load
2. **On Click**:
   - Prevents default action
   - Shows "Downloading..." text
   - Disables button
   - Initiates download
   - Restores button state

### Error Handling

- Missing `data-url`: Shows alert and logs error
- Download failure (fetch method): Shows alert to user
- Console logs for debugging

### Multiple Downloads

You can have unlimited download buttons on a single page:

```html
<button id="downloadButton1" data-url="..." data-file-name="file1.pdf">File 1</button>
<button id="downloadButton2" data-url="..." data-file-name="file2.zip">File 2</button>
<button id="downloadButton3" data-url="..." data-file-name="file3.docx">File 3</button>
```

### Module Export

The script can be used as a module:

```javascript
const { downloadAsset, downloadAssetWithFetch, initDownload } = require('./download-script');
```

---

## Implementation Guide

### Step 1: Include jQuery (if using jQuery-based scripts)

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

### Step 2: Add Script Files

```html
<!-- User Data Loading -->
<script src="path/to/user-data-loader.js"></script>

<!-- CTA Tracking -->
<script src="path/to/cta-tracking.js"></script>

<!-- CTA Notifications -->
<script src="path/to/cta-notifications.js"></script>

<!-- Video Tracking -->
<script src="path/to/video-tracking.js"></script>

<!-- Asset Downloads -->
<script src="path/to/asset-download.js"></script>
```

### Step 3: Set Up HTML Elements

#### User Profile Elements
```html
<div class="profile-section">
  <img id="profileImage" src="" alt="Profile">
  <h1><span class="firstName"></span> <span class="lastName"></span></h1>
  <a id="email" href=""></a>
  <a id="phoneNumber" href=""></a>
  <a id="customBookingLink" href="">Book Appointment</a>
</div>
```

#### CTA Tracking Buttons
```html
<button 
  id="ctaTrackingButton1"
  data-cta-tracking-id="12345"
  data-cta-tracking-location="Hero CTA"
  target="_blank">
  Get Started
</button>
```

#### CTA Notification Buttons
```html
<button 
  id="ctaButton1"
  data-description="Footer Contact"
  href="/thank-you">
  Contact Us
</button>
```

#### Video Elements
```html
<div class="wistia_embed wistia_async_ABC123" 
     data-resource-id="12345"
     style="width:640px;height:360px;">
</div>
<input type="hidden" id="webinar" value="Q1 2024 Training">
```

#### Download Buttons
```html
<button 
  id="downloadButton1"
  data-url="https://example.com/guide.pdf"
  data-file-name="complete-guide.pdf">
  Download Guide
</button>
```

### Step 4: Test Your Implementation

1. **Check Console Logs**: All scripts output detailed console logs
2. **Verify URL Parameters**: Ensure userId and contactId are in URL
3. **Test Each Button Type**: Click through all CTAs and downloads
4. **Watch Video Tracking**: Play videos and check console for tracking events

---

## Troubleshooting

### User Data Not Loading

**Problem**: Profile data isn't appearing on the page

**Solutions**:
- ✅ Verify `userId` is in the URL and is numeric
- ✅ Check that HTML element IDs match API response keys exactly
- ✅ Look for CORS errors in console
- ✅ Confirm API endpoint is accessible

### CTA Buttons Not Working

**Problem**: Clicking CTA buttons does nothing

**Solutions**:
- ✅ Ensure button ID starts with `ctaTrackingButton` or `ctaButton`
- ✅ Check that required data attributes are present
- ✅ Verify `href` attribute is set (even if just `"#"`)
- ✅ Look for JavaScript errors in console
- ✅ Confirm contactId is in URL (for tracking buttons)

### Video Tracking Not Firing

**Problem**: Video plays but no tracking data sent

**Solutions**:
- ✅ Verify both `userId` and `contactId` are in URL and numeric
- ✅ Check that video container has `data-resource-id` attribute
- ✅ Ensure Wistia script is loaded before tracking script
- ✅ Look for console warnings about missing parameters
- ✅ Check network tab for API request failures

### Downloads Not Starting

**Problem**: Download buttons don't trigger downloads

**Solutions**:
- ✅ Verify button has `data-url` attribute OR ID starts with `downloadButton`
- ✅ Check that URL is accessible and CORS-enabled (for fetch method)
- ✅ Try switching between `simple` and `fetch` methods
- ✅ Look for console errors
- ✅ Test URL directly in browser

### General Debugging Tips

1. **Open Browser Console**: All scripts log their activity
2. **Check Network Tab**: See API requests and responses
3. **Verify URL Parameters**: Use `console.log` to check parsed values
4. **Test with Valid IDs**: Use known-good userId and contactId values
5. **Disable Ad Blockers**: May interfere with tracking scripts
6. **Check CORS Settings**: Ensure APIs allow requests from your domain

### Console Log Messages

Each script outputs specific console messages:

```javascript
// User Data Loader
"User ID: 12345"
"Resource ID: 111"
"Contact ID: 67890"
"userdata: {...}"

// CTA Tracking
"Download script initialized successfully! Found 3 download button(s)."
"CTA Tracking email sent successfully"

// Video Tracking
"[Tracking] Wistia video is ready"
"[Tracking] ▶️ Video started"
"[Tracking] Sending data for video 12345: 25% watched"
"[Tracking] ✅ POST succeeded"

// Asset Downloads
"Download script initialized successfully! Found 2 download button(s)."
"Downloading asset..."
"Download completed!"
```

---

## Best Practices

### 1. URL Parameters
Always include userId and contactId in your landing page URLs:
```
https://yourpage.com?userId=12345&contactId=67890
```

### 2. Button Naming
Use consistent, descriptive button IDs:
```html
<!-- Good -->
<button id="ctaTrackingButton_hero">...</button>
<button id="ctaButton_footer_contact">...</button>
<button id="downloadButton_guide">...</button>

<!-- Avoid -->
<button id="ctaTrackingButton1">...</button>
<button id="btn2">...</button>
```

### 3. Data Attributes
Always provide descriptive data attributes:
```html
<button 
  data-cta-tracking-location="Homepage Hero Section"
  data-description="Main call-to-action button">
```

### 4. Error Handling
Monitor console logs in production to catch issues early.

### 5. Testing
Test with both valid and invalid/missing URL parameters to ensure graceful degradation.

---

## API Reference Summary

### User Details API
```
GET https://apiv2.rapidfunnel.com/v2/users-details/{userId}
Response: { data: [{ firstName, lastName, email, phoneNumber, profileImage, ... }] }
```

### Contact Details API
```
GET https://apiv2.rapidfunnel.com/v2/contact-details/{contactId}
Response: { data: { firstName, lastName, email, phone, ... } }
```

### Resource Details API
```
GET https://app.rapidfunnel.com/api/api/resources/resource-details/
Params: { userId, resourceId, contactId }
Response: { data: { resourceUrl, ... } }
```

### CTA Notification API
```
POST https://app.rapidfunnel.com/api/mail/send-cta-email
Body: { legacyUserId, contactFirstName, contactLastName, contactPhoneNumber, 
        contactEmail, ctaLocation, ctaPageName }
```

### Video Tracking API
```
POST https://my.rapidfunnel.com/landing/resource/push-to-sqs
Body: { resourceId, contactId, userId, percentageWatched, mediaHash, 
        duration, visitorKey, eventKey, delayProcess, webinar }
```

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Review this documentation
3. Verify all prerequisites are met
4. Contact RapidFunnel support with:
   - Browser console logs
   - Network tab screenshots
   - URL parameters being used
   - Specific error messages

---

## Version History

**v1.0** - Initial documentation
- User data loading
- CTA tracking and notifications
- Video tracking (Wistia)
- Asset downloads

---

**Last Updated**: 2024
**Maintained By**: RapidFunnel Development Team