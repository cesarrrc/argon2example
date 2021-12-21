const jwt = require("jsonwebtoken");
const superSecret = process.env.JWT;

const checkJwt = (req, res, next) => {
    let token
    if(!req.headers.authorization){
        token = null
        res.status(401).send('you are not authorized')
    } else {
        let bearer = req.headers.authorization.split(" ")
        token = bearer[1]
    }
    jwt.verify(token, superSecret, (err, decoded) => {
        if(err){
            res.status(401).send('you are not authorized')
        } 
        console.log(decoded)
        req.user_name = decoded.user_name
        req.user_id = decoded.user_id
        next()
    })
}

module.exports = { checkJwt }