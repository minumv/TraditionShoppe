const express = require("express")
const moment = require('moment');
const User = require('../model/user')
const Product = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')
const Cart = require('../model/cart')
const Order = require('../model/order')
const Address = require('../model/address')
const mongoose = require('mongoose');


// const userAuthent = require('../middleware/userAuthent')


/****************load admin order page*******************/
    const loadOrder = async (req,res)=>{
        try{
           
            const orders = await Order.aggregate([
            {
                    $unwind: "$product_list"   
            },
            {
                $lookup:{
                    from:'products',
                    localField:'product_list.productId',
                    foreignField:'_id',
                    as:'productDetails'
                    
                }
            },
            {
                $unwind: {
                    path: "$productDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
           
            {
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'userDetails'
                    
                }
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup:{
                    from:'addresses',
                    localField:'address',
                    foreignField:'_id',
                    as:'addressDetails'
                    
                }
            },
            {
                $unwind: {
                    path: "$addressDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort : { 'created' : -1 }
            }
            ])  
            // console.log(orders)      
            
            res.render('admin/orderManage',{
                title: "Order Management | TraditionShoppe",
                page:"Orders",
                orders,                
                errorMessage:req.flash('errorMessage'),
                successMessage:req.flash('successMessage')
            })

        } catch(err){
            console.log(err.message);
        }
    }


    /****************view order details*******************/
    const viewOrderMore = async (req,res)=>{
        try{

            const orderid = new mongoose.Types.ObjectId(req.params.orderid)
            const pdtid = new mongoose.Types.ObjectId(req.params.pdtid)            
            const orders = await Order.aggregate([
                {
                        $match:{
                            $and : [
                                {_id:orderid},
                                {"product_list.productId":pdtid}
                            ]
                        }
                },
                {
                    $addFields: {
                        product: {
                            $filter: {
                                input: "$product_list",
                                as: "product",
                                cond: { $eq: ["$$product.productId", pdtid] }
                            }
                        }
                    }
                }, 
                {
                    $unwind: {
                        path: "$product",
                        preserveNullAndEmptyArrays: true
                    }
                }, 
                {
                    $lookup: {
                        from: "products",
                        localField: "product.productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$productDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },  
                        
                {
                    $lookup: {
                        from: "addresses", 
                        localField: "address", 
                        foreignField: "_id",
                        as: "addressDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$addressDetails",
                        preserveNullAndEmptyArrays: true
                    }
                } , 
                {
                    $lookup: {
                        from: "users", 
                        localField: "user", 
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$addressDetails",
                        preserveNullAndEmptyArrays: true
                    }
                }                 
            ])
             
                // console.log("orders",orders)
           
           
            res.render('admin/orderDetails',{
                title: "Order Management | TraditionShoppe",
                page:"View Order",
                orders,
                errorMessage:req.flash('errorMessage'),
                successMessage:req.flash('successMessage')
            })

        } catch(err){
            console.log(err.message);
        }
    }

    /************************chart details************************* */

    //fetch pie chart details

    const pieChart = async (req, res) => {
        const categoryWiseSale = await Order.aggregate([
          {
            $match: {
                "product_list.orderstatus": { $ne: "cancelled" },
            },
          },
          {
            $unwind: "$product_list",
          },
          {
            $lookup: {
              from: "products", // the foreign collection name
              localField: "product_list.productId", //the foreign collection id in our local collection
              foreignField: "_id", //foreign collection id
              as: "productInfo", //new field added
            },
          },
          {
            $unwind: "$productInfo",
          },
          {
            $lookup: {
              from: "categories", // the foreign collection name
              localField: "productInfo.category", //the foreign collection id in our local collection
              foreignField: "_id", //foreign collection id
              as: "categoryInfo", //new field added
            },
          },
          {
            $group: {
              _id: "$categoryInfo.category_name",
              purchaseCount: { $sum: "$product_list.quantity" },
            },
          },
        ]);

        console.log("category : ",categoryWiseSale)
      
        res.json({ categoryWiseSale });
      };
      
      // fetch barChart details


      const barChart = async (req, res) => {
        const { timeFrame } = req.query;
      
        try {
          let aggregationPipeline = [];
      
          // Match based on payment status
          aggregationPipeline.push({
            $match: {
              $or: [{ "product_list.orderstatus": "pending" }, { "product_list.orderstatus": "delivered" }],
            },
          });
      
          // Group by different time frames
          switch (timeFrame) {
            case "daily":
              aggregationPipeline.push({
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$order_date" } },
                  totalOrders: { $sum: 1 },
                },
              });
              break;
      
            case "weekly":
              aggregationPipeline.push({
                $group: {
                  _id: { $dateToString: { format: "%Y-%U", date: "$order_date" } },
                  totalOrders: { $sum: 1 },
                },
              });
              break;
      
            case "monthly":
              aggregationPipeline.push({
                $group: {
                  _id: { $dateToString: { format: "%Y-%m", date: "$order_date" } },
                  totalOrders: { $sum: 1 },
                },
              });
              break;
      
            case "yearly":
              aggregationPipeline.push({
                $group: {
                  _id: { $dateToString: { format: "%Y", date: "$order_date" } },
                  totalOrders: { $sum: 1 },
                },
              });
              break;
      
            default:
              res.status(400).json({ error: "Invalid time frame" });
              return;
          }
      
          // Project and sort
          aggregationPipeline.push(
            {
              $project: {
                _id: 0,
                timeFrame: "$_id",
                totalOrders: 1,
              },
            },
            {
              $sort: { timeFrame: 1 },
            }
          );
          
          console.log("Aggregation Pipeline:", aggregationPipeline);
          const result = await Order.aggregate(aggregationPipeline);
          console.log("result :",result)
      
          const salesData = {
            labels: result.map((entry) => entry.timeFrame),
            datasets: [
              {
                label: `${
                  timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)
                } Sales`,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1,
                data: result.map((entry) => entry.totalOrders),
              },
            ],
          };
      
          res.json(salesData);
        } catch (error) {
          console.error("Error fetching data:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      };
      
    

/**********************************************************************/

        /*   load cancel page */
const loadCancelPage = async(req,res)=>{
    try{
        const orderid = req.params.odrid
        const pdtid = req.params.pdtid
        const users = await User.find({_id:req.session.user}).exec()
        res.render('profile/cancelRequest',{
            title : 'Cancel order | TraditioShoppe',
            page: 'Cancel Order',
            orderid,
            pdtid,
            users,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            user:req.session.user,
            blocked:req.session.blocked,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })
    } 
    catch(err){
        console.log(err.message);
    }

}

/*   load return page */
const loadReturnPage = async(req,res)=>{
    try{
        const orderid = req.params.odrid
        const pdtid = req.params.pdtid
        console.log("odr id : ",orderid)
        const users = await User.find({_id:req.session.user}).exec()
        res.render('profile/returnRequest',{
            title : 'Return Product | TraditioShoppe',
            page: 'Product Return',
            orderid,
            pdtid,
            users,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            user:req.session.user,
            blocked:req.session.blocked,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }    
}

//select cancel reason

const selectCancelReason = async(req,res)=>{
    try{
        const cancel_reason = req.body.cancel_reason       
        req.session.cancelReason =  cancel_reason
        
        console.log( req.session.cancelReason); 
        res.status(200).send({success:true});   
    }
    catch(err){
        console.log(err.message);
    }
}

//select return reason

const selectReturnReason = async(req,res)=>{
    try{
        const return_reason = req.body.return_reason
        console.log("dropdwn",req.body.return_reason);
        req.session.returnReason =  return_reason
        console.log("dropdwn session : ",req.session.returnReason);
        console.log( req.session.returnReason); 
        res.status(200).send({success:true});   
    }
    catch(err){
        console.log(err.message);
    }
}


const cancelOrder = async (req,res)=>{
    try{
        console.log("cancel request");        
        const odrid = req.params.odrid
        const pdtid = req.params.pdtid
        const reason = req.session.cancelReason
        console.log("order id : ",odrid);
        console.log("cancel reason : ",odrid);
       
        const cancelled = await Order.updateOne(
            { _id: odrid,"product_list.productId":pdtid},
           { $set: { 
                "product_list.$[elem].orderstatus": "cancel request",
                "product_list.$[elem].cancel_reason": reason
            } } ,
            { arrayFilters: [{ "elem.productId": pdtid }] }  
        )
        console.log('successful');
        if(cancelled){
            req.flash("successMessage", "Cancel request send successfully...");
            res.status(200).send({success:true})
        } else {
            req.flash("errorMessage", "Cancel request failed...");
            res.status(400).send({success:false})
        }
      
    }
    catch(err){
        console.log(err.message);
    }
}




const returnOrder = async (req,res)=>{
    try{
        
        const odrid = new mongoose.Types.ObjectId(req.params.odrid)
        const pdtid = new mongoose.Types.ObjectId(req.params.pdtid)
        // console.log("id :", odrid, pdtid)
        const reason = req.session.returnReason
        const orderData = await Order.findOne({_id:odrid,"product_list.productId":pdtid},{ "product_list.$": 1 }).exec()  
        console.log("orderData :",orderData)    
        if(orderData.product_list[0].return_date >= new Date()){
            console.log("request")
            const returned = await Order.updateOne(
                { _id: odrid, "product_list.productId":pdtid },
               { $set: { 
                "product_list.$[elem].orderstatus": "return request",
                "product_list.$[elem].return_reason": reason,
                "product_list.$[elem].returned_date ": new Date()               
                } } ,
                { arrayFilters: [{ "elem.productId": pdtid }] }  
            )
            console.log('return request successful',returned);
            if( returned ){
                req.flash("successMessage", "Return request send successfully...");
            res.status(200).send({success:true})
            } else {
                req.flash("errorMessage", "Return request Failed...");
                res.status(400).send({success:false})
            }
        } else {
            req.flash("errorMessage", "You cannot return this product, the days exceeds !!");
            res.status(400).send({success:false})
        }

        
        
    }
    catch(err){
        console.log(err.message);
    }
}


/************admin action handle****************/


const changeOrderStatus= async(req,res)=>{
    try{
        console.log("change status @",req.params.odrid)
        const odrid = req.params.odrid
        const pdtid = req.params.pdtid
        let action = req.params.action
        let orderstat = ''        
        switch (action) {
            case 'to pack':
                orderstat = 'packed';
                break;
            case 'to dispatch':
                orderstat = 'dispatched';
                break;
            case 'to ship':
                orderstat = 'shipped';
                break;
            case 'approve':
                orderstat = 'processing';
                break;
            default:
                break;
        }
        console.log("orderstatus :", orderstat , action)
        const order = await Order.findOne({_id:odrid,"product_list.productId":pdtid}, { "product_list.$": 1 }).exec()
        console.log("order detail :",order)
        const changeStat = await Order.updateOne(
            {_id:odrid,"product_list.productId":pdtid},           
            { $set : { "product_list.$[elem].orderstatus" : orderstat } },
            { arrayFilters: [{ "elem.productId": pdtid }] }
        )
        console.log("changed? :",changeStat)
        console.log("status changed successfully")
        if(changeStat){
            req.flash("successMessage", "Process completed..");
            res.json({success:true})
        } else {
            req.flash("successMessage", "Process failed !!");
            res.json({success:false})
        }
       
    }
    catch(err){
        console.log(err.message);
    }
}
const OrderApproved = async (req,res)=>{
    try{
        const odrid = req.params.odrid
        const pdtid = req.params.pdtid
        const userid = req.params.userid
       
        
        const order = await Order.findOne({_id:odrid,"product_list.productId":pdtid}, { "product_list.$": 1 }).exec()
        // order.product_list.forEach((odr)=>{
        //     qty = odr.quantity
        // })
        console.log("order det :",order)
        let qty = order.product_list[0].quantity
        console.log("qty :",qty);
        const products = await Product.findOne({_id:pdtid})
        let changeStock = 0
        console.log("stock",products.stock)
        if(products){
            changeStock = products.stock - parseFloat(qty) 
            console.log("stock : "+changeStock + typeof (changeStock) );
        }
       
        const currentDate = new Date();
        const returnDate = new Date(currentDate.setDate(currentDate.getDate() + 14));
        console.log ("return date :",returnDate)


        const orderStat = await Order.updateOne(
            { _id: odrid,"product_list.productId":pdtid},
           { $set: { 
                "product_list.$[elem].orderstatus":"delivered",
                "product_list.$[elem].paymentstatus":"completed",               
                "product_list.$[elem].delivered_date":new Date(),
                "product_list.$[elem].return_date": returnDate
                // update delivery date
            } },
            { arrayFilters: [{ "elem.productId": pdtid }] } )

            console.log("order status ?",orderStat)
        
        const cartStat = await Cart.updateOne(
            { user: userid , status:"pending" },
            {$set:
                {
                    status:"purchased"
                }})
            console.log("cart status ?",cartStat)
         const prodStat = await Product.updateOne(
            { _id: pdtid },
            {$set:
                {
                    stock:changeStock
                }})  
            console.log("product status ?",prodStat)

        if(orderStat && cartStat && prodStat ){
            req.flash("successMessage", "Process completed...");
            res.json({success:true})
        } else {
            req.flash("successMessage", "Process failed !!");
            res.json({success:false})
        }  

            
    }
    catch(err){
        console.log(err.message);
    }
}

const OrderReturned = async (req,res)=>{
    try{
       
        const odrid = req.params.odrid 
        const pdtid = req.params.pdtid     
        const orders = await Order.findOne({_id:odrid,"product_list.productId":pdtid},{ "product_list.$": 1,payment:1 }).populate('user').exec()       
        console.log("orders",orders)

       
        let qty = 0
        let total = 0
        orders.product_list.forEach((odr)=>{
            
            qty = odr.quantity
            total = odr.total
        })
        console.log("qty :",qty,"total :",total)
        const products = await Product.findOne({_id:pdtid}).exec()
        let newStock = products.stock + qty
        console.log("new stock :",newStock, "stock :",products.stock , "qty :",qty)

           const orderStat = await Order.updateOne(
                { _id: odrid,"product_list.productId":pdtid},              
                { $set: {     
                    "product_list.$[elem].orderstatus": "refund received",                    
                   "product_list.$[elem].paymentstatus":"refund granted"
                } },
                { arrayFilters: [{ "elem.productId": pdtid }] } ) 
             
            products.stock = newStock
            products.save()
            //add wallet to user collection
            console.log('order returned, amount adding to wallet')
            console.log('user wallet',orders.user.wallet)
            if(orders.user.wallet != null  || orders.user.wallet !== 0){
                let amount = orders.user.wallet + total
                console.log("wallet :",orders.user.wallet,"amount :",amount,'adding amount :',total)
                await User.updateOne(
                    {_id:orders.user._id},
                    { $set :{
                        wallet : amount
                    }}
                )
            } else {
                await User.updateOne(
                    {_id:orders.user._id},
                    { $set :{
                        wallet : total
                    }}
                )
            }

            if(orderStat && products){
                req.flash("successMessage", "Process completed..");
                res.json({success:true})
            } else {
                req.flash("successMessage", "Process failed !!");
                res.json({success:false})
            }  
            
    }
    catch(err){
        console.log(err.message);
    }
}

/*   load buylist */
    const OrderCancelled = async (req,res)=>{
        try{
            const pdtid = req.params.pdtid
            const odrid = req.params.odrid
             
            console.log('id :',pdtid,odrid)
           
            const orders = await Order.findOne({_id:odrid,"product_list.productId":pdtid}, { "product_list.$": 1,payment:1 }).populate('user').exec() 
            
            console.log('orderdata :',orders)
                let total = 0
                orders.product_list.forEach((odr)=>{
                    total = odr.total
                })
                
               
                const orderStat = await Order.updateOne(
                    { _id: odrid ,"product_list.productId":pdtid },              
                    { $set: {     
                        "product_list.$[elem].orderstatus": "cancelled" ,
                        "product_list.$[elem].cancelled_date": new Date(),
                        "product_list.$[elem].paymentstatus":'cancelled',                           
                    } },
                    { arrayFilters: [{ "elem.productId": pdtid }] }   
                )
                //update wallet(Add paymentamount) based on payment method
                console.log('order cancelled, adding to wallet')
                console.log('user wallet',orders.user.wallet)
                console.log(orders.payment)
                if(orders.payment === 'Razorpay' || orders.payment === 'Wallet'){
                    if(orders.user.wallet != null  || orders.user.wallet !== 0){
                       
                        let amount = orders.user.wallet + total
                        console.log('amount,total',amount,total)
                        await User.updateOne(
                            {_id:orders.user._id},
                            { $set :{
                                wallet : amount
                            }}
                        )
                        console.log('added to wallet amt');
                    } else {
                        await User.updateOne(
                            {_id:orders.user._id},
                            { $set :{
                                wallet : total
                            }}
                        )
                        console.log('added to empty wallet')
                    }
                }
            
                if(orderStat){
                    req.flash("successMessage", "Process completed..");
                    res.json({success:true})
                } else {
                    req.flash("successMessage", "Process failed !!");
                    res.json({success:false})
                } 
        }
        catch(err){
            console.log(err.message);
        }
    }



    module.exports = {
        loadOrder,
        viewOrderMore,

        pieChart,
        barChart,

        OrderApproved,

        loadCancelPage,
        loadReturnPage,

        selectCancelReason,
        selectReturnReason,

        changeOrderStatus,

        cancelOrder,
        returnOrder,
        OrderCancelled,
        OrderReturned,


    }