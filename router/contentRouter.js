const express = require("express")
const contentRoute = express()
const contentController = require('../controller/contentController')
const userAuthent = require('../middleware/userAuthent')



contentRoute.set('view engine','ejs')

const bodyParser = require('body-parser')
contentRoute.use(bodyParser.json())
contentRoute.use(bodyParser.urlencoded({extended:true}))



/*************navigation****************/
contentRoute.get("/cart",contentController.loadCart)
contentRoute.get("/checkout",contentController.loadCheckout)
contentRoute.get("/wishlist",contentController.loadWishlist)
contentRoute.get("/saveforlater",contentController.loadSaved)
contentRoute.get("/allproducts",contentController.loadAllProducts)
contentRoute.get("/viewProduct/:id",contentController.loadProductDetail)
// userRoute.get("/handicratfs",userController.loadHandicrafts)
// userRoute.get("/decor",userController.loadDecor)
// userRoute.get("/spices",userController.loadSpices)
// userRoute.get("/apparels",userController.loadApparels)
// userRoute.get("/sellers",userController.loadSellerProducts)
// userRoute.get("/popular",userController.loadPopular)


/****************All products handling************* */

contentRoute.get("/newHandicrafts",contentController.getnewHandicrafts)
contentRoute.get("/newAntique",contentController.getnewAntique)
contentRoute.get("/newSpices",contentController.getnewSpices)
contentRoute.get("/newApparels",contentController.getnewApparels)

contentRoute.get("/mostSold",contentController.getmostSold)
contentRoute.get("/lowtohigh",contentController.getLowtoHigh)
contentRoute.get("/hightolow",contentController.getHightoLow)

contentRoute.get("/toycategory",contentController.gettoyCategory)
contentRoute.get("/ecofriendly",contentController.getecoFriendly)
contentRoute.get("/giftcategory",contentController.getgiftCategory)

contentRoute.get("/brassmaterial",contentController.getbrassMaterial)
contentRoute.get("/metalmaterial",contentController.getmetalMaterial)
contentRoute.get("/woodmaterial",contentController.getwoodMaterial)

/*********price slider********** */
contentRoute.get("/pricerange",contentController.getpriceRange)
contentRoute.post("/setpricerange",contentController.setpriceRange)


/****************to cart table*********************/
contentRoute.get("/addtocart/:id",contentController.addToCartTable)
contentRoute.get("/addtowishlist/:id",contentController.addToWishlist)
contentRoute.get("/addtosave/:id",contentController.addToSave)

module.exports = contentRoute;