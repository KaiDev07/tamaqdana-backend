const express = require('express')
const {
    getProducts,
    createProduct,
    deleteProduct,
} = require('../controllers/productController')
const requireAuth = require('../middleware/requireAuth')
const requireAdminAuth = require('../middleware/requireAdminAuth')

const router = express.Router()

//require auth for get products route
router.use(requireAuth)

router.get('/', getProducts)

//require admin auth for post and delete product routes
router.use(requireAdminAuth)

router.post('/', createProduct)

router.delete('/:id', deleteProduct)

module.exports = router
