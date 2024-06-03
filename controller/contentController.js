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
const Order = require('../model/order');
const Coupon = require('../model/coupon')
const Wallet = require('../model/wallet')
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


//get all products from database
const getProducts = async(req,res,condition)=>{
    try{
        const products = await Products.aggregate([
            {
                $match : condition
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
                    let: { product_name: '$product_name' }, // Define variables for local and foreign fields
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$offer_name", "$$product_name"] }, // Match documents where offer_name equals categoryName
                                        { $eq: ["$status", true] } // Match documents where status is true
                                    ]
                                }
                            }
                        }
                    ], 
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
                    let: { categoryName: '$categoryInfo.category_name' }, // Define variables for local and foreign fields
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$offer_name", "$$categoryName"] }, // Match documents where offer_name equals categoryName
                                        { $eq: ["$status", true] } // Match documents where status is true
                                    ]
                                }
                            }
                        }
                    ],
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
                    },
                    numRatings: { $size: { $ifNull: ["$ratings", []] } }
                }
            },
            {
                $unwind: {
                    path: "$feedback",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'feedback.reviewby',
                    foreignField: '_id',
                    as: 'reviewbyInfo'
                }
            },
            {
                $addFields: {
                    'feedback.reviewbyInfo': { $arrayElemAt: ['$reviewbyInfo', 0] }
                }
            },
            {
                $unwind: {
                    path: "$ratings",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'ratings.ratedby',
                    foreignField: '_id',
                    as: 'ratedbyInfo'
                }
            },
            {
                $addFields: {
                    'ratings.ratedbyInfo': { $arrayElemAt: ['$ratedbyInfo', 0] }
                }
            },
            {
                $group: {
                    _id: '$_id',
                    feedback: { $push: '$feedback' },
                    ratings: { $push: '$ratings' },
                    productDetails: { $first: '$$ROOT' }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ['$productDetails', { feedback: '$feedback', ratings: '$ratings' }]
                    }
                }
            }
        ]);
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

