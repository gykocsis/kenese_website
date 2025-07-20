// DOM Content Loaded Event Listener
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initBookingForm();
    initGallery();
    initDateValidation();
    enhanceBookingForm();
});

// Navigation functionality
function initNavigation() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active state immediately
                updateActiveNavLink(targetId);
            }
        });
    });

    // Add active class to navigation links based on scroll position
    window.addEventListener('scroll', throttle(function() {
        updateActiveNavOnScroll();
    }, 100));
}

// Update active navigation link
function updateActiveNavLink(targetId) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`.nav-links a[href="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Update active navigation based on scroll position
function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const scrollPosition = window.scrollY + 150; // Offset for header
    
    let activeSection = null;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            activeSection = section.getAttribute('id');
        }
    });
    
    // Update active states
    navLinks.forEach(link => link.classList.remove('active'));
    if (activeSection) {
        const correspondingLink = document.querySelector(`.nav-links a[href="#${activeSection}"]`);
        if (correspondingLink) {
            correspondingLink.classList.add('active');
        }
    }
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Booking form functionality
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (validateBookingForm()) {
                // Get form data
                const formData = new FormData(bookingForm);
                const bookingData = Object.fromEntries(formData.entries());
                
                // Show success message
                showBookingSuccess(bookingData);
                
                // Reset form
                bookingForm.reset();
                
                // Clear pricing preview
                const pricingPreview = document.querySelector('.pricing-preview');
                if (pricingPreview) {
                    pricingPreview.remove();
                }
            }
        });
    }
}

// Form validation
function validateBookingForm() {
    const checkinDate = new Date(document.getElementById('checkin').value);
    const checkoutDate = new Date(document.getElementById('checkout').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Clear previous error messages
    clearFormErrors();
    
    let isValid = true;
    
    // Check if dates are selected
    if (!document.getElementById('checkin').value) {
        showFieldError('checkin', 'Kérjük válassza ki az érkezés dátumát.');
        isValid = false;
    }
    
    if (!document.getElementById('checkout').value) {
        showFieldError('checkout', 'Kérjük válassza ki a távozás dátumát.');
        isValid = false;
    }
    
    // Only validate date logic if both dates are selected
    if (document.getElementById('checkin').value && document.getElementById('checkout').value) {
        // Check if checkin date is in the future
        if (checkinDate < today) {
            showFieldError('checkin', 'Az érkezés dátuma nem lehet a múltban.');
            isValid = false;
        }
        
        // Check if checkout date is after checkin date
        if (checkoutDate <= checkinDate) {
            showFieldError('checkout', 'A távozás dátuma az érkezés után kell legyen.');
            isValid = false;
        }
        
        // Check minimum stay (2 nights)
        const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
        const dayDiff = timeDiff / (1000 * 3600 * 24);
        
        if (dayDiff < 2) {
            showFieldError('checkout', 'Minimum 2 éjszakás foglalás szükséges.');
            isValid = false;
        }
    }
    
    // Validate required fields
    const requiredFields = [
        { id: 'name', message: 'Kérjük adja meg a nevét.' },
        { id: 'email', message: 'Kérjük adja meg az e-mail címét.' },
        { id: 'phone', message: 'Kérjük adja meg a telefonszámát.' },
        { id: 'guests', message: 'Kérjük válassza ki a vendégek számát.' }
    ];
    
    requiredFields.forEach(field => {
        const fieldElement = document.getElementById(field.id);
        if (!fieldElement.value.trim()) {
            showFieldError(field.id, field.message);
            isValid = false;
        }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField.value && !emailRegex.test(emailField.value)) {
        showFieldError('email', 'Kérem adjon meg egy érvényes e-mail címet.');
        isValid = false;
    }
    
    // Validate phone format (Hungarian format)
    const phoneField = document.getElementById('phone');
    const phoneRegex = /^(\+36|06)?[0-9\s\-]{8,}$/;
    if (phoneField.value && !phoneRegex.test(phoneField.value.replace(/\s/g, ''))) {
        showFieldError('phone', 'Kérem adjon meg egy érvényes magyar telefonszámot.');
        isValid = false;
    }
    
    return isValid;
}

// Show field error
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = 'var(--color-error)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--space-4)';
    errorDiv.textContent = message;
    
    formGroup.appendChild(errorDiv);
    
    // Add error styling to field
    field.style.borderColor = 'var(--color-error)';
    
    // Remove error styling when user starts typing
    const removeError = function() {
        field.style.borderColor = '';
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
        field.removeEventListener('input', removeError);
        field.removeEventListener('change', removeError);
    };
    
    field.addEventListener('input', removeError);
    field.addEventListener('change', removeError);
}

// Clear all form errors
function clearFormErrors() {
    const errorMessages = document.querySelectorAll('.field-error');
    errorMessages.forEach(error => error.remove());
    
    const errorFields = document.querySelectorAll('input[style*="border-color"], select[style*="border-color"]');
    errorFields.forEach(field => field.style.borderColor = '');
}

// Show booking success message
function showBookingSuccess(bookingData) {
    // Remove existing success message
    const existingSuccess = document.querySelector('.form-success');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // Calculate stay duration
    const checkinDate = new Date(bookingData.checkin);
    const checkoutDate = new Date(bookingData.checkout);
    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Format dates for display
    const checkinFormatted = checkinDate.toLocaleDateString('hu-HU');
    const checkoutFormatted = checkoutDate.toLocaleDateString('hu-HU');
    
    // Calculate pricing
    const pricing = calculatePricing(bookingData.checkin, bookingData.checkout);
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.innerHTML = `
        <h4 style="margin-bottom: var(--space-16);">Köszönjük a foglalási kérelmét!</h4>
        <div style="text-align: left;">
            <p><strong>Név:</strong> ${bookingData.name}</p>
            <p><strong>E-mail:</strong> ${bookingData.email}</p>
            <p><strong>Telefon:</strong> ${bookingData.phone}</p>
            <p><strong>Érkezés:</strong> ${checkinFormatted}</p>
            <p><strong>Távozás:</strong> ${checkoutFormatted}</p>
            <p><strong>Éjszakák száma:</strong> ${dayDiff}</p>
            <p><strong>Vendégek száma:</strong> ${bookingData.guests} fő</p>
            <p><strong>Becsült ár:</strong> ${formatHungarianCurrency(pricing.totalPrice)}</p>
            ${bookingData.message ? `<p><strong>Különleges kérések:</strong> ${bookingData.message}</p>` : ''}
        </div>
        <hr style="margin: var(--space-16) 0; border: none; border-top: 1px solid var(--color-border);">
        <p style="text-align: center;">Hamarosan felvesszük Önnel a kapcsolatot a foglalás részleteinek egyeztetéséhez.</p>
        <p style="text-align: center;"><strong>Dr. Kocsis Albert</strong><br><a href="tel:+36302002941">+36 30 200 2941</a></p>
    `;
    
    // Add success message after form
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.parentNode.appendChild(successDiv);
    
    // Scroll to success message
    setTimeout(() => {
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    
    // Auto-remove success message after 15 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.style.opacity = '0';
            successDiv.style.transition = 'opacity 1s ease';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 1000);
        }
    }, 15000);
}

// Initialize date validation
function initDateValidation() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput && checkoutInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        checkinInput.min = today;
        checkoutInput.min = today;
        
        // When checkin date changes, update checkout minimum date
        checkinInput.addEventListener('change', function() {
            if (this.value) {
                const checkinDate = new Date(this.value);
                const minCheckoutDate = new Date(checkinDate);
                minCheckoutDate.setDate(minCheckoutDate.getDate() + 2); // Minimum 2 nights
                
                checkoutInput.min = minCheckoutDate.toISOString().split('T')[0];
                
                // Clear checkout if it's before the new minimum
                if (checkoutInput.value) {
                    const currentCheckout = new Date(checkoutInput.value);
                    if (currentCheckout < minCheckoutDate) {
                        checkoutInput.value = '';
                    }
                }
            }
        });
    }
}

// Gallery functionality
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.dataset.title;
            const description = this.querySelector('.gallery-placeholder p').textContent;
            
            // Create and show modal-like alert
            showGalleryModal(title, description);
        });
    });
}

// Show gallery modal
function showGalleryModal(title, description) {
    // Remove existing modal
    const existingModal = document.querySelector('.gallery-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-16);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--color-surface);
        padding: var(--space-32);
        border-radius: var(--radius-lg);
        max-width: 500px;
        width: 100%;
        text-align: center;
        position: relative;
    `;
    
    modalContent.innerHTML = `
        <button class="modal-close" style="
            position: absolute;
            top: var(--space-16);
            right: var(--space-16);
            background: none;
            border: none;
            font-size: var(--font-size-2xl);
            cursor: pointer;
            color: var(--color-text-secondary);
        ">×</button>
        <h3 style="margin-bottom: var(--space-16); color: var(--color-text);">${title}</h3>
        <p style="color: var(--color-text-secondary); line-height: var(--line-height-normal);">${description}</p>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeModal = () => modal.remove();
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Utility function to calculate pricing
function calculatePricing(checkinDate, checkoutDate) {
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    
    let pricePerNight = 25000; // Default low season
    
    const month = checkin.getMonth() + 1; // getMonth() returns 0-11
    
    if (month >= 6 && month <= 8) {
        pricePerNight = 45000; // High season (június-augusztus)
    } else if ((month >= 4 && month <= 5) || month === 9) {
        pricePerNight = 35000; // Mid season (április-május, szeptember)
    }
    
    return {
        nights: nights,
        pricePerNight: pricePerNight,
        totalPrice: nights * pricePerNight
    };
}

// Format currency in Hungarian format
function formatHungarianCurrency(amount) {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Enhanced form submission with pricing calculation
function enhanceBookingForm() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    // Add pricing preview functionality
    function updatePricingPreview() {
        if (checkinInput.value && checkoutInput.value) {
            const pricing = calculatePricing(checkinInput.value, checkoutInput.value);
            
            // Remove existing pricing preview
            const existingPreview = document.querySelector('.pricing-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            
            // Create pricing preview
            const pricingDiv = document.createElement('div');
            pricingDiv.className = 'pricing-preview';
            pricingDiv.style.cssText = `
                background: var(--color-bg-1);
                padding: var(--space-16);
                border-radius: var(--radius-base);
                margin-top: var(--space-16);
                text-align: center;
                border: 1px solid var(--color-border);
            `;
            pricingDiv.innerHTML = `
                <h4 style="margin-bottom: var(--space-8); color: var(--color-text);">Előzetes árkalkuláció</h4>
                <p style="margin: var(--space-4) 0;"><strong>${pricing.nights} éjszaka</strong> × <strong>${formatHungarianCurrency(pricing.pricePerNight)}</strong></p>
                <p style="font-size: var(--font-size-lg); color: var(--color-primary); font-weight: var(--font-weight-bold); margin: var(--space-8) 0;">
                    Összesen: ${formatHungarianCurrency(pricing.totalPrice)}
                </p>
                <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-8);">
                    *A végső ár a foglalás véglegesítésekor kerül meghatározásra
                </p>
            `;
            
            // Add after the checkout input's form group
            const checkoutFormGroup = checkoutInput.closest('.form-group');
            const formRow = checkoutFormGroup.closest('.form-row');
            formRow.parentNode.insertBefore(pricingDiv, formRow.nextSibling);
        }
    }
    
    // Add event listeners for pricing preview
    if (checkinInput && checkoutInput) {
        checkinInput.addEventListener('change', updatePricingPreview);
        checkoutInput.addEventListener('change', updatePricingPreview);
    }
}