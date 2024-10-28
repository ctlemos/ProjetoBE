require("dotenv").config();
const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();
const {getProductsFromCategorie} = require("./models/product")
const {getAllCategories, getCategorieById} = require("./models/categorie");


const controllerCategories = require("./controllers/categories");
const controllerProducts = require("./controllers/products");
const controllerUsers = require("./controllers/users");
const controllerOrders = require("./controllers/orders");
const controllerLogin = require("./controllers/login");
const controllerCart = require("./controllers/cart");
const logout = require("./controllers/logout");
const auth = require("./middleware/auth");


app.set("view engine", "ejs"); //definir template engine 
app.use(express.json()); //configurar express para carregar middleware e lidar om o http body 
app.use("/logout", logout);


app.use("/api/categories", controllerCategories);
app.use("/api/products", controllerProducts);
app.use("/api/users", controllerUsers);
app.use("/api/orders", controllerOrders);
app.use("/api/login", controllerLogin);
app.use("/api/cart", controllerCart);


//home page
app.get("/", async (request, response) => {

    try {
        const categories = await getAllCategories();
        return response.render("home.ejs", { categories });
    } catch (err) {
        console.error("Error fetching categories:", err.message);
        return response.status(404).send("Not Found");
    }
});

//categorias + produtos page
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

//login page
app.get("/login", async (request, response) => {
    return response.render("login.ejs");
});

//registo page
app.get("/register", async (request, response) => {
    return response.render("register.ejs");
}); 

//cart
app.get('/cart', auth, (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY;

   // if (!token) return res.status(401).send('Access Denied: No Token Provided');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(403).send('Invalid Token');

        // Get cart products and calculate total
        const cartProducts = decoded.cartProducts || [];
        const total = cartProducts.reduce((acc, product) => acc + (product.price * product.quantity), 0);

        res.render('cart', { cartProducts, total });
    });
});

// Testing token

// app.get('/test-token', (req, res) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
//         if (err) return res.status(403).send("Invalid Token");
//         res.send("Token is valid!");
//     });
// });

app.get("/confirmation", (req, res) => {
    res.render("confirmation"); 
});

app.listen(process.env.SERVER_PORT);