const getPaginatedProducts = async(req,res,perPage,pageNum,matchCondition)=>{
    try{
        const products = await Products.aggregate([
            {
                $match : matchCondition 
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
                    let: { product_name: '$product_name' }, // Define variables for local and foreign fields
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$offer_name", "$$product_name"] }, // Match documents where offer_name equals categoryName
                                        { $eq: ["$status", true] } // Match documents where status is true
                                    ]
                                }
                            }
                        }
                    ], 
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
                    let: { categoryName: '$categoryName' }, // Define variables for local and foreign fields
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$offer_name", "$$categoryName"] }, // Match documents where offer_name equals categoryName
                                        { $eq: ["$status", true] } // Match documents where status is true
                                    ]
                                }
                            }
                        }
                    ],
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
const getSortedProducts = async(req,res,perPage,pageNum,matchCondition,sortCondition)=>{
    try{
        const products = await Products.aggregate([
            {
                $match : matchCondition 
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
                    let: { product_name: '$product_name' }, // Define variables for local and foreign fields
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$offer_name", "$$product_name"] }, // Match documents where offer_name equals categoryName
                                        { $eq: ["$status", true] } // Match documents where status is true
                                    ]
                                }
                            }
                        }
                    ], 
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
                    let: { categoryName: '$categoryName' }, // Define variables for local and foreign fields
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$offer_name", "$$categoryName"] }, // Match documents where offer_name equals categoryName
                                        { $eq: ["$status", true] } // Match documents where status is true
                                    ]
                                }
                            }
                        }
                    ],
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
                $sort : sortCondition
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
const getnameSortedProducts = async(req,res,perPage,pageNum,matchCondition,sortCondition)=>{
    try{
        const products = await Products.aggregate([
            {
                $match : matchCondition 
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
                    let: { product_name: '$product_name' }, // Define variables for local and foreign fields
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$offer_name", "$$product_name"] }, // Match documents where offer_name equals categoryName
                                        { $eq: ["$status", true] } // Match documents where status is true
                                    ]
                                }
                            }
                        }
                    ], 
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
                    let: { categoryName: '$categoryName' }, // Define variables for local and foreign fields
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$offer_name", "$$categoryName"] }, // Match documents where offer_name equals categoryName
                                        { $eq: ["$status", true] } // Match documents where status is true
                                    ]
                                }
                            }
                        }
                    ],
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
                $sort : sortCondition
            },
            {
                $collation: { locale: 'en'}
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
const loadAllProducts = async(req,res)=>{
    try{
       
        const pageNum = parseInt(req.query.page) || 1;
        const pageDB = pageNum - 1;
        const perPage = 9;
        const search = req.query.search || "";
        let query = [
            { status: { $ne: 'inactive' } },
            { isListing: true }
        ];
        let sortCondition = { created:1 };
        // Search and filter conditions
        if (search !== "") {
          query.push(
            { "product_name": { $regex: ".*" + search + ".*", $options: 'i' } }
          );
        } 
          // Accumulate filter conditions based on query parameters
          if (req.query.categ_type) {
            const categType = req.query.categ_type.split("%2C");
            query.push({ product_type: { $in: categType } });
          }
        
          if (req.query.color) {
            const colors = req.query.color.split(",");
            query.push({ color: { $in: colors } });
          }

          if(req.query.trend){
            //const trend = req.query.trend.split(",");
            query.push({ status:'new' });
          }
        
          if (req.query.minPrice && req.query.maxPrice) {
            const minPrice = parseFloat(req.query.minPrice);
            const maxPrice = parseFloat(req.query.maxPrice);
            query.push({ price_unit: { $gte: minPrice, $lte: maxPrice } });
          }

         
          if(req.query.sort){
            switch (req.query.sort) {
                case 'lowtohigh':
                  sortCondition = { discountedsalePrice: 1 };
                  break;
                case 'hightolow':
                  sortCondition = { discountedsalePrice: -1 };
                  break;
                case 'ascending':
                  sortCondition = { product_name: 1 };
                  break;
                case 'descending':
                  sortCondition = { product_name: -1 };
                  break;
                default:
                  sortCondition = { created:1 }; // No sorting
                  break;
              }
            
         // console.log("sort:",sortCondition)
          // Continue to add more filter conditions as needed
        }
        console.log("sort:",sortCondition)
        console.log("query:",query)
        // Aggregation stages
        const matchStage = query.length > 0 ? { $match: { $and: query } } : { $match: {} };
        const sortStage = Object.keys(sortCondition).length > 0 ? { $sort: sortCondition } : { $sort: {} };
        const facetStage = {
          $facet: {
            products: [
              matchStage,
              {
                $lookup: {
                  from: 'discounts',
                  localField: 'discount',
                  foreignField: '_id',
                  as: 'discountInfo'
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
                          { $subtract: [1, { $divide: [{ $toDouble: { $arrayElemAt: ["$discountInfo.percentage", 0] } }, 100] }] }
                        ]
                      },
                      else: "$price_unit"
                    }
                  }
                }
              },
              {
                $lookup: {
                  from: 'categories',
                  localField: 'category',
                  foreignField: '_id',
                  as: 'categoryInfo'
                }
              },
              {
                $addFields: {
                  categoryInfo: { $arrayElemAt: ['$categoryInfo', 0] },
                  categoryName: "$categoryInfo.category_name"
                }
              },
              {
                $lookup: {
                  from: 'offers',
                  let: { product_name: '$product_name' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$offer_name", "$$product_name"] },
                            { $eq: ["$status", true] }
                          ]
                        }
                      }
                    }
                  ],
                  as: 'productoffer'
                }
              },
              {
                $addFields: {
                  productoffer: { $arrayElemAt: ['$productoffer', 0] },
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
                $lookup: {
                  from: 'offers',
                  let: { categoryName: '$categoryInfo.category_name' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$offer_name", "$$categoryName"] },
                            { $eq: ["$status", true] }
                          ]
                        }
                      }
                    }
                  ],
                  as: 'categoryoffer'
                }
              },
              {
                $addFields: {
                  categoryoffer: { $arrayElemAt: ['$categoryoffer', 0] },
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
                      if: { $isArray: "$discountInfo" },
                      then: { $arrayElemAt: ["$discountInfo", 0] },
                      else: null
                    }
                  },
                  discountedsalePrice: {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ["$discountInfo", null] },
                          { $or: [
                            { $ne: ["$pdtoffer", 0] },
                            { $ne: ["$categoffer", 0] }
                          ]}
                        ]
                      },
                      then: {
                        $subtract: [
                          "$discountedPrice",
                          { $max: ["$pdtoffer", "$categoffer"] }
                        ]
                      },
                      else: "$discountedPrice"
                    }
                  },
                  numRatings: { $size: { $ifNull: ["$ratings", []] }}

                }
              },
              
              sortStage,
              { $skip: pageDB * perPage },
              { $limit: perPage },
            ],
            productCount: [
              matchStage,
              { $count: "count" }
            ]
          }
        };
        
        const results = await Products.aggregate([facetStage]);
        
        const products = results[0].products;

        console.log("products :",products)

        const totalCount = results[0].productCount[0] ? results[0].productCount[0].count : 0;
        const pages = Math.ceil(totalCount / perPage);
        
        res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
            page : 'All products', 
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,               
            products,
            pageNum,
            perPage,
            totalCount, 
            pages,
            currentUrl: req.originalUrl,         
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
           })
        
    }
    catch(err){
        console.log(err.message)
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
        const user_cart = await Cart.findOne({user:req.session.user,status:"listed"}).exec()
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
       
        const user_list = await List.findOne({user:req.session.user}).exec()

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
        let pdtid = new mongoose.Types.ObjectId(req.params.id)
        
        const user_id= req.session.user
        //const users = await User.findById(user_id)
        let condition = { _id:pdtid }
        
        const products = await getProducts(req,res,condition)
        console.log("produtc :",products)
        condition = {
            $and : [
                { status: { $ne: 'inactive' } },
                { isListing : true}
                ]}
        
        const allproducts = await getProducts(req,res, condition)

        //console.log("productdetails :",products)
        
        await getQtyCount (req,res)
        await getListCount (req,res)
        
       
        res.render('content/productView',{
            title: "View Product | TraditionShoppe", 
            user : req.session.user,
            blocked:req.session.blocked,
            user_id:user_id[0]._id,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,         
            products,
            allproducts, 
           // users,        
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

        const user_id = req.session.user       
        let condition = {
            $and : [
                { status: { $ne: 'inactive' } },
                { isListing : true}
                ]}
        const products = await getProducts(req,res,condition)
       
        const user_cart = await Cart.findOne({
            user:user_id,
            status:"listed",
            //"product_list.productId" : { $in : products.map(pdt => pdt._id)}        
        }).exec()
        let mrpTotal = 0;
        
        if(user_cart){
            if(user_cart.product_list == ''){
                await Cart.deleteOne( { 
                    user: user_id,
                })
            } else {
                user_cart.product_list.forEach((cart)=>{
                    console.log("check pdt")
                    products.forEach((pdt)=>{
                        console.log("pdt tracking", pdt._id)
                        if(cart.productId.equals(pdt._id) ){
                            console.log("pdt equal",cart.quantity,pdt.price_unit)
                             mrpTotal += parseFloat(cart.quantity * pdt.price_unit)
                        }
                    })
                })
            }
            req.session.mrpTotal = mrpTotal        
            
        }      
        
         
        res.render('content/myCart',{
            title: "My Cart - TraditionShoppe",
            page:"My Cart",   
            user : req.session.user, 
            blocked:req.session.blocked,           
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
        const user_id = req.session.user
       // const product = await Products.findOne({_id:pdt_id}).exec();
        const stock = await Products.findOne({_id:pdt_id},{stock:1}).exec()
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
                       res.json({ success: true });
                   } else {
                       console.log('failed');
                       req.flash("errorMessage", "Product is not added to cart... Try again!!");
                       res.json({ success: false });
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
                res.json({ success: true });
            } else {
                console.log("user exist pdt not, push new pdts into pdtlist array")
                await Cart.updateOne({_id:user_cart.id},
                    { $push: { 'product_list':{productId :pdt_id ,quantity:1,price:price,total:price}} , $inc: { total_amount: parseFloat(price) }},
                    {$set:{status:"listed"}})  
                   
                   console.log('successful');
                   await getQtyCount(req,res);
                req.flash("successMessage", "Product is successfully updated to cart...");
                res.json({ success: true });

            }
    
        } 
    }else{
        req.flash("errorMessage", "Out of the stock!!");
        res.json({ success: false });
    }
    }
    catch(err){
        console.log(err.message);
    }
}

