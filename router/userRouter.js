const express = require("express")
const userRoute = express()
const passport = require('passport')
const passportFile =require('../passportFile')

userRoute.use(passport.initialize())
userRoute.use(passport.session())

const userController = require('../controller/userController')

const userAuthent = require('../middleware/userAuthent')

// const {otpValidator} = require('../middleware/validations')

userRoute.set('view engine','ejs')

const bodyParser = require('body-parser')
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({extended:true}))

//login routing
// userRoute.get("/login",userAuthent.isLoggedOut,userController.loadLogin)
// userRoute.post("/login",userController.verifyLogin)

//Auth
userRoute.get('/auth/google',passport.authenticate('google',{scope:
    [ 'email','profile' ]
}))

//Auth callback
userRoute.get('/auth/google/callback',
passport.authenticate('google',{
    successRedirect: '/success',
    failureRedirect: '/failure'
}))

//success
userRoute.get('/success',userController.successGoogleLogin)

//failure
userRoute.get('/failure',userController.failureGoogleLogin)

//logout routing
userRoute.get("/signin/userLogin",userAuthent.isLoggedOut,userController.loadLogin)
userRoute.get("/signin/forgetPassword",userController.loadMobile)
userRoute.get("/signin/changePassword",userController.loadChangePassword)
userRoute.get("/signin/signup",userAuthent.isLoggedOut,userController.loadSignup)
userRoute.get("/signin/otpPage",userController.loadOtp)

/************user home navigation****************/

userRoute.get("/",userAuthent.isAuthenticated,userController.loadIndex)
userRoute.get("/index",userController.loadIndex)
userRoute.get("/home",userAuthent.isAuthenticated,userController.loadHome)



//login process
userRoute.post('/checkLogin',userController.verifyLogin)

//registration routing
// userRoute.get("/register",userAuthent.isLoggedOut,userController.loadRegister)
userRoute.post("/addcustomer",userController.customerSignup)

//otp verification routes
userRoute.post('/send-otp',userController.sendOtpEmail)

//load verify page
userRoute.get('/verifyOTP/:id/:email',userController.loadverifyOTPMail)

//verify otp
userRoute.post('/verifyOTP/:id',userController.verifyOTPMail)

//load otp success page
userRoute.get('/otpSuccess',userController.loadOTPSuccess)
userRoute.post('/otpSuccess',userController.loadLogin)

//resend otp
userRoute.post('/resendOTP/:id/:email',userController.resendOTP)

//logout routing
userRoute.get("/logout",userController.logoutFrom)


/**************user profile*******************/


userRoute.get("/userprofile",userAuthent.isAuthenticated,userController.loadProfile)
// userRoute.get("/getProfile",userAuthent.isAuthenticated,userController.loadProfile)
userRoute.get("/getOrder",userAuthent.isAuthenticated,userController.loadOrder)
userRoute.get("/getAddress",userAuthent.isAuthenticated,userController.loadAddress)
userRoute.get("/getWallet",userAuthent.isAuthenticated,userController.loadWallet)
userRoute.get("/getList",userAuthent.isAuthenticated,userController.loadList)

/************my order**************/
// userRoute.get("/orderList",userAuthent.isAuthenticated,userController.loadorderList)
userRoute.get("/buyAgain",userAuthent.isAuthenticated,userController.loadbuyList)
userRoute.get("/cancelList",userAuthent.isAuthenticated,userController.loadcancelList)

/************my order by date**************/

userRoute.get("/orderlast30",userAuthent.isAuthenticated,userController.loadbuyLast30)
userRoute.get("/order2023",userAuthent.isAuthenticated,userController.load2023)
// userRoute.get("/order2022",userAuthent.isAuthenticated,userController.load2022)
// userRoute.get("/order2021",userAuthent.isAuthenticated,userController.load2021)
// userRoute.get("/oldorders",userAuthent.isAuthenticated,userController.loadold)


module.exports =  userRoute//router