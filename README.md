# Kajabi Code Library - Complete Documentation

A comprehensive collection of JavaScript utilities for building interactive web pages with form handling, analytics tracking, user data management, and content delivery features.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Script Descriptions](#script-descriptions)
4. [Usage Examples](#usage-examples)
5. [Configuration Reference](#configuration-reference)
6. [API Endpoints](#api-endpoints)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This library provides six core JavaScript modules plus a master loader script:

- **Form Validation & Contact Creation** - Two-step form submission with GDPR compliance
- **CTA Button Tracking** - Click tracking with email notifications
- **Button Tracking (Alternative)** - Advanced button tracking with resource management
- **Asset Downloads** - Flexible file download handling
- **Footer Automation** - Dynamic user profile data injection
- **Video Tracking** - Wistia video engagement analytics
- **Master Loader** - Automatic dependency management

---

## Installation

### Method 1: Master Loader (Recommended)

Add this single script tag to load all modules automatically:
```html
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/mainCode.js"></script>
```

The master loader will:
- Load jQuery if not present
- Load all custom scripts in the correct order
- Handle dependencies automatically

### Method 2: Individual Scripts

Load specific modules as needed:
```html
<!-- jQuery (required) -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Individual modules -->
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/formValidation.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/contactForm.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/ctaButtonNotification.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/buttonTracking.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/assetDownload.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/footerAutomation.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/videoTracking.js"></script>
```

---

## Script Descriptions

### 1. Form Validation (`formValidation.js`)

**Purpose**: First-stage validation script that enforces form requirements before contact creation.

**Key Features**:
- GDPR/CCPA consent validation (mandatory)
- Email format validation
- Required field checking
- AJAX call interception to prevent premature submission
- Defensive programming with multiple event capture methods
- Comprehensive console logging for debugging

**Security Features**:
- Blocks all API calls until validation passes
- Sets `window.VALIDATION_PASSED` flag
- Prevents double submission
- Validates GDPR checkbox explicitly

**HTML Requirements**:
```html
<form id="contactForm">
  <input type="text" id="contactFirstName" required />
  <input type="text" id="contactLastName" required />
  <input type="email" id="contactEmail" required />
  <input type="tel" id="contactPhone" required />
  <input type="checkbox" id="gdprConsent" required />
  <div id="gdprError" class="error-message">GDPR consent required</div>
  <button type="submit" id="contactFormSubmitBtn">Submit</button>
</form>
```

---

### 2. Contact Form (`contactForm.js`)

**Purpose**: Second-stage script that creates contacts in RapidFunnel after validation passes.

**Key Features**:
- Only loads after validation succeeds
- Creates contact via API
- Handles redirects with URL parameters
- Manages loading states (spinner, disabled button)
- Form reset after success

**Container Configuration**:
```html
<div id="contactFormContainer" 
     data-campaign="YOUR_CAMPAIGN_ID"
     data-label="YOUR_LABEL_ID"
     data-redirect="https://yoursite.com/thank-you">
  <!-- Form goes here -->
</div>
```

**Workflow**:
1. User submits form → `formValidation.js` runs
2. If validation passes → `contactForm.js` loads dynamically
3. Contact created via API
4. User redirected with `userId`, `resourceId`, `contactId` parameters

---

### 3. CTA Button Notification (`ctaButtonNotification.js`)

**Purpose**: Simple CTA tracking that sends email notifications when buttons are clicked.

**Features**:
- Sends notification emails on button click
- Captures button location/description
- Handles redirects after notification
- Works with or without contact data

**Button Markup**:
```html
<a href="https://destination.com" 
   id="ctaButton1"
   data-description="Download Free Guide"
   target="_blank">
  Click Here
</a>
```

**How It Works**:
1. Button clicked → Captures redirect URL and target
2. Fetches contact details (if `contactId` in URL)
3. Sends notification email
4. Redirects user to intended destination

---

### 4. Button Tracking (`buttonTracking.js`)

**Purpose**: Advanced CTA tracking with resource URL management and click tracking.

**Features**:
- Fetches resource URLs from API
- Updates button hrefs dynamically
- Tracks button clicks with email notifications
- Prevents duplicate submissions
- Graceful error handling

**Button Markup**:
```html
<a href="#" 
   id="ctaTrackingButton1"
   data-cta-tracking-id="RESOURCE_ID"
   data-cta-tracking-location="Hero Section"
   target="_blank">
  Get Started
</a>
```

**Workflow**:
1. Page loads → Fetches resource URLs for all tracking buttons
2. Updates button `href` attributes with tracking URLs
3. On click → Fetches contact data
4. Sends tracking email
5. Redirects to tracked URL

---

### 5. Asset Download (`assetDownload.js`)

**Purpose**: Provides flexible file download handling with contact tracking and email notifications.

**Features**:
- Simple link-based downloads
- Fetch API downloads (for CORS files)
- Automatic button state management
- Contact details fetching from API
- Download tracking with email notifications
- Integration with RapidFunnel tracking system
- Multiple button selector support

**How It Works**:
1. User clicks download button
2. Fetches contact details from API (if `contactId` in URL)
3. Sends download tracking notification email
4. Proceeds with file download

**Button Markup**:

**Method 1 - Simple Download with Tracking**:
```html
<button id="downloadButton1"
        data-url="https://yoursite.com/file.pdf"
        data-file-name="myfile.pdf"
        data-download-location="Hero Section Download">
  Download PDF
</button>
```

**Method 2 - Fetch API with Tracking (for CORS)**:
```html
<button data-url="https://external-site.com/file.pdf"
        data-file-name="document.pdf"
        data-download-method="fetch"
        data-download-location="Resource Library - Template Download">
  Download
</button>
```

**Required Attributes**:
- `data-url` - File URL to download (required)
- `data-file-name` - Name for downloaded file (optional, defaults to 'download')
- `data-download-location` - Location identifier for tracking (optional, falls back to button ID)
- `data-download-method` - Download method: "simple" or "fetch" (optional, defaults to "simple")

**URL Parameters** (for tracking):
- `userId` - RapidFunnel user ID (required for tracking)
- `contactId` - Contact ID (optional, enables full contact detail tracking)
- `resourceId` - Resource ID (optional)

**Initialization**: Automatic - finds buttons by ID prefix `downloadButton*` or any element with `data-url` attribute.

---

### 6. Footer Automation (`footerAutomation.js`)

**Purpose**: Dynamically populates user profile information from API.

**Features**:
- Fetches user details from RapidFunnel API
- Auto-populates profile image, name, email, phone
- Manages social media links
- Hides/shows elements based on data availability
- Handles custom booking links

**HTML Elements** (use matching IDs):
```html
<img id="profileImage" src="" alt="Profile" />
<span id="firstName"></span>
<span id="lastName"></span>
<a id="email" href=""></a>
<a id="phoneNumber" href=""></a>
<a id="customBookingLink" href="">Book a Call</a>

<!-- Social Links -->
<a id="facebookUrl" href=""><i class="fa fa-facebook"></i></a>
<a id="twitterUrl" href=""><i class="fa fa-twitter"></i></a>
<a id="linkedinUrl" href=""><i class="fa fa-linkedin"></i></a>
```

**How It Works**:
1. Extracts `userId` from URL parameters
2. Fetches user data from API
3. Populates matching element IDs with user data
4. Hides social links if URLs not provided
5. Triggers `customBookingLinkUpdated` event when ready

---

### 7. Video Tracking (`videoTracking.js`)

**Purpose**: Tracks Wistia video engagement and sends analytics to RapidFunnel.

**Features**:
- Tracks watch percentage every 15 seconds
- Sends data on play, pause, and end events
- Supports multiple videos on one page
- Requires `data-resource-id` on video container

**Video Markup**:
```html
<div class="wistia_embed wistia_async_VIDEOID" 
     data-resource-id="123">
</div>
<input type="hidden" id="webinar" value="optionalWebinarName" />
```

**Required URL Parameters**:
- `userId` - User ID
- `contactId` - Contact ID

**Tracking Data Sent**:
- Resource ID
- Percentage watched
- Video duration
- Wistia visitor key
- Event timestamp

---

## Usage Examples

### Complete Contact Form Setup
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load master script -->
  <script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/masterLoader.js"></script>
</head>
<body>

<!-- Form Container -->
<div id="contactFormContainer"
     data-campaign="12345"
     data-label="67890"
     data-redirect="https://yoursite.com/thank-you">
  
  <form id="contactForm">
    <input type="text" id="contactFirstName" placeholder="First Name" required />
    <input type="text" id="contactLastName" placeholder="Last Name" required />
    <input type="email" id="contactEmail" placeholder="Email" required />
    <input type="tel" id="contactPhone" placeholder="Phone" required />
    
    <label>
      <input type="checkbox" id="gdprConsent" required />
      I agree to GDPR and CCPA Terms
    </label>
    <div id="gdprError" class="error-message">You must agree to continue</div>
    
    <label>
      <input type="checkbox" id="marketingConsent" />
      Send me marketing emails
    </label>
    
    <button type="submit" id="contactFormSubmitBtn">
      <span class="btn-text">Submit</span>
      <span class="spinner" style="display:none;">⏳</span>
    </button>
  </form>
  
</div>

</body>
</html>
```

---

### CTA Button with Tracking
```html
<!-- Option 1: Simple Notification -->
<a href="https://yourproduct.com/buy" 
   id="ctaButton1"
   data-description="Purchase Button - Hero Section"
   target="_blank">
  Buy Now
</a>

<!-- Option 2: Advanced Tracking -->
<a href="#" 
   id="ctaTrackingButton1"
   data-cta-tracking-id="456"
   data-cta-tracking-location="Pricing Section">
  Start Free Trial
</a>
```

---

### Download Button with Tracking
```html
<!-- PDF Download with Location Tracking -->
<button id="downloadButton1"
        data-url="https://yoursite.com/ebook.pdf"
        data-file-name="free-ebook.pdf"
        data-download-location="Landing Page - Free Ebook">
  Download Free Ebook
</button>

<!-- Excel File with Fetch Method and Tracking -->
<button data-url="https://cdn.example.com/template.xlsx"
        data-file-name="template.xlsx"
        data-download-method="fetch"
        data-download-location="Resources Section - Excel Template">
  Download Template
</button>

<!-- Image Download with Tracking -->
<button id="downloadButton2"
        data-url="https://yoursite.com/infographic.png"
        data-file-name="infographic.png"
        data-download-location="Blog Post - Infographic Download">
  Download Infographic
</button>
```

---

### Video Tracking Setup
```html
<!-- Wistia Video -->
<script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>

<div class="wistia_responsive_padding">
  <div class="wistia_responsive_wrapper">
    <div class="wistia_embed wistia_async_abc123xyz" 
         data-resource-id="789">
    </div>
  </div>
</div>

<!-- Optional webinar identifier -->
<input type="hidden" id="webinar" value="Q1_Product_Launch" />
```

---

## Configuration Reference

### URL Parameters

All scripts expect these URL parameters:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `userId` | Yes | RapidFunnel user ID |
| `contactId` | Optional | Contact ID (for tracking) |
| `resourceId` | Optional | Resource ID (for forms) |

**Example URL**:
```
https://yourpage.com?userId=12345&resourceId=67890&contactId=11223
```

---

### Form Validation Settings

| Setting | Location | Description |
|---------|----------|-------------|
| Campaign ID | `data-campaign` | RapidFunnel campaign ID |
| Label ID | `data-label` | Contact tag/label ID |
| Redirect URL | `data-redirect` | Post-submission redirect |

---

### Button Tracking Settings

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-cta-tracking-id` | Resource ID for tracking | `"456"` |
| `data-cta-tracking-location` | Button location description | `"Hero CTA"` |
| `data-description` | Alternative location field | `"Download Section"` |

---

### Video Tracking Settings

| Setting | Purpose | Default |
|---------|---------|---------|
| `TRACK_INTERVAL_MS` | Tracking frequency | 15000 (15s) |
| `data-resource-id` | Resource identifier | Required |

---

## API Endpoints

### Contact Creation
```
POST https://my.rapidfunnel.com/landing/resource/create-custom-contact
```
**Parameters**: `firstName`, `lastName`, `email`, `phone`, `campaign`, `contactTag`, `resourceId`, `senderId`, `sentFrom`

### User Details
```
GET https://apiv2.rapidfunnel.com/v2/users-details/{userId}
```

### Contact Details
```
GET https://apiv2.rapidfunnel.com/v2/contact-details/{contactId}
```

### Resource Details
```
GET https://app.rapidfunnel.com/api/api/resources/resource-details/
```
**Parameters**: `userId`, `resourceId`, `contactId`

### CTA Tracking Email
```
POST https://app.rapidfunnel.com/api/mail/send-cta-email
```
**Body**: `legacyUserId`, `contactFirstName`, `contactLastName`, `contactPhoneNumber`, `contactEmail`, `ctaLocation`, `ctaPageName`

**Note**: This endpoint is also used by `assetDownload.js` to track download events

### Video Tracking
```
POST https://my.rapidfunnel.com/landing/resource/push-to-sqs
```
**Parameters**: `resourceId`, `contactId`, `userId`, `percentageWatched`, `mediaHash`, `duration`, `visitorKey`, `eventKey`, `delayProcess`, `webinar`

---

## Troubleshooting

### Form Issues

**Problem**: Form submits without validation
- ✅ Ensure `formValidation.js` loads before `contactForm.js`
- ✅ Check console for AJAX interception messages
- ✅ Verify GDPR checkbox has `id="gdprConsent"`

**Problem**: Contact not created
- ✅ Check `data-campaign` attribute is valid
- ✅ Verify validation passes (check console logs)
- ✅ Ensure `userId` is in URL

**Problem**: No redirect after submission
- ✅ Validate `data-redirect` URL format
- ✅ Check URL parameters are appended correctly

---

### Button Tracking Issues

**Problem**: Buttons don't track clicks
- ✅ Verify button ID starts with `ctaButton` or `ctaTrackingButton`
- ✅ Check `data-cta-tracking-id` exists (for buttonTracking.js)
- ✅ Ensure `userId` is in URL

**Problem**: Redirect doesn't work
- ✅ Check `href` attribute is set correctly
- ✅ Verify `target` attribute if using `_blank`

---

### Video Tracking Issues

**Problem**: Video tracking not working
- ✅ Ensure `contactId` and `userId` are in URL
- ✅ Verify `data-resource-id` is on video container
- ✅ Check Wistia API is loaded
- ✅ Confirm values are numeric

**Problem**: Multiple videos tracking to same resource
- ✅ Each video needs unique `data-resource-id`

---

### Footer Automation Issues

**Problem**: Profile data not populating
- ✅ Check `userId` is in URL
- ✅ Verify element IDs match API field names
- ✅ Check browser console for API errors

**Problem**: Social links not showing
- ✅ Ensure user has social URLs in RapidFunnel
- ✅ Element IDs must match: `facebookUrl`, `twitterUrl`, etc.

---

### Download Issues

**Problem**: Download button doesn't work
- ✅ Verify `data-url` attribute exists
- ✅ Check file URL is accessible
- ✅ Try `data-download-method="fetch"` for CORS issues

**Problem**: Download tracking not working
- ✅ Ensure `userId` is in URL parameters
- ✅ Check `data-download-location` attribute is set (optional but recommended)
- ✅ Verify console for API errors
- ✅ Confirm jQuery is loaded before assetDownload.js

**Problem**: Contact details not tracked
- ✅ Verify `contactId` is in URL parameters
- ✅ Check console for contact API errors
- ✅ Downloads will still work even if tracking fails

---

## Console Logging

All scripts include comprehensive console logging:

- **Form Validation**: `═══ VALIDATION...` messages with detailed field checks
- **Contact Creation**: `=== API REQUEST...` with payload details
- **Button Tracking**: Click events and API calls
- **Video Tracking**: `[Tracking]` prefixed messages

**Enable detailed logs**: Open browser Developer Tools (F12) → Console tab

---

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

**Requirements**:
- JavaScript enabled
- Cookies enabled (for Wistia tracking)
- jQuery 3.7.1+ (auto-loaded by masterLoader)

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify configuration attributes
3. Test with simple HTML example
4. Contact RapidFunnel support with console logs

---

## Version History

- **v1.0** - Initial release with all core modules
- Hosted on GitHub: `togetherwethrive/kajabi-code@main`

---

**Last Updated**: 2025
**Maintained By**: Together We Thrive Development Team
