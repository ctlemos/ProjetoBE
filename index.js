const express = require("express");
const app = express();

const controllerProducts = require("./controllers/products");
const controllerUsers = require("./controllers/users");
const controllerOrders = require("./controllers/orders");

app.use(express.json());

app.use("/api/products", controllerProducts);
app.use("/api/users", controllerUsers);
app.use("/api/orders", controllerOrders);


app.get("/", (request, response) => {
    return response.send("<h1>Home</h1>");
});

app.listen(3000);