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
contentRoute.get("/checkout/:userid/:amount",userAuthent.isAuthenticated,contentController.loadCheckout)
contentRoute.get("/wishlist",userAuthent.isAuthenticated,contentController.loadWishlist)
contentRoute.get("/saveforlater",userAuthent.isAuthenticated,contentController.loadSaved)
contentRoute.get("/allproducts",userAuthent.isAuthenticated,contentController.loadAllProducts)
contentRoute.get("/searchProducts",userAuthent.isAuthenticated,contentController.loadSearchProducts)
contentRoute.get("/viewProduct/:id",userAuthent.isAuthenticated,contentController.loadProductDetail)
// userRoute.get("/handicratfs",userController.loadHandicrafts)
// userRoute.get("/decor",userController.loadDecor)
// userRoute.get("/spices",userController.loadSpices)
// userRoute.get("/apparels",userController.loadApparels)
// userRoute.get("/sellers",userController.loadSellerProducts)
// userRoute.get("/popular",userController.loadPopular)


/****************All products handling************* */

contentRoute.get("/newHandicrafts",userAuthent.isAuthenticated,contentController.getnewHandicrafts)
contentRoute.get("/newAntique",userAuthent.isAuthenticated,contentController.getnewAntique)
contentRoute.get("/newSpices",userAuthent.isAuthenticated,contentController.getnewSpices)
contentRoute.get("/newApparels",userAuthent.isAuthenticated,contentController.getnewApparels)

contentRoute.get("/mostSold",userAuthent.isAuthenticated,contentController.getmostSold)
contentRoute.get("/lowtohigh",userAuthent.isAuthenticated,contentController.getLowtoHigh)
contentRoute.get("/hightolow",userAuthent.isAuthenticated,contentController.getHightoLow)

contentRoute.get("/toycategory",userAuthent.isAuthenticated,contentController.gettoyCategory)
contentRoute.get("/ecofriendly",userAuthent.isAuthenticated,contentController.getecoFriendly)
contentRoute.get("/giftcategory",userAuthent.isAuthenticated,contentController.getgiftCategory)

contentRoute.get("/brassmaterial",userAuthent.isAuthenticated,contentController.getbrassMaterial)
contentRoute.get("/metalmaterial",userAuthent.isAuthenticated,contentController.getmetalMaterial)
contentRoute.get("/woodmaterial",userAuthent.isAuthenticated,contentController.getwoodMaterial)

/*********price slider********** */
contentRoute.get("/pricerange",contentController.getpriceRange)
contentRoute.post("/setpricerange",contentController.setpriceRange)


/****************to cart table*********************/
contentRoute.get("/addtocart/:id/:mrp",contentController.addToCartTable)
contentRoute.get("/addCart/:userid/:pdtid/:price",contentController.addQtyToCart)
contentRoute.get("/subCart/:userid/:pdtid/:price",contentController.subQtyFromCart)
contentRoute.get("/deleteCart/:userid/:pdtid",contentController.deleteFromCart)

/****************add address *********************/
contentRoute.post ("/getStateCountry",contentController.storeStateCountry)
contentRoute.post("/addAddress/:userid/:amt",contentController.addNewAddress)
contentRoute.get("/loadeditAddress/:addressid/:amt",userAuthent.isAuthenticated,contentController.loadEditAddress)
contentRoute.post ("/editStateCountry",contentController.changeStateCountry)
contentRoute.post("/editAddress/:userid/:amt",contentController.changeAddress)

/*******set session for checkout**********/
contentRoute.post("/updateSelectedAddress",contentController.selectedAddress)
contentRoute.post("/updateSelectedMethod",contentController.selectedMethod)

/**********************make cod payment********************* */
contentRoute.post("/makeOrder/:userid/:amount/:list/:defAddr/:defPay",contentController.makeCODPayment)

/****************wishlist and save for later******************/

contentRoute.get("/addtowishlist/:id",contentController.addToWishlist)
contentRoute.get("/addtosave/:id",contentController.addToSave)

module.exports = contentRoute;