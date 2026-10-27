// FOOD DATABASE (100+ DISHES)
const FOOD_ITEMS = [
    { id: 1, name: "Special Rajasthani Dal Baati Churma", category: "Rajasthani", price: 280, diet: "veg", rating: 4.9, time: "25 min", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60", desc: "Authentic Panchmel dal served with pure ghee baati and sweet churma." },
    { id: 2, name: "Butter Chicken Special", category: "North Indian", price: 340, diet: "nonveg", rating: 4.8, time: "30 min", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60", desc: "Tender chicken cooked in rich tomato butter gravy with aromatic spices." },
    { id: 3, name: "Paneer Tikka Masala", category: "North Indian", price: 290, diet: "veg", rating: 4.7, time: "20 min", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60", desc: "Grilled cottage cheese cubes simmered in spiced onion tomato gravy." },
    { id: 4, name: "Masala Dosa Supreme", category: "South Indian", price: 160, diet: "veg", rating: 4.9, time: "15 min", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", desc: "Crispy crepe filled with potato masala served with coconut chutney." },
    { id: 5, name: "Hyderabadi Chicken Biryani", category: "Mughlai", price: 320, diet: "nonveg", rating: 4.9, time: "35 min", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60", desc: "Fragrant basmati rice layered with marinated chicken and aromatic spices." }
];

// Fill menu dynamically up to 104 items
for (let i = 6; i <= 104; i++) {
    const categories = ["North Indian", "South Indian", "Rajasthani", "Chinese", "Italian", "Fast Food", "Desserts", "Beverages"];
    const cat = categories[i % categories.length];
    const diet = i % 3 === 0 ? "nonveg" : "veg";
    FOOD_ITEMS.push({
        id: i,
        name: `${cat} Special Dish #${i}`,
        category: cat,
        price: 120 + (i * 3) % 250,
        diet: diet,
        rating: (4.0 + (i % 10) / 10).toFixed(1),
        time: `${15 + (i % 20)} min`,
        image: FOOD_ITEMS[(i % 5)].image,
        desc: `Delicious ${cat} specialty prepared fresh with premium Indian spices.`
    });
}

const CATEGORIES = ["All", "Rajasthani", "North Indian", "South Indian", "Mughlai", "Chinese", "Italian", "Fast Food", "Desserts", "Beverages"];

let cart = [];
let activeCategory = "All";
let activeDiet = "all";
let searchQuery = "";
let userSession = null;

// EXECUTES IMMEDIATELY ON PAGE LOAD
window.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderFoodGrid();
    init3DCanvasTracker();
    
    // Check if user is logged in, else KEEP LOGIN POPUP OPEN FIRST
    const savedUser = localStorage.getItem('swad_user');
    if (savedUser) {
        userSession = JSON.parse(savedUser);
        updateUserUI();
        closeLoginModal(); // Hide modal only if already logged in
    } else {
        openLoginModal(); // FORCES LOGIN MODAL TO SHOW FIRST
    }
});

function openLoginModal() { 
    document.getElementById('loginModal').classList.remove('hidden'); 
}

function closeLoginModal() { 
    document.getElementById('loginModal').classList.add('hidden'); 
}

function handleUserLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    userSession = { email, name: email.split('@')[0] };
    localStorage.setItem('swad_user', JSON.stringify(userSession));
    updateUserUI();
    closeLoginModal();
}

function continueAsGuest() { 
    userSession = { name: "Guest User" };
    updateUserUI();
    closeLoginModal(); 
}

function updateUserUI() {
    if (userSession && userSession.name) {
        document.getElementById('userAuthBtn').innerHTML = `<i class="fa-solid fa-user-check mr-1.5 text-green-400"></i> ${userSession.name}`;
    }
}

function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = CATEGORIES.map(cat => `
        <button onclick="filterCategory('${cat}')" class="px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${activeCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border'}">
            ${cat}
        </button>
    `).join('');
}

function renderFoodGrid() {
    const grid = document.getElementById('foodGrid');
    let items = FOOD_ITEMS.filter(item => {
        const matchCat = activeCategory === "All" || item.category === activeCategory;
        const matchDiet = activeDiet === "all" || item.diet === activeDiet;
        const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchDiet && matchSearch;
    });

    if (items.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-400 font-semibold">No food items found.</div>`;
        return;
    }

    grid.innerHTML = items.map(item => {
        const cartItem = cart.find(c => c.id === item.id);
        const qty = cartItem ? cartItem.qty : 0;
        return `
        <div class="bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col group">
            <div class="relative h-44 overflow-hidden bg-slate-100">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                <span class="absolute top-3 left-3 px-2.5 py-1 ${item.diet === 'veg' ? 'bg-green-600' : 'bg-red-600'} text-white text-[10px] font-black rounded-full uppercase">
                    ${item.diet === 'veg' ? '🟢 VEG' : '🔴 NON-VEG'}
                </span>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                    <span class="text-[10px] font-bold uppercase text-orange-600">${item.category}</span>
                    <h4 class="font-extrabold text-slate-900 text-base line-clamp-1">${item.name}</h4>
                    <p class="text-xs text-slate-500 line-clamp-2 mt-1">${item.desc}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t">
                    <div class="text-lg font-black text-slate-900">₹${item.price}</div>
                    ${qty === 0 ? `
                        <button onclick="addToCart(${item.id})" class="px-5 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md">+ ADD</button>
                    ` : `
                        <div class="flex items-center space-x-2 bg-orange-50 p-1 rounded-xl border border-orange-200">
                            <button onclick="updateQty(${item.id}, -1)" class="w-7 h-7 bg-orange-500 text-white font-bold rounded-lg">-</button>
                            <span class="text-xs font-black w-4 text-center">${qty}</span>
                            <button onclick="updateQty(${item.id}, 1)" class="w-7 h-7 bg-orange-500 text-white font-bold rounded-lg">+</button>
                        </div>
                    `}
                </div>
            </div>
        </div>`;
    }).join('');
}

function addToCart(id) {
    const item = FOOD_ITEMS.find(f => f.id === id);
    if (!item) return;
    const existing = cart.find(c => c.id === id);
    if (existing) { existing.qty++; } else { cart.push({ ...item, qty: 1 }); }
    updateCartUI();
    renderFoodGrid();
}

function updateQty(id, delta) {
    const index = cart.findIndex(c => c.id === id);
    if (index !== -1) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) cart.splice(index, 1);
    }
    updateCartUI();
    renderFoodGrid();
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('cartBadge').innerText = totalCount;
    document.getElementById('cartTotal').innerText = `₹${subtotal}`;

    const listContainer = document.getElementById('cartItemsList');
    if (cart.length === 0) {
        listContainer.innerHTML = `<div class="py-12 text-center text-slate-400 text-xs">Your basket is empty.</div>`;
        return;
    }
    listContainer.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between p-3 bg-slate-50 border rounded-2xl">
            <div>
                <h5 class="text-xs font-bold text-slate-900">${item.name}</h5>
                <span class="text-xs text-orange-600 font-extrabold">₹${item.price * item.qty}</span>
            </div>
            <div class="flex items-center space-x-2 bg-white p-1 rounded-xl border">
                <button onclick="updateQty(${item.id}, -1)" class="w-6 h-6 bg-slate-200 rounded text-xs">-</button>
                <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
                <button onclick="updateQty(${item.id}, 1)" class="w-6 h-6 bg-slate-200 rounded text-xs">+</button>
            </div>
        </div>`).join('');
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const panel = document.getElementById('cartDrawerPanel');
    if (drawer.classList.contains('invisible')) {
        drawer.classList.remove('invisible');
        setTimeout(() => panel.classList.remove('translate-x-full'), 10);
    } else {
        panel.classList.add('translate-x-full');
        setTimeout(() => drawer.classList.add('invisible'), 300);
    }
}

function proceedToPaytmCheckout() {
    if (cart.length === 0) { alert("Cart is empty!"); return; }
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const upiString = `upi://pay?pa=9257813359@ptyes&pn=Sanju&am=${total}&cu=INR`;
    document.getElementById('qrImage').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
    toggleCartDrawer();
    document.getElementById('paymentModal').classList.remove('hidden');
}

