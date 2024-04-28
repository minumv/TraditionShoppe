require("dotenv").config()
const express = require("express")

//models
const User = require('../model/user')
const Otp = require('../model/userOTP')
const Products = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')
const Cart = require('../model/cart')
const List = require('../model/wishlist')
const Order = require('../model/order')
const Address = require('../model/address')
const mongoose = require('mongoose');

//other controllers
const content = require('../controller/contentController')

//email handler
const nodemailer = require('nodemailer')

//password handler
const bcrypt = require('bcrypt')

//Env variables


//Nodemailer handling
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port:587,
    secure:false,
    auth:{       
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

//testing
transporter.verify((error,success)=>{
    if(error){
        console.log(error);
    } else {
        console.log("Ready for messages");
        //console.log(success);
    }
})

//load login page
const loadLogin = async (req,res)=>{
    try{
        res.render('signin/userLogin',{
            title: "Login | TraditionShoppe",
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    } catch(err){
        console.log(err.message);
    }
}

//loginto system 
const verifyLogin = async(req,res)=>{
    try{
        const {email,password} = req.body
        const userData =await User.findOne({email:email})
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                req.session.user = userData.email ;
                req.session.blocked = false
                req.flash("successMessage","You are successfully logged in.")
                res.redirect('/home')
            } else {
                req.flash("errorMessage","Invalid Username and Password!!")
                res.redirect('/signin/userLogin')
            }

        } else {
            req.flash("errorMessage","Invalid Username and Password!!")
            res.redirect('/signin/userLogin')
        }
    }
    catch(err){
        console.log(err.message);
    }
}

//login using google
const successGoogleLogin = async (req,res)=>{
    
    let firstFourChars = req.user.email.substring(0, 4).toUpperCase();
    // Generate four random numbers between 0 and 9
    let randomNumbers = '';
    for (let i = 0; i < 4; i++) {
        randomNumbers += Math.floor(Math.random() * 10);
    }
    // Concatenate the first four characters and four random numbers
    let referCode = firstFourChars + randomNumbers;
    console.log("referCode :",referCode)
    const newUser = await new User({
        name : req.user.displayName,
        email: req.user.email,       
        role : 'user',
        status: 'Pending', 
        wallet : 0, 
        referalCode: referCode            
        

    }).save()
    
    console.log("user :",req.user);
    if(newUser){
        console.log("new user :",newUser);
    }
    req.session.user = req.user.email 
    res.redirect('/home')
    
}

//google login failed
const failureGoogleLogin = async (req,res)=>{
    res.redirect('/signin/userLogin')
}

//google signup

const successGoogleSignup = async (req,res)=>{
   console.log("Google user :",req.user)
}

//google login failed
const failureGoogleSignup = async (req,res)=>{
    res.redirect('/signin/signup')
}




//login using facebook
const facebookSignin = async (req,res)=>{

}



//load mobile number
const loadMobile= async (req,res)=>{
    try{
        res.render('user/forgetPassword',{
            title: "Reset Password | TraditionShoppe",
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    } catch(err){
        console.log(err.message);
    }
}


//load new password page
const loadChangePassword = async (req,res)=>{
    try{
        res.render('user/changePassword',{
            title: "Change your password| TraditionShoppe",
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    } catch(err){
        console.log(err.message);
    }
}

//load signup page
const loadSignup = async (req,res)=>{
    try{
        const referalCode = req.query.referalCode
        req.session.signup = true
        console.log("session :", req.session.signup)
        res.render('signin/signup',{
            title: "Sign Up | TraditionShoppe",
            referalCode,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    } catch(err){
        console.log(err.message);
    }
}

//load otp generation
const loadOtp = async (req,res)=>{
    try{
        res.render('signin/otpVerifyPage',{
            title: "Verify Email | TraditionShoppe",
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    } catch(err){
        console.log(err.message);
    }
}


 //insert user details into database
 const customerSignup = async (req,res)=>{
    try{
       
          
        let {name,email,phone,password,confirmpassword,refferal} = req.body
        console.log(name,email,phone,password,confirmpassword,refferal);
        
       
        User.find({email})
        .then((result)=>{
            if(result.length){
                //A user already exists
                console.log("user exist error!")
                req.flash("errorMessage", "User with the provided email already exists!!");    
                res.json({success:false})
               
            } else {               
                if(password !== confirmpassword){
                    console.log("Password mismatch error!!")
                    req.flash("errorMessage", "Confirm password should match with password  !!");    
                    res.json({success:false})
                } else {
                //password hashing
                bcrypt.hash(password,10)
                .then((hashedPassword)=>{
                    console.log("set values to add into database..")
                    //creating referal code
                    let firstFourChars = email.substring(0, 4).toUpperCase();
                    // Generate four random numbers between 0 and 9
                    let randomNumbers = '';
                    for (let i = 0; i < 4; i++) {
                        randomNumbers += Math.floor(Math.random() * 10);
                    }
                    // Concatenate the first four characters and four random numbers
                    let referCode = firstFourChars + randomNumbers;
                    console.log("refercode generated :",referCode)
                    //apply referal use credit
                    let referCredit = 0
                    if(refferal !== 'No'){
                      referCredit = 100
                      referalUserUpdate(req,res,{referCredit,refferal})  
                    }
                    const newUser = new User({
                        name,
                        email,
                        phone,
                        password : hashedPassword,
                        role : 'user',
                        status: 'Pending', 
                        wallet : referCredit, 
                        referalCode: referCode,                   
                        isVerifiedByOtp : false
                    })
                    newUser
                    .save()
                    .then((result)=>{
                        console.log("User data :",newUser)
                        sendOtpEmail(result,res)
                        console.log("result :",result) 
                        console.log("mail sent successfully..") 
                        res.json({success:true, 
                             data:{ 
                                _id:result._id ,
                                email:result.email
                            }})   
                                               
                        //res.redirect(`/loadOTP/${result._id}/${result.email}`)
                    })
                    .catch((err)=>{
                        console.log(err);
                        req.flash("errorMessage", "An error occured while saving user account !!");    
                        res.json({success:false })
                    })
                })
                .catch((err)=>{
                    req.flash("errorMessage", "An error occured while hasing password !!");    
                    res.json({success:false })                    
                })
            }
        }

        })
        .catch((err)=>{
            console.log(err);
            req.flash("errorMessage", "An error occured while checking for existing user !!");    
            res.json({success:false })               
        })
        
    } catch(err){
        console.log(err);
        req.flash("errorMessage", "An error occured in saving try block!!");    
        res.json({success:false })        
    }
}

const referalUserUpdate = async(req,res,obj)=>{
    try{
            console.log("referal code is used")
            req.session.refferalUsed = true;           
                        
            const referUser = await User.findOne({referalCode:obj.refferal})
            referUser.wallet += obj.referCredit;
            referUser.save()
            console.log("referal user :",referUser) 
    } catch(err){
        console.log(err.message)
    }
}
//request otp
const sendOtpEmail = async({_id,email},res)=>{
    try{
        const otp = `${Math.floor(1000+Math.random()*9000)}`;
        
        console.log("at send : id"+_id,email,otp);
        //mail options
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify Your Email',
            html:`<p><b> ${otp}</b> is your OTP to verify your email and complete the signup process.<br> OTP will expires in 5 minutes..</p>`,
        }

        console.log("mail :",mailOptions)
        //hash the otp
        const hashedOTP = await bcrypt.hash(otp,10)
        const newOTP = new Otp({
            user_id:_id,
            otp:hashedOTP,
            createdAt:Date.now(),
            expiresAt:Date.now() + 3600000,
        })

        //save new otp
        await newOTP.save();
        console.log("otp generation :",newOTP);
        await transporter.sendMail(mailOptions)
             
    }
    catch(err){
        req.flash("errorMessage", "An error occured while sending otp mail to user !!");    
        res.json({success:false })   
    }
}
const loadverifyOTPMail = async(req,res)=>{
    try{        
            console.log("at loading id: "+req.params.id+ " email: "+ req.params.email);
       
            res.render('signin/otpVerifyPage',{
            title:'VerifyOTP | TraditionShoppe',
            userId:req.params.id,
            email:req.params.email
        })
            
       
    } catch (err){
        console.log(err.message);
    }
}

//verify otp email
const verifyOTPMail = async(req,res)=>{
    try{
        let userId = req.params.id;
        console.log("userId at  verify : "+userId);
        // let email = req.params.email
        let otp =req.body.otp
        
        // let {otp} = [...req.body.digit1,...req.body.digit2,...req.body.digit3,...req.body.digit4];
        console.log("userid : "+userId +" otp : "+otp);
        
        if(!userId || !otp){
            //throw new error("Empty otp details are not allowed")
            req.flash("errorMessage", "Empty otp details are not allowed!!");    
            res.json({success:false })     

        } else {
            const userOtpNumber = await Otp.find({user_id:userId})
        
           // res.json({message:userOtpNumber})
            console.log("user at otp table" + userOtpNumber);

            if(userOtpNumber.length <= 0){
                //no record found
                // throw new Error(
                //     "Account record doesn't exist or has been verified already. Please sign up or check your email! "
                // )
                req.flash("errorMessage", "Account record doesn't exist or has been verified already. Please sign up or check your email!!!");    
                res.json({success:false })     
            } else {
                //user otp record exists
                const { expiresAt } = userOtpNumber[0].expiresAt
                const hashedOTP = userOtpNumber[0].otp

                if(expiresAt < Date.now()){
                    //user otp record has expired
                    await Otp.deleteMany({user_id:userId})
                    //throw new Error("Code has expired. Please request again!")
                    req.flash("errorMessage", "Code has expired. Please request again!!!");    
                    res.json({success:false })    

                } else {
                    const validOTP = await bcrypt.compare(otp,hashedOTP)
                    
                    if(!validOTP){
                        //supplied otp is wrong
                        //throw new Error("Invalid code passed. Check your inbox!")
                        req.flash("errorMessage", "Invalid code passed. Check your inbox!!!");    
                        res.json({success:false })   
                        // res.redirect(`/verifyOTP/${userId}/${email}`)
                    } else {
                        //success
                        await User.updateOne({_id:userId},{isVerifiedByOtp:true})
                        Otp.deleteMany({userId})
                        req.flash("successMessage", "Your registration successfull, Sign in to the system..");  
                        res.json({success:true})
                       // res.redirect('/signin/userLogin')
                        // res.json({
                        //     status: "VERIFIED",
                        //     message: `User email verified successfully`
                        // })
                    }
                }
            }
        }

    }
    catch(error){
        console.log(error.message);
        req.flash("errorMessage", "An error occured on otp verification!!!");    
        res.json({success:false })  
    }
}

//load otp success page
const loadOTPSuccess = async(req,res)=>{
    try{
        res.render('signin/otpSuccess',{
            title:"OTP Verified | TraditionShoppe"
        })
    }
    catch(err){
        console.log(err.message);
    }
}
   // resend otp
    const resendOTP = async(req,res)=>{
        try{
            let _id=req.params.id
            let email=req.params.email
            console.log("at resend userid : " + _id + " email : "+ email);
            // if(!userId || !email){
            //     throw Error("Empty user details are not allowed!!")
            // }
            await Otp.deleteMany({user_id:_id})
            console.log("at resend after delete userid : " + _id + " email : "+ email);
            sendOtpEmail({_id, email},res)
            res.json({success:true})
           // res.redirect(`/verifyOTP/${_id}/${email}`)
        }
        catch(err){
            console.log(err.message);
        }
    }


/*****************user page navigation*********************/ 

//load index page
const loadIndex = async (req,res)=>{
    try{
        const products = await Products.find({status:{$ne:'inactive'},isListing:true}).exec()
        const categories = await Category.find({status:true}).exec()
        const sellers = await Seller.find({status:{$ne:'inactive'}}).exec()
        const discounts = await Discount.find({status:true}).exec()
        
        res.render('user/index',{
            title: "Home | TraditionShoppe", 
            user:req.session.user, 
            products:products,
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

//load homepage
const loadHome = async (req,res)=>{
    try{
        const email =  req.session.user
        const products = await Products.find({status:{$ne:'inactive'},isListing:true}).exec()
        const categories = await Category.find({status:true}).exec()
        const sellers = await Seller.find({status:{$ne:'inactive'}}).exec()
        const discounts = await Discount.find({status:true}).exec()
        
        await getQtyCount(req,res); //get cart count
        await getListCount(req,res);    //get wishlist count
   
        res.render('user/home',{
            title: "Home | TraditionShoppe", 
            user : email, 
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            products:products,
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


const logoutFrom = async(req,res)=>{
    try{
        req.flash("successMessage", "You have been logged out.");
        // Clear the user session
        req.session.destroy();      
        // Redirect to the login page
        res.redirect("/index");
    } catch (error){
        console.log(error.message);
    }
}

/******************qty and list count*********************/

const getQtyCount = async(req,res)=>{
    try{

        let qtyCount = 0;
        const users = await User.findOne({email:req.session.user},{_id:1}).exec()
        //console.log("user cart: "+users)
        const user_cart = await Cart.findOne({user:users,status:"listed"}).exec()
       // console.log("cart : "+user_cart)
        
        if(user_cart){
            // console.log("inside cart");
            // console.log( user_cart.total_amount);
            user_cart.product_list.forEach(product => { 
                console.log(product.quantity);       
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


/********************profile handling**************************/

const loadProfile = async (req,res)=>{
    try{
        const email = req.session.user
        const users = await User.findOne({email}).exec()    
        await getQtyCount(req,res);
        await getListCount(req,res);
        console.log("user: ",users);
        res.render('profile/userProfile',{
            title:"My account | TraditionShoppe",
            user : req.session.user,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            page:'Your Profile',
            users:users,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}


const loadeditProfile = async(req,res)=>{
    try{
        const users = await User.findOne({email:req.session.user}).exec()    
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/userProfileEdit',{
            title:"My account | TraditionShoppe",
            user : req.session.user,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            page:'Your Profile',
            users:users,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })

    } catch(err){
        console.log(err.message);
    }
}
const editProfile = async(req,res)=>{
    try{
        console.log("edit details")
        const id = req.params.id
        console.log("userid : ",id);
        const profile = await User.updateOne(
            { _id:id},
            { $set : {
                name : req.body.name,
                phone : req.body.phone,
                email : req.body.email
            }
        })

        if(profile){
            req.flash("successMessage", "You profile changed successfully..");        
            res.json({success:true})  
        } else {
            req.flash("errorMessage", "Profile Updation Failed !!");        
            res.json({success:false})  
        }

    } catch(err){
        console.log(err.message);
    }
}


/*************** handle my order********************/
const loadOrder = async (req,res)=>{
    try{

        const email = req.session.user
        const users = await User.findOne({email:email}).exec() 
            const pageNum = req.query.page || 1
            const perPage = 9
            const totalCount = await Order.countDocuments({user:users._id})
            const pages = Math.ceil( totalCount / perPage )
            console.log("count",totalCount);
        //const orders = await Order.find({user:users[0]._id}).populate('address').exec()   

        const orders = await Order.aggregate([
            {
                $match: { user: users._id }
            },
            {
                $lookup: {
                    from: "addresses", // Assuming 'addresses' is the name of your Address collection
                    localField: "address", // Field in the 'orders' collection
                    foreignField: "_id", // Field in the 'addresses' collection
                    as: "addressDetails"
                }
            },
            {
                $unwind: {
                    path: "$addressDetails",
                    preserveNullAndEmptyArrays: true
                }
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
            {
                $sort: { order_date : -1 }
            },
            {
                $skip: ( pageNum - 1 ) * perPage
            },
            {
                $limit: perPage
            }
        ]);

        console.log("order details :",orders)         
             
    
        

        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/userOrder',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            page:'Your Orders',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            users,
            orders, 
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


const loadOrderView = async (req,res)=>{
    try{
        const odrid = req.params.id
        const users = await User.findOne({email:req.session.user}).exec()
        const objectId = new mongoose.Types.ObjectId(odrid);
        console.log("order id :",odrid)
        const orders = await Order.aggregate([
            {
                $match: { _id: objectId }
            },
            {
                $lookup: {
                    from: "addresses", // Assuming 'addresses' is the name of your Address collection
                    localField: "address", // Field in the 'orders' collection
                    foreignField: "_id", // Field in the 'addresses' collection
                    as: "addressDetails"
                }
            },
            {
                $unwind: {
                    path: "$addressDetails",
                    preserveNullAndEmptyArrays: true
                }
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
            }
        ])

        console.log("orderdetails :",orders)
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/orderDetails',{
            title:"My Order Details | TraditionShoppe",
            user : req.session.user,
            page:'Change Address',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            users,
            orders,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}


const loadbuyLast30 = async(req,res)=>{

    

    const email = req.session.user
    const users = await User.find({email:email}).exec()        
    const orders = await Order.find({$expr: {
        $gt: [
           "$order_date",
           {
              $dateSubtract: {
                 startDate: { $dateTrunc: { date: "$$NOW", unit: "day" } },
                 unit: "day",
                 amount: 30
              }
           }
        ]
     }}).exec()  
     
     console.log(orders);
    const cart  = await Cart.find().exec()       
    const products = await Products.find({ isListing:true }).exec()
    const address = await Address.find().exec()



        // let qtyCount = await getQtyCount(req,res);
        // let listCount = await getListCount(req,res);
        
        res.render('profile/userOrder',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            page:'Your Orders',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            products:products,
            users:users,
            orders:orders,
            cart:cart,   
            address:address,        
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
}

const load2023 = async(req,res)=>{
    try{
        
        const email = req.session.user
        const users = await User.find({email:email}).exec()        
        const orders = await Order.find({
            $expr: {
                $and: [
                  { $gte: [{ $year: "$order_date" }, 2023] },
                  { $lt: [{ $year: "$order_date" }, 2024] } // Exclude 2024
                ]
              }
            }).exec()  
         
         console.log(orders);
         console.log(orders);
        const cart  = await Cart.find().exec()       
        const products = await Products.find({ isListing:true }).exec()
        const address = await Address.find().exec()   
    
            let qtyCount = await getQtyCount(req,res);
            let listCount = await getListCount(req,res);    
            res.render('profile/userOrder',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            page:'Your Orders',
            qtyCount:qtyCount,
            listCount:listCount,
            products:products,
            users:users,
            orders:orders,
            cart:cart,   
            address:address,        
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}

const load2022 = async(req,res)=>{
    try{
        
        const email = req.session.user
        const users = await User.find({email:email}).exec()        
        const orders = await Order.find({
            $expr: {
                $and: [
                  { $gte: [{ $year: "$order_date" }, 2022] },
                  { $lt: [{ $year: "$order_date" }, 2023] } // Exclude 2024
                ]
              }
            }).exec()  
         
         console.log(orders);
         console.log(orders);
        const cart  = await Cart.find().exec()       
        const products = await Products.find({ isListing:true }).exec()
        const address = await Address.find().exec()   
    
            let qtyCount = await getQtyCount(req,res);
            let listCount = await getListCount(req,res);    
            res.render('profile/userOrder',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            page:'Your Orders',
            qtyCount:qtyCount,
            listCount:listCount,
            products:products,
            users:users,
            orders:orders,
            cart:cart,   
            address:address,        
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}
const load2021 = async(req,res)=>{
    try{
        
        const email = req.session.user
        const users = await User.find({email:email}).exec()        
        const orders = await Order.find({
            $expr: {
                $and: [
                  { $gte: [{ $year: "$order_date" }, 2021] },
                  { $lt: [{ $year: "$order_date" }, 2022] } // Exclude 2024
                ]
              }
            }).exec()  
         
         console.log(orders);
         console.log(orders);
        const cart  = await Cart.find().exec()       
        const products = await Products.find({ isListing:true }).exec()
        const address = await Address.find().exec()   
    
            let qtyCount = await getQtyCount(req,res);
            let listCount = await getListCount(req,res);    
            res.render('profile/userOrder',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            page:'Your Orders',
            qtyCount:qtyCount,
            listCount:listCount,
            products:products,
            users:users,
            orders:orders,
            cart:cart,   
            address:address,        
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}

const loadOlder = async(req,res)=>{
    try{
        
        const email = req.session.user
        const users = await User.find({email:email}).exec()        
        const orders = await Order.find({
            $expr: {
                 $gt: [{ $year: "$order_date" }, 2021] },
            }).exec()  
         
         console.log(orders);
         console.log(orders);
        const cart  = await Cart.find().exec()       
        const products = await Products.find({ isListing:true }).exec()
        const address = await Address.find().exec()   
    
            let qtyCount = await getQtyCount(req,res);
            let listCount = await getListCount(req,res);    
            res.render('profile/userOrder',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            page:'Your Orders',
            qtyCount:qtyCount,
            listCount:listCount,
            products:products,
            users:users,
            orders:orders,
            cart:cart,   
            address:address,        
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}



/******************************** */

const loadbuyList = async (req,res)=>{
    try{

        const email = req.session.user
        const users = await User.find({email:email}).exec()        
        const orders = await Order.find().exec()       
        const cart  = await Cart.find().exec()       
        const products = await Products.find({ isListing:true }).exec()
        const address = await Address.find().exec()

        let qtyCount = await getQtyCount(req,res);
        let listCount = await getListCount(req,res);
        
        res.render('profile/userBuyList',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            page:'Your Orders',
            qtyCount:qtyCount,
            listCount:listCount,
            products:products,
            users:users,
            orders:orders,
            cart:cart,   
            address:address,        
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}

/*   load cancellist */

const loadcancelList = async (req,res)=>{
    try{

        const email = req.session.user
        const users = await User.find({email:email}).exec()        
        const orders = await Order.find().exec()       
        const cart  = await Cart.find().exec()       
        const products = await Products.find({ isListing:true }).exec()
        const address = await Address.find().exec()

        let qtyCount = await getQtyCount(req,res);
        let listCount = await getListCount(req,res);
        
        res.render('profile/userCancelList',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            page:'Your Orders',
            qtyCount:qtyCount,
            listCount:listCount,
            products:products,
            users:users,
            orders:orders,
            cart:cart,   
            address:address,        
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}

/**************handle my address******************/
const loadAddress = async (req,res)=>{
    try{

        const users = await User.findOne({email:req.session.user}).exec()

        const address= await Address.find({user_id:users._id}).exec()

        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/userAddress',{
            title:"My Address | TraditionShoppe",
            user : req.session.user,
            page:'Your Address',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,     
            address,
            users,        
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}

const loadnewAddress = async (req,res)=>{
    try{
        await getQtyCount(req,res);
        await getListCount(req,res);

        const users = await User.findOne({email:req.session.user}).exec()
        
        res.render('profile/newAddress',{
            title:"My Address | TraditionShoppe",
            user : req.session.user,
            page:'aAd Address',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            users,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}
const storeAddress = async (req,res)=>{
    try{
        const user = await User.findOne({email:req.session.user}).exec()
        const user_addr = await Address.find({user_id:user._id}).exec()
        console.log("form body :",req.body)

        let setDefault = true
        if(user_addr){
            setDefault = false
        }
        const addrData =await new Address({
            user_id:user._id,
            name: req.body.name,
            mobile:req.body.mobile,
            house:req.body.house,
            street:req.body.street,
            landmark:req.body.landmark,
            city:req.body.city,
            pincode:req.body.pin,
            state:req.body.state,
            country:req.body.country,
            isDefault:setDefault
        }).save()

        if(addrData){
            const address = await Address.find({user_id:user._id}).exec()
            
            const lastAddedAddress = address[address.length - 1]; // Retrieve the last address in the array
            console.log(lastAddedAddress._id);
          
            
            await User.updateOne({_id:user._id},
                { $push: { address: lastAddedAddress._id }})
 
            console.log('successful');
            req.flash("successMessage", "Address registered successfully..");
            res.json({ success: true });
        }
        else {
            req.flash("errorMessage", "Address registration failed.. Try again!!");
            res.json({ success: false });
        }
       
    }
    catch(err){
        console.log(err.message);
    }
}

const loadeditAddress = async (req,res)=>{
    try{
        const addrid = req.params.id
        const users = await User.findOne({email:req.session.user}).exec()
        const address = await Address.findOne({_id:addrid}).exec()
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/editAddress',{
            title:"My Address | TraditionShoppe",
            user : req.session.user,
            page:'Change Address',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            users,
            address,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}

const changeAddress = async (req,res)=>{
    try{
        const addrid = req.params.id
        console.log("form data edit :",req.body)

        const address = await Address.updateOne(
            { _id:addrid },
            {$set : {
                name: req.body.name,
                mobile:req.body.mobile,
                house:req.body.house,
                street:req.body.street,
                landmark:req.body.landmark,
                city:req.body.city,
                pincode:req.body.pin,
                state:req.body.state,
                country:req.body.country,
            }}
        )
        if(address){
            console.log('address changed');
            req.flash("successMessage", "Address changed successfully..");
            res.json({ success: true });
        }
        else {
            req.flash("errorMessage", "Address changing failed.. Try again!!");
            res.json({ success: false });
        }    
     }
    catch(err){
        console.log(err.message);
    }
}

const deleteAddress = async (req,res)=>{
    try{
        const addrid = req.params.id
        const user = await User.findOne({email:req.session.user}).exec()
        const defaultAddress = await Address.findOne({_id:addrid}).exec()
        if(defaultAddress.isDefault){
            req.flash("errorMessage", "Default address can't remove!!");
            res.json({ success: false });
        } else {
            await Address.deleteOne(
                {_id:addrid}).exec()
            await User.updateOne(
                {_id:user._id},
                {   $pull:{address:addrid}}
            ).exec()
            req.flash("successMessage", "Address changed successfully..");
            res.json({ success: true });                    
        }
        
     }
    catch(err){
        console.log(err.message);
    }
}

const setAddressDefault = async (req,res)=>{
    try{
        const addrid = req.params.id       

        const defaultAddress = await Address.findOne({isDefault:true})
        if(defaultAddress){
            await Address.updateOne(
                { _id:defaultAddress._id },
                {$set : {
                    isDefault:false
                }}
            )
        }

        const setDefault = await Address.updateOne(
            { _id:addrid },
            {$set : {
                isDefault:true
            }}
        ).exec()
        if(setDefault){
            console.log('address changed');
            req.flash("successMessage", "Your address set as default..");
            res.json({ success: true });
        }
        else {
            req.flash("errorMessage", "Something wrong, Your address can't set as default!!!!");
            res.json({ success: false });
        }    
     }
    catch(err){
        console.log(err.message);
    }
}



/**************handle my wallet******************/
const loadWallet = async (req,res)=>{
    try{
        
            const users = await User.findOne({email:req.session.user}).exec() 
            const pageNum = req.query.page || 1
            const perPage = 6
            const totalCount = await Order.countDocuments({user:users._id,payment:"Wallet"}).exec()               
            const pages = Math.ceil( totalCount / perPage )
            console.log("count",totalCount);

            const orders = await Order.aggregate([{
                $match:{
                    $and:[{ user:users._id}, {payment:"Wallet"}]
                }
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
                $skip: ( pageNum - 1 ) * perPage
            },
            {
                $limit: perPage
            }])

            await getQtyCount(req,res);
            await getListCount(req,res);
            console.log("orders :",orders)
            res.render('profile/userWallet',{
            title:"My account | TraditionShoppe",
            user : req.session.user,
            page:'Your Wallet',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,  
            users,
            orders,   
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



/**************************************/
const loadList = async (req,res)=>{
    try{
        
        const products = await content.getProducts(req,res) //get products from contentController 
        const users = await User.findOne({email:req.session.user}).exec()
        console.log("user :",users)
        const pageNum = req.query.page || 1
        const perPage = 8
        const totalpdtCount = await List.aggregate([
            {
                $match: { user: users._id }
            },
            {
                $unwind: "$product_list" 
            },
            {
                $group: {
                    _id: "$_id", 
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalCount = totalpdtCount.length > 0 ? totalpdtCount[0].count : 0;

        const pages = Math.ceil( totalCount / perPage )
        console.log("count",totalCount);

        const list = await List.aggregate([{
            $match:{user:users._id}
        },
        {
            $skip: ( pageNum - 1 ) * perPage
        },
        {
            $limit: perPage
        }])
        console.log("wishlist :",list)
        let productlist_length = 0
        list.forEach((lst)=>{
            console.log("product list :",lst.product_list.length)
            productlist_length= lst.product_list.length
        })
        
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/userWishlist',{
            title:"My Wishlist | TraditionShoppe",
            user : req.session.user,
            page:'Your Wishlist',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount, 
            productlist_length,              
            products,
            pageNum,
            perPage,
            totalCount, 
            pages,
            list, 
            users,         
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}

//remove product from wishlist
const removeProduct =async(req,res)=>{
    try{
        const pdtid = req.params.id
        const users = await User.findOne({email:req.session.user}).exec()
        await List.updateOne(
            {user:users._id},
            { $pull: { product_list: pdtid } }).exec()
        res.json({success:true})
    }
    catch(err){
        console.log(err.message);
    }
}





module.exports = {
    loadLogin,
    verifyLogin,

    successGoogleLogin,
    failureGoogleLogin,

    successGoogleSignup,
    failureGoogleSignup,

    facebookSignin,

    loadMobile,
    loadChangePassword,
    loadSignup,
    loadOtp,

    loadHome,
    loadIndex,

    customerSignup,
    referalUserUpdate,

    sendOtpEmail,
    loadverifyOTPMail,
    verifyOTPMail,
    loadOTPSuccess,
    resendOTP,

    logoutFrom,

    loadProfile,

    loadOrder,
    loadOrderView,

    // loadReview,
    // storReview,

    loadAddress,
    loadnewAddress,
    storeAddress,
    loadeditAddress,
    changeAddress,
    setAddressDefault,
    deleteAddress,

    loadWallet,

    loadList, 
    removeProduct,
    
    loadeditProfile,
    editProfile,

   
    loadbuyList,
    loadcancelList,

    loadbuyLast30,
    load2023,
    load2022,
    load2021,
    loadOlder,

    getQtyCount,
    getListCount
   

    // successLogin

    
    // loadDashboard,
    // loadUpdate,
    // userUpdate,
    // loadDelete
}