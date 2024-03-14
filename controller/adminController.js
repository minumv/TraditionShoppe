const express = require("express")
const User = require('../model/user')
const Product = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')

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
            await User.updateOne({_id:id},{$set:{
            status : 'Blocked'           
        }})
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

    //  //load coupon page
    //  const loadCoupon = async (req, res)=>{
    //     try {
    //         res.render('admin/coupon',{
    //             title : "Admin Panel - TraditionShoppe",
    //             page:"Coupon",
    //             errorMessage : req.flash('errorMessage'),
    //             successMessage : req.flash('successMessage')
    //         })
            
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // }

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

    //  //load Sales report page
    //  const loadSales= async (req, res)=>{
    //     try {
    //         res.render('admin/salesReport',{
    //             title : "Admin Panel - TraditionShoppe",
    //             page:"Sales Report",
    //             errorMessage : req.flash('errorMessage'),
    //             successMessage : req.flash('successMessage')
    //         })
            
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // }

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
        // loadCoupon,
        // loadBanner,
        // loadSales,
        // loadSettings,
        // logOut
        
    }