require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const userRoutes = require('./routes/user')
const productRoutes = require('./routes/products')
const cors = require('cors')

// express app
const app = express()

// connect to db
mongoose
    .connect(process.env.MONG_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log('connected to db & listening to port', process.env.PORT)
        })
    })
    .catch((err) => console.log(err))

// middleware
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})
app.use(
    cors({
        origin: ['https://tamaqdana.onrender.com'],
    })
)

// routes
app.use('', userRoutes)
app.use('/products', productRoutes)
