const express = require("express")
const orderRoute = express()
const orderController = require('../controller/orderController')
const userAuthent = require('../middleware/userAuthent')



orderRoute.set('view engine','ejs')

const bodyParser = require('body-parser')
orderRoute.use(bodyParser.json())
orderRoute.use(bodyParser.urlencoded({extended:true}))


/*********price slider********** */
orderRoute.get("/orderManage",orderController.loadOrder)
orderRoute.get("/orderDetails/:orderid",orderController.viewOrderMore)




module.exports = orderRoute;