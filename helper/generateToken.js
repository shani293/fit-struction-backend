const jwt = require('jsonwebtoken');

module.exports = async function generateToken(body) {
    let specificData = {
        _id: body?._id,
        email: body?.email
    }
    let token = jwt.sign({
        data: specificData
    }, "fit-struction")
    return token
}