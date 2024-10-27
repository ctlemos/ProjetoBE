require("dotenv").config();
const express = require("express");
const app = express();
const {getProductsFromCategorie} = require("./models/product")
const {getAllCategories, getCategorieById} = require("./models/categorie");

const controllerCategories = require("./controllers/categories");
const controllerProducts = require("./controllers/products");
const controllerUsers = require("./controllers/users");
const controllerOrders = require("./controllers/orders");
const controllerLogin = require("./controllers/login");
const controllerCart = require("./controllers/cart")

app.set("view engine", "ejs"); //definir template engine 
app.use(express.json()); //configurar express para carregar middleware e lidar om o http body 

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
app.get("/cart", async (request, response) => {

   return response.render("cart.ejs");
}); 


app.listen(process.env.SERVER_PORT);