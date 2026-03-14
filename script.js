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
const navbar = document.querySelector('.navbar');
const searchInput = document.getElementById('searchInput');

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

// ===== CHECKOUT FUNCTIONALITY =====
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutMessageEl = document.getElementById('checkout-message');
const toastEl = document.getElementById('toast');
let toastTimeout;

const showToast = (message, type = 'success', duration = 4200) => {
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.className = `toast ${type} show`;

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastEl.classList.remove('show');
    }, duration);
};

const showCheckoutMessage = (message, type = 'success') => {
    if (checkoutMessageEl) {
        checkoutMessageEl.textContent = message;
        checkoutMessageEl.className = `checkout-message ${type}`;
        checkoutMessageEl.style.display = 'block';

        setTimeout(() => {
            checkoutMessageEl.style.display = 'none';
        }, 3000);
    }

    showToast(message, type);
};

const saveOrder = (order) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
};

const handleCheckout = (e) => {
    e.preventDefault();

    if (cartProducts.length === 0) {
        showCheckoutMessage('Your cart is empty. Add items before checking out.', 'error');
        return;
    }

    if (!currentUser) {
        openAuthModal('login');
        showMessage('login-message', 'Please log in to complete your order.', 'error');
        return;
    }

    const total = cartTotal.textContent;
    const items = Array.from(document.querySelectorAll('.cart-list .item')).map(item => {
        const name = item.querySelector('.detail h4').textContent;
        const quantity = parseInt(item.querySelector('.quantity-value').textContent);
        const priceText = item.querySelector('.item-total').textContent;
        const price = parseFloat(priceText.replace('$', ''));

        return { name, quantity, price };
    });

    const order = {
        user: currentUser,
        total,
        items,
        placedAt: new Date().toISOString(),
    };

    saveOrder(order);
    showCheckoutMessage(`Thanks, ${currentUser.name}! Your order total is ${total}.`, 'success');

    // Clear cart
    cartProducts = [];
    cartList.innerHTML = '';
    updateTotals();
    cartTab.classList.remove('cart-tab-active');
};

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
}

// ===== PRODUCT LIST RENDERING =====
const showCards = (products = productList) => {
    cardList.innerHTML = '';

    if (products.length !== productList.length) {
        // Show results count when filtering
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'search-results-count';
        resultsDiv.innerHTML = `<p>Found ${products.length} product${products.length !== 1 ? 's' : ''}</p>`;
        cardList.appendChild(resultsDiv);
    }

    products.forEach(product => {
        const orderCard = document.createElement('div');
        orderCard.classList.add('order-card');

        orderCard.innerHTML = `
            <div class="card-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="card-content">
                <h4 class="card-title">${product.name}</h4>
                <h4 class="price">
                    <i class="fa-solid fa-dollar-sign"></i>
                    ${product.price.replace('$', '')}
                </h4>
                <a href="#" class="btn card-btn">
                    <i class="fa-solid fa-cart-plus"></i>
                    Add to Cart
                </a>
            </div>
        `;

        cardList.appendChild(orderCard);

        const cardBtn = orderCard.querySelector('.card-btn');
        cardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(product);
        });
    });
};

const showNoResults = (query) => {
    cardList.innerHTML = `
        <div class="no-results">
            <i class="fa-solid fa-search"></i>
            <h3>No results found</h3>
            <p>No products match "${query}"</p>
            <button class="btn clear-search-btn">Clear Search</button>
        </div>
    `;

    // Add event listener to the clear search button
    const clearBtn = cardList.querySelector('.clear-search-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }
};

const clearSearch = () => {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    filterProducts('');
    searchInput.focus();
};

const filterProducts = (query) => {
    const normalized = query.trim().toLowerCase();
    const searchWrapper = document.querySelector('.search-wrapper');

    if (!normalized) {
        showCards();
        searchWrapper.classList.remove('searching');
        return;
    }

    searchWrapper.classList.add('searching');

    // Filter products by name (case-insensitive partial match)
    const filtered = productList.filter(p =>
        p.name.toLowerCase().includes(normalized)
    );

    if (filtered.length === 0) {
        showNoResults(query);
    } else {
        showCards(filtered);
    }

    // Scroll to menu section to show results
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
        menuSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

// ===== NAVBAR SCROLL & SEARCH =====
const setupNavbarInteractions = () => {
    // Animate navbar on scroll
    if (navbar) {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        };

        // Run once on load and then on scroll
        handleScroll();
        window.addEventListener('scroll', handleScroll);
    }

    // Live search on input
    if (searchInput) {
        const clearBtn = document.getElementById('clearSearch');

        const handleSearch = (e) => {
            const value = e.target.value || '';
            filterProducts(value);
            // Show/hide clear button
            if (clearBtn) {
                clearBtn.style.display = value ? 'block' : 'none';
            }
        };

        searchInput.addEventListener('input', handleSearch);

        // Clear button functionality
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                filterProducts('');
                clearBtn.style.display = 'none';
                searchInput.focus();
            });
        }

        // Prevent form-submit style behaviour on Enter and just filter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterProducts(searchInput.value || '');
            }
        });
    }
};

// ===== ADD TO CART FUNCTION =====
const addToCart = (product) => {
    // Check if product already exists in cart
    const existingProduct = cartProducts.find(item => item.id === product.id);
    if (existingProduct) {
        alert('Item already in your cart');
        return;
    }

    // Add product to cart array with quantity
    const cartProduct = { ...product, quantity: 1 };
    cartProducts.push(cartProduct);

    let quantity = cartProduct.quantity;
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
        cartProduct.quantity = quantity;
        quantityValue.textContent = quantity;
        itemTotal.textContent = `$${(price * quantity).toFixed(2)}`;
        updateTotals();
    });

    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (quantity > 1) {
            quantity--;
            cartProduct.quantity = quantity;
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
            setupNavbarInteractions(); // Move this here so it's called after products are loaded
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
    // setupNavbarInteractions(); // Moved to after products are loaded
});