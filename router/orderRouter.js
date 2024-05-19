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
orderRoute.get("/orderDetails/:orderid/:pdtid",orderController.viewOrderMore)

//admin action handling

orderRoute.post("/statusChanging/:odrid/:pdtid/:action",orderController.changeOrderStatus)
orderRoute.post("/orderPending/:odrid/:pdtid/:userid",orderController.OrderApproved)
orderRoute.post("/cancelapprove/:odrid/:pdtid",orderController.OrderCancelled)
orderRoute.post("/returnapprove/:odrid/:pdtid",orderController.OrderReturned)

//chart handling
orderRoute.get("/categorySale",orderController.pieChart)
orderRoute.get("/barChart",orderController.barChart)



/*****************user side order*********************/

orderRoute.get('/cancelPage/:odrid/:pdtid',userAuthent.isAuthenticated,orderController.loadCancelPage)
orderRoute.get('/returnPage/:odrid/:pdtid',userAuthent.isAuthenticated,orderController.loadReturnPage)

orderRoute.post("/getCancelReason",orderController.selectCancelReason)
orderRoute.post("/getReturnReason",orderController.selectReturnReason)

orderRoute.post("/cancelRequest/:odrid/:pdtid",orderController.cancelOrder)
orderRoute.post("/returnRequest/:odrid/:pdtid",orderController.returnOrder)



module.exports = orderRoute;