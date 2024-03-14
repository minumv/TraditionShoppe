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
// adminRoute.get("/admin/coupon",adminController.loadCoupon) 
// adminRoute.get("/admin/banner",adminController.loadBanner)  
// adminRoute.get("/admin/salesreport",adminController.loadSales) 
// adminRoute.get("/admin/settings",adminController.loadSettings) 
// adminRoute.get("/admin/logout",adminController.logOut) 





module.exports = adminRoute