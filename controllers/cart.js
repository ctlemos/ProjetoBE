// cartController.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { insertOrder, insertOrderDetails } = require("../models/order");

// Add item to cart
router.post("/add-to-cart", auth, (request, response) => {
    const { productId, quantity, price, name } = request.body;

    // Initialize the cart if it doesn't exist
    if (!request.session.cartProducts) {
        request.session.cartProducts = [];
    }

    // Check if product is already in the cart to update quantity
    const existingProduct = request.session.cartProducts.find(p => p.id === productId);
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        // Add the new product
        request.session.cartProducts.push({ id: productId, name, price, quantity });
    }

    response.send({ message: "Product added to cart successfully" });
});

// Display cart
router.get("/cart", auth, (request, response) => {
    const cartProducts = request.session.cartProducts || [];
    const total = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
    response.render("cart", { cartProducts, total });
});

// Checkout
router.post("/checkout", auth, async (request, response) => {
    const cartProducts = request.session.cartProducts || [];
    const total = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);

    try {
        // Insert new order and order details
        const orderId = await insertOrder(request.payload.user_id, total);
        for (const product of cartProducts) {
            await insertOrderDetails(orderId, product.id, product.quantity, product.price);
        }

        // Clear the cart after checkout
        request.session.cartProducts = [];
        response.status(200).send({ message: "Checkout successful!" });
    } catch (err) {
        console.error("Error during checkout:", err);
        response.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
