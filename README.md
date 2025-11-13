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

This library provides eleven core JavaScript modules plus a master loader script and HTML template:

- **Form Validation & Contact Creation** - Two-step form submission with GDPR compliance
- **CTA Button Tracking** - Click tracking with email notifications
- **Button Tracking (Alternative)** - Advanced button tracking with resource management
- **Asset Downloads** - Flexible file download handling
- **Footer Automation** - Dynamic user profile data injection
- **Multiple Video Tracking** - Wistia video engagement analytics with progress tracking
- **Video Locking** - Sequential video unlocking based on watch completion
- **Show Button on Video Completion** - Display hidden buttons when last video reaches 90%
- **Master Loader** - Automatic dependency management
- **Footer Template** - Complete HTML example for footer implementation

---

## Installation

### Method 1: Master Loader (Recommended)

Add this single script tag to load all modules automatically:
```html
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/mainCodeInitializer.js"></script>
```

The master loader will:
- Load jQuery if not present
- Load all custom scripts in the correct order
- Handle dependencies automatically
- Include all video tracking and locking features

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
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/multipleVideoTracking.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/videoLocking.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/showButtonOnVideoCompletion.js"></script>
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

### 7. Multiple Video Tracking (`multipleVideoTracking.js`)

**Purpose**: Tracks Wistia video engagement and sends analytics to RapidFunnel for multiple videos on a page.

**Features**:
- Tracks watch percentage every 15 seconds
- Sends data on play, pause, and end events
- Supports multiple videos on one page
- Each video tracked independently
- Requires `data-resource-id` on video container
- Prevents duplicate tracking submissions
- Comprehensive console logging with `[Tracking]` prefix

**Video Markup**:
```html
<div class="wistia_embed wistia_async_VIDEOID"
     data-resource-id="123">
</div>
<input type="hidden" id="webinar" value="optionalWebinarName" />
```

**Required URL Parameters**:
- `userId` - User ID (must be numeric)
- `contactId` - Contact ID (must be numeric)

**Tracking Data Sent**:
- Resource ID
- Percentage watched
- Video duration
- Media hash (Wistia video ID)
- Wistia visitor key
- Event key
- Webinar identifier (optional)
- Delay process flag

**How It Works**:
1. Validates URL parameters on page load
2. Initializes Wistia API queue
3. Binds to all videos with `_all` selector
4. Tracks progress every 15 seconds while playing
5. Sends final 100% on video end
6. Stops tracking when video is paused

---

### 8. Video Locking (`videoLocking.js`)

**Purpose**: Sequential video unlocking system that requires users to watch videos in order.

**Features**:
- Locks all videos except the first one
- Unlocks next video when previous reaches 90% completion
- Visual lock overlay with icon and message
- Stores progress in localStorage
- Displays "Unlocked" badges on completed videos
- Supports multiple videos on one page
- Periodic checking for dynamically added videos
- Works seamlessly with multipleVideoTracking.js

**Key Configuration**:
```javascript
UNLOCK_THRESHOLD: 90     // % watched to unlock next video
CHECK_INTERVAL: 2000     // Check for new videos every 2s
STORAGE_KEY: 'kajabi_video_progress'
```

**Video Markup** (same as tracking):
```html
<div class="wistia_embed wistia_async_VIDEOID"
     data-resource-id="123">
</div>
```

**Required URL Parameters**:
- `userId` - User ID (must be numeric)
- `contactId` - Contact ID (must be numeric)

**Visual Features**:
- Dark overlay with lock icon on locked videos
- Portuguese messages: "Vídeo Bloqueado" / "Complete o vídeo anterior"
- Green "Desbloqueado" badge on unlocked videos
- Smooth transitions and hover effects
- Responsive design with backdrop blur

**How It Works**:
1. Scans page for all Wistia videos with `data-resource-id`
2. Checks localStorage for previously watched videos
3. Locks all videos except first and previously completed
4. Monitors video progress via Wistia API
5. Unlocks next video when threshold reached
6. Persists progress across page reloads

---

### 9. Show Button on Video Completion (`showButtonOnVideoCompletion.js`)

**Purpose**: Displays a hidden button when the last video on the page reaches 90% completion.

**Features**:
- Automatically identifies the last video on the page
- Watches video progress in real-time
- Shows button at exactly 90% completion
- Works with buttons that have `display: none`
- Comprehensive logging with `[Button Display]` prefix
- Integrates with Wistia API

**Button Markup**:
```html
<button id="videoButton" style="display: none;">
  Continue to Next Lesson
</button>
```

