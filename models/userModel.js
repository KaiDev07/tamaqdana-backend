import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import validator from 'validator'
import { v4 } from 'uuid'
import { sendActivationMail } from '../utils/mailUtil.js'
import Token from './tokenModel.js'

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isActivated: {
        type: Boolean,
        default: false,
    },
    activationLink: {
        type: String,
    },
    name: {
        type: String,
    },
})

userSchema.statics.signup = async function (email, password) {
    if (!email || !password) {
        throw Error('All fields must be filled')
    }
    if (!validator.isEmail(email)) {
        throw Error('Email is not valid')
    }
    if (!validator.isStrongPassword(password)) {
        throw Error('Password is not strong enough')
    }

    const exists = await this.findOne({ email })

    if (exists) {
        throw Error('Email already in use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const activationLink = v4()

    const user = await this.create({ email, password: hash, activationLink })

    await sendActivationMail(email, activationLink)

    return user
}

userSchema.statics.activate = async function (activationLink) {
    const user = await this.findOne({ activationLink })
    if (!user) {
        throw Error('Invalid activation link')
    }
    user.isActivated = true
    await user.save()
}

userSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({ email })
    if (!user) {
        throw Error('User with this email not found')
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        throw Error('Incorrect password')
    }

    return user
}

userSchema.statics.refresh = async function (refreshToken) {
    if (!refreshToken) {
        throw Error('User is not authorized')
    }
    const userData = Token.validateRefreshToken(refreshToken)
    const tokenFromDb = await Token.findToken(refreshToken)

    if (!userData || !tokenFromDb) {
        throw Error('User is not authorized')
    }

    const user = await this.findById(userData.id)

    return user
}

export default mongoose.model('User', userSchema)
