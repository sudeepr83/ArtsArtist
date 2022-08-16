const express=require("express")
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrders, deleteOrders } = require("../controllers/orderController")
const router=express.Router()
const {isAuthenticatedUser,authorizeRoles}=require("../middleware/auth")

router.route("/order/newOrder").post(isAuthenticatedUser,newOrder)

router.route("/order/:id").get(isAuthenticatedUser,getSingleOrder)

router.route("/orders/myOrders").get(isAuthenticatedUser,myOrders)

router.route("/admin/orders").get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders)

router.route("/admin/order/:id")
                            .put(isAuthenticatedUser,authorizeRoles("admin"),updateOrders)
                            .delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrders)

module.exports=router