/*********add qty to cart table*********/
const addQtyToCart = async(req,res)=>{
    try{
        console.log("increasing qntity")
       // console.log("ids :",cartid,userid,pdtid,price);
        const cartid = req.params.cartid;
        const userid = req.params.userid;
        const pdtid = req.params.pdtid;
        const price = req.params.price;

        const stock = await Products.findOne({_id:pdtid},{stock:1,_id:0}).exec()
        const user_cart = await Cart.findOne({_id:cartid}).exec()
        console.log("stock: "+stock.stock)

        if( stock.stock>0 ){
            let qty = 0;
            let amount = 0;

            user_cart.product_list.forEach(product => {
                if( product.productId == pdtid ){
                    //pdt_check = true;
                    qty = product.quantity;        
                    console.log("quantity :",qty)                   

                }})

                if(qty >=stock.stock){
                    req.flash("errorMessage", "Stock exceeds!!");
                    res.json({ success: false });
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
                    const newQty = qty+1
                    const totalAmount = amount + parseFloat(price)
                    await getQtyCount(req,res);
                    const qtyCount =  req.session.qtyCount
                    console.log('qty added successful');
                    //req.flash("successMessage", "Product is successfully updated to cart...");
                    res.json({ success: true,newQty,qtyCount,totalAmount});
                }
                
        } else {
            //req.flash("errorMessage", "Out of the stock!!");
            res.json({ success: false},{message:'Out of stock' });
        }

    }
    catch(err){
        console.log(err.message);
        req.flash("errorMessage", "Adding to cart failed !!");
        res.json({ success: false });
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
            const newQty = qty - 1
            const totalAmount = amount - parseFloat(price)
            await getQtyCount(req,res);
            const qtyCount =  req.session.qtyCount
            console.log('successful');
            //req.flash("successMessage", "Product is successfully updated to cart...");
            res.json({ success: true , newQty,qtyCount,totalAmount});

        } else if (qty<=1){
            if( user_cart.product_list.length === 1 ){
            await Cart.deleteOne(
                { _id:cartid })
                console.log('successful');
                await getQtyCount(req,res);
                //req.flash("successMessage", "User is deleted from cart...");
                res.json({ success: false });
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
           // req.flash("successMessage", "Product is deleted from cart...");
            res.json({ success: false });
        }
    }
    }
    catch(err){
        console.log(err.message);
        req.flash("errorMessage", "Deletion process failed !!...");
        res.json({ success: false });
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
        if( user_cart.product_list.length === 1 ){
            await Cart.deleteOne(
                { _id:cartid })
                console.log('successful');
                await getQtyCount(req,res);
               // req.flash("successMessage", "User is deleted from cart...");
                res.json({ success: true });
            } else {
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
           // req.flash("successMessage", "Product is deleted from cart...");
            res.json({success:true})
        }
    }
    catch(err){
        console.log(err.message);
        req.flash("errorMessage", "An error occured while deleting the product from cart!!...");
        res.json({ success: false });
    }
}


