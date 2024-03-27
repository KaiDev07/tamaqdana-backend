import express from 'express'
import {
    getProducts,
    createProduct,
    deleteProduct,
} from '../controllers/productController.js'
import requireAuth from '../middleware/requireAuth.js'
import requireAdminAuth from '../middleware/requireAdminAuth.js'

const router = express.Router()

//require auth for get products route
router.use(requireAuth)

router.get('/', getProducts)

//require admin auth for post and delete product routes
router.use(requireAdminAuth)

router.post('/', createProduct)

router.delete('/:id', deleteProduct)

export default router