function closePaymentModal() { document.getElementById('paymentModal').classList.add('hidden'); }

function confirmOrderAndNotifyAdmin() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custMobile').value.trim();
    const addr = document.getElementById('custAddress').value.trim();
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const itemListText = cart.map(i => `• ${i.name} (Qty: ${i.qty}) - ₹${i.price * i.qty}`).join('%0A');
    const message = `*NEW ORDER - SWAD BHARAT*%0A- Name: ${name}%0A- Phone: ${phone}%0A- Address: ${addr}%0A%0A*Items:*%0A${itemListText}%0A%0A*Total:* ₹${total}`;
    window.open(`https://wa.me/919257813359?text=${message}`, '_blank');
    closePaymentModal();
    cart = [];
    updateCartUI();
    renderFoodGrid();
    switchTab('tracker');
}

function switchTab(tab) {
    document.getElementById('view-menu').classList.add('hidden');
    document.getElementById('view-tracker').classList.add('hidden');
    document.getElementById('categoryFilterBar').classList.add('hidden');
    document.getElementById(`view-${tab}`).classList.remove('hidden');
    if (tab === 'menu') document.getElementById('categoryFilterBar').classList.remove('hidden');
}

function filterCategory(cat) { activeCategory = cat; renderCategories(); renderFoodGrid(); }
function setDietFilter(diet) { activeDiet = diet; renderFoodGrid(); }
function handleSearch() { searchQuery = document.getElementById('searchInput').value; renderFoodGrid(); }

function init3DCanvasTracker() {
    const canvas = document.getElementById('trackerCanvas');
    const ctx = canvas.getContext('2d');
    let frame = 0;
    function resize() { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; }
    resize();
    window.addEventListener('resize', resize);
    function animate() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.4);
        ctx.strokeStyle = "#f59e0b";
        ctx.setLineDash([20, 15]);
        ctx.beginPath(); ctx.moveTo(0, canvas.height * 0.6); ctx.lineTo(canvas.width, canvas.height * 0.6); ctx.stroke();
        requestAnimationFrame(animate);
    }
    animate();
}