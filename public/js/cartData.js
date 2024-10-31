function collectCartData() {
    const cartData = [];
    document.querySelectorAll('.product-item').forEach((item, index) => {
        const productId = item.dataset.id; 
        const name = item.dataset.name;
        const price = parseFloat(item.dataset.price);
        const quantity = parseInt(document.getElementById(`quantity-${index}`).value) || 0;
        if (quantity > 0) {
            cartData.push({ productId, name, price, quantity });
        }
    });

const token = localStorage.getItem('user_token');
    fetch('/api/cart/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products: cartData })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Products added to cart successfully!");
            localStorage.setItem('user_token', data.token); // atualizar o token com produtos para o carrinho
        } else {
            alert("Failed to add products to cart.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to add products to cart.");
    });
}
    
function viewCart() {
    const token = localStorage.getItem('user_token');
    if (!token) {
        alert("Please log in to view your cart.");
        return;
    }

    fetch('/cart', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.text()) 
    .then(html => {
         document.body.innerHTML = html; 
    })
    .catch(error => {
        console.error("Error accessing cart:", error);
        alert("Unable to access cart.");
    });
}
    
function checkout() {
    console.log("Checkout function called"); 
    const token = localStorage.getItem('user_token');
    if (!token) {
        alert("Please log in to view your cart.");
        return;
    }

    fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Checkout failed');
        return response.json();
    })
    .then(data => {
        window.location.href = "/confirmation";
    })
    .catch(error => {
        console.error("Error during checkout:", error);
        alert("Erro ao realizar pedido.");
    });
}