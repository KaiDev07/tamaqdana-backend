import Token from '../models/tokenModel.js'

const requireAuth = (req, res, next) => {
    try {
        const { authorization } = req.headers
        if (!authorization) {
            return res.status(401).json({ error: 'Request is not authorized' })
        }

        const accessToken = authorization.split(' ')[1]
        if (!accessToken) {
            return res.status(401).json({ error: 'Request is not authorized' })
        }

        const userData = Token.validateAccessToken(accessToken)
        if (!userData) {
            return res.status(401).json({ error: 'Request is not authorized' })
        }

        if (userData.email === process.env.ADMIN) {
            req.user = userData
            next()
        } else {
            res.status(401).json({ error: 'not allowed' })
        }
    } catch (error) {
        res.status(401).json({ error: 'Request is not authorized' })
    }
}

export default requireAuth
