const express=require('express')
const { getCategory, createCategory } = require('../controllers/categoryController')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')
const router=express.Router()


router.route("/category/addNewCategory").post(isAuthenticatedUser,authorizeRoles("admin"),createCategory)

router.route("/getCategory").get(getCategory)

module.exports=router