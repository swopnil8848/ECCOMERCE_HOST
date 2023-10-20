
const Product = require('../models/productModels');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require('cloudinary');
const error = require('../middleware/error');

// create product
exports.createProduct = catchAsyncErrors(async(req,res,next)=>{
    try{
      // console.log("createProduct is being called")
    let images = [];
    // console.log("req.body",req.body)
    // console.log("req.images",req.images)
    // console.log('req.file',req.file)
    // if(typeof req.body.images==='string'){
    //   images.push(req.body.images)
    // }
    // else{
    //   images = req.body.images||[];
    // }

    // console.log("images.length::",images)

    const imagesLink = []

    // for(let i = 0;i<images.length;i++){
      const result = await cloudinary.v2.uploader.upload(req.body.images,{
        folder:'products',
      });
      imagesLink.push({
        public_id:result.public_id,
        url:result.secure_url
      })
    // }
    
    req.body.images = imagesLink;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })
    }
    catch(errro){
      // console.log("error::",errro)
      res.status(400).send({})
    }
})

// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    // console.log("the get all products inside the product controller is being called")
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeature0 = new ApiFeatures(Product, req.query)
      .search()
      .filter()

      let product0 = await apiFeature0.query;

      let filteredProductsCount = product0.length;

    const apiFeature = new ApiFeatures(Product, req.query)
      .search()
      .filter()
      .pagination(resultPerPage)


      let products = await apiFeature.query;

      // Apply pagination after filtering and sorting
      // apiFeature.pagination(resultPerPage);
      // products = await apiFeature.query;
    
    
    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount
    });
  });
  
  // Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getProductDetails = catchAsyncErrors( async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product unavailable'
            });
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        // Handle unexpected errors here
        // console.error("An error occurred:", error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching the product',
        });
    }
})


// update proudcts -- Admin
exports.updateProduct =catchAsyncErrors( async(req,res,next)=>{

    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            sucess:false,
            message:'product not fund'
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true,useFindAndModify:false})

    res.status(200).json({
        sucess:true,
        product
    })
})

// delete product
exports.deleteProduct = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('product not found',404))
    }
    
    // deleting images from cloudinary
    for(let i= 0;i<product.images.length;i++){
      await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

    await product.deleteOne();

    res.status(200).json({
        sucess:true,
        message:'the product deleted sucessfully'
    })
})

// create new product review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }
  product.numberOfReviews = product.reviews.length;  // this line is not necessary i just added it later for temporary pruposes
  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.rating = avg / product.reviews.length;
  // console.log("product.numberOfReviews in productController.js",product.reviews.length,product.numOfReviews )

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});


  // Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});


// Delete Product review
  exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHander("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
      message:"product deleted sucessfully!"
    });
  });
  
  