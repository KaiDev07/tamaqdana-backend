import User from '../models/userModel.js'
import Token from '../models/tokenModel.js'
import { createTokens } from '../utils/createTokens.js'
import { v4 } from 'uuid'
import bcrypt from 'bcrypt'

export const signupUser = async (req, res) => {
    try {
        if (req.user) {
            throw Error('Error occured while signing up')
        }
        const { email, password } = req.body

        const user = await User.signup(email, password)

        const tokenPayload = {
            id: user._id,
            email: user.email,
            isActivated: user.isActivated,
        }
        const tokens = createTokens(tokenPayload)

        await Token.savetoken(user._id, tokens.refreshToken)

        res.cookie('refreshToken', tokens.refreshToken, {
            maxAge: 14 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        })

        res.status(200).json({
            accessToken: tokens.accessToken,
            user: tokenPayload,
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const activate = async (req, res) => {
    try {
        const activationLink = req.params.link
        await User.activate(activationLink)
        res.redirect(process.env.CLIENT_URL)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const login = async (req, res) => {
    try {
        if (req.user) {
            throw Error('Error occured while logging in')
        }
        const { email, password } = req.body

        const user = await User.login(email, password)

        const tokenPayload = {
            id: user._id,
            email: user.email,
            isActivated: user.isActivated,
        }
        const tokens = createTokens(tokenPayload)

        await Token.savetoken(user._id, tokens.refreshToken)

        res.cookie('refreshToken', tokens.refreshToken, {
            maxAge: 14 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        })

        res.status(200).json({
            accessToken: tokens.accessToken,
            user: tokenPayload,
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        if (req.user) {
            req.logout((err) => {
                if (err) {
                    throw Error('Error occured while logging out')
                }
                res.end()
            })
        } else {
            const { refreshToken } = req.cookies
            const token = await Token.removeToken(refreshToken)
            res.clearCookie('refreshToken')
            res.end()
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const refresh = async (req, res) => {
    try {
        if (req.user) {
            const findUser = await User.findOne({
                email: req.user._json.sub + '@gmail.com',
            })
            if (findUser) {
                res.status(200).json({
                    user: {
                        id: findUser._id,
                        isActivated: findUser.isActivated,
                        name: findUser.name,
                    },
                })
            } else {
                const password = v4()
                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(password, salt)

                const payload = {
                    email: req.user._json.sub + '@gmail.com',
                    password: hash,
                    isActivated: true,
                    name: req.user._json.name,
                }

                const user = await User.create(payload)

                res.status(200).json({
                    user: {
                        id: user._id,
                        isActivated: user.isActivated,
                        name: user.name,
                    },
                })
            }
        } else {
            const { refreshToken } = req.cookies

            const user = await User.refresh(refreshToken)

            const tokenPayload = {
                id: user._id,
                email: user.email,
                isActivated: user.isActivated,
            }
            const tokens = createTokens(tokenPayload)

            await Token.savetoken(user._id, tokens.refreshToken)

            res.cookie('refreshToken', tokens.refreshToken, {
                maxAge: 14 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
            })

            res.status(200).json({
                accessToken: tokens.accessToken,
                user: tokenPayload,
            })
        }
    } catch (error) {
        res.status(400).json({
            error: error?.message ? error.message : 'Error occured',
        })
    }
}
