const express = require("express")
const userRoute = express()
const passport = require('passport')
const passportFile =require('../passportFile')

userRoute.use(passport.initialize())
userRoute.use(passport.session())

const userController = require('../controller/userController')

const userAuthent = require('../middleware/userAuthent')

userRoute.set('view engine','ejs')

const bodyParser = require('body-parser')
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({extended:true}))


/*******************signup & login using Google account**************/

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


/*******************signup and login using credentials*************************/
userRoute.get("/signin/userLogin",userAuthent.isLoggedOut,userController.loadLogin)
userRoute.get("/signin/forgetPassword",userController.loadForget)
userRoute.get("/signin/resetPassword/:id",userController.loadReset)
userRoute.get("/signin/changePassword",userController.loadChangePassword)
userRoute.get("/signin/signup",userAuthent.isLoggedOut,userController.loadSignup)
userRoute.get("/signin/otpPage",userController.loadOtp)

userRoute.post("/changePassword/:id",userController.changingPassword)
userRoute.post("/resetPassword/:id",userController.resetingPassword)
userRoute.post("/forgotMail",userController.sendResetLink)

/************user home navigation****************/

userRoute.get("/",userController.loadIndex)
userRoute.get("/index",userController.loadIndex)
userRoute.get("/home",userAuthent.isAuthenticated,userController.loadHome)



//login process
userRoute.post('/checkLogin',userController.verifyLogin)

//registration process
userRoute.post("/addcustomer",userController.customerSignup)

//otp send to mail
userRoute.post('/send-otp',userController.sendOtpEmail)

//load otp verify page
userRoute.get('/loadOTP/:id/:email',userController.loadverifyOTPMail)

//otp verification 
userRoute.post('/verifyOTP/:id',userController.verifyOTPMail)

//load otp success page

userRoute.post('/otpSuccess',userController.loadLogin)

//resend otp
userRoute.post('/resendOTP/:id/:email',userController.resendOTP)

//logout routing
userRoute.get("/logout",userController.logoutFrom)


/**************user profile*******************/


userRoute.get("/userprofile",userAuthent.isAuthenticated,userController.loadProfile)
userRoute.get("/geteditprofile",userAuthent.isAuthenticated,userController.loadeditProfile)
userRoute.post("/changeprofile/:id",userAuthent.isAuthenticated,userController.editProfile)


/************order**************/
userRoute.get("/getOrder",userAuthent.isAuthenticated,userController.loadOrder)
userRoute.get("/getOrderView/:odrid/:pdtid",userAuthent.isAuthenticated,userController.loadOrderView)
userRoute.get("/getInvoice/:odrid/:pdtid",userController.loadInvoicePage)

/**************review*******************/
userRoute.get("/getReview/:pdtid",userAuthent.isAuthenticated,userController.loadReview)
userRoute.post("/addReview",userAuthent.isAuthenticated,userController.storeReview)
userRoute.get("/getusercoupon",userAuthent.isAuthenticated,userController.loadcoupon)

/**************address*******************/
userRoute.get("/getAddress",userAuthent.isAuthenticated,userController.loadAddress)
userRoute.get("/getNewAddress",userAuthent.isAuthenticated,userController.loadnewAddress)
userRoute.post("/addnewAddress",userAuthent.isAuthenticated,userController.storeAddress)
userRoute.get("/getEditAddress/:id",userAuthent.isAuthenticated,userController.loadeditAddress)
userRoute.post("/editnewAddress/:id",userAuthent.isAuthenticated,userController.changeAddress)
userRoute.post("/removeAddress/:id",userAuthent.isAuthenticated,userController.deleteAddress)
userRoute.post("/setAddress/:id",userAuthent.isAuthenticated,userController.setAddressDefault)

/**************wallet*******************/
userRoute.get("/getWallet",userAuthent.isAuthenticated,userController.loadWallet)


/**************wishlist*******************/
userRoute.get("/getList",userAuthent.isAuthenticated,userController.loadList)
userRoute.post("/removeList/:id",userAuthent.isAuthenticated,userController.removeProduct)



module.exports =  userRoute//router