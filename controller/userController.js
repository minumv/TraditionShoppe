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
    if(!req.user){
        res.redirect('/signin/userLogin')
    }
    //console.log(req.user);
    const productQuery = Products.find({status:{$ne:'inactive'},isListing:true}).exec()
    const categoryQuery = Category.find({status:true}).exec()
    const sellerQuery = Seller.find({status:{$ne:'inactive'}}).exec()
    const discountQuery = Discount.find({status:true}).exec()
    console.log( productQuery);
    const [products, categories, sellers, discounts] = await Promise.all([productQuery, categoryQuery, sellerQuery, discountQuery]);
    req.session.user = req.user.email ;
    res.render('user/home',{
        title:"Home | TraditionShoppe",
        user : req.session.user,
        products:products,
        categories:categories,
        sellers:sellers,
        discounts:discounts, 
        errorMessage:req.flash('errorMessage'),
        successMessage:req.flash('successMessage')
    })
}

//google login failed
const failureGoogleLogin = async (req,res)=>{
    res.redirect('/signin/userLogin')
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
        res.render('signin/signup',{
            title: "Sign Up | TraditionShoppe",
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
       
          
        let {name,email,phone,password} = req.body
        console.log(name,email,phone,password);
        
        //checking if user already exists
        User.find({email})
        .then((result)=>{
            if(result.length){
                //A user already exists
                res.json({
                    status: "FAILED",
                    message: "User with the proveded email already exists",
                })
            } else {
                //try to create new user

                //password hashing
                bcrypt.hash(password,10)
                .then((hashedPassword)=>{
                    const newUser = new User({
                        name,
                        email,
                        phone,
                        password : hashedPassword,
                        role : 'user',
                        status: 'Pending',
                        isVerifiedByOtp : false
                    })
                    newUser
                    .save()
                    .then((result)=>{
                        //handle otp verification

                        // const { _id: userId, email } = result;
                        // sendOtpEmail({ userId, email }, res);


                         sendOtpEmail(result,res)

                        
                        res.redirect(`/verifyOTP/${result._id}/${result.email}`)
                    })
                    .catch((err)=>{
                        console.log(err);
                        res.json({
                            status:"FAILED",
                            message: "An error occured while saving user account!"
                        })
                    })
                })
                .catch((err)=>{
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hasing password!"
                    })
                })
            }

        })
        .catch((err)=>{
            console.log(err);
            res.json({
                status:"FAILED",
                message: "An error occured while checking for existing user!"
            })
        })
        
    } catch(err){
        console.log(err);
        res.json({
            status:"FAILED",
            message:"An error occured in saving try block"
           })
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
        console.log(newOTP);
        await transporter.sendMail(mailOptions)
        
       //res.redirect('/signin/otpVerifyPage/_id')
        // res.json({
        //     status:"PENDING",
        //     message:"otp verification email sent",
        //     data:{
        //         user_id:_id,
        //         email
        //     }
        // })        
    }
    catch(err){
       res.json({
        status:"FAILED",
        message:err.message
       })
    }
}
const loadverifyOTPMail = async(req,res)=>{
    try{        
            console.log("at loading id: "+req.params.id+ " email: "+ req.params.email);
        // let id = req.params.id
        // User.findById(id)
        // .then(otps=>{
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
        let{ digit1,digit2,digit3,digit4 }=req.body
        let otp = digit1+digit2+digit3+digit4

        // let {otp} = [...req.body.digit1,...req.body.digit2,...req.body.digit3,...req.body.digit4];
        console.log("userid : "+userId +" otp : "+otp);
        
        if(!userId || !otp){
            throw new error("Empty otp details are not allowed")
        } else {
            const userOtpNumber = await Otp.find({user_id:userId})
        
           // res.json({message:userOtpNumber})
            console.log("user at otp table" + userOtpNumber);

            if(userOtpNumber.length <= 0){
                //no record found
                throw new Error(
                    "Account record doesn't exist or has been verified already. Please sign up or check your email! "
                )
            } else {
                //user otp record exists
                const { expiresAt } = userOtpNumber[0].expiresAt
                const hashedOTP = userOtpNumber[0].otp

                if(expiresAt < Date.now()){
                    //user otp record has expired
                    await Otp.deleteMany({user_id:userId})
                    throw new Error("Code has expired. Please request again!")
                } else {
                    const validOTP = await bcrypt.compare(otp,hashedOTP)
                    
                    if(!validOTP){
                        //supplied otp is wrong
                        throw new Error("Invalid code passed. Check your inbox!")
                        // res.redirect(`/verifyOTP/${userId}/${email}`)
                    } else {
                        //success
                        await User.updateOne({_id:userId},{isVerifiedByOtp:true})
                        Otp.deleteMany({userId})
                        res.redirect('/signin/userLogin')
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
        res.json({
            status: "FAILED",
            message: error.message
        })
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
            res.redirect(`/verifyOTP/${_id}/${email}`)
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
        
        // console.log( productQuery);
        // const [products, categories, sellers, discounts] = await Promise.all([productQuery, categoryQuery, sellerQuery, discountQuery]);
        const users = await User.findOne({email:email},{_id:1}).exec()
        console.log("user : "+users)
        const user_cart = await Cart.findOne({user:users}).exec()
        console.log("cart : "+user_cart)
        let qtyCount = 0;
        let listCount = 0;
        if(user_cart){
            console.log("inside cart");
            console.log( user_cart.total_amount);
            user_cart.product_list.forEach(product => { 
                console.log(product.quantity);       
                qtyCount += product.quantity; })
        } 
        const user_list = await List.findOne({user:users}).exec()
        if(user_list){            
            
            listCount = user_list.product_list.length;
        } 
        // else {
        //     qtyCount=0;
        // }
        console.log("qty"+ qtyCount);
        res.render('user/home',{
            title: "Home | TraditionShoppe", 
            user : email, 
            qtyCount:qtyCount,
            listCount:listCount,
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

module.exports = {
    loadLogin,
    verifyLogin,
    successGoogleLogin,
    failureGoogleLogin,
    facebookSignin,
    loadMobile,
    loadChangePassword,
    loadSignup,
    loadOtp,
    loadHome,
    loadIndex,    
    customerSignup,
    sendOtpEmail,
    loadverifyOTPMail,
    verifyOTPMail,
    loadOTPSuccess,
    resendOTP,
    logoutFrom,
   

    // successLogin

    
    // loadDashboard,
    // loadUpdate,
    // userUpdate,
    // loadDelete
}