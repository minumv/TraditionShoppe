const express = require("express")
const orderRoute = express()
const orderController = require('../controller/orderController')
const userAuthent = require('../middleware/userAuthent')



orderRoute.set('view engine','ejs')

const bodyParser = require('body-parser')
orderRoute.use(bodyParser.json())
orderRoute.use(bodyParser.urlencoded({extended:true}))


/*********admin order********** */

orderRoute.get("/orderManage",orderController.loadOrder)
orderRoute.get("/orderDetails/:orderid",orderController.viewOrderMore)

//admin action handling

orderRoute.post("/getAdminAction",orderController.selectAdminAction)
orderRoute.post("/statusChanging/:odrid/:action",orderController.changeOrderStatus)

orderRoute.post("/orderPending/:odrid/:pdtid/:userid",orderController.OrderApproved)

orderRoute.post("/cancelapprove/:odrid",orderController.OrderCancelled)
orderRoute.post("/returnapprove/:odrid",orderController.OrderReturned)



/*****************user side order*********************/

orderRoute.get('/cancelPage/:odrid',userAuthent.isAuthenticated,orderController.loadCancelPage)
orderRoute.get('/returnPage/:odrid',userAuthent.isAuthenticated,orderController.loadReturnPage)

orderRoute.post("/getCancelReason",orderController.selectCancelReason)
orderRoute.post("/getReturnReason",orderController.selectReturnReason)

orderRoute.post("/cancelRequest/:odrid",orderController.cancelOrder)
orderRoute.post("/returnRequest/:odrid",orderController.returnOrder)



module.exports = orderRoute;