import Product from '../models/productModel.js'
import mongoose from 'mongoose'

// get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 })

        res.status(200).json(products)
    } catch (error) {
        res.send(500).json({ error: error.message })
    }
}

// create new product
export const createProduct = async (req, res) => {
    const { name, description } = req.body

    let emptyFields = []

    if (!name) {
        emptyFields.push('name')
    }
    if (!description) {
        emptyFields.push('description')
    }
    if (emptyFields.length > 0) {
        return res
            .status(400)
            .json({ error: 'Please fill in all the fields', emptyFields })
    }

    // add doc to db
    try {
        const product = await Product.create({ ...req.body })
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// delete a product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'no such product' })
        }

        const product = await Product.findOneAndDelete({ _id: id })

        if (!product) {
            return res.status(404).json({ error: 'no such product' })
        }

        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
