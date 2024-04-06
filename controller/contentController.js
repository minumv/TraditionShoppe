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
const bcrypt = require('bcrypt')

const Razorpay = require('razorpay')
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env

const razorpayInstance = new Razorpay({
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



//load all products
const loadAllProducts = async (req,res)=>{
    try{
            const products = await Products.find({status:'active',isListing:true}).exec()            
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

const loadSearchProducts = async (req,res)=>{
    try{
            const search = req.query.search       
            console.log("search value: "+search)
            // Query the database to find products matching the search term
            const products = await Products.find({ "product_name":{$regex:".*"+search+".*",$options:'i'}  });            
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

//load all new handicrafts products (make these  code common)
const  getnewHandicrafts = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Handicrafts', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
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
//load all new handicrafts products
const  getnewAntique = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Antique', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
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
const  getnewSpices = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Spice', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
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
const  getnewApparels = async (req,res)=>{
    try{
            const categoryQuery = await Category.find({category_name:'Apparels', status : true},{_id:1}).exec()
            const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ category: { $in: categoryIds }, status: 'new', isListing: true }).exec();       
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

const  loadNew = async (req,res)=>{
    try{
            // const categoryQuery = await Category.find({category_name:'Apparels', status : true},{_id:1}).exec()
            // const categoryIds = categoryQuery.map(category => category._id);
            const products = await Products.find({ status: 'new', isListing: true }).exec();       
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
        console.log("user cart: "+users)
        const user_cart = await Cart.findOne({user:users,status:"listed"}).exec()
        console.log("cart : "+user_cart)
        
        if(user_cart){
            // console.log("inside cart");
            // console.log( user_cart.total_amount);
            user_cart.product_list.forEach(product => { 
                console.log(product.quantity);       
                qtyCount += product.quantity; })
        }
        return qtyCount;
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
        return listCount;
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
        const products = await Products.find({_id:id}).exec()
        const categories = await Category.find({status:true}).exec()
        const sellers = await Seller.find({status:{$ne:'inactive'}}).exec()
        const discounts = await Discount.find({status:true}).exec()
        const allproducts = await Products.find({status:{ $ne:'inactive'} , isListing: true }).exec()
        
        
        let qtyCount = await getQtyCount(req,res)
        let listCount = await getListCount(req,res)

        res.render('content/productView',{
            title: "View Product | TraditionShoppe", 
            user : req.session.user,
            listCount:listCount,
            qtyCount:qtyCount,              
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

        const user = req.session.user       
        const user_id = await User.findOne({email:user},{_id:1}).exec()        
        const user_cart = await Cart.findOne({user:user_id,status:"listed"}).exec()
        const products = await Products.find({status:{$ne:'inactive'},isListing:true}).exec()
        const discounts = await Discount.find({status:true}).exec()
        let qtyCount = 0;
        if(user_cart){
            if(user_cart.product_list == ''){
                await Cart.deleteOne( { 
                    user: user_id,
                })
            } else {
                user_cart.product_list.forEach(product => {        
                    qtyCount += product.quantity; })
            }                                
            
        }        
         let listCount = await getListCount(req,res)   
        res.render('content/myCart',{
            title: "My Cart - TraditionShoppe",
            page:"My Cart",   
            user : req.session.user, 
            products:products,  
            discounts:discounts,
            user_cart:user_cart, 
            qtyCount:qtyCount, 
            listCount:listCount,     
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
        console.log("inside cart")

        let pdt_id = req.params.id;
        let price = req.params.mrp;
        const user = req.session.user
       // const product = await Products.findOne({_id:pdt_id}).exec();
       const stock = await Products.findOne({_id:pdt_id},{stock:1}).exec()
        const user_id = await User.findOne({email:user},{_id:1}).exec()
        const user_cart = await Cart.findOne({user:user_id}).exec()
        // console.log("pdtid: "+pdt_id)
        // console.log("userid: "+user_id)
        // console.log("price: "+price)
        // console.log("cart user: "+user_cart)
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
            user_cart.product_list.forEach(product => {
                if( product.productId == pdt_id ){
                    pdt_check = true;
                    qty = product.quantity;                           

                }})

                amount = parseFloat(user_cart.total_amount); 

              
            if(pdt_check){
                // console.log("user and pdt exist")
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
                req.flash("successMessage", "Product is successfully updated to cart...");
                res.redirect(`/viewProduct/${pdt_id}`)
            } else {
                console.log("user exist pdt not")
                await Cart.updateOne({_id:user_cart.id},
                    { $push: { 'product_list':{productId :pdt_id ,quantity:1,price:price,total:price}} , $inc: { total_amount: parseFloat(price) }},
                    {$set:{status:"listed"}})  
                   
                   console.log('successful');
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
        const userid = req.params.userid;
        const pdtid = req.params.pdtid;
        const price = req.params.price;

        const stock = await Products.findOne({_id:pdtid},{stock:1,_id:0}).exec()
        const user_cart = await Cart.findOne({user:userid,status:"listed"}).exec()
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
         const userid = req.params.userid;
        const pdtid = req.params.pdtid;
        const price = req.params.price;

        const stock = await Products.findOne({_id:pdtid},{stock:1,_id:0}).exec()
        const user_cart = await Cart.findOne({user:userid}).exec()
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
                user: userid,
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
            console.log('successful');
            req.flash("successMessage", "Product is successfully updated to cart...");
            res.redirect('/cart')

        } else if (qty<=1){
            if( user_cart.product_list.length === 1 ){
            await Cart.deleteOne(
                { user: userid })
                console.log('successful');
                req.flash("successMessage", "User is deleted from cart...");
                res.redirect('/cart')
        } else{
            await Cart.updateOne(
                { user: userid },
                { $pull: { product_list: { productId: pdtid } },
                $set: { 
                    total_amount: amount - parseFloat(newPrice)
                }  
            })
            console.log('successful');
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
        const userid = req.params.userid;
        const pdtid = req.params.pdtid; 
        const user_cart = await Cart.findOne({user:userid}).exec()
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
                { user: userid },
                { $pull: { product_list: { productId: pdtid } },
                $set: { 
                    total_amount: amount - parseFloat(newPrice)
                }  
            }) 
                      
        
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
        console.log("load checkout");
        const userid = req.params.userid;
        const amount = req.params.amount;

        const users = await User.find({_id:userid}).exec()
        const user_cart = await Cart.find({user:userid}).exec()

        const address = await Address.find({user_id:userid}).exec()
       // console.log(address[0]._id);
        let qtyCount = await getQtyCount(req,res)
        let listCount = await getListCount(req,res)

        console.log("user id:"+userid);
        // console.log("user details:"+users);
        res.render('content/checkout',{
            title: "Checkout - TraditionShoppe",
            page:"Checkout",   
            user : req.session.user,
            users:users,
            userid:userid,
            user_cart:user_cart,
            address:address,
            amount:amount,
            
            qtyCount:qtyCount,
            listCount:listCount,          
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
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
        const amt = req.params.amt;
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
           
            res.redirect(`/checkout/${userid}/${amt}`)
        } else {
            console.log('failed');
             req.flash("errorMessage", "Address registration failed.. Try again!!");
             res.redirect(`/checkout/${userid}/${amt}`)
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
        const amt = req.params.amt;

        const address = await Address.find({_id:addressid}).exec()

        res.render('content/editAddress',{
            title: "Edit Address - TraditionShoppe",
            user : req.session.user,
            address:address,  
            amt:amt,             
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
        const addressid = req.params.addressid
        const amt = req.params.amt

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
           
        res.redirect(`/checkout/${address[0].user_id}/${amt}`)
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

/*************make cod payment**************/

const makeCODPayment = async(req,res)=>{
    try{
        const userid = req.params.userid
        const amount = req.params.amount
        const pdtlist = req.params.list
       
        const pay = req.params.defPay

        const address = await Address.find({user_id:userid}).exec()
        const adr = address[0]._id

        const addressid = req.session.deliverAddress ||  adr
        const paymethod = req.session.paymethod || pay

        const currentDate = moment().format('ddd MMM DD YYYY');
        const deliveryDate = moment().add(7,'days').format('ddd MMM DD YYYY')
        const returnDate = moment().add(12,'days').format('ddd MMM DD YYYY')
        // console.log(currentDate);
        // console.log(deliveryDate);


         console.log("userid: "+userid);
         console.log("amount: "+amount);
         console.log("pdt list: "+pdtlist);
         console.log("addressid: "+addressid);
         console.log("pay: "+paymethod);

         let qtyCount = await getQtyCount(req,res)
         let listCount = await getListCount(req,res)

         if (pdtlist && typeof pdtlist === 'object') {
            console.log("checking");
            console.log("pdtlist.productId", pdtlist.productId);
            console.log("pdtlist.quantity", pdtlist.quantity);
            console.log("pdtlist.price", pdtlist.price);
            console.log("pdtlist.total", pdtlist.total);
            console.log("pdtlist._id", pdtlist._id);
        }
        
        // console.log("pdtlist.id",pdtlist.productId);
         const productArray = [{
            productId: pdtlist.productId,
            quantity: pdtlist.quantity,
            price: pdtlist.price,
            total: pdtlist.total,
            _id: pdtlist._id
          }];
        //    // const product_list = Array.isArray(pdtlist) ? pdtlist : [pdtlist];
        //    console.log(productArray, typeof(productArray))

         const order = new Order({
            order_date : currentDate,
            user: userid,
            address:addressid,
            payment : paymethod,
            product_list: productArray,
            payment_amount:amount,
            delivery_date:deliveryDate,
            return_date:returnDate,
            status:'pending',
            action:'approve'        

         })
         const orderData = await order.save()
         if(orderData.payment === 'COD'){
            console.log('successfull');

            // await Cart.deleteOne(
            //     { user: userid })

            await Cart.updateOne(
                { user: userid },{$set:{status:"pending"}})

            res.render('content/PaymentSuccess',{
                title: "Successful Payment - TraditionShoppe",
                user : req.session.user,
                qtyCount:qtyCount,
                listCount:listCount,                 
                errorMessage : req.flash('errorMessage'),
                successMesssage : req.flash('successMessage')
            })
         }  else if(orderData.payment === 'Razorpay') {

            const userDet = await Order.find({_id:orderData._id}).populate('user').exec();
            console.log("details user : ",userDet)
            const productDet = await Order.find({_id:orderData._id}).populate({ path: 'product_list.productId', model: 'Product' }).exec();            
            console.log("product user : ",productDet)
            // const amt = amount * 100
            // const options = {
            //     amount : amt,
            //     currency : 'INR',
            //     receipt : "RCPT"+orderData._id
            // }
            // razorpayInstance.orders.create(options,(err,order)=>{
            //     if(!err){
            //         res.status(200).send({
            //             success : true,
            //             msg : "Order Placed",
            //             order_id : order.id,
            //             amount : amount,
            //             key_id : RAZORPAY_ID_KEY,
            //             product_name : ,
            //             description : ,
            //             contact : "",
            //             name : "",
            //             email : " "
            //         })
            //     } else {
                //         res.status(400).send({success : false ,msg : 'Something went wrong!'})
                //    }
            // })

         } else{
            console.log('failed');
             req.flash("errorMessage", "Payment failed.. Try again!!");
             res.redirect(`/checkout/${userid}/${amount}`)
        }
       
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

    makeCODPayment,

    addToWishlist,
    addToSave,

    getQtyCount,
    getListCount
}