**How It Works**:
1. Collects all Wistia videos on page load
2. Identifies the last video in DOM order
3. Binds to video play and timechange events
4. Checks progress every second while playing
5. Sets button display to 'block' at 90%
6. Stops checking after button is shown

**Use Cases**:
- Course progression buttons
- Next lesson navigation
- Call-to-action reveals
- Certification unlock buttons
- Content gate releases

**Integration Example**:
```html
<!-- Video -->
<div class="wistia_embed wistia_async_abc123"></div>

<!-- Hidden button that will appear at 90% -->
<button id="videoButton" style="display: none;" class="next-lesson-btn">
  Proceed to Next Module
</button>

<!-- Scripts -->
<script src="multipleVideoTracking.js"></script>
<script src="showButtonOnVideoCompletion.js"></script>
```

---

### 10. Master Loader (`mainCodeInitializer.js`)

**Purpose**: Centralized script loader that automatically loads all dependencies in the correct order.

**Features**:
- Detects and loads jQuery if not present
- Loads all custom scripts sequentially
- Prevents loading conflicts
- Comprehensive console logging
- Error handling for failed script loads
- Uses jsDelivr CDN for reliable delivery

**Scripts Loaded (in order)**:
1. jQuery 3.7.1 (if not present)
2. showButtonOnVideoCompletion.js
3. formValidation.js
4. assetDownload.js
5. buttonTracking.js
6. ctaButtonNotification.js
7. footerAutomation.js
8. multipleVideoTracking.js
9. videoLocking.js

**Usage**:
```html
<!-- Single line to load everything -->
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/mainCodeInitializer.js"></script>
```

**Console Output**:
```
Loading jQuery...
✓ jQuery loaded successfully
Starting to load custom scripts...
✓ Loaded: showButtonOnVideoCompletion.js
✓ Loaded: formValidation.js
✓ Loaded: assetDownload.js
...
All scripts loaded!
```

---

### 11. Footer Template (`footer-template.html`)

**Purpose**: Complete HTML template demonstrating footerAutomation.js implementation.

**Features**:
- Fully styled responsive footer
- Profile section with image and name
- Contact information section
- Social media links
- Custom booking link integration
- Loading state animations
- Font Awesome icons
- Google Fonts integration
- Gradient background design

**Includes**:
- Modern CSS with flexbox and grid
- Mobile-responsive design
- Hover effects and transitions
- Event listener examples
- Loading state management
- Complete working example

**Elements Included**:
```html
<!-- Profile -->
<img id="profileImage" />
<span id="firstName"></span>
<span id="lastName"></span>

<!-- Contact -->
<a id="email"></a>
<a id="phoneNumber"></a>

<!-- Booking -->
<a id="customBookingLink"></a>

<!-- Social Links -->
<a id="facebookUrl"></a>
<a id="twitterUrl"></a>
<a id="linkedinUrl"></a>
<a id="instagramUrl"></a>
<a id="youtubeUrl"></a>
```

**How to Use**:
1. Copy the HTML template
2. Customize styles to match your brand
3. Add `?userId=YOUR_ID` to URL
4. Footer automatically populates with user data

---

## Usage Examples

### Complete Contact Form Setup
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load master script -->
  <script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/mainCodeInitializer.js"></script>
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

### Sequential Video Locking Setup
```html
<!-- Wistia API -->
<script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>

<!-- Video Locking & Tracking Scripts -->
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/multipleVideoTracking.js"></script>
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/videoLocking.js"></script>

<!-- Video 1 - Always unlocked -->
<div class="wistia_embed wistia_async_video1id"
     data-resource-id="101">
</div>

<!-- Video 2 - Locked until video 1 reaches 90% -->
<div class="wistia_embed wistia_async_video2id"
     data-resource-id="102">
</div>

<!-- Video 3 - Locked until video 2 reaches 90% -->
<div class="wistia_embed wistia_async_video3id"
     data-resource-id="103">
</div>

<!-- URL: ?userId=123&contactId=456 -->
```

---

### Show Button on Video Completion
```html
<!-- Wistia API -->
<script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>

<!-- Button Display Script -->
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/showButtonOnVideoCompletion.js"></script>

<!-- Course videos -->
<div class="wistia_embed wistia_async_lesson1"></div>
<div class="wistia_embed wistia_async_lesson2"></div>
<div class="wistia_embed wistia_async_lesson3"></div>

<!-- Hidden button that shows when last video reaches 90% -->
<button id="videoButton" style="display: none;" onclick="window.location.href='/next-module'">
  Continue to Next Module →
</button>

<style>
  #videoButton {
    padding: 15px 30px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
    margin-top: 20px;
  }
  #videoButton:hover {
    background: #45a049;
  }
</style>
```