/*********add to wishlist table*********/
const addToWishlist = async(req,res)=>{
    try{
        //add user, productlist; user exist- update, otherwise insert
        let pdt_id = req.params.id;
        const user_id = req.session.user
        const user_list = await List.findOne({user:user_id}).exec()

        if (user_list){
            let pdt_check = false
            user_list.product_list.forEach((pdt)=>{
                if(pdt.toString() === pdt_id.toString()){
                    pdt_check = true
                }
            })
            if(pdt_check){
                req.flash("successMessage", "Product is already in the list!!");
                res.redirect(`/viewProduct/${pdt_id}`)
            } else {
                await List.updateOne({_id:user_list._id},
                    { $push: { product_list: pdt_id }})

                    console.log('successful');
                    req.flash("successMessage", "Product is successfully added to wishlist...");
                    res.redirect(`/viewProduct/${pdt_id}`)
            }
        } else {
            const list = new List({
                 user:user_id,
                 product_list:pdt_id,
            })
            const listData = await list.save()
            if(listData){
                console.log('successfully added to list');
                req.flash("successMessage", "Product is successfully added to wishlist...");
                res.redirect(`/viewProduct/${pdt_id}`)
            } else {
                console.log('failed to add to wishlist');
                req.flash("errorMessage", "Product is not added to wishlist... Try again!!");
                res.redirect("/viewProduct/${pdt_id}");
            }  

        }
        
    }
    catch(err){
        console.log(err.message);
    }
}


