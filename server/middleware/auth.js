const jwt = require("jsonwebtoken")

exports.auth = (req, res, next) => {
    try {
        const token = req.headers["authtoken"]
        if (!token) {
            return res.status(401).send("No Token, Authorization Denied")
        }
        const decoded = jwt.verify(token, 'Starzon-Cafe')
        req.user = decoded.user
        console.log(decoded)
        next()
    } catch (err) {
        console.log(err)
        res.status(401).send('Token Invalid')
    }
}