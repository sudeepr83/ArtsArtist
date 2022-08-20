const express=require('express')
const app=express()
const cors=require('cors')
const errorMiddleware=require("./middleware/error")
const fileUpload=require("express-fileupload")
const path=require("path")

//Config
if(process.env.NODE_ENV!=="PRODUCTION"){
    require("dotenv").config({path:"backend/config/config.env"})
}


app.use(express.json())
app.use(cors())
app.use(fileUpload())
//Route Imports
const categoryRoute=require("./routes/categoryRoute")
const productRoute=require("./routes/productRoute")
const userRoute=require("./routes/userRoute")
const orderRoute=require("./routes/orderRoute")
const paymentRoute=require("./routes/paymentRoute")

app.use("/api/v1",categoryRoute)
app.use("/api/v1",productRoute)
app.use("/api/v1",userRoute)
app.use("/api/v1",orderRoute)
app.use("/api/v1",paymentRoute)

// app.use(express.static(path.join(__dirname,"../frontend/build")))

// app.get("*",(req,res)=>{
//     res.sendFile(path.resolve(__dirname,"../frontend/build/index.html"))
// })

//Middleware for Errors
app.use(errorMiddleware)
module.exports=app
