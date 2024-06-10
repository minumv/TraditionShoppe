const express = require("express")
const User = require('../model/user')
const Products = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')
const bcrypt = require('bcrypt')
const Banner = require("../model/banner")





/*.................... Product details ................. */

const getProducts = async(req,res)=>{
    try{
        const products = await Products.aggregate([
            
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
                    let: { categoryName: '$categoryName' }, 
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
                    }
                }
            },
            {
                $sort : { 'created' : -1 }
            }           
        ])
        return products
    }
    catch(err){
        console.log(err.message);
    }
}
  // load products page
  const loadProducts = async(req,res)=>{
    try{
        const products= await getProducts(req,res)
        console.log(products)
        
        res.render('admin/products',{
            title : "Admin Panel - TraditionShoppe",
            page:"Products",
            products:products,
           
            errorMessage: req.flash("errorMessage"), 
            successMessage: req.flash("successMessage") 
       
    })
        
    } catch (err){
        console.log(err.message);
    }
}

//load new products page
const loadNewProducts = async(req,res)=>{
    try{
        const categoryQuery = Category.find({status:true}).exec()
        const sellerQuery = Seller.find({status:{$ne:'inactive'}}).exec()
        const discountQuery = Discount.find({status:true}).exec()

        const [categories, sellers, discounts] = await Promise.all([categoryQuery, sellerQuery, discountQuery]);
        
        res.render('admin/addProducts',{
            title:'Add products - TraditionShoppe',
            page:"New Products",
            categories:categories,
            sellers:sellers,
            discounts:discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })           
    }
    catch(err){
        console.log(err.message);
    }
}

//upload images into folder

const storeDropdownValues = async (req,res,next)=>{
    try{

        // Extract dropdown values from the request body
        console.log(req.body);
        const { category, seller, discount, material, color, product_type } = req.body;

        // Store dropdown values in session
        req.session.dropdownValues = { category, seller, discount, material, color, product_type  };  
        console.log("session values in storeDropdonValues:");
        console.log(req.session.dropdownValues); 
        res.sendStatus(200);    
    
    }
    catch(err){
        console.log(err.message);
    }
   
}


