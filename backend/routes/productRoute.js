const express=require('express')
const { createProduct, getAllProducts, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReviews, getProductBySlug, getAdminProducts } = require('../controllers/productController')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')
const router=express.Router()

router.route("/admin/product/addNewProduct").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct)

router.route("/products").get(getAllProducts)
router.route("/admin/products").get(isAuthenticatedUser,authorizeRoles("admin"),getAdminProducts)

router.route("/products/:slug").get(getProductBySlug)
router.route("/admin/product/:id")
.put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct)

router.route("/product/:id").get(getProductDetails)

router.route("/review").put(isAuthenticatedUser,createProductReview)

router.route("/admin/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReviews)

module.exports=router;