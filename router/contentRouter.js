const express = require("express")
const contentRoute = express()
const contentController = require('../controller/contentController')
const userAuthent = require('../middleware/userAuthent')



contentRoute.set('view engine','ejs')

const bodyParser = require('body-parser')
contentRoute.use(bodyParser.json())
contentRoute.use(bodyParser.urlencoded({extended:true}))

/*************searching****************/
contentRoute.post("/getSearchValue",contentController.storeSerachValue)
contentRoute.post("/getSearchProduct",contentController.listSearchProduct)




/*************navigation****************/
contentRoute.get("/cart",userAuthent.isAuthenticated,contentController.loadCart)
contentRoute.get("/checkout/:cartid/:amount",userAuthent.isAuthenticated,contentController.loadCheckout)
contentRoute.get("/allproducts",userAuthent.isAuthenticated,contentController.loadAllProducts)
contentRoute.get("/searchProducts",userAuthent.isAuthenticated,contentController.loadSearchProducts)
contentRoute.get("/viewProduct/:id",userAuthent.isAuthenticated,contentController.loadProductDetail)

contentRoute.get("/handicratfs",userAuthent.isAuthenticated,contentController.loadSearchProducts)
// contentRoute.get("/antiques",userAuthent.isAuthenticated,contentController.loadAntiques)
// contentRoute.get("/spices",userAuthent.isAuthenticated,contentController.loadSpices)
// contentRoute.get("/apparels",userAuthent.isAuthenticated,contentController.loadApparels)

// /****************All products handling************* */

// contentRoute.get("/bestSellers",userAuthent.isAuthenticated,contentController.loadSellerProducts)
// contentRoute.get("/popularProducts",userAuthent.isAuthenticated,contentController.loadPopular)
contentRoute.get("/newArrivals",userAuthent.isAuthenticated,contentController.loadNew)




contentRoute.get("/newHandicrafts",userAuthent.isAuthenticated,contentController.getnewHandicrafts)
contentRoute.get("/newAntique",userAuthent.isAuthenticated,contentController.getnewAntique)
contentRoute.get("/newSpices",userAuthent.isAuthenticated,contentController.getnewSpices)
contentRoute.get("/newApparels",userAuthent.isAuthenticated,contentController.getnewApparels)

contentRoute.get("/mostSold",userAuthent.isAuthenticated,contentController.getmostSold)
contentRoute.get("/lowtohigh",userAuthent.isAuthenticated,contentController.getLowtoHigh)
contentRoute.get("/hightolow",userAuthent.isAuthenticated,contentController.getHightoLow)
contentRoute.get("/ascending",userAuthent.isAuthenticated,contentController.getascending)
contentRoute.get("/descending",userAuthent.isAuthenticated,contentController.getdescending)


// contentRoute.get("/toycategory",userAuthent.isAuthenticated,contentController.gettoyCategory)
// contentRoute.get("/ecofriendly",userAuthent.isAuthenticated,contentController.getecoFriendly)
// contentRoute.get("/giftcategory",userAuthent.isAuthenticated,contentController.getgiftCategory)

contentRoute.get("/brassmaterial",userAuthent.isAuthenticated,contentController.getbrassMaterial)
contentRoute.get("/metalmaterial",userAuthent.isAuthenticated,contentController.getmetalMaterial)
contentRoute.get("/woodmaterial",userAuthent.isAuthenticated,contentController.getwoodMaterial)

// /*********price slider********** */
// contentRoute.get("/lowCost",userAuthent.isAuthenticated,contentController.getlowcost)
// contentRoute.get("/averageCost",userAuthent.isAuthenticated,contentController.getaverage)
// contentRoute.get("/costly",userAuthent.isAuthenticated,contentController.getcostly)
// contentRoute.get("/highcostly",userAuthent.isAuthenticated,contentController.gethighcostly)

/****************to cart table*********************/
contentRoute.post("/addtocart/:id/:mrp",contentController.addToCartTable)
contentRoute.post("/addCart/:cartid/:userid/:pdtid/:price",contentController.addQtyToCart)
contentRoute.post("/subCart/:cartid/:userid/:pdtid/:price",contentController.subQtyFromCart)
contentRoute.post("/deleteCart/:cartid/:userid/:pdtid",contentController.deleteFromCart)

/****************add address *********************/

contentRoute.post("/addAddress/:userid/:cartid/:amount",contentController.addNewAddress)
contentRoute.get("/loadeditAddress/:addressid/:cartid/:amount",userAuthent.isAuthenticated,contentController.loadEditAddress)
contentRoute.post("/editAddress/:userid/:cartid/:amount",contentController.changeAddress)

/*******set session for checkout**********/
contentRoute.post("/updateSelectedAddress",contentController.selectedAddress)
contentRoute.post("/updateSelectedMethod",contentController.selectedMethod)

/******************************/
contentRoute.post("/applyCoupon/:userid",contentController.couponApply)

/**********************make cod payment********************* */
contentRoute.post("/makeOrder",contentController.makeCODPayment)
contentRoute.get('/failedPayment',contentController.verifyFailedPayment)
contentRoute.post('/verifyPayment',contentController.verifyPayment)
contentRoute.get("/paymentSuccess",contentController.loadPaymentSuccess)


contentRoute.post('/continueFailedPayment',contentController.continuePaymentFailed)
contentRoute.post('/verifyPaymentFailed',contentController.verifyPaymentFailed)




/****************wishlist and save for later******************/

contentRoute.get("/addtowishlist/:id",contentController.addToWishlist)


module.exports = contentRoute;