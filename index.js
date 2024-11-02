require("dotenv").config();
const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();
const auth = require("./middleware/auth");

const {getProductsFromCategorie} = require("./models/product")
const {getAllCategories, getCategorieById} = require("./models/categorie");


const controllerCategories = require("./controllers/categories");
const controllerProducts = require("./controllers/products");
const controllerUsers = require("./controllers/users");
const controllerOrders = require("./controllers/orders");
const controllerCart = require("./controllers/cart");
const controllerLogin = require("./controllers/login");
const controllerLogout = require("./controllers/logout");



app.set("view engine", "ejs"); // Definir template engine 
app.use(express.json()); // Configurar express para carregar middleware e lidar om o http body 

app.use('/public', express.static('public')); // Para poder usar ficheiros externos de css+js


app.use("/api/categories", controllerCategories);
app.use("/api/products", controllerProducts);
app.use("/api/users", controllerUsers);
app.use("/api/orders", controllerOrders);
app.use("/api/cart", controllerCart);
app.use("/api/login", controllerLogin);
app.use("/logout", controllerLogout);


// Home page
app.get("/", async (request, response) => {

    try {
        const categories = await getAllCategories();
        return response.render("home.ejs", { categories });
    } catch (err) {
        console.error("Error fetching categories:", err.message);
        return response.status(404).send("Not Found");
    }
});

// Categorias + produtos page
app.get("/categorie/:id", async (request, response) => {
    
    try {
        const categorie = await getCategorieById(request.params.id);
        if (!categorie) {
            return response.status(404).render("error.ejs", { errorMsg: "Not Found" });
        }

        const products = await getProductsFromCategorie(request.params.id);

        return response.render("categorie.ejs", { categorie, products });

    } catch (err) {
        console.error("Error fetching categorie:", err);
        return response.status(400).render("error.ejs", { errorMsg: "Bad Request" });
    }
});

// Login page
app.get("/login", (request, response) => {
    return response.render("login.ejs");
});

// Registo page
app.get("/register", (request, response) => {
    return response.render("register.ejs");
}); 

// Carrinho 
app.get('/cart', auth, (request, response) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY;


    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return response.status(403).send('Invalid Token');

        // Ver produtos no carrinho e calcular o total
        const cartProducts = decoded.cartProducts || [];
        const total = cartProducts.reduce((acc, product) => acc + (product.price * product.quantity), 0);

        return response.render('cart', { cartProducts, total });
    });
});

// Confirmação da encomenda
app.get("/confirmation", (request, response) => {
    return response.render("confirmation"); 
});


app.listen(process.env.SERVER_PORT);