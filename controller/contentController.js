const express = require("express")
const User = require('../model/user')
const Products = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')
const List = require('../model/wishlist')
const bcrypt = require('bcrypt')


/***************All products handling****************** */

//load all products
const loadAllProducts = async (req,res)=>{
    try{
            const productQuery = Products.find({status:'active',isListing:true}).exec()            
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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

//load all new handicrafts products (make these  code common)
const  getnewHandicrafts = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Handicrafts', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const productQuery = Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  getnewAntique = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Antique', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const productQuery = Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  getnewSpices = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Spice', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const productQuery = Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  getnewApparels = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Apparels', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const productQuery = Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  getmostSold = async (req,res)=>{
    try{
            const SellerQuery = await Seller.find({ status : 'popular'},{_id:1}).exec()
            const SellerIds = SellerQuery.map(category => category._id);
            const productQuery = Products.find({ seller: { $in: SellerIds }, status: {$ne:'inactive'}, isListing: true }).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  getLowtoHigh = async (req,res)=>{
    try{
            const productQuery = Products.find({isListing: true }).sort({'price_unit':1}).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  getHightoLow = async (req,res)=>{
    try{
            const productQuery = Products.find({isListing: true }).sort({'price_unit':-1}).exec();      
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  gettoyCategory = async (req,res)=>{
    try{
        const productQuery = Products.find({ product_type : 'toys' , status:{ $ne:'inactive'} , isListing: true }).exec();           
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  getecoFriendly = async (req,res)=>{
    try{
        const productQuery = Products.find({ product_type : 'eco-friendly' , status:{ $ne:'inactive'} , isListing: true }).exec();          
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
            const productQuery = Products.find({ material: 'Brass' , status:{ $ne:'inactive'} , isListing: true }).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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

const  getmetalMaterial = async (req,res)=>{
    try{
        const productQuery = Products.find({ material: 'Metal' , status:{ $ne:'inactive'} , isListing: true }).exec();         
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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

const  getwoodMaterial = async (req,res)=>{
    try{
        const productQuery = Products.find({ material: 'Wood' , status:{ $ne:'inactive'} , isListing: true }).exec();            
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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

const  getgiftCategory = async (req,res)=>{
    try{
            const productQuery = Products.find({ product_type : 'gift' , status:{ $ne:'inactive'} , isListing: true }).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
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
const  getpriceRange = async (req,res)=>{
    try{
        console.log(req.body);
        const { minPrice, maxPrice } = req.body;
       
        // Store dropdown values in session
        req.session.priceValues = { minPrice, maxPrice };
         res.sendStatus(200);  
        // console.log("session values in storeDropdonValues:");
        // console.log(req.session.dropdownValues); 
    }
    catch(err){
        console.log(err.message);
    }
}
const  setpriceRange = async (req,res)=>{
            try{     
                
                const { minPrice, maxPrice } = req.session.priceValues;     
            const productQuery = Products.find({price_unit:{$gt:minPrice,$lt:maxPrice} , status:{ $ne:'inactive'} , isListing: true }).exec();       
            const discountQuery = Discount.find({status:true}).exec()
            console.log( productQuery);
            const [products, discounts] = await Promise.all([productQuery,discountQuery]);
            
            res.render('content/allproducts',{
            title : "All Products| TraditionShoppe",
            user : req.session.user,
            page : 'All products',            
            products : products,
             discounts : discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

            
        })
        res.sendStatus(200); 

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
        console.log(id);
        const productQuery = Products.find({_id:id}).exec()
        const categoryQuery = Category.find({status:true}).exec()
        const sellerQuery = Seller.find({status:{$ne:'inactive'}}).exec()
        const discountQuery = Discount.find({status:true}).exec()
        const otherProducts = Products.find({status:{ $ne:'inactive'} , isListing: true }).exec()
        
        const [products, categories, sellers, discounts, allproducts] = await Promise.all([productQuery, categoryQuery, sellerQuery, discountQuery, otherProducts]);
        console.log( products);
        console.log( products.product_name);
        res.render('content/productView',{
            title: "View Product | TraditionShoppe", 
            user : req.session.user,           
            products:products,
            allproducts:allproducts,
            categories:categories,
            sellers:sellers,
            discounts:discounts,          
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

/*********add to cart table*********/
const addToCartTable = async(req,res)=>{
    try{
        let pdt_id = req.params.id;
        const user = req.session.user
        const user_id = await User.findOne({email:user},{_id:1}).exec()
        const user_list_id = await List.findOne({user:user_id},{_id:1}).exec()

        if (user_list_id){

            await List.updateOne({_id:user_list_id},
                { $push: { product_list: pdt_id }})
                
                console.log('successful');
                req.flash("successMessage", "Product is successfully updated to cart...");
                res.redirect('/viewProduct/:pdt_id')

        } else {
            const list = new List({
                 user:user_id,
                 product_list:pdt_id,
            })
            const listData = await list.save()
            if(listData){
                console.log('successful');
                req.flash("successMessage", "Product is successfully added to cart...");
                res.redirect('/viewProduct/:pdt_id')
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
                res.redirect('/viewProduct/pdt_id')

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
        res.render('content/checkout',{
            title: "Checkout - TraditionShoppe",
            page:"Checkout",   
            user : req.session.user,          
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
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
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}




module.exports = {
    loadAllProducts,
    loadProductDetail,
    getnewHandicrafts,
    getnewAntique,
    getnewApparels,
    getnewSpices,
    getmostSold,
    getLowtoHigh,
    getHightoLow,
    getecoFriendly,
    getgiftCategory,
    gettoyCategory,
    getpriceRange,
    setpriceRange,
    getbrassMaterial,
    getmetalMaterial,
    getwoodMaterial,
    loadCart,
    loadCheckout,
    loadWishlist,
    loadSaved,
    addToCartTable,
    addToWishlist,
    addToSave
}