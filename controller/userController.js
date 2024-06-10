require("dotenv").config()
const express = require("express")

//models
const User = require('../model/user')
const Otp = require('../model/userOTP')
const Products = require('../model/product')
const Category = require('../model/category')
const Wallet = require('../model/wallet')
const Coupon = require('../model/coupon')
const Cart = require('../model/cart')
const List = require('../model/wishlist')
const Order = require('../model/order')
const Address = require('../model/address')
const Banner = require('../model/banner')
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
        if(userData.status === 'Blocked'){
            req.flash("errorMessage","You are blocked by the admin!!!")
            res.redirect('/signin/userLogin')
        }
        if(!userData){
            req.flash("errorMessage","You are not authenticated to access this site!!")
            res.redirect('/signin/userLogin')
        }
        const passwordMatch = await bcrypt.compare(password,userData.password)
        if(passwordMatch){
                req.session.user = userData._id ;
                req.session.blocked = false
                req.flash("successMessage","You are successfully logged in.")
                res.redirect('/home')
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
    
    const existUser = await User.findOne({email:req.user.email}).exec()
    if(!existUser){
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
            referalCode: referCode,            
            isGoogleAuth:true

        }).save()
        
        console.log("user :",req.user);
        if(newUser){
            console.log("new user :",newUser);
        }
        req.session.user = newUser._id
        req.session.blocked = false
        res.redirect('/home')

    } else {
       // req.flash("errorMessage","You are authenticated..Please login!!")
       req.session.user = existUser._id
       req.session.blocked = false
        res.redirect('/home')
    }
    
    
    
}

//google login failed
const failureGoogleLogin = async (req,res)=>{
    if(!req.user){
        res.redirect('/signin/userLogin')
    }   
}