/*********load checkout*********/
const loadCheckout = async(req,res)=>{
    try{
        
       
        const userid = req.session.user
       // if(req.query){}
        let coupondisc = req.query.coupondisc
        console.log("checkout query:",req.query)
        console.log("coupondis :",coupondisc)
        
        const cartDet = await Cart.find({_id:req.params.cartid}).exec()
        const userAddress = await Address.find({user_id:userid}).exec()
        let amount = req.params.amount
        let deliveryCharge = 0
        if (amount < 1500){
            deliveryCharge = 80
            amount = amount - 80
        }

        await getQtyCount(req,res)
        await getListCount(req,res)

        let coupondiscount = 0
        if(coupondisc){
            coupondiscount = coupondisc
        }

        res.render('content/checkout',{
            title: "Checkout - TraditionShoppe",
            page:"Checkout",   
            user : req.session.user,
            blocked:req.session.blocked,
            cartDet, 
            userAddress,
            amount,
            coupondiscount,
            deliveryCharge,
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



/************add address**************/
const addNewAddress =async(req,res)=>{
    try{
        const userid = req.params.userid;
        const cartid = req.params.cartid;
        const amount = req.params.amount;

        const user_addr = await Address.find({user_id:userid}).exec()
        let setDefault = true
        if(user_addr){
            setDefault = false
        }

        const address = new Address({
            user_id:userid,
            name: req.body.name,
            mobile:req.body.mobile,
            house:req.body.house,
            street:req.body.street,
            landmark:req.body.landmark,
            city:req.body.city,
            pincode:req.body.pin,
            state:req.body.state,
            country:req.body.city,
            isDefault:setDefault
        })

    
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
            blocked:req.session.blocked,
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



/************edit address**************/
const changeAddress =async(req,res)=>{
    try{
        const addressid = req.params.addressid;
        const cartid = req.params.cartid;
        const amount = req.params.amount
      
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
                state:req.body.state,
                country:req.body.country,
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

        const cartid = req.params.cartid
        console.log("cartid :",cartid)

        console.log("req-body :",req.body)
        const { couponCode , totalAmount } = req.body

        const user = await User.find({ _id:userid }).exec()
        const coupon = await Coupon.find({ coupon_code : couponCode},{_id:1,discount_per:1,minimum_purchase:1,maximum_discount_amt:1}).exec()

        //to change the total with coupon amount for each product in cart
        let pdtCount = 0;
        const cart = await Cart.findOne({_id:cartid}).exec()
        console.log("cart:",cart)
        cart.product_list.forEach((lst)=>{
            pdtCount++
        })
        console.log('pdt count :',pdtCount)
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
        if(couponDiscount > couponamt){
            couponDiscount = couponamt
        }
        let discountedTotal = totalAmount - couponDiscount   
        //coupon amount for each product
        let productCoupon = couponDiscount / pdtCount
        productCoupon = parseFloat(productCoupon.toFixed(2));
        console.log("prdt coupon :",productCoupon)
        console.log("coupon discount :",couponDiscount);
        console.log("total discount :",discountedTotal);
        user.forEach((usr)=>{
            if(usr.coupons.length === 0){
                couponEmpty = true
            } else {
                usr.coupons.forEach((cpn)=>{
                    if(cpn === null){
                        couponApplied = false
                    } else if( cpn.equals(couponid)){
                        couponApplied = true
                    }
            })}
        })
        
        
        //coupuns empty or not
        if(couponEmpty){
            console.log("coupon empty");           
            if(totalAmount < couponminim){
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
                req.session.couponid = couponid
                req.session.productCoupon = productCoupon

                console.log("coupon applied first time successfully..");
                req.flash("successMessage", "Coupon applied successfully...");
                res.status(200).send({ success: true,discountedTotal,couponDiscount});                
            }

        } else if ( couponApplied ){
            console.log("error : coupon applied!!");
            req.flash("errorMessage", "Coupon already applied.. Try another one!!");
            res.status(400).send({ success: false });
            return;
        } else {
            console.log("coupon not applied yet");            
            if( totalAmount < couponminim){
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
                req.session.coupondiscount = couponDiscount 
                req.session.couponid = couponid 
                req.session.productCoupon = productCoupon

                console.log("coupon applied amount : " + discountedTotal);      
                console.log("coupon applied successfull..");
                req.flash("successMessage", "Coupon applied successfully...");
                res.status(200).send({ success: true, discountedTotal,couponDiscount });                
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
        let charge = 0
        if (total < 1500){
            charge = 80
        }

        const user = await User.findOne({_id:userid}).exec()
        const cartDet = await Cart.findOne({_id:cartid}).exec()

        let paymntamnt = total
        console.log('total before coupon:',paymntamnt)
        if(req.session.couponDiscountTotal){
            paymntamnt = req.session.couponDiscountTotal 
            cartDet.product_list.forEach((lst)=>{
                //set product total by reducing coupon amt
                lst.total -= req.session.productCoupon
             })
        }
        console.log('total after coupon:',paymntamnt)

        console.log("userwallet :",user.wallet," paymethod :",paymentMethod)
    
            if(paymentMethod === 'Wallet' && (user.wallet === 0 || !user.wallet)){
                console.log("Payment failed..Your wallet is empty..!!")
                req.flash("errorMessage", "Payment failed..Your wallet is empty..!!");
                res.json({wallet_empty : true})
            } else  if( paymentMethod === 'Wallet' && user.wallet < total ){
                console.log("Insufficicient balance in wallet..!!")
                req.flash("errorMessage", "Insufficicient balance in wallet..!!");
                res.json({wallet_empty : true})
            } else {
              
      
        //change each cart product total with coupon value

       

        const currentDate = moment().format('ddd MMM DD YYYY');
        const deliveryDate = moment().add(7,'days').format('ddd MMM DD YYYY') //expected
        console.log("dates:",new Date(currentDate),new Date(deliveryDate)) 
        const newList = cartDet.product_list.map(pdt => {
            return { ...pdt,  
                orderstatus:'pending',
                paymentstatus:"pending",
                delivery_date:new Date(deliveryDate),
            }; // Add the status field to each item
        });
        
        const productDet = await Products.findOne({_id:cartDet.product_list[0].productId}).exec()
       
        req.session.cartid = cartid
        let order;
        if(req.session.couponid){
            order = new Order({
                order_date : new Date(currentDate),
                user: userid,
                address:address,
                payment : paymentMethod,
                coupon: req.session.couponid,
                product_list: newList,
                payment_amount:total,
                fixedDeliveryCharge:charge              
               })
        } else {

        order = new Order({
            order_date : new Date(currentDate),
            user: userid,
            address:address,
            payment : paymentMethod,
            product_list: newList,
            payment_amount:total,
            fixedDeliveryCharge:charge                
           })
        }
         const orderData = await order.save()
         await getQtyCount(req,res);
        
        
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
            const walletsave = new Wallet({
                user:userid,
                order:orderData._id,
                transactiontype:'debited',
                amount:total,
            }).save()
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
                        res.json({success : false})
                   }
            })

         } else{
            console.log('failed');
             req.flash("errorMessage", "Payment failed.. Try again!!");
             res.json({success:false})
       }
    }

       
       
    }
    catch(err){
        console.log(err.message);
    }
}


const loadPaymentSuccess = async(req,res)=>{
    try{
            console.log("session :",req.session.orderData)    
            const orderData = req.session.orderData
            console.log("orderdata :",orderData)
            const order = await Order.aggregate([
                {
                    $match: { _id:orderData._id }
                }, 
                {
                    $unwind: "$product_list"   
                },         
               
                {
                    $lookup: {
                        from: "products", // Assuming 'addresses' is the name of your Address collection
                        localField: "product_list.productId", // Field in the 'orders' collection
                        foreignField: "_id", // Field in the 'addresses' collection
                        as: "productDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$productDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
            ])
               
           console.log("orders :",order);
            await getQtyCount(req,res);

            res.render('content/PaymentSuccess',{
            title: "Successful Payment - TraditionShoppe",
            user : req.session.user,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount, 
            order,                
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
                        "product_list.$[].paymentstatus": "completed"
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
                res.json({success: true });
            } else {
                console.log("payment verification failed")
                res.json({success: false });
            }
   } catch(err){
    console.log(err.message);
   }
  }
 const verifyFailedPayment = async (req,res)=>{
    try{
        console.log("order :", req.session.orderid,"cartid :", req.session.cartid)
        // const failedOrder = await Order.updateOne({_id:req.session.orderid},{$set:{
        //     "product_list.$[].paymentstatus":"pending"
        // }}).exec()
        //  if(failedOrder){
            await Cart.updateOne({_id:req.session.cartid},
                { $set: {
                    status:"pending"
                    } }
            ).exec()
            req.flash("errorMessage", "Payment failed.. Try again!!");
            res.json({
                success: true,
                orderid: req.session.orderid,
                cartid: req.session.cartid
              });
        //  }
    } catch(err){
        console.log(err.message);
    }
 }

 //payment again 
 const continuePaymentFailed = async (req, res) => {
    // const orderid  = req.body.orderid;
    // const prdtid = req.body.prdtid;
    const orderid = new mongoose.Types.ObjectId(req.body.orderid);
    const prdtid = new mongoose.Types.ObjectId( req.body.prdtid);
    const order = await Order.aggregate([
        {
            $match: {
                _id: orderid,
                "product_list.productId": prdtid
            }
        },
        {
            $addFields: {
                product: {
                    $filter: {
                        input: "$product_list",
                        as: "product",
                        cond: { $eq: ["$$product.productId", prdtid] }
                    }
                }
            }
        }, 
        {
            $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
            }
        }, 
        {
            $lookup: {
                from: "products",
                localField: "product.productId",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        {
            $unwind: {
                path: "$productDetails",
                preserveNullAndEmptyArrays: true
            }
        },  
                
        {
            $lookup: {
                from: "users", // Assuming 'addresses' is the name of your Address collection
                localField: "user", // Field in the 'orders' collection
                foreignField: "_id", // Field in the 'addresses' collection
                as: "userDetails"
            }
        },
        {
            $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
            }
        }  
    ]).exec();
   // console.log("payorder :",order)
  // console.log("Detail :",order[0].userDetails.name)
    req.session.failedPaymentOrderId = orderid;
    req.session.failedPaymentPrdtid = prdtid;
   // console.log("session :", req.session.failedPaymentOrderId,req.session.failedPaymentPrdtid )
    var options = {
      amount: order[0].product.total * 100,
      currency: "INR",
      receipt: "RCPT"+order._id+prdtid,
    };
  
    razorpayInstance.orders.create(options,(err,razorder)=>{
        if(!err){                   
           // console.log("razorpay order :",razorder)
            res.json({
                success : true,
                msg : "Order Placed",
                order_id :razorder.id,
                amount : order[0].product.total * 100,
                key_id : RAZORPAY_ID_KEY,
                product_name : order[0].productDetails.product_name ,
                description : "Test Transaction",
                contact : order[0].userDetails.phone,
                name : order[0].userDetails.name,
                email : order[0].userDetails.email,                       
                razorder:razorder
            })
           
        } else {
                console.error(err)
                req.flash("errorMessage", "Payment failed.. Try again!!");
                res.json({success : false})
           }
    })
  };
  //verify payment after failed payment
  const verifyPaymentFailed = async (req, res) => {
    //const email = req.session.user;
   try{
            console.log("inside verifypayment")
            const { payment, razorOrder} = req.body;
            console.log("verifypayment details :",req.body)

            const crypto = require("crypto");
            var hmac = crypto.createHmac("sha256",RAZORPAY_SECRET_KEY);
            hmac.update(razorOrder.id + "|" + payment.razorpay_payment_id);
            hmac = hmac.digest("hex");
            console.log("hmac :",hmac)
            console.log("paymnt signtr :",payment.razorpay_signature)
            if (hmac == payment.razorpay_signature) {
              
                const orderid = req.session.failedPaymentOrderId;
                const order = await Order.findOne({_id:orderid})
                req.session.orderData = order
                const pdtid =  req.session.failedPaymentPrdtid;
                console.log("orderid :",orderid)
                console.log("pdtid :",pdtid)
                await Order.updateOne(
                    { _id: orderid,"product_list.productId":pdtid},
                    { $set: {
                        "product_list.$[elem].paymentstatus": "completed"
                    } },
                    { arrayFilters: [{ "elem.productId": pdtid }] } )                 
               
               
                console.log("payment verification success")
                res.json({success: true });
            } else {
                console.log("payment verification failed")
                res.json({success: false });
            }
   } catch(err){
    console.log(err.message);
   }
  }



module.exports = {

    getPaginatedProducts,  
    getProducts,
    getSortedProducts,
    getnameSortedProducts,
    
    loadAllProducts,
  
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

    getbrassMaterial,
    getmetalMaterial,
    getwoodMaterial,

    storeSerachValue,
    listSearchProduct,

    loadCart,
    loadCheckout,
    
    addToCartTable,
    addQtyToCart,
    subQtyFromCart,
    deleteFromCart,

  
    addNewAddress,
    loadEditAddress,   
    changeAddress,
    selectedMethod,
    selectedAddress,

    couponApply,

   
    makeCODPayment,
    verifyPayment,
    verifyFailedPayment,    
    loadPaymentSuccess,

    continuePaymentFailed,
    verifyPaymentFailed,

    addToWishlist,
    

    getQtyCount,
    getListCount
}