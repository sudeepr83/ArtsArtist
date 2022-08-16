const Product=require("../models/productModel")
const Category=require("../models/categoryModel")
const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const ErrorHandler = require("../utils/errorHandler")
const ApiFeatures=require("../utils/apiFeatures")
const cloudinary=require("cloudinary")
//Create Product -- Admin
exports.createProduct=catchAsyncErrors(async (req,res,next)=>{
    let images=[]
    if(typeof req.body.images ==="string"){
        images.push(req.body.images)
    }
    else{
        images=req.body.images
    }

    const imagesLinks=[]
    for(let i=0;i< images.length;i++){
        const result=await cloudinary.v2.uploader.upload(images[i],{
            folder:"products"
        })

        imagesLinks.push({
            public_id:result.public_id,
            url:result.secure_url
        })
    }
    req.body.images=imagesLinks
    console.log(req.user.id)
    req.body.user_id=req.user.id
    req.body.user_name=req.user.name
    console.log(req.body.user_id);
    console.log(req.body.user_name);
    subcategory_id=req.body.category;
    const category_detail=await Category.findById(subcategory_id,{parentId:1,name:1})
    const parentId=category_detail["parentId"]
    req.body.parentCategoryId=parentId
    req.body.subCategoryName=category_detail["name"]
    const parent_category_name=await Category.findById(parentId,{name:1,_id:0})
    req.body.parentCategoryName=parent_category_name["name"]
    const product=await Product.create(req.body)
    res.status(201).json({
        success:true,
        product
    })
})

exports.getAllProducts=catchAsyncErrors(async (req,res,next) =>{
    const productCount=await Product.countDocuments()

    const apiFeature=new ApiFeatures(Product.find(),req.query).search()
    const products=await apiFeature.query;
    res.status(200).json({
        success:true,
        products,
        productCount
    })
})

//Get Product By Slug
exports.getProductBySlug=catchAsyncErrors(async (req,res,next) =>{
    const {slug}=req.params;
    const category=await Category.findOne({slug:slug}).select("_id")
    if(!category){
        return next(new ErrorHandler("Category Not Found",404))
    }
    const product=await Product.find({category:category._id})
    const productCount=await Product.find({category:category._id}).countDocuments()
    if(!product){
        return next(new ErrorHandler("Product Details Not Found"))
    }
    res.status(200).json({
        success:true,
        product,
        productCount,
        message:"Product Feteched Successfully"
    })
})
//Update Product -- Admin
exports.updateProduct=catchAsyncErrors(async (req,res,next)=>{
    let product=await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler("Product Not Found",404))
    }

    let images=[]

    if(typeof req.body.images === "string"){
        images.push(req.body.images)
    }else{
        images=req.body.images;
    }

    if(images!==undefined){
        for (let i=0;i< product.images.length;i++){
            await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        const imagesLinks=[]

        for(let i=0;i<images.length;i++){
            const result=await cloudinary.v2.uploader.upload(images[i],{
                folder:"products"
            })

            imagesLinks.push({
                public_id:result.public_id,
                url:result.secure_url
            })
        }
        req.body.images=imagesLinks;
    }

    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    
    res.status(200).json({
        success:true,
        product,
        message:"Product Updated Successfully"
    })
})

//Delete Product -- Admin
exports.deleteProduct=catchAsyncErrors(async (req,res,next)=>{
    const product=await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product Not Found",404))
    }

    //Deleting Images from Cloudinary
    for(let i=0;i<product.images.length;i++){
        await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

    await product.remove()
    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })
})

//Get Product Details
exports.getProductDetails=catchAsyncErrors(async (req,res,next) =>{
    const product=await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler("Product Details Not Found"))
    }

    res.status(200).json({
        success:true,
        product,
        message:"Product Details Fetched Successfully"
    })
})

//Create New Review or Update the Review
exports.createProductReview=catchAsyncErrors(async (req,res,next)=>{
    
    const {rating,comment,productId}=req.body
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product=await Product.findById(productId)
    
    const isReviewed=product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())
    if(isReviewed){
        product.reviews.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString())
                (rev.rating=rating),(rev.comment=comment)
            
        });
    }
    else{
        product.reviews.push(review)
        product.numOfReviews=product.reviews.length
    }
    let avg=0
    product.reviews.forEach(rev =>{
        avg+=rev.rating;
    })
    product.ratings=avg/product.reviews.length

    await product.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,

    })
})

//Get All Reviews of a product
exports.getProductReviews=catchAsyncErrors(async (req,res,next)=>{
    const product=await Product.findById(req.query.id)
    if(!product){
        return next(new ErrorHandler("Product Not Found",404))
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews,
        message:"Product Reviews Fetched Successfully"
    })
})

//Delete Reviews
exports.deleteReviews=catchAsyncErrors(async (req,res,next) =>{
    const product=await Product.findById(req.query.productId)

    if(!product){
        return next(new ErrorHandler("Product Not Found",404))
    }

    const reviews=product.reviews.filter((rev) => rev._id.toString() === req.query.id.toString())

    let avg=0;

    reviews.forEach((rev) => {
        avg+=rev.rating;
    })

    const ratings=avg/reviews.length;

    const numOfReviews=reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,{reviews,ratings,numOfReviews},{new:true,runValidators:true,useFindAndModify:false})

    res.status(200).json({
        success:true,
        message:"Review Deleted Successfully"
    })
})

exports.getAdminProducts=catchAsyncErrors(async (req,res,next) =>{
    const products=await Product.find();
    res.status(200).json({
        success:true,
        products
    })
})