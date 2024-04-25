const express = require("express")
const User = require('../model/user')
const Product = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')
const Coupon = require('../model/coupon')
const Offer = require('../model/offer')
const Order = require('../model/order')

// const userAuthent = require('../middleware/userAuthent')



//login page
    //load login page
    const loadAdminLogin = async (req,res)=>{
        try{
            res.render('signin/adminLogin',{
                title: "Admin Login | TraditionShoppe",
                errorMessage:req.flash('errorMessage'),
                successMessage:req.flash('successMessage')
            })

        } catch(err){
            console.log(err.message);
        }
    }

    //log into admin panel
    const verifyAdminLogin = async(req,res)=>{
        try{

            const username = req.body.username
            const password = req.body.password
            const userData = await User.findOne({email:username})
            console.log(userData);
            if(userData){
                // const passwordMatch = await bcrypt.compare(password,userData.password)
                // console.log(passwordMatch);
                // if(passwordMatch){                    
                   
                    if(userData.role === 'admin'){
                        req.session.role = userData.role;
                        req.session.user = userData.email ;
                        req.flash("successMessage", "You have successfully logged in.");
                        res.redirect('/admin/dashboard')
                    } else {
                        req.flash("errorMessage", "Invalid access!!");
                        res.redirect("/signin/adminLogin");
                    }
                    
                } else {
                    req.flash("errorMessage", "Invalid Username and Password!!");
                    res.redirect("/signin/adminLogin");
                }
                

            // } else {
            //     req.flash("errorMessage", "Invalid Username and Password!!");
            //     res.redirect("/admin/login");
            // }


        } catch(err) {
            console.log(err.message)
        }
    }



