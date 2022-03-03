const jwt = require('jsonwebtoken');

module.exports = async function generateToken(body) {
    let token = jwt.sign({
        data: body
    }, "fit-struction")
    return token
}