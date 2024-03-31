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


orderRoute.post("/orderPending/:pdtid/:odrid/:userid/:qty",orderController.OrderApproved)

orderRoute.post("/cancelRequest/:odrid",orderController.cancelOrder)
orderRoute.post("/returnRequest/:odrid",orderController.returnOrder)

orderRoute.post("/cancelapprove/:odrid",orderController.OrderCancelled)
orderRoute.post("/returnapprove/:odrid",orderController.OrderReturned)





module.exports = orderRoute;