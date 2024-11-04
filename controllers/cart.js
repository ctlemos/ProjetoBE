const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const { insertOrder, insertOrderDetails } = require("../models/order");

const secretKey = process.env.JWT_SECRET_KEY;

function reissueToken(payload) {
    return jwt.sign(payload, secretKey);
}

// Mostrar carrinho
router.get("/cart", auth, (request, response) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(authHeader)

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return response.status(403).send("Invalid Token");

        const cartProducts = decoded.cartProducts || [];
        const total = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);

        response.render("cart", { cartProducts, total });
    });
});

// Remover do carrinho
router.delete("/delete-from-cart", auth, (request, response) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET_KEY;

    if (!token) return response.status(401).send({ message: "Access Denied: No Token Provided" });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return response.status(403).send({ message: "Invalid Token" });

        let cartProducts = decoded.cartProducts || [];
        const productIdToRemove = request.body.productId;

        // Remove the product with the specified productId
        cartProducts = cartProducts.filter(p => p.productId !== productIdToRemove);

        // Update and reissue the token with modified cartProducts
        const newPayload = { ...decoded, cartProducts };
        const newToken = reissueToken(newPayload);

        response.send({ success: true, token: newToken });
    });
});

// Adicionar ao carrinho
router.post("/add-to-cart", auth, (request, response) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET_KEY;

    if (!token) return response.status(401).send({ message: "Access Denied: No Token Provided" });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return response.status(403).send({ message: "Invalid Token" });

        let cartProducts = decoded.cartProducts || [];

        // Loop pelos produtos para adicionar ao cartProducts
        request.body.products.forEach(newProduct => {
            const existingProduct = cartProducts.find(p => p.productId === newProduct.productId);

            if (existingProduct) {
                // Atualizar total no cart
                existingProduct.quantity += newProduct.quantity;
            } else {
                cartProducts.push(newProduct);
            }
        });

        // Atualizar e reemitir o token com cartProducts modificados
        const newPayload = { ...decoded, cartProducts };
        const newToken = reissueToken(newPayload);

        response.send({ success: true, token: newToken });
    });
});

// Checkout
router.post("/checkout", auth, async (request, response) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) return response.status(403).send("Invalid Token");

        const cartProducts = decoded.cartProducts || [];
        const total = cartProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);

        try {
            const orderId = await insertOrder(decoded.user_id, total);
            for (const product of cartProducts) {
                await insertOrderDetails(orderId, product.productId, product.quantity, product.price);
            }

            const newToken = reissueToken({ ...decoded, cartProducts: [] });
            response.status(200).send({ message: "Checkout successful!", token: newToken });
        } catch (err) {
            console.error("Error during checkout:", err);
            response.status(500).send({ message: "Internal Server Error" });
        }
    });
});

module.exports = router;
