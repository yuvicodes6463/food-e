// ===== DOM ELEMENT SELECTIONS =====
const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const cardList = document.querySelector('.card-list');
const cartList = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.cart-total');
const cartValue = document.querySelector('.cart-value');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const bars = document.querySelector('.fa-bars');

// ===== CART FUNCTIONALITY =====
cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartTab.classList.add('cart-tab-active');
});

closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cartTab.classList.remove('cart-tab-active');
});

// ===== MOBILE MENU FUNCTIONALITY =====
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('mobile-menu-active');
    bars.classList.toggle('fa-xmark');
});

// ===== PRODUCT DATA =====
let productList = [];
let cartProducts = [];

// ===== UPDATE CART TOTALS =====
const updateTotals = () => {
    let totalPrice = 0;
    let totalQuantity = 0;

    document.querySelectorAll('.cart-list .item').forEach(item => {
        const quantity = parseInt(item.querySelector('.quantity-value').textContent);
        const priceText = item.querySelector('.item-total').textContent;
        const price = parseFloat(priceText.replace('$', ''));
        
        totalPrice += price;
        totalQuantity += quantity;
    });

    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
    cartValue.textContent = totalQuantity;
}

// ===== DISPLAY MENU CARDS =====
const showCards = () => {
    cardList.innerHTML = '';
    
    productList.forEach(product => {
        const orderCard = document.createElement('div');
        orderCard.classList.add('order-card');

        orderCard.innerHTML = `
            <div class="card-image">
                <img src="${product.image}" alt="${product.name}" style="width: 15rem; height: auto; filter: drop-shadow(rgba(0, 0, 0, 0.2) 0 10px 10px); display: block; margin: auto;">
            </div>
            <h4>${product.name}</h4>
            <h4 class="price">${product.price}</h4>
            <a href="#" class="btn card-btn">Add to Cart</a>
        `;

        cardList.appendChild(orderCard);

        const cardBtn = orderCard.querySelector('.card-btn');
        cardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(product);
        });
    });
};

// ===== ADD TO CART FUNCTION =====
const addToCart = (product) => {
    // Check if product already exists in cart
    const existingProduct = cartProducts.find(item => item.id === product.id);
    if (existingProduct) {
        alert('Item already in your cart');
        return;
    }

    // Add product to cart array
    cartProducts.push(product);

    let quantity = 1;
    let price = parseFloat(product.price.replace('$', ''));

    const cartItem = document.createElement('div');
    cartItem.classList.add('item');

    cartItem.innerHTML = `
        <div class="item-image">
            <img src="${product.image}" alt="${product.name}" style="width: 5rem; height: auto; display: block;">
        </div>
        <div class="detail">
            <h4>${product.name}</h4>
            <h4 class="item-total">$${price.toFixed(2)}</h4>
        </div>
        <div class="flex">
            <a href="#" class="quantity-btn minus">
                <i class="fa-solid fa-minus"></i>
            </a>
            <h4 class="quantity-value">${quantity}</h4>
            <a href="#" class="quantity-btn plus">
                <i class="fa-solid fa-plus"></i>
            </a>
        </div>
    `;

    cartList.appendChild(cartItem);
    updateTotals();

    const plusBtn = cartItem.querySelector('.plus');
    const minusBtn = cartItem.querySelector('.minus');
    const quantityValue = cartItem.querySelector('.quantity-value');
    const itemTotal = cartItem.querySelector('.item-total');

    plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        quantity++;
        quantityValue.textContent = quantity;
        itemTotal.textContent = `$${(price * quantity).toFixed(2)}`;
        updateTotals();
    });

    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (quantity > 1) {
            quantity--;
            quantityValue.textContent = quantity;
            itemTotal.textContent = `$${(price * quantity).toFixed(2)}`;
            updateTotals();
        } else {
            cartItem.classList.add('slide-out');
            
            setTimeout(() => {
                cartItem.remove();
                cartProducts = cartProducts.filter(item => item.id !== product.id);
                updateTotals();
            }, 300);
        }
    });
}

// ===== SMOOTH SCROLL FUNCTIONALITY =====
const setupSmoothScroll = () => {
    // Find all buttons that say "Order now" (case insensitive)
    const orderButtons = Array.from(document.querySelectorAll('.btn')).filter(button => 
        button.textContent.toLowerCase().includes('order now')
    );
    
    // Get the menu section
    const menuSection = document.getElementById('menu-section');
    
    // Add click event to each Order Now button
    orderButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Stop instant jumping
            
            // Smooth scroll to menu section
            menuSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if it's open
            mobileMenu.classList.remove('mobile-menu-active');
            if(bars.classList.contains('fa-xmark')) {
                bars.classList.remove('fa-xmark');
            }
        });
    });
    
    console.log('Smooth scroll setup complete! Found', orderButtons.length, 'Order Now button(s)');
}