const submitProducts = async (req,res)=>{
    try{
      
        console.log(req.body);
        console.log("try for session in /submitProducts");
        console.log(req.session.dropdownValues);
        const { category, seller, discount, material, color, product_type} = req.session.dropdownValues;        
        const categ = await Category.findOne({ category_name: category }, { _id: 1 }).exec();
        console.log('Category:', category, categ);        
        const sellr = await Seller.findOne({ seller_name: seller }, { _id: 1 }).exec();
        console.log('Seller:', seller, sellr);        
        const disc = await Discount.findOne({ discount_name: discount }, { _id: 1 }).exec();
        console.log('Discount:', discount, disc);        
        if (!categ || !sellr || !disc) {
            console.log('One or more documents not found in the database.');          
        }
        let imgArray = req.uploadedFiles
       // imgArray.pop()
       imgArray.splice(0,3)
        //console.log(imgArray)

        const product = new Products({

            product_name: req.body.name,
            category: categ,
            seller: sellr,
            description : req.body.description,
            stock:req.body.stock,
            price_unit:req.body.price,
            discount: disc,
            material:material,
            color:color,
            size:req.body.size,
            weight:req.body.weight,
            images:imgArray ,
            product_type:product_type,
            status:'new',
            isListing:true
        })

        console.log('Final Product:', product);

        const productData = await product.save()
        if(productData){
            console.log('successful');          
            res.json({success:true})
        } else {
            console.log('failed');            
            res.json({success:false})
        }  
    }
    catch(err){
        console.log(err.message)
    }
}
//load update product page
const loadProductsChange = async(req,res)=>{
    try{
        const categoryQuery = Category.find({status:true}).exec()
        const sellerQuery = Seller.find({status:{$ne:'inactive'}}).exec()
        const discountQuery = Discount.find({status:true}).exec()

        const [categories, sellers, discounts] = await Promise.all([categoryQuery, sellerQuery, discountQuery]);
        
        let id = req.params.id
        Products.findById(id)
        .then(products=>{
        res.render('admin/changeProduct',{
            title: " Update Product | TraditionShoppe ",
            page:"Change Products",
            categories:categories,
            sellers:sellers,
            discounts:discounts,
            products:products,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    })
    }
    catch(err){
        console.log(err.message);
    }
}


const storeDropdownEdit = async (req,res,next)=>{
    try{

        // Extract dropdown values from the request body
        console.log(req.body);
        const { category, seller, discount, material, color, product_type, status, isListing } = req.body;

        // Store dropdown values in session
        req.session.dropdownEdit = { category, seller, discount, material, color, product_type, status, isListing   };  
        console.log("session values in storeDropdonValues:");
        console.log(req.session.dropdownEdit); 
        res.sendStatus(200);    
    
    }
    catch(err){
        console.log(err.message);
    }
   
}
//update products
const updateProduct = async(req,res)=>{
    try{
        let id = req.params.id
      if(req.session.dropdownEdit){
        const { category, seller, discount, material, color, product_type, status, isListing } = req.session.dropdownEdit;
        const categ = await Category.findOne({ category_name: category }, { _id: 1 }).exec();
        const sellr = await Seller.findOne({ seller_name: seller }, { _id: 1 }).exec();
        const disc = await Discount.findOne({ discount_name: discount }, { _id: 1 }).exec();

        if (!categ || !sellr || !disc) {
            console.log('One or more documents not found in the database.');
        }
        await Products.updateOne({_id:id},{$set:{
            product_name: req.body.name,
            category: categ,
            seller: sellr,
            description : req.body.description,
            stock:req.body.stock,
            price_unit:req.body.price,
            discount: disc,
            material:material,
            color:color,
            size:req.body.size,
            weight:req.body.weight,           
            product_type:product_type,
            status:status,
            isListing:isListing
        }})
        res.redirect('/admin/products')
    } else{
        console.log('not updated');

    }
    }
    catch(err){
        console.log(err.message);
    }
}


const loadImage = async(req,res)=>{
    try{
        console.log('display page')
        res.render('admin/changeImage',{
            title : "Add Image - TraditionShoppe",
            page:"Add new Image",
            pdtid:req.params.pdtid,
            images:req.query.image,
            errorMessage : req.flash('errorMessage'),
            successMessage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

const addimageTopdt = async(req,res)=>{
    try{
        const pdtid = req.body.pdtid
        const image = req.body.image
        let imgArray=req.uploadedFiles
        console.log('img req:',image)
        console.log("imgarray :",imgArray)
        imgArray.splice(0,1)
        console.log("array :",imgArray)
        if(req.body.image !== null){
            console.log("images loaded")
            await Products.updateOne({_id:pdtid },
                { $pull: { images: image }}) 
                console.log('deleted previous')
            }          
        const pdtDisp = await Products.findById(pdtid)
        console.log("imge display:",pdtDisp)
        const product = await Products.updateOne({_id:pdtid },
            { $push: { images: imgArray[0]}}) 

        if(product){
            res.json({success:true})
        } 
        else{
            req.flash("errorMessage", "Image uploading failed!!");
            res.json({success:false})   
        }      
    }
    catch(err){
        console.log(err.message);
    }
}

const deleteImage = async(req,res)=>{
    try{
        console.log('to delete')
        console.log(req.body)
        const pdtid = req.body.pdtid
        const image = req.body.images
        console.log(pdtid,image)
        const product = await Products.updateOne({_id:pdtid },
            { $pull: { images: image }}) 
        if(product){
            console.log('deleted')
            req.flash("successMessage", "Image deletion successfull...");
            res.json({success:true})
        } 
        else{
            req.flash("errorMessage", "Image deletion failed!!");
            res.json({success:false})   
        }      
    }
    catch(err){
        console.log(err.message);
    }
}
// delete product
const  deleteProduct = async (req,res)=>{
    try{       
        console.log('deleting')
        let id = req.params.id
        console.log(id)
        await Products.updateOne({_id:id},{$set:{
        status : "inactive"           
    }})
    res.redirect('/admin/products')
     
    } catch (err){
        console.log(err.message);
    }
    
}

/**********************banner management******************************/

     //load banner page
     const loadBanner = async (req, res)=>{
        try {
            const banner = await Banner.findOne().sort({ _id: -1 }).exec(); 
            console.log("banner",banner)
            res.render('admin/banner',{
                title : "Admin Panel - TraditionShoppe",
                page:"Banner",
                banner,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
            
        } catch (err) {
            console.log(err.message);
        }
    }

    //add banner image to database
    const addimageBanner = async (req,res)=>{
        try{
            let imgArray=req.uploadedFiles
            console.log("array :",imgArray)
            imgArray.splice(0,1)
            console.log("array :",imgArray)
            const banner = await Banner.findOne().exec()
            console.log("banner",banner)
            let bannerAdd ;
            if (banner) {
                if (banner.images && banner.images.length > 0) {
                    bannerAdd = await Banner.updateOne({}, { $push: { images: imgArray[0] } });
                } else {
                    bannerAdd = await Banner.updateOne({}, { images: imgArray[0]});
                }
            } else {
                bannerAdd = await Banner.create({ images: imgArray[0]});
            }

            if(bannerAdd){
                res.json({success:true})
            } 
            else{
                req.flash("errorMessage", "Image uploading failed!!");
                res.json({success:false})   
            }      
        }
        catch(err){
            console.log(err);
        }
    }


/*.................... Category details ................. */

    //load category page
    const loadCategory = async (req, res)=>{
        try {
            const categQuery = Category.find({status:true})
            await categQuery.exec()
            .then(categories=>{
            res.render('admin/category',{
                title : "Category - TraditionShoppe",
                page:"Categories",
                categories:categories,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
        })
            
        } catch (err) {
            console.log(err.message);
        }
}

//load change category page
const loadCategoryChange = async(req,res)=>{
    try{
                  
        let id = req.params.id
        Category.findById(id)
        .then(categories=>{
        res.render('admin/changeCategory',{
            title: " Update Category | TraditionShoppe ",
            page:"Change Category",
            categories:categories,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    })
    }
    catch(err){
        console.log(err.message);
    }
}

//load new products page
const loadNewCategory = async(req,res)=>{
    try{
        
        
        res.render('admin/addCategory',{
            title:'Category - TraditionShoppe',
            page:"New Category",
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })           
    }
    catch(err){
        console.log(err.message);
    }
}

//Add category
const addNewCategory = async(req,res)=>{
    try{
        
        const name =  req.body.name
        const descr = req.body.description

        const categ = await Category.findOne({category_name:name}).exec()
        console.log("categ :",categ)
        
            if(categ){
                console.log('failed');
                req.flash("errorMessage", "Category exist..Try new one!!");
                res.redirect("/newCategory");
            }  else {
                console.log(req.body.name,req.body.description);

                const categQuery = new Category({
                category_name:name,
                description : descr,
                status:true                
                })
                const categData = await categQuery.save();

                if(categData){
                    console.log('successful');
                    req.flash("successMessage", "Category added successfully..");
                    res.redirect('/admin/category')
                } else {
                    console.log('failed');
                    req.flash("errorMessage", "Category registration failed.. Try again!!");
                    res.redirect("/newCategory");
                } 
            }

        
    }
    catch(err){
        console.log(err.message);
    }
}

//update products
const updateCategory = async(req,res)=>{
    try{
        let id = req.params.id
        console.log(id);
        await Category.updateOne({_id:id},{$set:{
            category_name: req.body.name,
            description :  req.body.description,
            status:true
        }})

        res.redirect('/admin/category')
    }
    catch(err){
        console.log(err.message);
    }
}


// delete product
const  deleteCategory = async (req,res)=>{
    try{        
        console.log('delete')
    
            let id = req.params.id
            console.log(id);
            await Category.updateOne({_id:id},{$set:{
            status : false                        
            }})
            res.redirect('/admin/category') 
              
    } catch (err){
        console.log(err.message);
    }        
}


    module.exports = {
        loadProducts,
        
        loadNewProducts,       
        submitProducts,
        
        loadImage,
        addimageTopdt,
        deleteImage,
        
        storeDropdownValues,
        loadProductsChange ,
        storeDropdownEdit,
        updateProduct,
        deleteProduct,

        loadBanner,
        addimageBanner,
        
        loadCategory,
        loadNewCategory,
        addNewCategory,
        loadCategoryChange,
        updateCategory,
        deleteCategory,
    }