const loadReset = async(req,res)=>{
    try{
        const userid = req.params.id
        res.render('signin/resetPassword',{
            title: "Reset Password | TraditionShoppe", 
            userid,           
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

//load forgeot password page
const loadForget= async (req,res)=>{
    try{
       
        res.render('signin/forgetPassword',{
            title: "Reset Password | TraditionShoppe",
            
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    } catch(err){
        console.log(err.message);
    }
}
const sendResetLink = async(req,res)=>{
    try{
        const email = req.body.email
        const user = await User.findOne({email:email}).exec()
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Reset Password',
            html:`
            <div style="text-align:left; padding: 20px;">
                <div class="text-lft" style="margin-bottom: 20px;">        
                    <span  style="margin-left: 10px; font-weight: bold; color:  #00bfa5;font-family: 'icomoon'; font-size: 24px;">TraditionShoppe</span>
                </div>
                <hr style="border-top: 1px solid #ccc; margin: 20px 0;">
                <div style="text-align: left;">
                    <p style="color:#4F0341;">Hello <strong>${user.name}</strong>,</p>
                    <p>You have requested to reset the password of your <b>TraditionShoppe</b> account.</p>
                    <p>Please click this link to change your password:</p>
                    <a href="http://localhost:4000/signin/resetPassword/${user._id}">http://localhost:4000/signin/resetPassword/${user._id}</a>
                    <p>See you soon on our website.</p>
                    <p style="margin-top: 20px;">Sportingly,</p>
                    <p style="color:#4F0341;">The TraditionShoppe Team</p>
                </div>
            </div>`,
        }

        await transporter.sendMail(mailOptions)
        res.render('signin/resetFeedback',{
            title:'Feedback| TraditionShoppe',            
        })
            

    }
    catch(err){
        console.log(err.message);
    }
}
//reset yor password
const resetingPassword = async (req,res)=>{
    try{
        const userid = req.params.id
        console.log(userid , req.body)
        const user = await User.findOne({_id:userid}).exec() 
        if(req.body.password === req.body.confirmpassword){
            const hashPassword = await bcrypt.hash(req.body.password,10)
            console.log(hashPassword)
            await User.updateOne(
                {_id:userid},
                    {$set : {
                        password : hashPassword
                }})
                console.log("password change successfully!")
                req.flash("errorMessage", "Password changed successfully..");    
                res.json({success:true})
            } else {
                console.log("password mismatch!")
                req.flash("errorMessage", "New password should match with confirm password!!");    
                res.json({success:false})
            }
        
    } catch(err){
        console.log(err.message);
    }
   
}

//load change password page
const loadChangePassword = async (req,res)=>{
    try{
        const userid = req.session.user 
        console.log(userid) 
        res.render('signin/changePassword',{           
            title: "Change your password| TraditionShoppe",
            userid,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    } catch(err){
        console.log(err.message);
    }
}
//save new password change
const changingPassword = async (req,res)=>{
    try{
        const userid = req.session.user
        console.log(req.body)
        const user = await User.findOne({_id:userid}).exec() 
        const passwordMatch = bcrypt.compare(req.body.password,user.password)
        if(passwordMatch){
            if(req.body.newpassword === req.body.confirmpassword){
                const hashPassword = await bcrypt.hash(req.body.newpassword,10)
                await User.updateOne(
                {_id:userid},
                    {$set : {
                        password : hashPassword
                }})
                console.log("password change successfull!")
                req.flash("errorMessage", "Password changed successfully..");    
                res.json({success:true})
            } else {
                console.log("password mismatch!")
                req.flash("errorMessage", "New password should match with confirm password!!");    
                res.json({success:false})
            }
        } else {
            console.log("password mismatch!")
            req.flash("errorMessage", "Enter your current password correctly!!");    
            res.json({success:false})
        }  
    } catch(err){
        console.log(err.message);
    }
}

//load signup page
const loadSignup = async (req,res)=>{
    try{
        const referalCode = req.query.referalCode     
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

 //Store customer details in database
 const customerSignup = async (req,res)=>{
    try{     
          
        let {name,email,phone,password,confirmpassword,refferal} = req.body
        console.log(name,email,phone,password,confirmpassword,refferal);
        const userExist = await User.find({email})
        // .then((result)=>{
            if(userExist.lenght > 0){                
               console.log("user exist error!",userExist)
               console.log("hggfc");
                req.flash("errorMessage", "User with the provided email already exists!!");    
                res.json({success:false}) 

                // console.log("User exists error!");
                // return res.json({ success: false, message: "User with the provided email already exists!!" });              
            } else {             
                             
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
                        isGoogleAuth:false,                  
                        isVerifiedByOtp : false
                    })
                    newUser
                    .save() 
                    // const walletsave = new Wallet({
                    //     user:newUser._id,                
                    //     transactiontype:'credited',
                    //     amount: obj.referCredit,
                    // }).save()                   
                    .then((result)=>{                        
                        sendOtpEmail(result,res)                        
                        res.json({success:true, 
                             data:{ 
                                _id:result._id ,
                                email:result.email
                            }})   
                       
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

        // })
        // .catch((err)=>{
        //     console.log(err);
        //     req.flash("errorMessage", "An error occured while checking for existing user !!");    
        //     res.json({success:false })               
        // })
        
    } catch(err){
        console.log(err);
        req.flash("errorMessage", "An error occured in saving try block!!");    
        res.json({success:false })        
    }
}
//updating wallet amount of refered user
const referalUserUpdate = async(req,res,obj)=>{
    try{
            console.log("referal code is used")
            req.session.refferalUsed = true;
            const referUser = await User.findOne({referalCode:obj.refferal})
            referUser.wallet += obj.referCredit;
            referUser.save()  
            const walletsave = new Wallet({
                user:referUser._id,                
                transactiontype:'credited',
                amount: obj.referCredit,
            }).save()
            
            
    } catch(err){
        console.log(err.message)
    }
}
//request otp
const sendOtpEmail = async({_id,email},res)=>{
    try{
        const otp = `${Math.floor(1000+Math.random()*9000)}`;
        const user = await User.findById(_id)
        //mail options
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify Your Email',
            html: `
            <div style="text-align:left; padding: 20px;">
                <div style="margin-bottom: 20px;">           
                    <img src="http://localhost:4000/userasset/images/logo.png" alt="main_logo" style="height: 100px;">
                    <span  style="margin-left: 10px; font-weight: bold; color:  #00bfa5;font-family: 'icomoon'; font-size: 24px;">TraditionShoppe</span>
                </div>
                <hr style="border-top: 1px solid #ccc; margin: 20px 0;">
                <div style="text-align: left;">                
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Thank you for choosing <b>TraditionShoppe</b>. Use this OTP to complete your Sign Up procedures and verifyy your account on <b>TraditionShoppe</b>.The OTP will expires in 1 minutes. </p>
                    <br>
                    <p>Remember, Never share this OTP with anyone. Our cutomer service team will never ask you for your password, OTP, credit card or banking info.</p><br>
                    <p style="display: inline-block; padding: 10px 20px; color: white; background-color: #4F0341; text-decoration: none; border-radius: 5px;">${otp}</p>
                    <p>We hope to see you again soon. <br>Regards,<br>
                    Team <b>TraditionShoppe</b></p>
                </div>
            </div>
        `,
        }

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
       // res.render()
             
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
        let otp =req.body.otp
        
        // let {otp} = [...req.body.digit1,...req.body.digit2,...req.body.digit3,...req.body.digit4];
        console.log("userid : "+userId +" otp : "+otp);
        
        if(!userId || !otp){            
            req.flash("errorMessage", "Empty otp details are not allowed!!");    
            res.json({success:false })     

        } else {
            const userOtpNumber = await Otp.find({user_id:userId})       
           
            console.log("user at otp table" + userOtpNumber);

            if(userOtpNumber.length <= 0){                
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
                       
                        req.flash("errorMessage", "Invalid code passed. Check your inbox!!!");    
                        res.json({success:false })  
                       
                    } else {
                        //success
                        await User.updateOne({_id:userId},{isVerifiedByOtp:true})
                        Otp.deleteMany({userId})
                        req.flash("successMessage", "Your registration successfull, Sign in to the system..");  
                        res.json({success:true})
                      
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


   // resend otp
    const resendOTP = async(req,res)=>{
        try{
            let _id=req.params.id
            let email=req.params.email
            console.log("at resend userid : " + _id + " email : "+ email);
           
            await Otp.deleteMany({user_id:_id})
            console.log("at resend after delete userid : " + _id + " email : "+ email);
            sendOtpEmail({_id, email},res)
            res.json({success:true})           
        }
        catch(err){
            console.log(err.message);
        }
    }


/*****************user page navigation*********************/ 

//load index page
const loadIndex = async (req,res)=>{
    try{

        let condition = {
            status:{$ne:'inactive'},
            isListing:true}
        const products = await content.getProducts(req,res,condition)
        
        await getQtyCount(req,res); 
        await getListCount(req,res);
        
        res.render('user/index',{
            title: "Home | TraditionShoppe", 
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            user:req.session.user, 
            products,                     
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
        let condition = {
            status:'new',
            isListing:true}
        const products = await content.getProducts(req,res,condition)
        const banner = await Banner.findOne().sort({ _id: -1 }).exec()
        const pdtExpl = await Products.findOne({status: { $in: ['new', 'active'] },product_type:'decor'}).sort({_id: -1}).skip(2).exec()
        const pdtToy = await Products.findOne({status: { $in: ['new', 'active'] },product_type:'toys'}).sort({_id: -1}).skip(1).exec()
        const category = await Category.findOne({ name: 'apparel' }).exec();
        const pdtApparel = await Products.findOne({status: { $in: ['new', 'active'] }}).populate('category').sort({_id: -1}).skip(1).exec()
        const pdtGifts = await Products.findOne({status: { $in: ['new', 'active'] },product_type:'gift'}).sort({_id: -1}).skip(1).exec()
        const pdtJewllry = await Products.findOne({status: { $in: ['new', 'active'] },product_type:'jewellery'}).sort({_id: -1}).skip(1).exec()
        const pdtWest = await Products.findOne({status: { $in: ['new', 'active'] },product_type:'western'}).sort({_id: -1}).skip(1).exec()
        const pdtFig = await Products.findOne({status: { $in: ['new', 'active'] },product_type:'figurine'}).sort({_id: -1}).skip(1).exec()
            const loadPdt = {
                pdtExpl, pdtToy, pdtApparel, pdtGifts, pdtJewllry, pdtWest, pdtFig
            }
        console.log("load",loadPdt)
        await getQtyCount(req,res); 
        await getListCount(req,res);
   
        res.render('user/home',{
            title: "Home | TraditionShoppe", 
            user :req.session.user, 
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            products,           
            banner,
            loadPdt,       
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })

    }
    catch(error){

    }
}

//logout from home
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
        
        const user_cart = await Cart.findOne({user:req.session.user,status:"listed"}).exec()
     
        if(user_cart){            
            user_cart.product_list.forEach(product => { 
               // console.log(product.quantity);       
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


/********************profile handling**************************/

const loadProfile = async (req,res)=>{
    try{
        const users = await User.findOne({_id:req.session.user}).exec()    
        await getQtyCount(req,res);
        await getListCount(req,res);
        console.log("user: ",users);
        res.render('profile/userProfile',{
            title:"My account | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
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
        const users = await User.findOne({_id:req.session.user}).exec()    
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/userProfileEdit',{
            title:"My account | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
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
        console.log("query:",req.query)        
        const users = await User.findOne({_id:req.session.user}).exec()
        let matchCondition = {user:users._id}
        let pageName = 'Your Orders'
        if(req.query.cond){
            switch(req.query.cond){
                case '30days':
                    matchCondition = {
                        user: users._id,
                        $expr: {
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
                        }
                    };
                    pageName = 'Your Orders / Last 30 Days';
                    break;
                case '2023':
                    matchCondition = {
                        user: users._id,
                        $expr: {
                            $and: [
                                { $gte: [{ $year: "$order_date" }, 2023] },
                                { $lt: [{ $year: "$order_date" }, 2024] }
                            ]
                        }
                    };
                    pageName = 'Your Orders / 2023';
                    break;
                case '2022':
                    matchCondition = {
                        user: users._id,
                        $expr: {
                            $and: [
                                { $gte: [{ $year: "$order_date" }, 2022] },
                                { $lt: [{ $year: "$order_date" }, 2023] } 
                            ]
                        }
                    };
                    pageName = 'Your Orders / 2022';
                    break;
                case '2021':
                        matchCondition = {
                            user: users._id,
                            $expr: {
                                $and: [
                                    { $gte: [{ $year: "$order_date" }, 2021] },
                                    { $lt: [{ $year: "$order_date" }, 2022] }
                                ]
                            }
                        };
                    break;
                    pageName = 'Your Orders / 2021';
                case 'older':
                        matchCondition = {
                            user: users._id,
                            $expr: {
                               
                                     $lt: [{ $year: "$order_date" }, 2021]  
                                
                            }
                        };
                        pageName = 'Your Orders / Older';
                    break;
                
            }
        }
        
            const pageNum = req.query.page || 1
            const perPage = 9
            const total = await Order.aggregate([
                {
                    $match: matchCondition
                },
                {
                    $unwind : "$product_list"
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ])
            let totalCount = 1
            console.log(total)
            if(total.length>0){               
                totalCount = total[0].count
            }             
            const pages = Math.ceil( totalCount / perPage )
            
        
        const orders = await Order.aggregate([
            {
                $match: matchCondition
            }, 
            {
                $unwind: "$product_list"   
            },          
            {
                $lookup: {
                    from: "addresses", 
                    localField: "address", 
                    foreignField: "_id", 
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
                    from: "products", 
                    localField: "product_list.productId", 
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
                $sort : { 'created' : -1 }
            },
            {
                $skip: ( pageNum - 1 ) * perPage
            },
            {
                $limit: perPage
            },
           
        ]);

        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/userOrder',{
            title:"My Order | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
            page:pageName,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            orders, 
            users,
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

const getOrderDetails = async(req,res,odrid,pdtid)=>{
   try{
    const orders = await Order.aggregate([
        {
            $match: { 
                $and : [
                    {_id: odrid} ,
                    {"product_list.productId": pdtid }
                ]
            }
        }, 
        {
            $addFields: {
                product: {
                    $filter: {
                        input: "$product_list",
                        as: "product",
                        cond: { $eq: ["$$product.productId", pdtid] }
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
                from: "addresses", 
                localField: "address",
                foreignField: "_id", 
                as: "addressDetails"
            }
        },
        {
            $unwind: {
                path: "$addressDetails",
                preserveNullAndEmptyArrays: true
            }
        }           
    ])  
    return orders
   } catch(err){
    console.log(err.message);
   }
}
const loadOrderView = async (req,res)=>{
    try{
        console.log("req :",req.params)
        const odrid = new mongoose.Types.ObjectId(req.params.odrid)
        console.log(odrid)
        const pdtid = new mongoose.Types.ObjectId(req.params.pdtid)
        console.log(pdtid)
       const users = await User.findOne({_id:req.session.user}).exec()
        console.log("order id :",odrid)
        const orders = await getOrderDetails(req,res,odrid,pdtid)

        //console.log("orderdetails :",orders)
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/orderDetails',{
            title:"My Order Details | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
            page:'Change Address',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,           
            orders,
            users,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}

const loadInvoicePage = async(req,res)=>{
    try{
        const odrid = new mongoose.Types.ObjectId(req.params.odrid)
        console.log(odrid)
        const pdtid = new mongoose.Types.ObjectId(req.params.pdtid)
        console.log(pdtid)
        const users = await User.findOne({_id:req.session.user}).exec()
        console.log("order id :",odrid)
             
        let condition = {
            _id:pdtid}
        const products = await content.getProducts(req,res,condition)
        const orders = await getOrderDetails(req,res,odrid,pdtid)
        res.render('profile/invoicePage',{
        title:"My Order Details | TraditionShoppe",
        user : req.session.user,
        blocked:req.session.blocked,
        page:'Invoice',
        qtyCount:req.session.qtyCount,
        listCount:req.session.listCount,           
        orders,
        users,
        products,
        errorMessage:req.flash('errorMessage'),
        successMessage:req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message)
    }   

}


/**************handle my address******************/
const loadAddress = async (req,res)=>{
    try{
        const users = await User.findOne({_id:req.session.user}).exec()
        const address= await Address.find({user_id:users._id}).exec()        
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/userAddress',{
            title:"My Address | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
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
        const users = await User.findOne({_id:req.session.user}).exec()
        res.render('profile/newAddress',{
            title:"My Address | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
            page:'aAd Address',
            users,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
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
        const user_addr = await Address.find({user_id:req.session.user}).exec()
        console.log("form body :",req.body)

        let setDefault = true
        if(user_addr){
            setDefault = false
        }
        const addrData =await new Address({
            user_id:req.session.user,
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
            const address = await Address.find({user_id:req.session.user}).exec()            
            const lastAddedAddress = address[address.length - 1]; 
            console.log(lastAddedAddress._id);          
            
            await User.updateOne({_id:req.session.user},
                { $push: { address: lastAddedAddress._id }})
 
            console.log('successful');
            req.flash("successMessage", "Address registered successfully..");
            res.redirect('/getAddress')
        }
        else {
            req.flash("errorMessage", "Address registration failed.. Try again!!");
            res.redirect('/getNewAddress')
        }
       
    }
    catch(err){
        console.log(err.message);
    }
}

const loadeditAddress = async (req,res)=>{
    try{
        const addrid = req.params.id
        const users = await User.findOne({_id:req.session.user}).exec()
        const address = await Address.findOne({_id:addrid}).exec()
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/editAddress',{
            title:"My Address | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
            page:'Change Address',
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
            res.redirect('/getAddress');
        }
        else {
            req.flash("errorMessage", "Address changing failed.. Try again!!");
            res.redirect(`/getEditAddress/${addrid}`);
        }    
     }
    catch(err){
        console.log(err.message);
    }
}

const deleteAddress = async (req,res)=>{
    try{
        const addrid = req.params.id
        const defaultAddress = await Address.findOne({_id:addrid}).exec()
        if(defaultAddress.isDefault){
            req.flash("errorMessage", "Default address can't remove!!");
            res.json({ success: false });
        } else {
            await Address.deleteOne(
                {_id:addrid}).exec()
            await User.updateOne(
                {_id:req.session.user},
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

/********************Review********************* */
const loadReview = async ( req,res )=>{
    try{
        const pdtid = req.params.pdtid
        const users = await User.findOne({_id:req.session.user}).exec()
        const product = await Products.findById(pdtid) 
        res.render('profile/userReview',{
            title:"Rate our product | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
            page:'Your review',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,            
            users, 
            product,                   
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    }
    catch(err){
        console.log(err.message);
    }
}
const storeReview = async ( req,res )=>{
    try{
        const userid = req.session.user
        const { star , feedback , pdtid } = req.body
        const product = await Products.findById(pdtid)

        console.log(req.body)
        
        let ratedAlready = await Products.findOne({ 
            _id: pdtid, 
            "ratings.ratedby": userid 
        }, { "ratings.$": 1 });

        // Check if the user has already given feedback
        let feedbackGiven = await Products.findOne({
            _id: pdtid,
            "feedback.reviewby": userid
        }, { "feedback.$": 1 });

        if (ratedAlready) {
            const updateRating = await Products.updateOne(
                {
                    _id: pdtid,
                    "ratings.ratedby": userid
                },
                {
                    $set: { "ratings.$.star": star }
                },
                {
                    new: true
                }
            );

            if (!updateRating) {
                req.flash("errorMessage", "Your rating is not updated!!!");
                return res.json({ success: false });
            }
        } else {
            const rateProduct = await Products.findByIdAndUpdate(
                pdtid,
                {
                    $push: {
                        ratings: {
                            star: star,
                            ratedby: userid
                        }
                    }
                },
                {
                    new: true
                }
            );

            if (!rateProduct) {
                req.flash("errorMessage", "Your rating is not added!!!");
                return res.json({ success: false });
            }
        }

        if (feedback) {
            if (feedbackGiven) {
                const updateFeedback = await Products.updateOne(
                    {
                        _id: pdtid,
                        "feedback.reviewby": userid
                    },
                    {
                        $set: {
                            "feedback.$.reviews": feedback,
                            "feedback.$.reviewDate": Date.now()
                        }
                    },
                    {
                        new: true
                    }
                );

                if (!updateFeedback) {
                    req.flash("errorMessage", "Your feedback is not updated!!!");
                    return res.json({ success: false });
                }
            } else {
                const addFeedback = await Products.findByIdAndUpdate(
                    pdtid,
                    {
                        $push: {
                            feedback: {
                                reviews: feedback,
                                reviewby: userid,
                                reviewDate: Date.now()
                            }
                        }
                    },
                    {
                        new: true
                    }
                );

                if (!addFeedback) {
                    req.flash("errorMessage", "Your feedback is not added!!!");
                    return res.json({ success: false });
                }
            }
        }

        const getAllRatings = await Products.findById(pdtid)
        let totalRating = getAllRatings.ratings.length
        let ratingSum = getAllRatings.ratings
        .map((item) => item.star)
        .reduce(( prev,curr ) => prev + curr, 0)
        let actualRating = Math.round( ratingSum / totalRating )
        let finalProduct = await Products.findByIdAndUpdate(
            pdtid,
            {
                totalrating : actualRating
            },
            {
                new : true
            }
        )
        if(finalProduct){
            res.json({success:true})
        } else {
            req.flash("errorMessage", "Your review is not added !!!");
            res.json({success:false})
        }
    }
    catch(err){
        console.log(err.message);
    }
}

/********************coupon********************* */
const loadcoupon = async (req,res)=>{
    try{
      
        const pageNum = req.query.page || 1
        const perPage = 8
        const totalpdtCount = await Coupon.aggregate([
            {
                $match: { status:true }
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
        const users = await User.findOne({_id:req.session.user}).exec()
        const coupon = await Coupon.aggregate([{
            $match:{ status:true}
        },
        {
            $sort: { created : -1 }
        },
        {
            $skip: ( pageNum - 1 ) * perPage
        },
        {
            $limit: perPage
        }])
        console.log("Coupon :",coupon)
        await getQtyCount(req,res);
        await getListCount(req,res);
        
        res.render('profile/coupon',{
            title:"Coupon List | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
            page:'Your Coupon',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,                       
           coupon,
            users,
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


/**************handle my wallet******************/
const loadWallet = async (req,res)=>{
    try{
        
            const users = await User.findOne({_id:req.session.user}).exec() 
            const pageNum = req.query.page || 1
            const perPage = 6
            const totalCount = await Wallet.countDocuments({user:users._id}).exec()               
            const pages = Math.ceil( totalCount / perPage )
            console.log("count",totalCount);

            const wallet = await Wallet.aggregate([{
                $match:
                    { user:users._id}
               
            },
            {
                $sort: { 'created' : -1 }
            },            
            {
                $skip: ( pageNum - 1 ) * perPage
            },
            {
                $limit: perPage
            }])

            await getQtyCount(req,res);
            await getListCount(req,res);
            console.log("Wallets :",wallet)
            res.render('profile/userWallet',{
            title:"My account | TraditionShoppe",
            user : req.session.user,
            blocked:req.session.blocked,
            page:'Your Wallet',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,  
            users,
            wallet,   
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



/*****************WishList*********************/
const loadList = async (req,res)=>{
    try{
        let  matchCondition = {
            $and: [
                { status: { $ne: 'inactive' } },
                { isListing: true }
             ]
        }
        const products = await content.getProducts(req,res,matchCondition) //get products from contentController 
        const pageNum = req.query.page || 1
        const perPage = 8
        const totalpdtCount = await List.aggregate([
            {
                $match: { user: req.session.user }
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
        const userid = new mongoose.Types.ObjectId(req.session.user)
        const pages = Math.ceil( totalCount / perPage )
        console.log("count",totalCount);
        const users = await User.findOne({_id:req.session.user}).exec()
        const list = await List.aggregate([{
            $match:{user:userid}
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
            blocked:req.session.blocked,
            page:'Your Wishlist',
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount, 
            productlist_length,              
            products,
            users,
            pageNum,
            perPage,
            totalCount, 
            pages,
            list,     
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
        await List.updateOne(
            {user:req.session.user},
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

    loadForget,
    loadReset,
    loadChangePassword,
    loadSignup,
    loadOtp,

    changingPassword,
    resetingPassword,
    sendResetLink,

    loadHome,
    loadIndex,

    customerSignup,
    referalUserUpdate,

    sendOtpEmail,
    loadverifyOTPMail,
    verifyOTPMail,
   
    resendOTP,

    logoutFrom,

    loadProfile,

    getOrderDetails,

    loadOrder,
    loadOrderView,
    loadInvoicePage,

    loadcoupon,

    loadReview,
    storeReview,

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

    getQtyCount,
    getListCount  

}