// ===== INITIALIZE APP =====
const initApp = () => {
    fetch('product.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            productList = data;
            console.log('Products loaded:', productList.length, 'items');
            showCards();
            setupSmoothScroll();
        })
        .catch(error => {
            console.error('Error loading products:', error);
            cardList.innerHTML = '<p style="color: red; text-align: center; width: 100%;">Error loading menu items. Please check if product.json file exists.</p>';
        });
}

// Watch for dynamically added buttons
const observer = new MutationObserver(function(mutations) {
    setupSmoothScroll();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// ===== AUTHENTICATION FUNCTIONALITY =====

// DOM Elements for Authentication
const authModal = document.getElementById('auth-modal');
const closeModal = document.querySelector('.close-modal');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const signInBtns = document.querySelectorAll('.btn'); // Sign in buttons in header
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginMessage = document.getElementById('login-message');
const signupMessage = document.getElementById('signup-message');

// User data storage (in a real app, this would be server-side)
let currentUser = null;

// Initialize authentication
const initAuth = () => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }

    // Add event listeners
    setupAuthEventListeners();
};

// Setup event listeners for authentication
const setupAuthEventListeners = () => {
    // Sign in button clicks
    signInBtns.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('sign in')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentUser) {
                    logout();
                } else {
                    openAuthModal('login');
                }
            });
        }
    });

    // Close modal
    closeModal.addEventListener('click', closeAuthModal);
    
    // Close modal when clicking outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchAuthTab(tabName);
        });
    });

    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
};

// Open authentication modal
const openAuthModal = (defaultTab = 'login') => {
    authModal.classList.add('active');
    switchAuthTab(defaultTab);
};

// Close authentication modal
const closeAuthModal = () => {
    authModal.classList.remove('active');
    clearMessages();
    clearForms();
};

// Switch between login and signup tabs
const switchAuthTab = (tabName) => {
    authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    authForms.forEach(form => {
        form.classList.toggle('active', form.id === `${tabName}-form`);
    });
    
    clearMessages();
};

// Handle login form submission
const handleLogin = (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('login-message', 'Please fill in all fields', 'error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = { name: user.name, email: user.email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
        closeAuthModal();
        showMessage('login-message', 'Login successful!', 'success');
        setTimeout(() => {
            clearMessages();
        }, 2000);
    } else {
        showMessage('login-message', 'Invalid email or password', 'error');
    }
};

// Handle signup form submission
const handleSignup = (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showMessage('signup-message', 'Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('signup-message', 'Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('signup-message', 'Password must be at least 6 characters', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showMessage('signup-message', 'Email already registered', 'error');
        return;
    }
    
    // Add new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    currentUser = { name, email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    closeAuthModal();
    showMessage('signup-message', 'Account created successfully!', 'success');
    setTimeout(() => {
        clearMessages();
    }, 2000);
};

// Update UI for logged in user
const updateUIForLoggedInUser = () => {
    const signInBtns = document.querySelectorAll('.btn');
    signInBtns.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('sign in')) {
            // Create user status element
            const userStatus = document.createElement('div');
            userStatus.className = 'user-status';
            userStatus.innerHTML = `
                <span class="user-info">Welcome, ${currentUser.name}!</span>
                <button class="logout-btn">Logout</button>
            `;
            
            // Replace the sign in button with user status
            btn.parentNode.replaceChild(userStatus, btn);
            
            // Add logout functionality
            const logoutBtn = userStatus.querySelector('.logout-btn');
            logoutBtn.addEventListener('click', logout);
        }
    });
};

// Logout function
const logout = () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload(); // Simple way to reset UI
};

// Show message in auth forms
const showMessage = (elementId, message, type) => {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `auth-message ${type}`;
};

// Clear messages
const clearMessages = () => {
    loginMessage.textContent = '';
    loginMessage.className = 'auth-message';
    signupMessage.textContent = '';
    signupMessage.className = 'auth-message';
};

// Clear form inputs
const clearForms = () => {
    loginForm.reset();
    signupForm.reset();
};

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initAuth();
});