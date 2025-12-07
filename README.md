# Kajabi Code Library - Complete Documentation

A comprehensive collection of JavaScript utilities for building interactive web pages with form handling, analytics tracking, user data management, and content delivery features.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Script Descriptions](#script-descriptions)
4. [Usage Examples](#usage-examples)
5. [Test Pages & Testing Flow](#test-pages--testing-flow)
6. [Configuration Reference](#configuration-reference)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This library provides twelve core JavaScript modules plus a master loader script and HTML template:

- **Form Validation & Contact Creation** - Two-step form submission with GDPR compliance
- **CTA Button Tracking** - Click tracking with email notifications
- **Button Tracking (Alternative)** - Advanced button tracking with resource management
- **Asset Downloads** - Flexible file download handling
- **Footer Automation** - Dynamic user profile data injection
- **Multiple Video Tracking** - Wistia video engagement analytics with progress tracking
- **Video Locking** - Sequential video unlocking based on watch completion
- **Show Button on Video Completion** - Display hidden buttons when last video reaches 90%
- **Back Button Navigation** - Automatic back button for users coming from another page
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
- Automatically passes URL parameters (userId, contactId, resourceId) to button destinations

**Button Markup**:
```html
<a href="https://destination.com"
   id="ctaButton1"
   data-description="Download Free Guide"
   target="_blank">
  Click Here
</a>
```

**URL Parameter Handling**:
The script automatically processes button href URLs and passes parameters from the current page URL. It supports three formats:

1. **Square Bracket Placeholders** (e.g., `[user-id]`, `[contactId]`)
2. **Curly Brace Placeholders** (e.g., `{userId}`, `{contactId}`)
3. **Query Parameters** (auto-appended if no placeholders found)

**Examples**:
```html
<!-- Path-based format with square brackets -->
<a href="https://thrivewithtwtapp.com/res/66980/[user-id]/[contactId]" id="ctaButton1">
  Next Page
</a>
<!-- Result: https://thrivewithtwtapp.com/res/66980/123/456 -->

<!-- Query parameter format with curly braces -->
<a href="https://example.com/page?user={userId}&contact={contactId}" id="ctaButton2">
  Continue
</a>
<!-- Result: https://example.com/page?user=123&contact=456 -->

<!-- No placeholders - parameters auto-appended -->
<a href="https://example.com/page" id="ctaButton3">
  Go
</a>
<!-- Result: https://example.com/page?userId=123&contactId=456&resourceId=789 -->
```

**How It Works**:
1. Button clicked → Captures redirect URL and target
2. Fetches contact details (if `contactId` in URL)
3. Sends notification email
4. Processes URL with parameters (replaces placeholders or appends query params)
5. Redirects user to intended destination

---

### 4. Button Tracking (`buttonTracking.js`)

**Purpose**: Advanced CTA tracking with resource URL management and click tracking.

**Features**:
- Fetches resource URLs from API
- Updates button hrefs dynamically
- Tracks button clicks with email notifications
- Prevents duplicate submissions
- Graceful error handling
- Automatically passes URL parameters (userId, contactId, resourceId) to button destinations

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

**URL Parameter Handling**:
Like `ctaButtonNotification.js`, this script automatically processes button URLs fetched from the API and passes parameters. It supports three formats:

1. **Square Bracket Placeholders** (e.g., `[user-id]`, `[userId]`, `[contactId]`)
2. **Curly Brace Placeholders** (e.g., `{userId}`, `{contactId}`)
3. **Query Parameters** (auto-appended if no placeholders found)

**Examples**:
```html
<!-- API returns: https://thrivewithtwtapp.com/res/66980/[user-id]/[contactId] -->
<!-- Button href becomes: https://thrivewithtwtapp.com/res/66980/123/456 -->

<!-- API returns: https://example.com/resource?id={resourceId} -->
<!-- Button href becomes: https://example.com/resource?id=789 -->

<!-- API returns: https://example.com/page -->
<!-- Button href becomes: https://example.com/page?userId=123&contactId=456&resourceId=789 -->
```

**Workflow**:
1. Page loads → Fetches resource URLs for all tracking buttons
2. Processes URLs with parameters (replaces placeholders or appends query params)
3. Updates button `href` attributes with processed tracking URLs
4. On click → Fetches contact data
5. Sends tracking email
6. Redirects to tracked URL

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

### 10. Back Button Navigation (`backButton.js`)

**Purpose**: Automatically displays a floating back button for users who arrived from another page.

**Features**:
- Detects document referrer to determine if user came from another page
- Creates a styled floating back button
- Excludes search engines and social media referrers
- Configurable position and styling
- Option to show only for same-domain navigation
- Responsive design for mobile and desktop
- One-click navigation to previous page

**Configuration Options**:
```javascript
const CONFIG = {
  BUTTON_POSITION: 'bottom-left', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
  BUTTON_TEXT: '← Back',
  BUTTON_COLOR: '#291d5c',
  BUTTON_TEXT_COLOR: '#fff',
  SHOW_ONLY_INTERNAL: false, // Only show for same-domain referrers
  ALLOWED_DOMAINS: [], // Whitelist specific domains
  EXCLUDED_REFERRERS: ['google.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com']
};
```

**When the Button Shows**:
- ✅ User clicked a link from your site
- ✅ User clicked a link from another site (if not excluded)
- ✅ User came from email link or bookmark with referrer
- ❌ User typed URL directly
- ❌ User came from search engine (Google, Bing, etc.)
- ❌ User came from social media (Facebook, Twitter, LinkedIn, Instagram)
- ❌ User opened from bookmark with no referrer

**Use Cases**:
- Course modules - Easy navigation back to course index
- Multi-page forms - Return to previous step
- Product pages - Back to product catalog
- Blog posts - Return to blog index
- Video series - Navigate between lessons

**Customization Examples**:

**Example 1: Bottom-right position with custom color**
```javascript
// Edit backButton.js configuration
const CONFIG = {
  BUTTON_POSITION: 'bottom-right',
  BUTTON_COLOR: '#10b981', // Green
  BUTTON_TEXT: '⬅ Previous Page'
};
```

**Example 2: Show only for internal navigation**
```javascript
const CONFIG = {
  SHOW_ONLY_INTERNAL: true, // Only show when navigating within your site
  BUTTON_POSITION: 'top-left'
};
```

**Example 3: Allow specific external domains**
```javascript
const CONFIG = {
  ALLOWED_DOMAINS: ['yourdomain.com', 'partner-site.com'],
  EXCLUDED_REFERRERS: [] // Don't exclude any
};
```

**How It Works**:
1. Script checks `document.referrer` on page load
2. Validates referrer against excluded domains
3. If valid referrer found → Creates floating back button
4. Button click triggers `window.history.back()`
5. User returns to previous page

**Styling**:
The button is styled with:
- Fixed position (stays visible while scrolling)
- Smooth hover animations
- Shadow effects for depth
- Responsive sizing for mobile
- High z-index (9998) to stay above content

**Integration Example**:
```html
<!-- Automatic with master loader -->
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/mainCodeInitializer.js"></script>

<!-- Or load individually -->
<script src="https://cdn.jsdelivr.net/gh/togetherwethrive/kajabi-code@main/backButton.js"></script>
```

---

### 11. Master Loader (`mainCodeInitializer.js`)

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
10. backButton.js

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

### 12. Footer Template (`footer-template.html`)

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

## Test Pages & Testing Flow

### Overview

Two comprehensive test pages are included to validate all functionality in a controlled environment:

1. **previous-page.html** - Starting page (resourceId: 66949)
2. **test-page.html** - Destination page (resourceId: 66950)

These pages demonstrate the complete integration of all scripts and provide a testing environment for debugging.

---

### Test Page Architecture

Both test pages include:
- ✅ **2-3 Wistia videos** with sequential locking
- ✅ **Video completion button** (#videoButton)
- ✅ **Tracking button** (#ctaTrackingButton1 with data-cta-tracking-id="66950")
- ✅ **Notification button** (#ctaButton1)
- ✅ **Contact form** with full validation and GDPR consent
- ✅ **Footer template** with user profile automation
- ✅ **Back navigation buttons** (appear after last video completion)
- ✅ **localStorage management tools** (clear progress/cache)
- ✅ **Console debug logging** for all systems

---

### Test Flow Diagram

```
┌─────────────────────────────────────────┐
│ previous-page.html (resourceId: 66949)  │
│ - 2 videos (66949001, 66949002)         │
│ - Test all features                     │
└──────────────┬──────────────────────────┘
               │
               │ Click tracking/notification/
               │ completion button
               ↓
┌─────────────────────────────────────────┐
│ test-page.html (resourceId: 66950)      │
│ - 3 videos (10001, 10002, 10003)        │
│ - Test all features                     │
└──────────────┬──────────────────────────┘
               │
               │ Click "Previous Lesson" back button
               │ (appears after last video completion)
               ↓
┌─────────────────────────────────────────┐
│ Back to previous-page.html              │
└─────────────────────────────────────────┘
```

---

### Getting Started with Test Pages

**Step 1: Start with Previous Page**

Open: `previous-page.html?resourceId=66949&userId=308889&contactId=20274267`

This initializes the test environment with the required parameters.

**Step 2: Test Features on Previous Page**

1. **Video Locking**
   - First video (66949001) should be unlocked
   - Second video (66949002) should be locked with overlay
   - Watch first video to 90% → second video unlocks

2. **Video Completion Button**
   - Hidden initially
   - Appears when last video reaches 90%
   - Click to navigate to test-page.html

3. **Tracking Button**
   - Logs activity with trackingId 66950
   - Passes parameters to next page
   - Check console for [Button Tracking] logs

4. **Notification Button**
   - Sends email notification
   - Navigates to test-page.html
   - Check console for [CTA Notification] logs

5. **Contact Form**
   - Fill all required fields
   - Check/uncheck GDPR consent
   - Submit and watch validation logs
   - Check console for VALIDATION SCRIPT logs

6. **Footer Automation**
   - Profile image loads from API
   - User name, email, phone populate
   - Social links appear (if available)
   - Booking link appears (if available)

**Step 3: Navigate to Test Page**

Click any navigation button to go to test-page.html. Parameters should be maintained in URL.

**Step 4: Test Features on Test Page**

Same features as previous page, but with 3 videos instead of 2:
- Videos: 10001 (unlocked), 10002 (locked), 10003 (locked)
- Video locking sequence: Watch video 1 → unlocks video 2 → watch video 2 → unlocks video 3
- Completion button appears after video 3 reaches 90%

**Step 5: Test Back Button**

1. Watch the last video (video 3) to 90% or end
2. Two "Previous Lesson" buttons appear:
   - One at top of page
   - One above footer
3. Click either button → navigates back to previous-page.html
4. Check console for [Back Button] logs

---

### Required URL Parameters

Both test pages require these parameters:

| Parameter | Value (for testing) | Purpose |
|-----------|---------------------|---------|
| `userId` | `308889` | User identification for API calls |
| `contactId` | `20274267` | Contact tracking and profile loading |
| `resourceId` | `66949` (previous) or `66950` (test) | Page resource identification |

**Quick Links**:
- Previous Page: `previous-page.html?resourceId=66949&userId=308889&contactId=20274267`
- Test Page: `test-page.html?resourceId=66950&userId=308889&contactId=20274267`

---

### Console Debugging

Both test pages include comprehensive console logging. Open Developer Tools (F12) → Console to see:

**Video Locking Logs** (`[VideoLock]`):
```
[VideoLock] Found 3 Wistia container(s) in DOM
[VideoLock] Total videos with valid resourceId: 3
[VideoLock] Processing video #0 (resourceId: 10001)
[VideoLock] 🔓 Removing overlay for resourceId: 10002
```

**Back Button Logs** (`[Back Button]`):
```
[Back Button] Script loaded
[Back Button] ✓ Wistia video detected: abc123
[Back Button] ✓ Watching last video: abc123 (3 total videos)
[Back Button] Last video reached 90% - showing buttons
[Back Button] ✅ Both buttons are now visible!
```

**Button Display Logs** (`[Button Display]`):
```
[Button Display] Video detected: abc123
[Button Display] ✓ Identified last video: abc123 (3 total videos on page)
[Button Display] Video abc123 started playing - monitoring progress
[Button Display] Progress check: 92%
[Button Display] 90% threshold reached - showing button
[Button Display] ✅ Button is now visible!
```

**Button Tracking Logs** (`[Button Tracking]`):
```
[Button Tracking] Processing button: ctaTrackingButton1
[Button Tracking] Processing URL: test-page.html?resourceId=66950&userId=[userId]
[Button Tracking] Processed URL: test-page.html?resourceId=66950&userId=308889&contactId=20274267
```

**Footer Automation Logs**:
```
User details fetched successfully
Profile populated for user: 308889
```

**Form Validation Logs** (`VALIDATION SCRIPT`):
```
═══════════════════════════════════════════════════
VALIDATION STARTED
═══════════════════════════════════════════════════
✓ First Name: PASSED (John)
✓ Last Name: PASSED (Doe)
✓ Email: PASSED (john@example.com)
✓ Phone: PASSED (1234567890)
✅ GDPR: PASSED (checked)
✅✅✅ VALIDATION PASSED ✅✅✅
```

---

### LocalStorage Management

Both test pages include buttons to manage cached data:

**Clear Video Progress** - Removes `kajabi_video_progress`
```javascript
// Resets all video unlock states
localStorage.removeItem('kajabi_video_progress');
```

**Clear Button Cache** - Removes `kajabi_button_unlocked`
```javascript
// Resets video completion button state
localStorage.removeItem('kajabi_button_unlocked');
```

**Clear All** - Removes all cached data
```javascript
// Complete reset for fresh testing
localStorage.removeItem('kajabi_video_progress');
localStorage.removeItem('kajabi_button_unlocked');
```

**When to Clear Cache**:
- Starting fresh testing session
- Video unlock states not behaving correctly
- Completion button not hiding after page reload
- Testing specific unlock scenarios

---

### URL Parameter Passing Test

Both test pages validate that parameters are correctly passed between pages:

**Test Scenario 1: Tracking Button**
```html
<!-- On previous-page.html -->
<button id="ctaTrackingButton1"
        data-cta-tracking-id="66950"
        onclick="window.location.href='test-page.html?resourceId=66950&userId=[userId]&contactId=[contactId]';">
  → Go to Next Page (Tracking)
</button>

<!-- Expected behavior: -->
<!-- Current URL: previous-page.html?userId=308889&contactId=20274267 -->
<!-- Result URL: test-page.html?resourceId=66950&userId=308889&contactId=20274267 -->
```

**Test Scenario 2: Notification Button**
```html
<!-- Same parameter passing as tracking button -->
<!-- Sends email notification, then navigates with parameters -->
```

**Test Scenario 3: Video Completion Button**
```html
<!-- Shows when last video reaches 90% -->
<!-- Parameters automatically processed by showButtonOnVideoCompletion.js -->
```

**Validation Checklist**:
- [ ] Parameters appear in browser address bar
- [ ] Console shows processed URLs with actual values
- [ ] Footer loads user data from userId
- [ ] Video tracking sends correct resourceId
- [ ] Form submission includes resourceId

---

### Feature Test Checklist

Use this checklist to validate all functionality:

#### Video Locking System
- [ ] First video unlocked on page load
- [ ] Subsequent videos show lock overlay
- [ ] Lock overlay displays "Video Locked" message
- [ ] Lock overlay shows lock icon
- [ ] Watching video to 90% unlocks next video
- [ ] Unlocked badge appears on completed videos
- [ ] Progress persists after page reload
- [ ] Clear progress button resets all locks

#### Video Completion Button
- [ ] Button hidden on page load
- [ ] Last video identified correctly (check console)
- [ ] Button appears when last video reaches 90%
- [ ] Button appears when last video ends
- [ ] Button click navigates with parameters
- [ ] Button state cached in localStorage
- [ ] Button remains visible after page reload

#### Back Navigation Buttons
- [ ] Buttons hidden on page load
- [ ] No buttons if no video completion
- [ ] Top button appears after last video 90%
- [ ] Bottom button appears after last video 90%
- [ ] Both buttons use "Previous Lesson" text
- [ ] Clicking button navigates back in history
- [ ] Buttons styled consistently

#### Tracking Button
- [ ] Button has data-cta-tracking-id attribute
- [ ] Click logs activity to console
- [ ] Email notification sent (check API)
- [ ] Navigation includes all URL parameters
- [ ] Placeholders replaced correctly

#### Notification Button
- [ ] Button sends notification email
- [ ] Click logs to console
- [ ] Navigation includes all URL parameters
- [ ] Works without contactId (graceful degradation)

#### Contact Form
- [ ] Required field validation works
- [ ] Email format validation works
- [ ] GDPR checkbox required
- [ ] Error messages display correctly
- [ ] Validation blocks API call until passed
- [ ] Console shows detailed validation logs
- [ ] Success triggers contactForm.js load

#### Footer Automation
- [ ] Profile image loads from API
- [ ] First and last name populate
- [ ] Email link works with mailto:
- [ ] Phone link works with tel:
- [ ] Booking link appears if available
- [ ] Social links appear if available
- [ ] Missing data gracefully handled

---

### Testing Different Scenarios

**Scenario 1: New User (Fresh State)**
1. Clear all localStorage
2. Open previous-page.html with parameters
3. Only first video should be unlocked
4. Watch videos in sequence
5. Verify progressive unlocking

**Scenario 2: Returning User (Cached Progress)**
1. Complete first video
2. Reload page
3. First video should have "Unlocked" badge
4. Second video should be unlocked
5. Progress should persist

**Scenario 3: Missing Parameters**
1. Open page without userId
2. Video locking should be disabled (check console)
3. Tracking features should gracefully fail
4. Footer should show default/loading state

**Scenario 4: Back Button Flow**
1. Start on previous-page.html
2. Navigate to test-page.html via button
3. Complete last video on test-page.html
4. Back buttons should appear
5. Click back button → returns to previous-page.html
6. Browser back button should also work

**Scenario 5: Parameter Passing**
1. Start with full parameters
2. Click tracking button → verify parameters passed
3. Check browser address bar
4. Check footer loads correct user data
5. Check console for processed URLs

---

### Common Issues & Solutions

**Issue**: Videos don't lock
- **Check**: Console for [VideoLock] messages
- **Check**: userId parameter is present and numeric
- **Solution**: Add ?userId=308889 to URL

**Issue**: Back button doesn't appear
- **Check**: Console for [Back Button] messages
- **Check**: Last video reached 90%
- **Check**: Wistia API loaded
- **Solution**: Wait for video completion, check console logs

**Issue**: Completion button doesn't show
- **Check**: Console for [Button Display] messages
- **Check**: Button has id="videoButton"
- **Check**: Button has display: none initially
- **Solution**: Verify last video reaches 90%

**Issue**: Footer doesn't populate
- **Check**: userId parameter present
- **Check**: Console for API errors
- **Check**: Network tab for API call
- **Solution**: Verify userId=308889 in URL

**Issue**: Parameters not passing
- **Check**: Console for processed URLs
- **Check**: Button href or onclick attribute
- **Solution**: Verify button scripts loaded (buttonTracking.js, ctaButtonNotification.js, showButtonOnVideoCompletion.js)

---

### Files Included

**Test Page Files**:
- `previous-page.html` - Starting test page (2 videos)
- `test-page.html` - Destination test page (3 videos)

**Required Scripts** (loaded by test pages):
- `videoLocking.js`
- `showButtonOnVideoCompletion.js`
- `backButton.js`
- `buttonTracking.js`
- `ctaButtonNotification.js`
- `footerAutomation.js`
- `formValidation.js`
- jQuery 3.6.0
- Font Awesome 4.7.0
- Wistia E-v1.js

**All scripts and dependencies are loaded automatically on test pages.**

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

### URL Parameter Passing in Buttons

Both `buttonTracking.js` and `ctaButtonNotification.js` automatically pass URL parameters to button destinations. This ensures user context is maintained across page navigation.

**Supported Placeholder Formats**:

| Format | Placeholders | Use Case |
|--------|-------------|----------|
| Square Brackets | `[user-id]`, `[userId]`, `[contactId]`, `[resourceId]` | Path-based URLs |
| Curly Braces | `{userId}`, `{contactId}`, `{resourceId}` | Query parameter URLs |
| Auto-append | No placeholders needed | Automatic query string addition |

**Real-World Examples**:

**Example 1: Path-based URL** (like your requirement)
```html
<!-- Button markup -->
<a href="https://thrivewithtwtapp.com/res/66980/[user-id]/[contactId]" id="ctaButton1">
  Next Module
</a>

<!-- Current page URL: ?userId=123&contactId=456 -->
<!-- Result: https://thrivewithtwtapp.com/res/66980/123/456 -->
```

**Example 2: Mixed placeholders in query string**
```html
<a href="https://example.com/page?user={userId}&contact={contactId}" id="ctaButton2">
  Continue
</a>

<!-- Current page URL: ?userId=789&contactId=101 -->
<!-- Result: https://example.com/page?user=789&contact=101 -->
```

**Example 3: No placeholders (auto-append)**
```html
<a href="https://example.com/checkout" id="ctaButton3">
  Checkout
</a>

<!-- Current page URL: ?userId=555&contactId=888&resourceId=999 -->
<!-- Result: https://example.com/checkout?userId=555&contactId=888&resourceId=999 -->
```

**Example 4: Multiple placeholder types**
```html
<a href="https://app.example.com/course/[resourceId]/user/{userId}" id="ctaButton4">
  Start Course
</a>

<!-- Current page URL: ?userId=123&resourceId=456 -->
<!-- Result: https://app.example.com/course/456/user/123 -->
```

**Placeholder Variants Supported**:
- `[user-id]` or `[userId]` → Both work for userId
- `[contactId]` → Contact ID
- `[resourceId]` → Resource ID
- `{userId}`, `{contactId}`, `{resourceId}` → Curly brace format

**Processing Logic**:
1. Script checks if URL contains any placeholders
2. If found → Replaces all placeholders with actual values from page URL
3. If not found → Appends parameters as query string
4. Button redirects to processed URL

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

### JavaScript Modules (12)
1. `formValidation.js` - Form field validation with GDPR
2. `contactForm.js` - Contact creation API integration
3. `ctaButtonNotification.js` - Simple CTA click tracking
4. `buttonTracking.js` - Advanced button tracking with resources
5. `assetDownload.js` - File download with tracking
6. `footerAutomation.js` - Dynamic user profile population
7. `multipleVideoTracking.js` - Wistia video analytics
8. `videoLocking.js` - Sequential video unlocking
9. `showButtonOnVideoCompletion.js` - Button reveal on video completion
10. `backButton.js` - Automatic back navigation button
11. `mainCodeInitializer.js` - Master dependency loader
12. *(contactForm.js dynamically loaded after validation)*

### HTML Templates (3)
1. `footer-template.html` - Complete footer implementation example
2. `previous-page.html` - Test page with 2 videos (resourceId: 66949)
3. `test-page.html` - Test page with 3 videos (resourceId: 66950)

### Total Files: 15

---

**Last Updated**: January 2025
**Maintained By**: Together We Thrive Development Team
**Repository**: https://github.com/togetherwethrive/kajabi-code