---

### Complete Course Page with All Video Features
```html
<!DOCTYPE html>
<html>
<head>
  <title>Course Module 1</title>
</head>
<body>

  <!-- Course Content -->
  <h1>Module 1: Introduction</h1>

  <!-- Wistia API -->
  <script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>

  <!-- All Video Scripts via Master Loader -->
  <script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/mainCodeInitializer.js"></script>

  <!-- Lesson 1 (Always available) -->
  <h2>Lesson 1: Getting Started</h2>
  <div class="wistia_embed wistia_async_abc123" data-resource-id="101"></div>

  <!-- Lesson 2 (Locked) -->
  <h2>Lesson 2: Core Concepts</h2>
  <div class="wistia_embed wistia_async_def456" data-resource-id="102"></div>

  <!-- Lesson 3 (Locked) -->
  <h2>Lesson 3: Advanced Techniques</h2>
  <div class="wistia_embed wistia_async_ghi789" data-resource-id="103"></div>

  <!-- Hidden completion button -->
  <button id="videoButton" style="display: none;">
    Complete Module & Continue →
  </button>

  <!-- URL: https://yoursite.com/module-1?userId=123&contactId=456 -->

</body>
</html>
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

### Video Locking Settings

| Setting | Purpose | Default |
|---------|---------|---------|
| `UNLOCK_THRESHOLD` | % watched to unlock next | 90 |
| `CHECK_INTERVAL` | Check for new videos | 2000ms |
| `STORAGE_KEY` | localStorage key name | `'kajabi_video_progress'` |
| `data-resource-id` | Video identifier | Required |

**Customizing Unlock Threshold**:
To change the unlock percentage, edit `videoLocking.js`:
```javascript
const CONFIG = {
  UNLOCK_THRESHOLD: 75, // Change to 75%
  // ...
};
```

---

### Button Display Settings

| Setting | Purpose | Default |
|---------|---------|---------|
| Button ID | Required button identifier | `'videoButton'` |
| Check Interval | Progress check frequency | 1000ms (1s) |
| Trigger Threshold | % watched to show button | 90% |

**Customizing Button Behavior**:
The script automatically finds the LAST video on the page. To target a different video, modify the HTML structure or edit the script.

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
- ✅ Check console for `[Tracking]` messages

**Problem**: Multiple videos tracking to same resource
- ✅ Each video needs unique `data-resource-id`

---

### Video Locking Issues

**Problem**: All videos are unlocked
- ✅ Check `userId` and `contactId` are in URL and numeric
- ✅ Verify videoLocking.js is loaded after Wistia API
- ✅ Ensure `data-resource-id` on each video container
- ✅ Check console for `[VideoLock]` messages

**Problem**: Videos remain locked after completion
- ✅ Clear localStorage: `localStorage.removeItem('kajabi_video_progress')`
- ✅ Check if previous video reached 90% threshold
- ✅ Verify Wistia events are firing (check console)

**Problem**: Lock overlay not visible
- ✅ Check if custom CSS is overriding lock styles
- ✅ Verify z-index isn't being overridden
- ✅ Inspect element to see if overlay exists in DOM

**Problem**: Progress not persisting across reloads
- ✅ Check browser localStorage is enabled
- ✅ Verify not in incognito/private mode
- ✅ Check console for localStorage errors

---

### Button Display Issues

**Problem**: Button not showing at 90%
- ✅ Verify button has ID `videoButton`
- ✅ Check button initially has `display: none`
- ✅ Ensure showButtonOnVideoCompletion.js is loaded
- ✅ Check console for `[Button Display]` messages
- ✅ Verify Wistia videos are detected

**Problem**: Button shows immediately
- ✅ Check if button doesn't have `display: none` initially
- ✅ Verify JavaScript isn't setting display elsewhere
- ✅ Check CSS specificity isn't overriding

**Problem**: Wrong video triggers button
- ✅ Script watches LAST video only (by DOM order)
- ✅ Reorder videos in HTML if needed
- ✅ Check console to see which video is identified as last

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
- **Video Tracking**: `[Tracking]` prefixed messages with percentage updates
- **Video Locking**: `[VideoLock]` prefixed messages with lock/unlock events
- **Button Display**: `[Button Display]` prefixed messages with video detection
- **Master Loader**: `✓` and `✗` symbols for script load status

**Enable detailed logs**: Open browser Developer Tools (F12) → Console tab

**Example Console Output**:
```
[VideoLock] 🎬 Video locking system initialized
[VideoLock] Found 3 videos
[VideoLock] 🔒 Locked video #2 (resourceId: 102)
[VideoLock] 🔒 Locked video #3 (resourceId: 103)
[Tracking] ▶️ Video started
[Tracking] Sending data for video 101: 25% watched
[VideoLock] 🔓 Unlocked video #2 (resourceId: 102)
[Button Display] Watching last video: abc123xyz
[Button Display] Last video started playing
[Button Display] ✅ Button is now visible!
```

---

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

**Requirements**:
- JavaScript enabled
- Cookies enabled (for Wistia tracking)
- jQuery 3.7.1+ (auto-loaded by mainCodeInitializer)

---

## Script Integration & Best Practices

### Video Script Compatibility

The three video scripts work together seamlessly:

1. **multipleVideoTracking.js** - Tracks all video engagement
2. **videoLocking.js** - Locks videos based on completion
3. **showButtonOnVideoCompletion.js** - Shows button when done

**Recommended Loading Order**:
```html
<!-- Wistia first -->
<script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>

