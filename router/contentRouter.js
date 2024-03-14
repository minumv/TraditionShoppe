const express = require("express")
const contentRoute = express()
const contentController = require('../controller/contentController')
const userAuthent = require('../middleware/userAuthent')



contentRoute.set('view engine','ejs')

const bodyParser = require('body-parser')
contentRoute.use(bodyParser.json())
contentRoute.use(bodyParser.urlencoded({extended:true}))



/*************navigation****************/
contentRoute.get("/cart",userAuthent.isAuthenticated,contentController.loadCart)
contentRoute.get("/checkout",userAuthent.isAuthenticated,contentController.loadCheckout)
contentRoute.get("/wishlist",userAuthent.isAuthenticated,contentController.loadWishlist)
contentRoute.get("/saveforlater",userAuthent.isAuthenticated,contentController.loadSaved)
contentRoute.get("/allproducts",userAuthent.isAuthenticated,contentController.loadAllProducts)
contentRoute.get("/viewProduct/:id",userAuthent.isAuthenticated,contentController.loadProductDetail)
// userRoute.get("/handicratfs",userController.loadHandicrafts)
// userRoute.get("/decor",userController.loadDecor)
// userRoute.get("/spices",userController.loadSpices)
// userRoute.get("/apparels",userController.loadApparels)
// userRoute.get("/sellers",userController.loadSellerProducts)
// userRoute.get("/popular",userController.loadPopular)


/****************All products handling************* */

contentRoute.get("/newHandicrafts",userAuthent.isAuthenticated,contentController.getnewHandicrafts)


/****************to cart table*********************/
contentRoute.get("/addtocart/:id",contentController.addToCartTable)
contentRoute.get("/addtowishlist/:id",contentController.addToWishlist)
contentRoute.get("/addtosave/:id",contentController.addToSave)

module.exports = contentRoute;