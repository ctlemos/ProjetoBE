require("dotenv").config();
const express = require("express");
const app = express();

const controllerProducts = require("./controllers/products");
const controllerUsers = require("./controllers/users");
const controllerOrders = require("./controllers/orders");
const controllerLogin = require("./controllers/login");

app.use(express.json());

app.use("/api/products", controllerProducts);
app.use("/api/users", controllerUsers);
app.use("/api/orders", controllerOrders);
app.use("/api/login", controllerLogin);


app.get("/", (request, response) => {
    return response.send("<h1>Home</h1>");
});

app.listen(process.env.SERVER_PORT);