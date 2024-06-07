const express = require("express")
const User = require('../model/user')
const Product = require('../model/product')
const Category = require('../model/category')
const Coupon = require('../model/coupon')
const Offer = require('../model/offer')
const Order = require('../model/order')
const { EventEmitterAsyncResource } = require("nodemailer/lib/xoauth2")

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
                
                if(password === userData.password){                               
                   
                    if(userData.role === 'admin'){
                        req.session.role = userData.role;
                        req.session.admin = userData._id ;
                        req.flash("successMessage", "You have successfully logged in.");
                        res.redirect('/admin/dashboard')
                    } else {
                        req.flash("errorMessage", "Invalid access, Only admin can access!!");
                        res.redirect("/admin/login");
                    }
                    
                } else {
                    req.flash("errorMessage", "Invalid Username and Password!!");
                    res.redirect("/admin/login");
                }
                

            } else {
                req.flash("errorMessage", "You are not authenticated!!");
                res.redirect("/admin/login");
            }


        } catch(err) {
            console.log(err.message)
        }
    }



//Home page
    //load home page
    const loadAdminHome = async (req,res)=>{
        try{
            const totalActiveProducts = await Product.aggregate([
                {
                  $group: {
                    _id: null,
                    totalProducts: {
                        $sum: {
                          $cond: [
                            {
                              $and: [
                                { $ne: ["$status", 'inactive'] },
                                { $eq: ["$isListing", true] },
                              ],
                            },
                            1,
                            0,
                          ],
                        },
                      }, 
                  },
                },
              ]);
            
              //total users
              const totalActiveUsers = await User.aggregate([
                {
                  $group: {
                    _id: null,
                    activeUsers: {
                      $sum: {
                        $cond: [
                          {
                            $and: [
                              { $ne: ["$status", 'Blocked'] },
                              { $ne: ["$role", 'admin'] },
                            ],
                          },
                          1,
                          0,
                        ],
                      },
                    },                   
                  },
                },
              ]);
            
              //total orders
              const totalOrders = await Order.aggregate([
                { $unwind: "$product_list" },
                {
                  $group: {
                    _id: null,
                    completedOrders: {
                      $sum: {
                        $cond: [
                          {
                            $and: [
                              { $ne: ["$product_list.paymentstatus", "pending"] },
                              { $ne: ["$product_list.paymentstatus", "cancelled"] },
                            ],
                          },
                          1,
                          0,
                        ],
                      },
                    },                   
                    income: {
                      $sum: {
                        $cond: [
                          {
                            $or: [
                              { $eq: ["$product_list.paymentstatus", "completed"] },                              
                              { $eq: ["$product_list.paymentstatus", "refund granted"] },                              
                            ],
                          },
                          "$product_list.total",
                          0,
                        ],
                      },
                    },
                  },
                },
              ]);
            
            
            const bestSellingProduct = await Order.aggregate([
                {
                  $match: {
                   " product_list.paymentstatus": { $ne: "cancelled" },
                  },
                },
                
                { $unwind: "$product_list" },
            
                {
                  $group: {
                    _id: "$product_list.productId",
                    totalQuantity: { $sum: "$product_list.quantity" },
                  },
                },           
               
                { $sort: { totalQuantity: -1 } },
            
                { $limit: 10 },
            
                {
                  $lookup: {
                    from: "products", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails",
                  },
                },            
               
                { $unwind: "$productDetails" },
            
                {
                  $project: {
                    _id: 0,
                    productName: "$productDetails.product_name",
                    productImage: "$productDetails.images", 
                    productPrice: "$productDetails.price_unit", 
                    totalQuantity: 1,
                  },
                },
              ]);
            
              //top three best selling categories
              const bestSellingBrands = await Order.aggregate([
                {
                  $match: {
                    "product_list.paymentStatus": { $ne: "cancelled" },
                  },
                },               
                { $unwind: "$product_list" },            
                {
                  $lookup: {
                    from: "products", 
                    localField: "product_list.productId",
                    foreignField: "_id",
                    as: "productDetails",
                  },
                },            
                { $unwind: "$productDetails" },
                {
                    $lookup: {
                        from: "sellers", 
                        localField: "productDetails.seller",
                        foreignField: "_id",
                        as: "sellerDetails",
                      },
                },
                {
                  $group: {
                    _id: "$sellerDetails.seller_name",
                    totalQuantity: { $sum: "$product_list.quantity" },
                  },
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 10 },
              ]);
              const bestSellingCategories = await Order.aggregate([
                {
                  $match: {
                    "product_list.paymentStatus": { $ne: "cancelled" },
                  },
                },               
                { $unwind: "$product_list" },
                {
                  $lookup: {
                    from: "products", 
                    localField: "product_list.productId",
                    foreignField: "_id",
                    as: "productDetails",
                  },
                },
            
                { $unwind: "$productDetails" },
                {
                    $lookup: {
                        from: "categories", 
                        localField: "productDetails.category",
                        foreignField: "_id",
                        as: "categoryDetails",
                      },
                },
            
                {
                  $group: {
                    _id: "$categoryDetails.category_name",
                    totalQuantity: { $sum: "$product_list.quantity" },
                  },
                },
            
                { $sort: { totalQuantity: -1 } },
            
                { $limit: 10 },
              ]);
              console.log('bestproducts :',bestSellingProduct)
              console.log('bestcategories :',bestSellingCategories)
              console.log('bestbrands :',bestSellingBrands)
            
                res.render('admin/dashboard',{
                    title:"Admin Panel | TraditionShoppe",
                    page:"Dashboard",
                    totalActiveProducts,
                    totalActiveUsers,
                    totalOrders,
                    bestSellingBrands,
                    bestSellingCategories,
                    bestSellingProduct,
                    //users:users,
                    admin : req.session.admin,
                    errorMessage: req.flash("errorMessage"), 
                    successMessage: req.flash("successMessage") 
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
                    admin : req.session.admin,
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
                    admin : req.session.admin,
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
            req.session.verified = true
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
            user.status = 'Blocked'
            await user.save()    
            req.session.blocked = true
            req.session.user = false        
            res.redirect('/admin/customers')
         
        } catch (err){
            console.log(err.message);
        }
        
    }
   
    //unblock customer 

    const  unBlockCustomer = async (req,res)=>{
        try{  

            let id = req.params.id
            await User.updateOne({_id:id},{$set:{
            status : 'Verified'           
            }})
            req.session.blocked = false
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
           res.redirect('/admin/customers')         
        } catch (err){
            console.log(err.message);
        }
        
    }

  
    /***********************coupon management******************************/
   
    const loadCouponPage = async (req, res)=>{
        try {
            let flag =0, id;
            const couponData = await Coupon.find().exec()
            couponData.forEach((cpn)=>{               
                if(cpn.expire_date < new Date()){
                    flag = 1
                    id = cpn.id
                }
                     
                if(flag == 1){
                    Coupon.updateOne(                    
                        {_id:id},
                        { $set : {
                        status : false
                        }}
                    ).exec()                    
                }
            })
            const coupon = await Coupon.find().sort({'created':-1}).exec()
            res.render('admin/couponManage',{
                title : "Admin Panel - TraditionShoppe",
                page:"Coupon",
                coupon:coupon,
                admin:req.session.admin,
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
            
            res.render('admin/addCoupon',{
                title : "Admin Panel - TraditionShoppe",
                page:"New Coupon",
                admin:req.session.admin,               
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
            let start = new Date(req.body.start)
            let end = new Date(req.body.end)
            let min = parseFloat(req.body.min_purch)
            let max = parseFloat(req.body.max_amt)
            if(end < new Date() || end < start || min < max){
                stat = false
            }
           
            const newCoupon = new Coupon({
                    coupon_code:req.body.coupon,
                    discount_per:req.body.percentage,
                    start_date:start,
                    expire_date:end,
                    minimum_purchase:min,
                    maximum_discount_amt:max,
                    status : stat
            })
            await newCoupon.save();
            if(newCoupon){
                req.flash("successMessage", "New coupon created successfully!!");
                res.redirect('/getCoupon')
            } else {
                req.flash("errorMessage", "Coupon creation failed.. Try again!!");
                res.redirect('/newCoupon')
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
                admin:req.session.admin,
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
            let stat = true
            let start = new Date(req.body.start)
            let end = new Date(req.body.end)
            let min = parseFloat(req.body.min_purch)
            let max = parseFloat(req.body.max_amt)
            if(end < new Date() || end < start || min < max){
                stat = false
            }
           
            const coupon = await Coupon.updateOne(
                {_id:id},
                {$set :{
                    coupon_code:req.body.coupon,
                    discount_per:req.body.discount_per,
                    start_date:start,
                    expire_date:end,
                    minimum_purchase:min,
                    maximum_discount_amt:max,
                    status:stat                    
                }}).exec()

                if(coupon){
                    req.flash("successMessage", "Coupon details updated successfully!!");
                    res.redirect('/getCoupon')
                } else {
                    req.flash("errorMessage", "Coupon updation failed.. Try again!!");
                    res.redirect('/newCoupon')
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
                    res.redirect('/getCoupon')
                } else {
                    req.flash("errorMessage", "Coupon deletion failed.. Try again!!");
                    res.redirect('/newCoupon')
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
                
                if(offr.expire_date < new Date()){
                    flag = 1
                    id = offr.id
                }           
                if(flag == 1){
                    Offer.updateOne(                    
                        {_id:id},
                        { $set : {
                        status : false
                        }}
                    ).exec()                    
                }
            })
            const offer= await Offer.find().sort({'created':-1}).exec()
            res.render('admin/offerManage',{
                title : "Offer Management - TraditionShoppe",
                page:"Offer",
                offer:offer,
                admin:req.session.admin,
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
                admin:req.session.admin,
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
            let start = new Date(req.body.start)
            let end = new Date(req.body.end)
                   
           if(end < new Date()||end < start){
            setStatus = false
           }           
            const newOffer = new Offer({
                    offer_name:req.body.offer_name,
                    offer_type:req.body.offer_type,
                    discount_per:req.body.percentage,
                    start_date:start,
                    expire_date:end,
                    status : setStatus
            })
            await newOffer.save();
            if(newOffer){               
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
                offer,
                admin:req.session.admin,
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
           
                let stat = true
                let start = new Date(req.body.start)
                let end = new Date(req.body.end)
                       
               if(end < new Date()||end < start){
                stat = false
               } 
           
                const offer = await Offer.updateOne(
                    {_id:id},
                    {$set :{
                        offer_name:req.body.offer_name,
                        offert_type:req.body.offer_type,
                        discount_per:req.body.percentage,
                        start_date:start,
                        expire_date:end, 
                        status : stat                                   
                    }}).exec()

                    if(offer){                        
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






 

     /**********************Handling salesreport******************************/

     //load Sales report page
     const storeFromdate = async(req,res)=>{
        try{
            const fromdate = req.body.fromdate
            const todate = req.body.todate
            req.session.todate = todate
            req.session.fromdate = fromdate
            res.json({succes:true})
        } catch(err){
            console.log(err.message);
        }
     }
     const storeTodate = async(req,res)=>{
        try{
            const todate = req.body.todate
            req.session.todate = todate
            res.json({succes:true})
        } catch(err){
            console.log(err.message);
        }
     }

     const storeFilterValue = async(req,res)=>{
        try{
            const todate = req.body.todate
            req.session.todate = todate
            res.json({succes:true})
        } catch(err){
            console.log(err.message);
        }
     }

     const loadSalesReport= async (req, res)=>{
        try {

            const fromdate = req.session.fromdate
            const todate = req.session.todate
            console.log("dates",fromdate,todate)
            const filter = req.query.filter
            console.log("filter",filter)
            let matchCondition = ''
            if(fromdate && todate){
                matchCondition={
                $and: [
                    { "product_list.orderstatus": 'delivered' },
                    { "product_list.delivered_date": { $gte: new Date(fromdate), $lte: new Date(todate) } }
                ] }           
            } else if(filter){
                const currentDate = new Date();               

                if(filter === 'today'){
                    const startOfDay = new Date(currentDate);
                    startOfDay.setHours(5, 30, 0, 0);
                    const endOfDay = new Date(currentDate);
                    endOfDay.setDate(currentDate.getDate() + 1)
                    endOfDay.setHours(5, 29, 59, 999);
                    console.log("start :",startOfDay,"end : ",endOfDay)
                   
                    matchCondition={
                        $and: [
                            {  "product_list.orderstatus": "delivered"  },
                            { "product_list.delivered_date":{ '$gte': startOfDay, '$lt': endOfDay } }
                        ] }    
                } else if(filter === 'yesterday'){
                   
                    const startOfyesterday = new Date(currentDate); 
                    startOfyesterday.setDate(currentDate.getDate() - 1)                   
                    startOfyesterday.setHours(5, 30, 0, 0);
                    const endOfyesterday = new Date(currentDate);                    
                     
                    endOfyesterday.setHours(5, 29, 59, 999);
                    console.log("start :",startOfyesterday,"end : ",endOfyesterday)
                    matchCondition = {
                        $and: [
                            { "product_list.orderstatus": "delivered" },
                            { "product_list.delivered_date":{ '$gte': startOfyesterday, '$lt': endOfyesterday }  } 
                        ]
                       
                    };

                } else if(filter === 'lastweek'){
                    
                    
                    const lastWeekStartDate = new Date(currentDate);
                    lastWeekStartDate.setDate(currentDate.getDate() - currentDate.getDay() - 7);
                    
                    lastWeekStartDate.setHours(5, 30, 0, 0);
                  
                    const lastWeekEndDate = new Date(lastWeekStartDate);
                    lastWeekEndDate.setDate(lastWeekStartDate.getDate() + 7); 
                    lastWeekEndDate.setHours(5, 29, 59, 999);
                    console.log("lastWeek",lastWeekStartDate,lastWeekEndDate,)
                    matchCondition = {
                        $and: [
                            { "product_list.orderstatus": "delivered" },
                            { "product_list.delivered_date": { $gte: lastWeekStartDate, $lte: lastWeekEndDate } }
                        ]
                    };
                    
                } else if(filter === 'lastmonth'){                  
                    const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                    const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);                    
                    console.log("lastMonth",lastMonthStartDate ,lastMonthEndDate,)
                    matchCondition = {
                        $and: [
                            {  "product_list.orderstatus": "delivered"  },
                            { "product_list.delivered_date": { $gte: lastMonthStartDate, $lte: lastMonthEndDate } }
                        ]
                    };

                }

            } else {
                matchCondition={ "product_list.orderstatus": "delivered" };
            }
            console.log("matchCondition:",matchCondition)
            const orders = await getOrders(req,res,matchCondition)
            delete req.session.fromdate  
            delete req.session.todate  
                
            res.render('admin/salesReport',{
                title : "Sales Report - TraditionShoppe",
                page:"Sales Report",
                orders:orders,  
                admin:req.session.admin,              
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
            
        } catch (err) {
            console.log(err.message);
        }
    }
    const getOrders = async (req,res,matchCondition)=>{
        try{
            const orders = await Order.aggregate([
                {
                    $match: matchCondition
                },
                {
                    $unwind: "$product_list"   
            },
            {
                $lookup:{
                    from:'products',
                    localField:'product_list.productId',
                    foreignField:'_id',
                    as:'productDetails'
                    
                }
            },
            {
                $unwind: {
                    path: "$productDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
           
            {
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'userDetails'
                    
                }
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup:{
                    from:'addresses',
                    localField:'address',
                    foreignField:'_id',
                    as:'addressDetails'
                    
                }
            },
            {
                $unwind: {
                    path: "$addressDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort : { 'created' : -1 }
            }
            ])  
            return orders
    
        } catch(err){
            console.log(err.message)
        }
    }

   
//logout from site
    const logout = async(req,res)=>{
        try{
            req.flash("successMessage", "You have been logged out.");
            req.session.destroy();         
            res.redirect("/admin");
        } catch (error){
            console.log(error.message);
        }
    }
    




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
       
        loadCouponPage,
        addCoupon,
        addCouponDetails,
        getUpdatePage,
        updateCouponDetails,
        deleteCouponDetails,

        loadOfferPage,
        addOffer,       
        addOfferDetails,      
        getUpdateOfferPage,
        updateOfferDetails,
        deleteOfferDetails,
        addNames,


        storeTodate,
        storeFromdate,
        loadSalesReport,
        getOrders,
        // loadSettings,
        logout
        
    }