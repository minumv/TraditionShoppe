const express = require("express")
const contentRoute = express()
const contentController = require('../controller/contentController')
const userAuthent = require('../middleware/userAuthent')



contentRoute.set('view engine','ejs')

const bodyParser = require('body-parser')
contentRoute.use(bodyParser.json())
contentRoute.use(bodyParser.urlencoded({extended:true}))

/*************load all pages****************/
contentRoute.get("/cart",userAuthent.isAuthenticated,contentController.loadCart)
contentRoute.get("/checkout/:cartid/:amount",userAuthent.isAuthenticated,contentController.loadCheckout)
contentRoute.get("/allproducts",userAuthent.isAuthenticated,contentController.loadAllProducts)
contentRoute.get("/viewProduct/:id",userAuthent.isAuthenticated,contentController.loadProductDetail)

/****************to cart table*********************/
contentRoute.post("/addtocart/:id/:mrp",contentController.addToCartTable)
contentRoute.post("/addCart/:cartid/:userid/:pdtid/:price",contentController.addQtyToCart)
contentRoute.post("/subCart/:cartid/:userid/:pdtid/:price",contentController.subQtyFromCart)
contentRoute.post("/deleteCart/:cartid/:userid/:pdtid",contentController.deleteFromCart)

/****************add address *********************/

contentRoute.post("/addAddress/:userid/:cartid/:amount",contentController.addNewAddress)
contentRoute.get("/loadeditAddress/:addressid/:cartid/:amount",userAuthent.isAuthenticated,contentController.loadEditAddress)
contentRoute.post("/editAddress/:addrid/:cartid/:amount",contentController.changeAddress)

/*******set session for checkout**********/
contentRoute.post("/updateSelectedAddress",contentController.selectedAddress)
contentRoute.post("/updateSelectedMethod",contentController.selectedMethod)

/******************************/
contentRoute.post("/applyCoupon/:userid/:cartid",contentController.couponApply)

/**********************make cod payment********************* */
contentRoute.post("/makeOrder",contentController.makeCODPayment)
contentRoute.get('/failedPayment',userAuthent.isAuthenticated,contentController.verifyFailedPayment)
contentRoute.post('/verifyPayment',contentController.verifyPayment)
contentRoute.get("/paymentSuccess",userAuthent.isAuthenticated,contentController.loadPaymentSuccess)

contentRoute.post('/continueFailedPayment',contentController.continuePaymentFailed)
contentRoute.post('/verifyPaymentFailed',contentController.verifyPaymentFailed)

/****************wishlist and save for later******************/

contentRoute.get("/addtowishlist/:id",contentController.addToWishlist)


module.exports = contentRoute;