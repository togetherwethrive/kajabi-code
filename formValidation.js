(function() {
    'use strict';
    
    console.log('═══════════════════════════════════════════════════');
    console.log('VALIDATION SCRIPT LOADING - DEFENSIVE MODE');
    console.log('═══════════════════════════════════════════════════');
    
    // Global flags
    window.contactScriptLoaded = false;
    window.isValidating = false;
    window.validationComplete = false;
    window.VALIDATION_PASSED = false; // NEW: Explicit pass flag

    // SECURITY: Debounce timer to prevent rapid submission attempts
    let validationDebounceTimer = null;
    const DEBOUNCE_DELAY = 300; // milliseconds
    
    // BLOCK ALL AJAX CALLS to the contact creation endpoint until validation passes
    const originalAjax = jQuery.ajax;
    jQuery.ajax = function(settings) {
        // Check if this is a call to the contact creation API
        if (settings.url && settings.url.includes('create-custom-contact')) {
            console.log('🛑🛑🛑 AJAX CALL TO CREATE-CUSTOM-CONTACT INTERCEPTED 🛑🛑🛑');
            console.log('Validation Status:', {
                validationComplete: window.validationComplete,
                VALIDATION_PASSED: window.VALIDATION_PASSED,
                isValidating: window.isValidating
            });
            
            // Only allow if validation explicitly passed
            if (!window.VALIDATION_PASSED) {
                console.error('❌❌❌ BLOCKING API CALL - VALIDATION NOT PASSED ❌❌❌');
                console.error('This API call is being blocked because validation has not been completed and passed.');
                
                // Return a rejected promise to prevent the call
                return jQuery.Deferred().reject({
                    status: 403,
                    statusText: 'Blocked by validation script',
                    responseText: 'Form validation must pass before contact creation'
                }).promise();
            }
            
            console.log('✅ VALIDATION PASSED - ALLOWING API CALL');
        }
        
        // Call original ajax
        return originalAjax.apply(this, arguments);
    };
    
    console.log('✓ AJAX interceptor installed - all API calls will be checked');

    // Email validation regex
    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Main validation function
    function validateForm() {
        console.log('═══════════════════════════════════════════════════');
        console.log('VALIDATION STARTED');
        console.log('═══════════════════════════════════════════════════');

        // SECURITY: Clear any existing debounce timer
        if (validationDebounceTimer) {
            clearTimeout(validationDebounceTimer);
        }

        // SECURITY: Immediately disable the submit button to prevent race conditions
        const submitButton = document.getElementById('contactFormSubmitBtn');
        if (submitButton) {
            submitButton.disabled = true;
            console.log('✓ Submit button disabled immediately');
        }

        // Reset validation flags
        window.VALIDATION_PASSED = false;
        window.validationComplete = false;

        // Prevent multiple validation attempts
        if (window.isValidating) {
            console.log('⚠ Validation already in progress - ignoring duplicate request');
            return false;
        }

        window.isValidating = true;
        
        // Get form elements
        const firstName = document.getElementById('contactFirstName');
        const lastName = document.getElementById('contactLastName');
        const email = document.getElementById('contactEmail');
        const phone = document.getElementById('contactPhone');
        const gdprConsent = document.getElementById('gdprConsent');
        const gdprError = document.getElementById('gdprError');
        
        let isValid = true;
        let errorMessages = [];
        
        console.log('─────────────────────────────────────────────────');
        console.log('VALIDATING FORM FIELDS:');
        console.log('─────────────────────────────────────────────────');
        
        // Validate First Name
        if (!firstName || !firstName.value.trim()) {
            isValid = false;
            errorMessages.push('First Name is required');
            console.error('First Name: FAILED (empty)');
        } else {
            console.log('✓ First Name: PASSED (' + firstName.value.trim() + ')');
        }
        
        // Validate Last Name
        if (!lastName || !lastName.value.trim()) {
            isValid = false;
            errorMessages.push('Last Name is required');
            console.error('Last Name: FAILED (empty)');
        } else {
            console.log('✓ Last Name: PASSED (' + lastName.value.trim() + ')');
        }
        
        // Validate Email
        if (!email || !email.value.trim()) {
            isValid = false;
            errorMessages.push('Email is required');
            console.error('Email: FAILED (empty)');
        } else if (!isValidEmail(email.value.trim())) {
            isValid = false;
            errorMessages.push('Please enter a valid email address');
            console.error('Email: FAILED (invalid format: ' + email.value.trim() + ')');
        } else {
            console.log('✓ Email: PASSED (' + email.value.trim() + ')');
        }
        
        // Validate Phone
        if (!phone || !phone.value.trim()) {
            isValid = false;
            errorMessages.push('Phone is required');
            console.error('Phone: FAILED (empty)');
        } else {
            console.log('✓ Phone: PASSED (' + phone.value.trim() + ')');
        }
        
        console.log('─────────────────────────────────────────────────');
        console.log('VALIDATING GDPR CONSENT:');
        console.log('─────────────────────────────────────────────────');
        
        // CRITICAL: Validate GDPR Consent
        if (!gdprConsent) {
            isValid = false;
            errorMessages.push('GDPR consent checkbox not found');
            console.error('GDPR: FAILED (checkbox element not found in DOM)');
        } else {
            console.log('GDPR Checkbox Element: FOUND');
            console.log('GDPR Checkbox Checked: ' + gdprConsent.checked);
            
            if (!gdprConsent.checked) {
                isValid = false;
                errorMessages.push('You must agree to the GDPR and CCPA Terms and Conditions');
                if (gdprError) {
                    gdprError.classList.add('show');
                }
                console.error('GDPR: FAILED (NOT CHECKED)');
            } else {
                if (gdprError) {
                    gdprError.classList.remove('show');
                }
                console.log('✅ GDPR: PASSED (checked)');
            }
        }
        
        console.log('─────────────────────────────────────────────────');
        
        // If validation fails, show errors and stop
        if (!isValid) {
            console.error('═══════════════════════════════════════════════════');
            console.error('VALIDATION FAILED');
            console.error('═══════════════════════════════════════════════════');
            console.error('Errors found:', errorMessages);
            console.error('VALIDATION_PASSED: FALSE');
            console.error('═══════════════════════════════════════════════════');

            alert('VALIDATION FAILED:\n\n' + errorMessages.join('\n'));

            // SECURITY: Re-enable button after validation failure
            if (submitButton) {
                submitButton.disabled = false;
                console.log('✓ Submit button re-enabled after validation failure');
            }

            window.isValidating = false;
            window.validationComplete = false;
            window.VALIDATION_PASSED = false;

            return false;
        }
        
        // All validations passed
        console.log('═══════════════════════════════════════════════════');
        console.log('✅✅✅ VALIDATION PASSED ✅✅✅');
        console.log('═══════════════════════════════════════════════════');
        console.log('All fields validated successfully');
        console.log('GDPR consent confirmed');
        console.log('Setting VALIDATION_PASSED = true');
        console.log('═══════════════════════════════════════════════════');
        
        // Mark validation as complete and passed
        window.validationComplete = true;
        window.VALIDATION_PASSED = true;
        
        console.log('Loading contact creation script...');
        
        // Load the contact creation script ONLY after validation passes
        loadContactCreationScript();
        
        return false;
    }
    
    // Function to dynamically load the contact creation script
    function loadContactCreationScript() {
        console.log('─────────────────────────────────────────────────');
        console.log('LOADING CONTACT CREATION SCRIPT');
        console.log('─────────────────────────────────────────────────');
        
        // Triple-check validation passed
        if (!window.validationComplete || !window.VALIDATION_PASSED) {
            console.error('❌ CRITICAL: Cannot load script - validation flags not set correctly');
            console.error('validationComplete:', window.validationComplete);
            console.error('VALIDATION_PASSED:', window.VALIDATION_PASSED);
            window.isValidating = false;
            return;
        }
        
        console.log('✓ Validation flags confirmed');
        
        // Check if script is already loaded
        if (window.contactScriptLoaded) {
            console.log('Contact script already loaded - calling function directly');
            
            setTimeout(function() {
                if (typeof window.createContactAfterValidation === 'function') {
                    console.log('Calling createContactAfterValidation()...');
                    window.createContactAfterValidation();
                } else {
                    console.error('❌ Function not found');
                    alert('Error: Contact creation function not available.');
                    window.isValidating = false;
                }
            }, 100);
            return;
        }
        
        console.log('Creating script element...');
        console.log('Source: https://cdn.statically.io/gh/togetherwethrive/kajabi-code/main/contactForm.js');
        
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdn.statically.io/gh/togetherwethrive/kajabi-code/main/contactForm.js';
        script.async = false;
        script.type = 'text/javascript';
        
        // Handle script load success
        script.onload = function() {
            console.log('─────────────────────────────────────────────────');
            console.log('✅ CONTACT SCRIPT LOADED FROM GITHUB');
            console.log('─────────────────────────────────────────────────');
            
            window.contactScriptLoaded = true;
            
            // Wait for initialization
            setTimeout(function() {
                console.log('Checking for createContactAfterValidation function...');
                
                if (typeof window.createContactAfterValidation === 'function') {
                    console.log('✅ Function found - calling now...');
                    console.log('═══════════════════════════════════════════════════');
                    window.createContactAfterValidation();
                } else {
                    console.error('❌ Function not found after load');
                    alert('Error: Contact creation function not initialized.');
                    window.isValidating = false;
                    window.validationComplete = false;
                    window.VALIDATION_PASSED = false;
                }
            }, 300);
        };
        
        // Handle script load error
        script.onerror = function() {
            console.error('═══════════════════════════════════════════════════');
            console.error('❌ FAILED TO LOAD CONTACT SCRIPT');
            console.error('═══════════════════════════════════════════════════');
            console.error('URL:', script.src);
            
            alert('Error: Could not load form submission module. Please check your connection.');
            window.isValidating = false;
            window.validationComplete = false;
            window.VALIDATION_PASSED = false;
        };
        
        // Append script
        console.log('Appending script to document head...');
        document.head.appendChild(script);
        console.log('✓ Script element appended');
    }
    
    // SECURITY: Debounced validation wrapper to prevent rapid-fire submissions
    function debouncedValidateForm() {
        // Clear any pending validation
        if (validationDebounceTimer) {
            clearTimeout(validationDebounceTimer);
        }

        // If already validating, ignore this call
        if (window.isValidating) {
            console.log('⚠ Validation already in progress - debounce ignored');
            return;
        }

        // Set a small delay to catch rapid clicks
        validationDebounceTimer = setTimeout(function() {
            validateForm();
        }, DEBOUNCE_DELAY);
    }

    // Initialize - CAPTURE EVERYTHING
    jQuery(function($) {
        console.log('═══════════════════════════════════════════════════');
        console.log('INITIALIZING FORM VALIDATION');
        console.log('═══════════════════════════════════════════════════');

        // Method 1: Form submit event
        $(document).on('submit', '#contactForm', function(event) {
            console.log('🛑 FORM SUBMIT EVENT INTERCEPTED');
            event.preventDefault();
            event.stopImmediatePropagation();
            debouncedValidateForm();
            return false;
        });

        // Method 2: Button click event
        $(document).on('click', '#contactFormSubmitBtn', function(event) {
            console.log('🛑 BUTTON CLICK EVENT INTERCEPTED');
            event.preventDefault();
            event.stopImmediatePropagation();
            debouncedValidateForm();
            return false;
        });

        // Method 3: Prevent native form submission
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', function(event) {
                console.log('🛑 NATIVE FORM SUBMIT INTERCEPTED');
                event.preventDefault();
                event.stopImmediatePropagation();
                debouncedValidateForm();
                return false;
            }, true); // Use capture phase
        }

        // Method 4: Prevent button default action
        const button = document.getElementById('contactFormSubmitBtn');
        if (button) {
            button.addEventListener('click', function(event) {
                console.log('🛑 NATIVE BUTTON CLICK INTERCEPTED');
                event.preventDefault();
                event.stopImmediatePropagation();
                debouncedValidateForm();
                return false;
            }, true); // Use capture phase
        }

        console.log('✓ All event listeners attached (jQuery + Native) with debouncing');
        console.log('✓ AJAX interceptor active');
        console.log('✓ Validation script ready');
        console.log('═══════════════════════════════════════════════════');
    });
})();