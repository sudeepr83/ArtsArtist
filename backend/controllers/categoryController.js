const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const Category=require("../models/categoryModel")
const slugify=require('slugify')
const ErrorHandler=require("../utils/errorHandler")

function createCategories(categories,parentId=null){
    const categoryList=[]
    let category;
    if(parentId == null){
        category=categories.filter(cat => cat.parentId == undefined)
    }
    else{
        category=categories.filter(cat => cat.parentId == parentId)
    }
    for(let cate of category){
        categoryList.push({
            _id:cate._id,
            name:cate.name,
            slug:cate.slug,
            parentId:cate.parentId,
            children:createCategories(categories,cate._id)
        })
    }
    return categoryList
}

exports.createCategory=catchAsyncErrors(async(req,res,next)=>{
    const categoryObj={
        name:req.body.name,
        slug:req.body.parentId ? slugify(`${req.body.name}${req.body.parentId}`) : slugify(req.body.name)
    }
    if(req.body.parentId){
        categoryObj.parentId=req.body.parentId
    }
    const category=await Category.create(categoryObj)

    if(!category){
        return next(new ErrorHandler("Category Details Not Found",400))
    }
    
    res.status(201).json({
        success:true,
        category,
        message:"Category Created Successfully"
    })

})


exports.getCategory=catchAsyncErrors(async(req,res,next)=>{
    const categories=await Category.find({})

    if(!categories){
        return next(new ErrorHandler("Categories Not Found",400))
    }

    const categoryList=createCategories(categories)
    res.status(200).json({
        success:true,
        categoryList,
        message:"Categories Fetched Successfully"
    })
})