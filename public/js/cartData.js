function collectCartData() {
    const cartData = [];
    let invalidItemFound = false; // Para verificar se a quantidade é inválida 

    document.querySelectorAll('.product-item').forEach((item, index) => {
        const productId = item.dataset.id; 
        const name = item.dataset.name;
        const price = parseFloat(item.dataset.price);
        const quantity = parseInt(document.getElementById(`quantity-${index}`).value) || 0;
        
        if (quantity > 0) {
            cartData.push({ productId, name, price, quantity });
        } else {
            invalidItemFound = true;
        }   
    });

    // Mostrar um alerta se existirem items com quantidade inválida
    if (invalidItemFound) {
        alert('Some items have a quantity of 0 and will not be added to the cart.');
    }


    // Avançar se existir uma quantidade válida
    if (cartData.length > 0) {
    // Adicionar info carrinho ao token
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
                localStorage.setItem('user_token', data.token); // Atualizar o token com produtos para o carrinho
            } else {
                alert("Failed to add products to cart.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Failed to add products to cart.");
        });
    }
} 
 
// Aceder ao carrinho
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
    
// Checkout - enviar info para a base de dados
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

function deleteCartItem(productId) {
    const token = localStorage.getItem('user_token');
    fetch('/api/cart/delete-from-cart', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Product removed from cart successfully!");
            localStorage.setItem('user_token', data.token); // Atualizar token
            location.reload(); // Refrescar página 
        } else {
            alert("Failed to remove product from cart.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to remove product from cart.");
    });
}