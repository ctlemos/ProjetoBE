const jwt = require("jsonwebtoken");

function auth(request, response, next) {

    const header = request.header("Authorization"); 

    if( !header) {
        return response.status(401).send({"message": "Authorization header missing"});
    }

    const token = header.replace("Bearer ", "");
    const secretKey = process.env.JWT_SECRET_KEY;

    jwt.verify(token, secretKey, (err, payload) => {
        
        if(err) {
            return response.status(400).send(err);
        }

        request.payload = payload; // guardar o payload dentro do request global
        return next(); // invocar a proxima função da rota de Express
    });
}

module.exports = auth;