const express = require("express")
const moment = require('moment');
const User = require('../model/user')
const Products = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')
const Cart = require('../model/cart')
const List = require('../model/wishlist')
const Address = require('../model/address')
const Order = require('../model/order')
const Coupon = require('../model/coupon')
const Offer = require('../model/offer')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');

const RazorpayObj = require('razorpay');
const { resolveContent } = require("nodemailer/lib/shared");
const { createBrotliDecompress } = require("zlib");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env

const razorpayInstance = new RazorpayObj({
    key_id : RAZORPAY_ID_KEY,
    key_secret : RAZORPAY_SECRET_KEY
})


/***************All products handling****************** */

//store search value
const storeSerachValue = async(req,res)=>{
    try{
        
        const search = req.body.search;
        req.session.search = search;
        console.log(search)
        // Query the database to find products matching the search term
        const products = await Products.find({ "product_name":{$regex:".*"+search+".*",$options:'i'}  });
        
        const discounts = await Discount.find({status:true}).exec()
        
        res.json({products:products});
    }
    catch(err){
        console.log(err.message);
    }
}

//get a product by id

const getProductById = async(req,res,id)=>{
    try{

        
        const objectId = new mongoose.Types.ObjectId(id);
       
        const products = await Products.aggregate([
            {
                $match : {
                    _id: objectId
                }
            },
            {
                $lookup : {
                    from : 'discounts',
                    localField : 'discount',
                    foreignField : '_id',
                    as : 'discountInfo'
                }
            },
            {
                $addFields: {
                    discountInfo: { $arrayElemAt: ['$discountInfo', 0] },
                    discountedPrice: {
                        $cond: {
                            if: { $gt: [{ $size: "$discountInfo" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $subtract: [1, { $divide: [{ $toDouble: { $arrayElemAt: ["$discountInfo.percentage", 0] } }, 100] }]}
                                ]
                            },
                            else: "$price_unit"
                        }
                    }
                }
                
            },
            {
                $lookup : {
                    from : 'categories',
                    localField : 'category',
                    foreignField : '_id',
                    as : 'categoryInfo'
                }
            },
            {
                $addFields: {
                    categoryInfo: { $arrayElemAt: ['$categoryInfo', 0]},
                    categoryName: "$categoryInfo.category_name"
                }
            },
            {
                $lookup : {
                    from : 'offers',
                    localField : 'product_name',
                    foreignField : 'offer_name',
                    as : 'productoffer'
                }
            },
            {
                $addFields: {
                    productoffer: { $arrayElemAt: ['$productoffer', 0]},
                    pdtoffer: {
                        $cond: {
                            if: { $gt: [{ $size: "$productoffer" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $divide: [{ $toDouble: { $arrayElemAt: ["$productoffer.discount_per", 0] } }, 100] }
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $lookup : {
                    from : 'offers',
                    localField : 'categoryName',
                    foreignField : 'offer_name',
                    as : 'categoryoffer'
                }
            },
            {
                $addFields: {
                    categoryoffer: { $arrayElemAt: ['$categoryoffer', 0]},
                    categoffer: {
                        $cond: {
                            if: { $gt: [{ $size: "$categoryoffer" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $divide: [{ $toDouble: { $arrayElemAt: ["$categoryoffer.discount_per", 0] } }, 100] }
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $addFields: {
                    discountInfo: {
                        $cond: {
                            if: { $isArray: "$discountInfo" }, // Check if discountInfo is an array
                            then: { $arrayElemAt: ["$discountInfo", 0] }, // If it's an array, extract the first element
                            else: null // If it's not an array, set it to null
                        }
                    },
                    discountedsalePrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ["$discountInfo", null] }, // Check if discountInfo is not null
                                    { $or: [ // Check if either pdtoffer or categoffer is not 0
                                        { $ne: ["$pdtoffer", 0] },
                                        { $ne: ["$categoffer", 0] }
                                    ]}
                                ]
                            },
                            then: {
                                $subtract: [
                                    "$discountedPrice", // Subtract the offer price from the discountedPrice
                                    { $max: ["$pdtoffer", "$categoffer"] } // Use $max to get the higher offer value
                                ]
                            },
                            else: "$discountedPrice" // If no offer is applicable or discountInfo is null, keep the original discountedPrice
                        }
                    }
                }
            }            
        ])

        return products
    }
    catch(err){
        console.log(err.message);
    }
}
//get all products from database
const getProducts = async(req,res)=>{
    try{


        const products = await Products.aggregate([
            {
                $match : {
                    $and : [{status : 'active', isListing : true}]
                }
            },
            {
                $lookup : {
                    from : 'discounts',
                    localField : 'discount',
                    foreignField : '_id',
                    as : 'discountInfo'
                }
            },
            {
                $addFields: {
                    discountInfo: { $arrayElemAt: ['$discountInfo', 0] },
                    discountedPrice: {
                        $cond: {
                            if: { $gt: [{ $size: "$discountInfo" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $subtract: [1, { $divide: [{ $toDouble: { $arrayElemAt: ["$discountInfo.percentage", 0] } }, 100] }]}
                                ]
                            },
                            else: "$price_unit"
                        }
                    }
                }
                
            },
            {
                $lookup : {
                    from : 'categories',
                    localField : 'category',
                    foreignField : '_id',
                    as : 'categoryInfo'
                }
            },
            {
                $addFields: {
                    categoryInfo: { $arrayElemAt: ['$categoryInfo', 0]},
                    categoryName: "$categoryInfo.category_name"
                }
            },
            {
                $lookup : {
                    from : 'offers',
                    localField : 'product_name',
                    foreignField : 'offer_name',
                    as : 'productoffer'
                }
            },
            {
                $addFields: {
                    productoffer: { $arrayElemAt: ['$productoffer', 0]},
                    pdtoffer: {
                        $cond: {
                            if: { $gt: [{ $size: "$productoffer" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $divide: [{ $toDouble: { $arrayElemAt: ["$productoffer.discount_per", 0] } }, 100] }
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $lookup : {
                    from : 'offers',
                    localField : 'categoryName',
                    foreignField : 'offer_name',
                    as : 'categoryoffer'
                }
            },
            {
                $addFields: {
                    categoryoffer: { $arrayElemAt: ['$categoryoffer', 0]},
                    categoffer: {
                        $cond: {
                            if: { $gt: [{ $size: "$categoryoffer" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $divide: [{ $toDouble: { $arrayElemAt: ["$categoryoffer.discount_per", 0] } }, 100] }
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $addFields: {
                    discountInfo: {
                        $cond: {
                            if: { $isArray: "$discountInfo" }, // Check if discountInfo is an array
                            then: { $arrayElemAt: ["$discountInfo", 0] }, // If it's an array, extract the first element
                            else: null // If it's not an array, set it to null
                        }
                    },
                    discountedsalePrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ["$discountInfo", null] }, // Check if discountInfo is not null
                                    { $or: [ // Check if either pdtoffer or categoffer is not 0
                                        { $ne: ["$pdtoffer", 0] },
                                        { $ne: ["$categoffer", 0] }
                                    ]}
                                ]
                            },
                            then: {
                                $subtract: [
                                    "$discountedPrice", // Subtract the offer price from the discountedPrice
                                    { $max: ["$pdtoffer", "$categoffer"] } // Use $max to get the higher offer value
                                ]
                            },
                            else: "$discountedPrice" // If no offer is applicable or discountInfo is null, keep the original discountedPrice
                        }
                    }
                }
            }            
        ])
        return products
    }
    catch(err){
        console.log(err.message);
    }
}

//serach products
const listSearchProduct = async(req,res)=>{
    try{
        const {name} = req.session.search;
        console.log(name)

    }
    catch(err){
        console.log(err.message);
    }
}

const getPaginatedProducts = async(req,res,perPage,pageNum)=>{
    try{
        const products = await Products.aggregate([
            {
                $match : {
                    $and : [{status : 'active', isListing : true}]
                }
            },
            {
                $lookup : {
                    from : 'discounts',
                    localField : 'discount',
                    foreignField : '_id',
                    as : 'discountInfo'
                }
            },
            {
                $addFields: {
                    discountInfo: { $arrayElemAt: ['$discountInfo', 0] },
                    discountedPrice: {
                        $cond: {
                            if: { $gt: [{ $size: "$discountInfo" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $subtract: [1, { $divide: [{ $toDouble: { $arrayElemAt: ["$discountInfo.percentage", 0] } }, 100] }]}
                                ]
                            },
                            else: "$price_unit"
                        }
                    }
                }
                
            },
            {
                $lookup : {
                    from : 'categories',
                    localField : 'category',
                    foreignField : '_id',
                    as : 'categoryInfo'
                }
            },
            {
                $addFields: {
                    categoryInfo: { $arrayElemAt: ['$categoryInfo', 0]},
                    categoryName: "$categoryInfo.category_name"
                }
            },
            {
                $lookup : {
                    from : 'offers',
                    localField : 'product_name',
                    foreignField : 'offer_name',
                    as : 'productoffer'
                }
            },
            {
                $addFields: {
                    productoffer: { $arrayElemAt: ['$productoffer', 0]},
                    pdtoffer: {
                        $cond: {
                            if: { $gt: [{ $size: "$productoffer" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $divide: [{ $toDouble: { $arrayElemAt: ["$productoffer.discount_per", 0] } }, 100] }
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $lookup : {
                    from : 'offers',
                    localField : 'categoryName',
                    foreignField : 'offer_name',
                    as : 'categoryoffer'
                }
            },
            {
                $addFields: {
                    categoryoffer: { $arrayElemAt: ['$categoryoffer', 0]},
                    categoffer: {
                        $cond: {
                            if: { $gt: [{ $size: "$categoryoffer" }, 0] },
                            then: {
                                $multiply: [
                                    "$price_unit",
                                    { $divide: [{ $toDouble: { $arrayElemAt: ["$categoryoffer.discount_per", 0] } }, 100] }
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $addFields: {
                    discountInfo: {
                        $cond: {
                            if: { $isArray: "$discountInfo" }, // Check if discountInfo is an array
                            then: { $arrayElemAt: ["$discountInfo", 0] }, // If it's an array, extract the first element
                            else: null // If it's not an array, set it to null
                        }
                    },
                    discountedsalePrice: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ["$discountInfo", null] }, // Check if discountInfo is not null
                                    { $or: [ // Check if either pdtoffer or categoffer is not 0
                                        { $ne: ["$pdtoffer", 0] },
                                        { $ne: ["$categoffer", 0] }
                                    ]}
                                ]
                            },
                            then: {
                                $subtract: [
                                    "$discountedPrice", // Subtract the offer price from the discountedPrice
                                    { $max: ["$pdtoffer", "$categoffer"] } // Use $max to get the higher offer value
                                ]
                            },
                            else: "$discountedPrice" // If no offer is applicable or discountInfo is null, keep the original discountedPrice
                        }
                    }
                }
            },


            {
                $skip: ( pageNum - 1 ) * perPage
            },
            {
                $limit: perPage
            }

            
        ])
        return products
    }
    catch(err){
        console.log(err.message);
    }
}

//load all products
const loadAllProducts = async (req,res)=>{
    try{    
            const pageNum = req.query.page || 1
            const perPage = 9
            const totalCount = await Products.countDocuments({status:'active',isListing:true})
            const pages = Math.ceil( totalCount / perPage )
            console.log("count",totalCount);

            
            const products = await getPaginatedProducts(req,res,perPage,pageNum)
            

           console.log( products);    
           res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products', 
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,               
            products,
            pageNum,
            perPage,
            totalCount, 
            pages,           
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
           })
                    
    }
    catch(err){
        console.log(err.message);
    }
}

const loadSearchProducts = async (req,res)=>{
    try{
            const search = req.query.search       
            console.log("search value: "+search)
            // Query the database to find products matching the search term
            const products = await Products.find({ "product_name":{$regex:".*"+search+".*",$options:'i'}  });            
            const discounts = await Discount.find({status:true}).exec()

       
            
                res.render('content/allproducts',{
                title : "All Products| TraditionShoppe",
                user : req.session.user,
                page : 'All products', 
                qtyCount:req.session.qtyCount,
                listCount:req.session.listCount,               
                products : products,
                discounts : discounts,
                errorMessage:req.flash('errorMessage'),
                successMessage:req.flash('successMessage')

                
            })

    }
    catch(err){
        console.log(err.message);
    }
}

//load all new handicrafts products (make these  code common)
const  getnewHandicrafts = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Handicrafts', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()                    

            
            // let qtyCount = await getQtyCount(req,res)
            // let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,         
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}
//load all new handicrafts products
const  getnewAntique = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Antique', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()

            // let qtyCount = await getQtyCount(req,res)
            // let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products', 
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,        
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}
//load all new handicrafts products
const  getnewSpices = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Spice', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()
            
            // let qtyCount = await getQtyCount(req,res)
            // let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,      
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

//load all new handicrafts products
const  getnewApparels = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Apparels', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()
            
            // let qtyCount = await getQtyCount(req,res)
            // let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',  
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,      
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

const  loadNew = async (req,res)=>{
    try{
            // const categoryQuery = await Category.find({category_name:'Apparels', status : true},{_id:1}).exec()
            // const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ status: 'new', isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()
            
            // let qtyCount = await getQtyCount(req,res)
            // let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',  
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,     
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

//load all new handicrafts products
const  getmostSold = async (req,res)=>{
    try{
            const SellerQuery = await Seller.find({ status : 'popular'},{_id:1}).exec()
            const SellerIds = SellerQuery.map(category => category._id);
            const products = await Products.find({ seller: { $in: SellerIds }, status: {$ne:'inactive'}, isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()
            
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',            
            products : products,
             discounts : discounts,
             qtyCount:qtyCount,
             listCount:listCount,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

//load all new handicrafts products
const  getLowtoHigh = async (req,res)=>{
    try{
            const products = await Products.find({isListing: true }).sort({'price_unit':1}).exec();       
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,           
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

//load all new handicrafts products
const  getHightoLow = async (req,res)=>{
    try{
            const products = await Products.find({isListing: true }).sort({'price_unit':-1}).exec();      
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}


const  getascending = async (req,res)=>{
    try{
            const products = await Products.find({isListing: true }).collation({ locale: 'en' }).sort({'product_name':1}).exec();      
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}



const  getdescending = async (req,res)=>{
    try{
            const products = await Products.find({isListing: true }).collation({ locale: 'en' }).sort({'product_name':-1}).exec();      
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}




const  getlowcost = async (req,res)=>{
    try{
            const products = await Products.find({isListing: true,price_unit:{$lt:500} }).sort({'price_unit':-1}).exec();      
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

const  getaverage = async (req,res)=>{
    try{
            const products = await Products.find({isListing: true,price_unit:{$gt:500,$lt:10000} }).sort({'price_unit':-1}).exec();      
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

const  getcostly = async (req,res)=>{
    try{
            const products = await Products.find({isListing: true,price_unit:{$gt:10000,$lt:50000} }).sort({'price_unit':-1}).exec();      
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

const  gethighcostly = async (req,res)=>{
    try{
            const products = await Products.find({isListing: true,price_unit:{$gt:50000} }).sort({'price_unit':-1}).exec();      
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}


//load all new handicrafts products
async function gettoyCategory(req, res) {
    try {
        const products = await Products.find({ product_type: 'toys', status: { $ne: 'inactive' }, isListing: true }).exec();
        const discounts = await Discount.find({ status: true }).exec();

        let qtyCount = await getQtyCount(req, res);
        let listCount = await getListCount(req, res);

        res.render('content/allproducts', {
            title: "All Products| TraditionShoppe",
            user: req.session.user,
            page: 'All products',
            listCount: listCount,
            qtyCount: qtyCount,
            products: products,
            discounts: discounts,
            errorMessage: req.flash('errorMessage'),
            successMessage: req.flash('successMessage')
        });

    }
    catch (err) {
        console.log(err.message);
    }
}

//load all new handicrafts products
const  getecoFriendly = async (req,res)=>{
    try{
            const products = await Products.find({ product_type : 'eco-friendly' , status:{ $ne:'inactive'} , isListing: true }).exec();          
            const discounts = await Discount.find({status:true}).exec()
            
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            listCount:listCount,
            qtyCount:qtyCount,
            page : 'All products',            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}
//load all new handicrafts products
const  getbrassMaterial= async (req,res)=>{
    try{
            const products = await Products.find({ material: 'Brass' , status:{ $ne:'inactive'} , isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()
            
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            qtyCount:qtyCount,
            listCount:listCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

const  getmetalMaterial = async (req,res)=>{
    try{
            const products = await Products.find({ material: 'Metal' , status:{ $ne:'inactive'} , isListing: true }).exec();         
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)

            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

const  getwoodMaterial = async (req,res)=>{
    try{
            const products = await Products.find({ material: 'Wood' , status:{ $ne:'inactive'} , isListing: true }).exec();            
            const discounts = await Discount.find({status:true}).exec()
            
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products', 
            listCount:listCount,
            qtyCount:qtyCount,           
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}

const  getgiftCategory = async (req,res)=>{
    try{
            const products = await Products.find({ product_type : 'gift' , status:{ $ne:'inactive'} , isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()
            

            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',
            listCount:listCount,
            qtyCount:qtyCount,            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })

    }
    catch(err){
        console.log(err.message);
    }
}
//load all new handicrafts products
const  getpriceRange = async (req,res)=>{
    try{
        // console.log(req.body);
        const { minPrice, maxPrice } = req.body;
       
        // Store dropdown values in session
        req.session.priceValues = { minPrice, maxPrice };
         res.sendStatus(200);  
       
    }
    catch(err){
        console.log(err.message);
    }
}
const  setpriceRange = async (req,res)=>{
            try{     
                
                const { minPrice, maxPrice } = req.session.priceValues;     
            const products = await Products.find({price_unit:{$gt:minPrice,$lt:maxPrice} , status:{ $ne:'inactive'} , isListing: true }).exec();       
            const discounts = await Discount.find({status:true}).exec()
           
            let qtyCount = await getQtyCount(req,res)
            let listCount = await getListCount(req,res)

            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',            
            products : products,
             discounts : discounts,
             qtyCount:qtyCount, 
             listCount:listCount,           
             products : products,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })
        res.sendStatus(200); 

    }
    catch(err){
        console.log(err.message);
    }
}

const getQtyCount = async(req,res)=>{
    try{

        let qtyCount = 0;
        const users = await User.findOne({email:req.session.user},{_id:1}).exec()
        // console.log("user cart: "+users)
        const user_cart = await Cart.findOne({user:users,status:"listed"}).exec()
        // console.log("cart : "+user_cart)
        
        if(user_cart){           
            user_cart.product_list.forEach(product => { 
               // console.log("pdt qty: ",product.quantity);       
                qtyCount += product.quantity; })
        }
        req.session.qtyCount = qtyCount
    }
    catch(err){
        console.log(err.message);
    }
}

const getListCount = async(req,res)=>{
    try{
        let listCount = 0;
        const users = await User.findOne({email:req.session.user},{_id:1}).exec()
        // console.log("user : "+users)
        const user_list = await List.findOne({user:users}).exec()

        if(user_list){           
            
            listCount = user_list.product_list.length;
        }
        req.session.listCount = listCount
    }
    catch(err){
        console.log(err.message);
    }
}
//load all new handicrafts products

/*******************product view details************************* */
const loadProductDetail = async (req,res)=>{
    try{
        let id = req.params.id
       
        const user_id= await User.find({email:req.session.user},{_id:1}).exec()

        const products = await getProductById(req,res,id)
        const allproducts = await getProducts(req,res)
        
        await getQtyCount (req,res)
        await getListCount (req,res)
        
       
        res.render('content/productView',{
            title: "View Product | TraditionShoppe", 
            user : req.session.user,
            user_id:user_id[0]._id,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,         
            products,
            allproducts,         
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    }
    catch(error){

    }
}





/*********load cart*********/
const loadCart = async(req,res)=>{
    try{
        await getQtyCount (req,res)
        await getListCount (req,res)

        const user = req.session.user       
        const user_id = await User.findOne({email:user},{_id:1}).exec()        
        
        const products = await getProducts(req,res)
        const user_cart = await Cart.findOne({
            user:user_id,
            status:"listed",
            "product_list.productId" : { $in : products.map(pdt => pdt._id)}        
        }).exec()
        let mrpTotal = 0;
        if(user_cart){
            if(user_cart.product_list == ''){
                await Cart.deleteOne( { 
                    user: user_id,
                })
            } else {
                user_cart.product_list.forEach((cart)=>{
                    products.forEach((pdt)=>{
                        if(cart.productId.equals(pdt._id) ){
                             mrpTotal += parseFloat(cart.quantity * pdt.price_unit)
                        }
                    })
                })
            }
            req.session.mrpTotal = mrpTotal           
            
        }      
         //console.log(products);
         console.log("user cart : ",user_cart);
         console.log( "mrptotal: ",mrpTotal)
        res.render('content/myCart',{
            title: "My Cart - TraditionShoppe",
            page:"My Cart",   
            user : req.session.user,            
            products, 
            user_cart, 
            mrpTotal,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

/*********add to cart table*********/
const addToCartTable = async(req,res)=>{
    try{
        
        let pdt_id = req.params.id;
        let price = req.params.mrp;
        const user = req.session.user
       // const product = await Products.findOne({_id:pdt_id}).exec();
       const stock = await Products.findOne({_id:pdt_id},{stock:1}).exec()
        const user_id = await User.findOne({email:user},{_id:1}).exec()
        const user_cart = await Cart.findOne({user:user_id,status:"listed"}).exec()
        
        let pdt_check = false;
        let amount = 0;
        let qty;
        if(stock.stock>0)  { 
                if (!user_cart){
                    console.log("cart is empty")
                    const cart = new Cart({
                        user:user_id,
                        product_list:[{productId :pdt_id,quantity:1,price:price,total:price}],
                        total_amount : price,  
                        status:"listed"
                   })
                   const cartData = await cart.save()
                   if(cartData){
                        await getQtyCount(req,res);
                       console.log('successful');
                       req.flash("successMessage", "Product is successfully added to cart...");
                       res.redirect(`/viewProduct/${pdt_id}`)
                   } else {
                       console.log('failed');
                       req.flash("errorMessage", "Product is not added to cart... Try again!!");
                       res.redirect("/newProducts");
                   }  

                }
        if (user_cart){
            console.log("user cart status : ",user_cart.status);
          
                console.log("inside listed");
            user_cart.product_list.forEach(product => {
                if( product.productId.equals(pdt_id)){
                    pdt_check = true;
                    qty = product.quantity;                           
                    console.log("check pdt qty :",qty);
                }})

                amount = parseFloat(user_cart.total_amount); 

              
            if(pdt_check){
                console.log("user and pdt exist, update qty and price")
                await Cart.updateOne( { 
                    user: user_id,
                    "product_list.productId": pdt_id 
                },
                { 
                    $set: { 
                        "product_list.$.quantity": qty + 1,
                        "product_list.$.price": price,
                        "product_list.$.total": (qty+1)*price,
                        total_amount: amount + parseFloat(price)
                    } 
                })
                    
                console.log('successful');
                await getQtyCount(req,res);
                req.flash("successMessage", "Product is successfully updated to cart...");
                res.redirect(`/viewProduct/${pdt_id}`)
            } else {
                console.log("user exist pdt not, push new pdts into pdtlist array")
                await Cart.updateOne({_id:user_cart.id},
                    { $push: { 'product_list':{productId :pdt_id ,quantity:1,price:price,total:price}} , $inc: { total_amount: parseFloat(price) }},
                    {$set:{status:"listed"}})  
                   
                   console.log('successful');
                   await getQtyCount(req,res);
                req.flash("successMessage", "Product is successfully updated to cart...");
                res.redirect(`/viewProduct/${pdt_id}`)

            }
    
        } 
    }else{
        req.flash("errorMessage", "Out of the stock!!");
        res.redirect(`/viewProduct/${pdt_id}`)
    }
    }
    catch(err){
        console.log(err.message);
    }
}

/*********add qty to cart table*********/
const addQtyToCart = async(req,res)=>{
    try{
        const cartid = req.params.cartid;
        const userid = req.params.userid;
        const pdtid = req.params.pdtid;
        const price = req.params.price;

        const stock = await Products.findOne({_id:pdtid},{stock:1,_id:0}).exec()
        const user_cart = await Cart.findOne({_id:cartid}).exec()
        // console.log("stock: "+stock.stock)

        if( stock.stock>0 ){
            let qty = 0;
            let amount = 0;

            user_cart.product_list.forEach(product => {
                if( product.productId == pdtid ){
                    //pdt_check = true;
                    qty = product.quantity;                           

                }})

                if(qty >=stock.stock){
                    req.flash("errorMessage", "Stock exceeds!!");
                    res.redirect('/cart')
                } else{
                    amount = parseFloat(user_cart.total_amount);  
                    await Cart.updateOne({
                        user: userid,
                        "product_list.productId": pdtid 
                        },
                        {
                            $set: { 
                                "product_list.$.quantity": qty + 1,
                                "product_list.$.price": price,
                                "product_list.$.total": (qty+1)*price,
                                total_amount: amount + parseFloat(price)
                            } 
                        }
                    )
                    await getQtyCount(req,res);
                    console.log('successful');
                    req.flash("successMessage", "Product is successfully updated to cart...");
                    res.redirect('/cart')
                }
                
        } else {
            req.flash("errorMessage", "Out of the stock!!");
            res.redirect('/cart')
        }

    }
    catch(err){
        console.log(err.message);
    }
}

/*********remove qty from cart table*********/
const subQtyFromCart = async(req,res)=>{
    try{
        const cartid = req.params.cartid;
        const userid = req.params.userid;
        const pdtid = req.params.pdtid;
        const price = req.params.price;

        const stock = await Products.findOne({_id:pdtid},{stock:1,_id:0}).exec()
        const user_cart = await Cart.findOne({_id:cartid}).exec()
        // console.log("stock: "+stock.stock)
        let qty = 0;
        let amount = 0;
        user_cart.product_list.forEach(product => {
            if( product.productId == pdtid ){
                //pdt_check = true;
                qty = product.quantity;                           

            }}) 
            let newPrice = qty * price;
            // console.log("qty: "+qty);
            // console.log("total amount : "+ user_cart.total_amount);
            amount = parseFloat(user_cart.total_amount);  

        if( stock.stock>0 && qty>1){
            
            await Cart.updateOne({
                _id:cartid,
                "product_list.productId": pdtid 
                },
                {
                    $set: { 
                        "product_list.$.quantity": qty - 1,
                        "product_list.$.price": price,
                        "product_list.$.total": (qty-1)*price,
                        total_amount: amount - parseFloat(price)
                    } 
                }
            )
            await getQtyCount(req,res);
            console.log('successful');
            req.flash("successMessage", "Product is successfully updated to cart...");
            res.redirect('/cart')

        } else if (qty<=1){
            if( user_cart.product_list.length === 1 ){
            await Cart.deleteOne(
                { _id:cartid })
                console.log('successful');
                await getQtyCount(req,res);
                req.flash("successMessage", "User is deleted from cart...");
                res.redirect('/cart')
        } else{
            await Cart.updateOne(
                {  _id:cartid },
                { $pull: { product_list: { productId: pdtid } },
                $set: { 
                    total_amount: amount - parseFloat(newPrice)
                }  
            })
            console.log('successful');
            await getQtyCount(req,res);
            req.flash("successMessage", "Product is deleted from cart...");
            res.redirect('/cart')
        }
    }
    }
    catch(err){
        console.log(err.message);
    }
}

/*********delete from cart table*********/
const deleteFromCart = async(req,res)=>{
    try{
        const cartid = req.params.cartid;
        const userid = req.params.userid;
        const pdtid = req.params.pdtid; 
        const user_cart = await Cart.findOne({_id:cartid}).exec()
        let qty = 0;
        let amount = 0;
        let price = 0;
        user_cart.product_list.forEach(product => {
            if( product.productId == pdtid ){
                qty = product.quantity,
                price = product.price
            }}) 
            amount = user_cart.total_amount
            let newPrice = qty * price;
            await Cart.updateOne(
                { user: userid ,status:"listed"},
                { $pull: { product_list: { productId: pdtid } },
                $set: { 
                    total_amount: amount - parseFloat(newPrice)
                }  
            }) 
                      
            await getQtyCount(req,res);
        console.log('successful');
        req.flash("successMessage", "Product is deleted from cart...");
        res.redirect('/cart')
    }
    catch(err){
        console.log(err.message);
    }
}


/*********add to wishlist table*********/
const addToWishlist = async(req,res)=>{
    try{
        //add user, productlist; user exist- update, otherwise insert
        let pdt_id = req.params.id;
        const user = req.session.user
        const user_id = await User.findOne({email:user},{_id:1}).exec()
        const user_list_id = await List.findOne({user:user_id},{_id:1}).exec()

        if (user_list_id){

            await List.updateOne({_id:user_list_id},
                { $push: { product_list: pdt_id }})

                console.log('successful');
                req.flash("successMessage", "Product is successfully updated to cart...");
                res.redirect(`/viewProduct/${pdt_id}`)

        } else {
            const list = new List({
                 user:user_id,
                 product_list:pdt_id,
            })
            const listData = await list.save()
            if(listData){
                console.log('successful');
                req.flash("successMessage", "Product is successfully added to cart...");
                res.redirect(`/viewProduct/${pdt_id}`)
            } else {
                console.log('failed');
                req.flash("errorMessage", "Product is not added to cart... Try again!!");
                res.redirect("/newProducts");
            }  

        }
        
    }
    catch(err){
        console.log(err.message);
    }
}
/*********add to saving*********/
const addToSave = async(req,res)=>{
    try{
        res.render('content/myCart',{
            title: "My Cart - TraditionShoppe",
            page:"My Cart",   
            user : req.session.user,          
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

/*********load checkout*********/
const loadCheckout = async(req,res)=>{
    try{
        
       
        const userid = await User.findOne({email:req.session.user},{_id:1}).exec()
        
        const cartDet = await Cart.find({_id:req.params.cartid}).exec()
        const userAddress = await Address.find({user_id:userid._id}).exec()
        const amount = req.params.amount
   

        console.log("cart user :",cartDet);
        console.log("user address :",userAddress);
        await getQtyCount(req,res)
        await getListCount(req,res)

        // req.session.couponDiscountTotal = discountedTotal
        // req.session.coupondiscount = couponDiscount

        let coupondiscount = 0
        if(req.session.coupondisc){
            coupondiscount = req.session.coupondiscount
        }

        res.render('content/checkout',{
            title: "Checkout - TraditionShoppe",
            page:"Checkout",   
            user : req.session.user,
            cartDet, 
            userAddress,
            amount,
            coupondiscount,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,       
            errorMessage : req.flash('errorMessage'),
            successMessage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

/************get state and country value**************/
const storeStateCountry =async(req,res)=>{
    try{
        // console.log(req.body);
        const { country,state } = req.body;

        // Store dropdown values in session
        req.session.stateCountry = { country,state  };  
        console.log("session values in stateCountry:");
        console.log(req.session.stateCountry); 
        res.sendStatus(200);    

    }
    catch(err){
        console.log(err.message);
    }
}

/************add address**************/
const addNewAddress =async(req,res)=>{
    try{
        const userid = req.params.userid;
        const cartid = req.params.cartid;
        const amount = req.params.amount;
        const { country,state } = req.session.stateCountry || { country: '', state: '' }

        const address = new Address({
            user_id:userid,
            name: req.body.name,
            mobile:req.body.mobile,
            house:req.body.house,
            street:req.body.street,
            landmark:req.body.landmark,
            city:req.body.city,
            pincode:req.body.pin,
            state:state,
            country:country,
        })

        // console.log('Final Product:', product);

        const addressData = await address.save()
        if(addressData){
            const address = await Address.find({user_id:userid}).exec()
            
            const lastAddedAddress = address[address.length - 1]; // Retrieve the last address in the array
            console.log(lastAddedAddress._id);
          
            
            await User.updateOne({_id:userid},
                { $push: { address: lastAddedAddress._id }})
 
            console.log('successful');
           
            res.redirect(`/checkout/${cartid}/${amount}`)
        } else {
            console.log('failed');
             req.flash("errorMessage", "Address registration failed.. Try again!!");
             res.redirect(`/checkout/${cartid}/${amount}`)
        }  

    }
    catch(err){
        console.log(err.message);
    }
}

/************ load edit address**************/
const loadEditAddress =async(req,res)=>{
    try{
        const addressid = req.params.addressid
        const cartid = req.params.cartid;
        const amount = req.params.amount
        const address = await Address.find({_id:addressid}).exec()

        res.render('content/editAddress',{
            title: "Edit Address - TraditionShoppe",
            user : req.session.user,
            address,  
            cartid,
            amount,             
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){

    }
}

/************get state and country value**************/
const changeStateCountry =async(req,res)=>{
    try{
        console.log(req.body);
        const { country,state } = req.body;

        // Store dropdown values in session
        req.session.stateCountryedited = { country , state  };  
        console.log("session values in stateCountry:");
        console.log(req.session.stateCountryedited); 
        res.sendStatus(200);    

    }
    catch(err){
        console.log(err.message);
    }
}

/************edit address**************/
const changeAddress =async(req,res)=>{
    try{
        const addressid = req.params.addressid;
        const cartid = req.params.cartid;
        const amount = req.params.amount
       // const amt = req.params.amt

        const {country,state} = req.session.stateCountryedited

        const address = await Address.find({_id:addressid}).exec()

        await Address.updateOne({_id:addressid},
            {$set:{
                name: req.body.name,
                mobile:req.body.mobile,
                house:req.body.house,
                street:req.body.street,
                landmark:req.body.landmark,
                city:req.body.city,
                pincode:req.body.pin,
                state:state,
                country:country,
            }})
        
        console.log('successful');
           
        res.redirect(`/checkout/${cartid}/${amount}`)
    }
    catch(err){
        console.log(err.message);
    }
}

/************session for saving address to delivery***********/
const selectedAddress = async(req,res)=>{
    try{
        console.log(req.body);
        const {addressid} = req.body        
       console.log("radio button : "+ addressid);
        req.session.deliverAddress = addressid

        console.log( req.session.deliverAddress);
           
        res.sendStatus(200)

}
    catch(err){
        console.log(err.message);
    }
}

/**************apply coupon***************/
const couponApply = async (req,res)=>{
    try{
        
        const userid = req.params.userid
        console.log("userid :",userid)

        console.log("req-body :",req.body)
        const { couponCode , totalAmount } = req.body

        const user = await User.find({ _id:userid }).exec()
        const coupon = await Coupon.find({ coupon_code : couponCode},{_id:1,discount_per:1,minimum_purchase:1,maximum_discount_amt:1}).exec()

        console.log("user :",user)
        console.log("coupon :",coupon)

    
        console.log("total Amount :",totalAmount);
        let couponid , coupondisc, couponminim, couponamt;
       
        coupon.forEach((cpn)=>{
            couponid = cpn._id,
            coupondisc =cpn.discount_per,
            couponminim = cpn.minimum_purchase,
            couponamt = cpn.maximum_discount_amt
        }) 

        let couponApplied = false;
        let couponDiscount = coupondisc * .01 * totalAmount
        let couponEmpty = false;
        let discountedTotal = totalAmount - couponDiscount   

        console.log("coupon discount :",couponDiscount);
        console.log("total discount :",discountedTotal);
        user.forEach((usr)=>{
            if(usr.coupons.length === 0){
                couponEmpty = true
            } else {
                usr.coupons.forEach((cpn)=>{
                    if(cpn === null){
                        couponApplied = false
                    }
                else if( cpn.equals(couponid)){
                    couponApplied = true
                }
            })}
        })
        
        
        //coupuns empty or not
        if(couponEmpty){
            console.log("coupon empty");           
            if( (totalAmount < couponminim) || (couponDiscount > couponamt) ){
                req.flash("errorMessage", "Selected coupon is not applicable to this purchase..Try another one!!");
                res.status(400).send({ success: false });
                return;
            } else { 
                      
                await Promise.all(user.map(async (usr) => {
                    console.log("couponid :",couponid);
                    usr.coupons.push(couponid);
                    await usr.save();
                    console.log("coupon added to collection");
                }));

                req.session.couponDiscountTotal = discountedTotal
                req.session.coupondiscount = couponDiscount

                console.log("coupon applied first time successfully..");
                req.flash("successMessage", "Coupon applied successfully...");
                res.status(200).send({ success: true, discountedTotal });                
            }

        } else if ( couponApplied ){
            console.log("error : coupon applied!!");
            req.flash("errorMessage", "Coupon already applied.. Try another one!!");
            res.status(400).send({ success: false });
            return;
        } else {
            console.log("coupon not applied yet");            
            if( (totalAmount < couponminim) || (couponDiscount > couponamt) ){
                req.flash("errorMessage", "Selected coupon is not applicable to this purchase..Try another one!!");
                res.status(400).send({ success: false });
                return;
            } else {                
                // user.coupons.push(cpn._id)
                // await user.save()
                for (let usr of user) {
                    console.log("couponid :",couponid);
                    usr.coupons.push(couponid);
                    await usr.save();
                    console.log("coupon added to collection");
                }   
                
                req.session.couponDiscountTotal = discountedTotal    
                console.log("coupon applied amount : " + discountedTotal);      
                console.log("coupon applied successfull..");
                req.flash("successMessage", "Coupon applied successfully...");
                res.status(200).send({ success: true, discountedTotal });                
            }
    
        } 
   
               
    } catch(err){
        console.log(err.message);
        req.flash("errorMessage", "Invalid coupon code or check details !!!");
        res.status(400).send({ success: false });
        return;
    }
}

/************session for saving address to delivery***********/
const selectedMethod = async(req,res)=>{
    try{
        console.log(req.body);
        const {paymethod} = req.body        
       console.log("radio button : "+ paymethod);
        req.session.paymethod = paymethod

        console.log(req.session.paymethod);
           
        res.sendStatus(200)

}
    catch(err){
        console.log(err.message);
    }
}


/****************** payment ********************/

const makeCODPayment = async(req,res)=>{
    try{
        //const userid = req.params.userid
        const jsonData = JSON.parse(Object.keys(req.body)[0]);

        const { paymentMethod,address,total,cartid,userid } = jsonData;
        console.log("checkout data :",jsonData)

        const user = await User.findOne({_id:userid}).exec()

        
    
            if(paymentMethod === 'Wallet' && (user.wallet === 0 || !user.wallet)){
                req.flash("errorMessage", "Payment failed..Your wallet is empty..!!");
                res.status(400).send({success : false ,msg : 'Something went wrong!'})
            } else  if( paymentMethod === 'Wallet' && user.wallet < total ){
                req.flash("errorMessage", "Insufficicient balance in wallet..!!");
                res.status(400).send({success : false ,msg : 'Something went wrong!'})
            } else {
       

       console.log("cart id :",cartid)
        const cartDet = await Cart.findOne({_id:cartid}).exec()
        
        console.log("Cart details :",cartDet)
       
        
        const productDet = await Products.findOne({_id:cartDet.product_list[0].productId}).exec()
        console.log("productlist for order :",productDet)

        const currentDate = moment().format('ddd MMM DD YYYY');
        const deliveryDate = moment().add(7,'days').format('ddd MMM DD YYYY') //expected
        //const returnDate = moment().add(12,'days').format('ddd MMM DD YYYY')
    
 
        req.session.cartid = cartid

         const order = new Order({
            order_date : currentDate,
            user: userid,
            address:address,
            payment : paymentMethod,
            product_list: cartDet.product_list,
            payment_amount:total,
            delivery_date:deliveryDate,
           // return_date:returnDate,
            paymentstatus:"pending",
            orderstatus:'pending',
            adminaction:'approve'        

         })
         const orderData = await order.save()
         await getQtyCount(req,res);

         console.log("order details :",orderData); //success
         console.log("order id :",orderData._id); //success
         console.log("order payment :",orderData.payment); //success

        
         req.session.orderid = orderData._id
         req.session.orderData = orderData

         if(orderData.payment === 'COD'){
            console.log('successfull');

            await Cart.updateOne(
                { _id:cartid },{$set:{status:"pending"}})

            res.json({cod_success : true})
        }  else if(orderData.payment === 'Wallet') {
            console.log('successfull');
            const newWallet = user.wallet - total
            await User.updateOne(
                {_id:userid},{$set:{wallet:newWallet}}).exec()
            
            await Cart.updateOne(
                { _id:cartid },{$set:{status:"pending"}}).exec()

            res.json({cod_success : true})

        }  else if(orderData.payment === 'Razorpay') {

           
            const amt = total * 100
            const options = {
                amount : amt,
                currency : 'INR',
                receipt : "RCPT"+orderData._id
            }
            razorpayInstance.orders.create(options,(err,razorder)=>{
                if(!err){                   
                   // console.log("razorpay order :",razorder)
                    res.json({
                        success : true,
                        msg : "Order Placed",
                        order_id :razorder.id,
                        amount : amt,
                        key_id : RAZORPAY_ID_KEY,
                        product_name : productDet.product_name ,
                        description : "Test Transaction",
                        contact : cartDet.user.phone,
                        name : cartDet.user.name,
                        email : cartDet.user.email,                       
                        razorder:razorder
                    })
                   
                } else {
                        console.error(err)
                        req.flash("errorMessage", "Payment failed.. Try again!!");
                        res.status(400).send({success : false ,msg : 'Something went wrong!'})
                   }
            })

         } else{
            console.log('failed');
             req.flash("errorMessage", "Payment failed.. Try again!!");
             res.redirect(`/checkout/${cartid}/${amount}`)
        }
    }

       
       
    }
    catch(err){
        console.log(err.message);
    }
}


const loadPaymentSuccess = async(req,res)=>{
    try{
            const {orderData} = req.session.orderData
            console.log("success :",orderData);
            await getQtyCount(req,res);

            res.render('content/PaymentSuccess',{
            title: "Successful Payment - TraditionShoppe",
            user : req.session.user,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount, 
            orderData:orderData,                
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

const verifyPayment = async (req, res) => {
    //const email = req.session.user;
   try{
            console.log("inside verifypayment")
            const { payment, razorOrder } = req.body;
            console.log("verifypayment details :",req.body)

            const crypto = require("crypto");
            var hmac = crypto.createHmac("sha256",RAZORPAY_SECRET_KEY);
            hmac.update(razorOrder.id + "|" + payment.razorpay_payment_id);
            hmac = hmac.digest("hex");
            console.log("hmac :",hmac)
            console.log("paymnt signtr :",payment.razorpay_signature)
            if (hmac == payment.razorpay_signature) {
              
                const orderid = req.session.orderid;
                console.log("orderid :",orderid)
                await Order.updateOne(
                    { _id: orderid },
                    { $set: {
                        paymentstatus:"completed"
                        } }
                ).exec()
                const cartid = req.session.cartid
                console.log("cartid :",cartid)
                await Cart.updateOne(
                    { _id: cartid },
                    { $set: {
                        status:"pending"
                        } }
                ).exec()
                console.log("payment verification success")
                res.status(200).json({ status: true });
            } else {
                console.log("payment verification failed")
                res.json({ status: false });
            }
   } catch(err){
    console.log(err.message);
   }
  }

// continue payment from order page
const continueFailedPayment = async (req, res) => {
    try{
                const { orderId } = req.body;
                const order = await Order.findOne({ orderId: orderId }).populate("user");
                req.session.failedPaymentOrderId = orderId;
                var options = {
                amount: order.payment_amount * 100,
                currency: "INR",
                receipt: "RCPT"+order._id,
                };
            
                instance.orders.create(options, function (error, raz_order) {
                if (error) {
                    console.error("Error creating Razorpay order:", error);
                } else {
                    res.json({ raz_order: raz_order, user: order.user });
                }
                })
    } catch (err){
            console.log(err.message);
    }
  }


  // continued failedPayment verification
const FailedPaymentVerification = async (req, res) => {
        try{
                 //const user_id = req.session.isAuth;
                const { payment, razorOrder } = req.body;
            
                const crypto = require("crypto");
                var hmac = crypto.createHmac("sha256", RAZORPAY_SECRET_KEY);
                hmac.update(razorOrder.id + "|" + payment.razorpay_payment_id);
                hmac = hmac.digest("hex");
                if (hmac == payment.razorpay_signature) {

                    const orderid = req.session.orderid;
                    console.log("orderid :",orderid)
                    await Order.updateOne(
                        { _id: orderid },
                        { $set: {
                            paymentstatus:"completed"
                            } }
                    ).exec()
                    const cartid = req.session.cartid
                    console.log("cartid :",cartid)
                    await Cart.updateOne(
                        { _id: cartid },
                        { $set: {
                            status:"pending"
                            } }
                    ).exec()
                    console.log("payment verification success")
                    res.status(200).json({ status: true });

                } else {

                    console.log("payment verification failed!!")
                    res.json({ status: false });
                }
        } catch(err) {
            console.log(err.message);
        }
  }

/*********load wishlist*********/
const loadWishlist = async(req,res)=>{
    try{
        res.render('content/myWishlist',{
            title: "My Wishlist - TraditionShoppe",
            page:"Checkout",   
            user : req.session.user, 
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,         
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

/*********load saved list*********/
const loadSaved = async(req,res)=>{
    try{
        res.render('content/savedList',{
            title: "Checkout - TraditionShoppe",
            page:"Checkout",  
            user : req.session.user,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,           
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}




module.exports = {

    getPaginatedProducts,
    getProductById,
    getProducts,

    loadAllProducts,
    loadSearchProducts,
    loadProductDetail,

    loadNew,

    getnewHandicrafts,
    getnewAntique,
    getnewApparels,
    getnewSpices,

    getmostSold,
    getLowtoHigh,
    getHightoLow,
    getascending,
    getdescending,

    getecoFriendly,
    getgiftCategory,
    gettoyCategory,

    getlowcost,
    getaverage,
    getcostly,
    gethighcostly,

    getbrassMaterial,
    getmetalMaterial,
    getwoodMaterial,

    storeSerachValue,
    listSearchProduct,

    loadCart,
    loadCheckout,
    loadWishlist,
    loadSaved,

    addToCartTable,
    addQtyToCart,
    subQtyFromCart,
    deleteFromCart,

    storeStateCountry,
    addNewAddress,
    loadEditAddress,
    changeStateCountry,
    changeAddress,
    selectedMethod,
    selectedAddress,

    couponApply,

   
    makeCODPayment,
    verifyPayment,
    continueFailedPayment,
    FailedPaymentVerification,
    loadPaymentSuccess,

    addToWishlist,
    addToSave,

    getQtyCount,
    getListCount
}