const express = require("express")
const adminRoute = express()
const bodyParser = require('body-parser')

const adminController = require('../controller/adminController')
// const userAuthent = require('../middleware/userAuthent')



adminRoute.set('view engine','ejs')

adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({extended:true}))

adminRoute.use(express.static('public'));

/*****************Routing Customer page****************** */

adminRoute.get("/admin/login",/*userAuthent.isAuthenticated */adminController.loadAdminLogin)
adminRoute.get("/admin/dashboard",adminController.loadAdminHome)
adminRoute.get("/admin/customers",/*userAuthent.isAuthenticated,*/adminController.loadCustomer)
adminRoute.get("/admin/customer/update/:id",adminController.loadCustomerEdit)

adminRoute.post("/admin/login",adminController.verifyAdminLogin)
adminRoute.post("/verify/:id",adminController.verifyCustomer)
adminRoute.post("/block/:id",adminController.blockCustomer)
adminRoute.post("/unblock/:id",adminController.unBlockCustomer)
adminRoute.post("/delete/:id",adminController.deleteCustomer)



// adminRoute.get("/admin/orders",adminController.loadOrders) 

/****************add coupon *********************/
adminRoute.get("/getCoupon",adminController.loadCouponPage) 
adminRoute.get("/newCoupon",adminController.addCoupon) 
adminRoute.post("/newCoupon",adminController.addCouponDetails)
adminRoute.get("/getUpdate/:id",adminController.getUpdatePage) 
adminRoute.post("/updateCoupon/:id",adminController.updateCouponDetails)
adminRoute.post("/deleteCoupon/:id",adminController.deleteCouponDetails)

/****************add offer *********************/

adminRoute.get("/getOffer",adminController.loadOfferPage) 
adminRoute.get("/newOffer",adminController.addOffer)
// adminRoute.post("/getOfferType",adminController.storeOfferType) 
adminRoute.post("/newOffer",adminController.addOfferDetails)
adminRoute.get("/getUpdateOffer/:id",adminController.getUpdateOfferPage)
// adminRoute.post("/updateOfferType",adminController.changeOfferType) 
adminRoute.post("/updateOffer/:id",adminController.updateOfferDetails)
adminRoute.post("/deleteOffer/:id",adminController.deleteOfferDetails)

adminRoute.get("/getNames/:type",adminController.addNames)



/****************sales report*********************/
adminRoute.post("/getdate",adminController.storeFromdate)
adminRoute.get("/gettodate",adminController.storeTodate)
adminRoute.get("/salesreport",adminController.loadSalesReport) 



// adminRoute.get("/admin/banner",adminController.loadBanner)  
// adminRoute.get("/admin/salesreport",adminController.loadSales) 
// adminRoute.get("/admin/settings",adminController.loadSettings) 
// adminRoute.get("/admin/logout",adminController.logOut) 





module.exports = adminRoute