<!-- Then video scripts (order doesn't matter for these) -->
<script src="multipleVideoTracking.js"></script>
<script src="videoLocking.js"></script>
<script src="showButtonOnVideoCompletion.js"></script>
```

**Or use Master Loader** (recommended):
```html
<script src="mainCodeInitializer.js"></script>
```

### Course Platform Implementation

For a complete course platform, use this structure:

**Module Page**:
- Multiple videos with sequential locking
- Progress tracking for analytics
- Completion button to advance

**Implementation**:
```html
<div class="module-content">
  <!-- Videos with unique resource IDs -->
  <div class="wistia_embed wistia_async_vid1" data-resource-id="101"></div>
  <div class="wistia_embed wistia_async_vid2" data-resource-id="102"></div>
  <div class="wistia_embed wistia_async_vid3" data-resource-id="103"></div>

  <!-- Completion button -->
  <button id="videoButton" style="display: none;">Next Module</button>
</div>
```

### Performance Tips

1. **Use Master Loader**: One script loads everything efficiently
2. **Minimize Console Logs**: In production, consider removing console logs
3. **localStorage Management**: Clear old progress data periodically
4. **Wistia Optimization**: Use Wistia's async loading
5. **CDN Usage**: jsDelivr provides fast, global content delivery

### Security Considerations

1. **URL Parameters**: Always validate userId and contactId server-side
2. **API Keys**: Never expose sensitive API keys in frontend code
3. **GDPR Compliance**: Form validation enforces consent requirements
4. **Data Privacy**: Video progress stored locally in browser
5. **Contact Data**: Transmitted securely via HTTPS endpoints

### Common Patterns

**Pattern 1: Course with Sequential Lessons**
- Use videoLocking.js for progression
- Track with multipleVideoTracking.js
- Show completion button with showButtonOnVideoCompletion.js

**Pattern 2: Webinar with Downloads**
- Track video engagement
- Show download button at 90%
- Track downloads with assetDownload.js

**Pattern 3: Lead Generation**
- Form validation with GDPR consent
- Contact creation and tracking
- CTA button tracking for conversions
- Footer with user profile data

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify configuration attributes
3. Test with simple HTML example
4. Contact RapidFunnel support with console logs

---

## Version History

- **v1.0** - Initial release with core modules (forms, tracking, footer)
- **v2.0** - Added video tracking and asset download features
- **v3.0** - Added video locking, button completion trigger, and master loader
  - multipleVideoTracking.js - Enhanced video engagement tracking
  - videoLocking.js - Sequential video unlocking system
  - showButtonOnVideoCompletion.js - Dynamic button display
  - mainCodeInitializer.js - Master script loader
  - footer-template.html - Complete footer example
- Hosted on GitHub: `togetherwethrive/kajabi-code@main`

---

## File Inventory

### JavaScript Modules (11)
1. `formValidation.js` - Form field validation with GDPR
2. `contactForm.js` - Contact creation API integration
3. `ctaButtonNotification.js` - Simple CTA click tracking
4. `buttonTracking.js` - Advanced button tracking with resources
5. `assetDownload.js` - File download with tracking
6. `footerAutomation.js` - Dynamic user profile population
7. `multipleVideoTracking.js` - Wistia video analytics
8. `videoLocking.js` - Sequential video unlocking
9. `showButtonOnVideoCompletion.js` - Button reveal on video completion
10. `mainCodeInitializer.js` - Master dependency loader
11. *(contactForm.js dynamically loaded after validation)*

### HTML Templates (1)
1. `footer-template.html` - Complete footer implementation example

### Total Files: 12

---

**Last Updated**: January 2025
**Maintained By**: Together We Thrive Development Team
**Repository**: https://github.com/togetherwethrive/kajabi-code
