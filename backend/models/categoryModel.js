const mongoose=require('mongoose')

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Name of Category"],
        trim:true
    },
    slug:{
        type:String,
        required:[true,"Please Enter Slug"],
        unique:true
    },
    parentId:{
        type:String
    }
})

module.exports=mongoose.model("Category",categorySchema)