//Home page
    //load home page
    const loadAdminHome = async (req,res)=>{
        try{
            const userQuery =  User.find({role:'user',status:{$ne:'deleted'}})
            await userQuery.exec()
            .then(users=>{
                res.render('admin/dashboard',{
                    title:"Admin Panel | TraditionShoppe",
                    page:"Dashboard",
                    users:users,
                    user : req.session.user,
                    errorMessage: req.flash("errorMessage"), 
                    successMessage: req.flash("successMessage") 
                })
            }) 
            
        } catch (err){
            console.log(err.message);
        }
        
    }
    //load customer page
    const loadCustomer = async (req,res)=>{
        try{
            const userQuery =  User.find({role:'user',status:{$ne:'deleted'}})
            await userQuery.exec()
            .then(users=>{
                res.render('admin/customers',{
                    title:"Admin Panel | TraditionShoppe",
                    page:"Customers",
                    users:users,
                    user : req.session.user,
                    errorMessage: req.flash("errorMessage"), 
                    successMessage: req.flash("successMessage") 
                })
            }) 
        } catch (err){
            console.log(err.message);
        }
        
    }

    //load customer edit page
    const  loadCustomerEdit = async (req,res)=>{
        try{        

            let id = req.params.id
            User.findById(id)
            .then(users=>{
                res.render('admin/customerUpdate',{
                    title:"Admin Panel | TraditionShoppe",
                    page:"Customer Update",
                    users:users,
                    page:'View Customer',
                    user : req.session.user,
                    errorMessage: req.flash("errorMessage"), 
                    successMessage: req.flash("successMessage") 
                })
            }) 
        } catch (err){
            console.log(err.message);
        }
        
    }

    //verify customer
    const  verifyCustomer = async (req,res)=>{
        try{        

            let id = req.params.id
            await User.updateOne({_id:id},{$set:{
            status : 'Verified'           
        }})
           res.redirect('/admin/customers')
         
        } catch (err){
            console.log(err.message);
        }
        
    }

    
    //block customer

    const  blockCustomer = async (req,res)=>{
        try{        

            let id = req.params.id
            const user = await User.findById(id)
            // await User.updateOne({_id:id},{$set:{
            // status : 'Blocked'     
            user.status = 'Blocked'
            await user.save()    
            req.session.blocked = true
        
           res.redirect('/admin/customers')
         
        } catch (err){
            console.log(err.message);
        }
        
    }
   
    //delete customer 

    const  unBlockCustomer = async (req,res)=>{
    try{  

        let id = req.params.id
        await User.updateOne({_id:id},{$set:{
        status : 'Verified'           
    }})
       res.redirect('/admin/customers')
     
    } catch (err){
        console.log(err.message);
    }
    
}


    //delete customer 
    const  deleteCustomer = async (req,res)=>{
        try{        

            let id = req.params.id
            await User.updateOne({_id:id},{$set:{
            status : 'deleted'           
        }})
            //req.flash("successMessage", "Address registration failed.. Try again!!");
           res.redirect('/admin/customers')
         
        } catch (err){
            console.log(err.message);
        }
        
    }

  

  


    //load order page
    // const loadOrders = async (req, res)=>{
    //     try {
    //         res.render('admin/orders',{
    //             title : "Admin Panel - TraditionShoppe",
    //             page:"Orders",
    //             errorMessage : req.flash('errorMessage'),
    //             successMessage : req.flash('successMessage')
    //         })
            
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // }

    /***********************coupon management******************************/
   
    const loadCouponPage = async (req, res)=>{
        try {
            const coupon = await Coupon.find().sort({'created':-1}).exec()

            res.render('admin/couponManage',{
                title : "Admin Panel - TraditionShoppe",
                page:"Coupon",
                coupon:coupon,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
            
        } catch (err) {
            console.log(err.message);
        }
    }

    //load new coupon page

    const addCoupon = async (req,res) =>{
        try{
            // const id = req.params.id
            // const coupon = await Coupon.find({_id:id}).exec()
            res.render('admin/addCoupon',{
                title : "Admin Panel - TraditionShoppe",
                page:"New Coupon",
                //coupon:coupon,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
        }
        catch(err){
            console.log(err.message);
        }
    }

    // add new coupon to collection

    const addCouponDetails = async (req,res)=>{
        try{

            let stat = true

            if((req.body.end < new Date())||(req.body.end < req.body.start)){
                stat = false
            }

            console.log(req.body);
            const newCoupon = new Coupon({
                    coupon_code:req.body.coupon,
                    discount_per:req.body.percentage,
                    start_date:req.body.start,
                    expire_date:req.body.end,
                    minimum_purchase:req.body.min_purch,
                    maximum_discount_amt:req.body.max_amt,
                    status : stat
            })
            await newCoupon.save();
            if(newCoupon){
                req.flash("successMessage", "New coupon created successfully!!");
                res.json({success:true})
            } else {
                req.flash("errorMessage", "Coupon creation failed.. Try again!!");
                res.json({success:false})
            }
        }
        catch(err){
            console.log(err.message);
        }
    }

    //load coupon change page

    const getUpdatePage = async (req,res) =>{
        try{
            const id = req.params.id
            const coupon = await Coupon.find({_id:id}).exec()
            res.render('admin/changeCoupon',{
                title : "Admin Panel - TraditionShoppe",
                page:"Change Coupon",
                coupon:coupon,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
        }
        catch(err){
            console.log(err.message);
        }
    }

    //change coupon details

    const updateCouponDetails = async (req,res) =>{
        try{
            const id = req.params.id
            console.log(req.body);
            let stat = true
            if((req.body.end < new Date())||(req.body.end < req.body.start)){
                stat = false
            }
           
            const coupon = await Coupon.updateOne(
                {_id:id},
                {$set :{
                    coupon_code:req.body.coupon,
                    discount_per:req.body.discount_per,
                    start_date:req.body.start,
                    expire_date:req.body.end,
                    minimum_purchase:req.body.min_purch,
                    maximum_discount_amt:req.body.max_amt,
                    status:stat                    
                }}).exec()

                if(coupon){
                    req.flash("successMessage", "Coupon details updated successfully!!");
                    res.json({success:true})
                } else {
                    req.flash("errorMessage", "Coupon updation failed.. Try again!!");
                    res.json({succes:false})
                }
        }
        catch(err){
            console.log(err.message);
        }
    }

    //delete existing coupon

    const deleteCouponDetails = async (req,res) =>{
        try{
            const id = req.params.id
            const coupon = await Coupon.updateOne(
                {_id:id},
                {$set :{
                   status : false
                }}).exec()
                if(coupon){
                    req.flash("successMessage", "Coupon deleted successfully!!");
                    res.json({success:true})
                } else {
                    req.flash("errorMessage", "Coupon deletion failed.. Try again!!");
                    res.json({success:false})
                }
        }
        catch(err){
            console.log(err.message);
        }
    }

    /**********************offer page management******************************/

    const loadOfferPage = async (req, res)=>{
        try {
            let flag =0, id;
            const offerData = await Offer.find().exec()
            offerData.forEach((offr)=>{
                console.log(offr.expire_date);
                if(offr.expire_date < new Date()){
                    flag = 1
                    id = offr.id
                }
            })
            if(flag == 1){
                 await Offer.updateOne(                    
                    {_id:id},
                    { $set : {
                     status : false
                    }}
                 ).exec()                    
            }
            const offer= await Offer.find().sort({'created':-1}).exec()
            res.render('admin/offerManage',{
                title : "Offer Management - TraditionShoppe",
                page:"Offer",
                offer:offer,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
            
        } catch (err) {
            console.log(err.message);
        }
    }
// load add offer page

    const addOffer = async (req,res) =>{
        try{
                res.render('admin/addOffer',{
                title : "Offer Management - TraditionShoppe",
                page:"New Offer",
                //coupon:coupon,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
        }
        catch(err){
            console.log(err.message);
        }
    }

// load offer name based on selected offer type

    const addNames =  async (req, res) => {
        try {
            const type =decodeURIComponent(req.params.type);
            
            // Fetch names based on type from the collections
            let names = [];
            
            if (type === 'Product Offer') {
                names = await Product.find({ isListing : true }).distinct('product_name').exec();
            } else if (type === 'Category Offer') {
                names = await Category.find().distinct('category_name').exec();
            }
            
            res.json({ names });
            
        } catch (error) {
            console.error('Error fetching names:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

// add new offer to collection

    const addOfferDetails = async (req,res)=>{
        try{
        
        console.log("req.body :",req.body)
            let setStatus = true
           if((req.body.end < new Date())||(req.body.end < req.body.start)||(req.body.offer_name==='No Selection')){
            setStatus = false
           }           
            const newOffer = new Offer({
                    offer_name:req.body.offer_name,
                    offer_type:req.body.offer_type,
                    discount_per:req.body.percentage,
                    start_date:req.body.start,
                    expire_date:req.body.end,
                    status : setStatus
            })
            await newOffer.save();
            if(newOffer){
                req.flash("successMessage", "New Offer created successfully!!");
                res.json({success:true})
            } else {
                req.flash("errorMessage", "Offer creation failed.. Try again!!");
                res.json({success:false})
            }
        }
        
        catch(err){
            console.log(err.message);
        }
    }

    //load offer change page

    const getUpdateOfferPage = async (req,res) =>{
        try{
            const id = req.params.id
            const offer = await Offer.find({_id:id}).exec()
            res.render('admin/changeOffer',{
                title : "Offer Management - TraditionShoppe",
                page:"Change Offer",
                offer,offer,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
        }
        catch(err){
            console.log(err.message);
        }
    }

    //update offer details

    const updateOfferDetails = async (req,res) =>{
        try{
            const id = req.params.id          
            let stat = true;
            
            if((req.body.end < new Date())||(req.body.end < req.body.start)||(req.body.offer_name==='No Selection')){
                stat = false
            }
           
           
                const offer = await Offer.updateOne(
                    {_id:id},
                    {$set :{
                        offer_name:req.body.offer_name,
                        offert_type:req.body.offer_type,
                        discount_per:req.body.percentage,
                        start_date:req.body.start,
                        expire_date:req.body.end, 
                        status : stat                                   
                    }}).exec()

                    if(offer){
                        req.flash("successMessage", "Offer details updated successfully!!");
                        res.json({success:true})
                    } else {                
                        req.flash("errorMessage", "Offer updation failed.. Try again!!");
                        res.json({success:false})
                    }
                }    
    
        catch(err){
            console.log(err.message);
        }
    }

    //delete existing offer

    const deleteOfferDetails = async (req,res) =>{
        try{
            const id = req.params.id
            const offer = await Offer.updateOne(
                {_id:id},
                {$set :{
                   status : false
                }}).exec()
                if(offer){
                    req.flash("successMessage", "Offer deleted successfully!!");
                    res.json({success:true})
                } else {
                    req.flash("errorMessage", "Offer deletion failed.. Try again!!");
                    res.json({success:false})
                }
        }
        catch(err){
            console.log(err.message);
        }
    }








    //  //load banner page
    //  const loadBanner = async (req, res)=>{
    //     try {
    //         res.render('admin/banner',{
    //             title : "Admin Panel - TraditionShoppe",
    //             page:"Banner",
    //             errorMessage : req.flash('errorMessage'),
    //             successMessage : req.flash('successMessage')
    //         })
            
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // }

     //load Sales report page
     const loadSalesReport= async (req, res)=>{
        try {

            // const orderData = await Order.aggregate([
            //     {$match:{orderstatus :{$in:["delivered","cancelled","refund received"]}}},
            //     { $unwind:"$product_list"} ,
            //     {$lookup:{
            //         from:"products",
            //         localField:"product_list.product_id",
            //         foreignField: "_id",
            //         as: "productInfo",
            //     }},
            //     { $unwind:"$productInfo"} ,
            //     {$project : {
            //         prodname : "$productInfo.product_name",
            //         qty : "$product_list.quantity",
            //         delivery_dat : "$delivered_date ",
            //         total_cost : "$payment_amount",
            //         method:"$payment",
            //         status:"$orderstatus"
            //     }}                         
            // ])
            

            const orders = await Order.find({orderstatus:{$in:["delivered","cancelled","refund received"]}})
            .populate('product_list')
            .populate('user')
            .exec()
            orders.forEach((ord)=>{
                console.log("inside order");
                console.log(ord.user.name,ord.payment_amount,ord.product_list)
            })  
            const products = await Product.find({status:'active',isListing:true}).exec()           
            res.render('admin/salesReport',{
                title : "Sales Report - TraditionShoppe",
                page:"Sales Report",
                orders:orders,
                products:products,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
            
        } catch (err) {
            console.log(err.message);
        }
    }

    //  //load Sales report page
    //  const loadSettings= async (req, res)=>{
    //     try {
    //         res.render('admin/settings',{
    //             title : "Admin Panel - TraditionShoppe",
    //             page:"Settings",
    //             errorMessage : req.flash('errorMessage'),
    //             successMessage : req.flash('successMessage')
    //         })
            
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // }

    //  //load Sales report page ***** change this after adding session
    //  const logOut= async (req, res)=>{
    //     try {
    //         res.render('admin/settings',{
    //             title : "Admin Panel - TraditionShoppe",
    //             page:"Settings",
    //             errorMessage : req.flash('errorMessage'),
    //             successMessage : req.flash('successMessage')
    //         })
            
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // }





    module.exports = {
        loadAdminLogin,
        verifyAdminLogin,
        loadAdminHome,
        loadCustomer,
        loadCustomerEdit,
        verifyCustomer,
        blockCustomer,
        unBlockCustomer,
        deleteCustomer,
       
        // loadOrders,
        loadCouponPage,
        addCoupon,
        addCouponDetails,
        getUpdatePage,
        updateCouponDetails,
        deleteCouponDetails,

        loadOfferPage,
        addOffer,
       // storeOfferType,
        addOfferDetails,
       // changeOfferType,
        getUpdateOfferPage,
        updateOfferDetails,
        deleteOfferDetails,
        addNames,


        // loadBanner,
        loadSalesReport,
        // loadSettings,
        // logOut
        
    }