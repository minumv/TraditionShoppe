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


/****************load order page*******************/
    const loadOrder = async (req,res)=>{
        try{
           // console.log("controller");
            // const orders = await Order.find().sort({'created':-1}).exec() 
            // const cart =await Cart.find().exec()
            // const users = await User.find({status : {$nin:["deleted","blocked"]}}).exec()
            // const products = await Product.find({isListing:true}).exec()

            const orders = await Order.aggregate([
            
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
                $sort : { 'created' : -1 }
            }
            ])
          

            const address = await Address.find().exec()
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

            const orderid = req.params.orderid
            //console.log(orderid);
            const orders = await Order.find({_id:orderid}).exec() 
           // console.log(orders.user);
            const users = await User.find({status : {$nin:["deleted","blocked"]}}).exec()
           // console.log(users);
            const cart  = await Cart.find().exec()
            console.log(cart);
            const discount = await Discount.find({status:true}).exec()

           // const productIds = cart.product_list.map(item => item.productId);
            
            const products = await Product.find({ isListing:true }).exec()
            const address = await Address.find().exec()
            res.render('admin/orderDetails',{
                title: "Order Management | TraditionShoppe",
                page:"View Order",
                orders:orders,
                users:users,
                products:products,
                address:address,
                cart:cart,
                discount:discount,
                errorMessage:req.flash('errorMessage'),
                successMessage:req.flash('successMessage')
            })

        } catch(err){
            console.log(err.message);
        }
    }

    
    



        /*   load cancel page */
const loadCancelPage = async(req,res)=>{
    try{
        const orderid = req.params.odrid
        const users = await User.find({email:req.session.user}).exec()
        res.render('profile/cancelRequest',{
            title : 'Cancel order | TraditioShoppe',
            page: 'Cancel Order',
            orderid,
            users,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            user:req.session.user,
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
        console.log("odr id : ",orderid)
        const users = await User.find({email:req.session.user}).exec()
        res.render('profile/returnRequest',{
            title : 'Return Product | TraditioShoppe',
            page: 'Product Return',
            orderid,
            users,
            qtyCount:req.session.qtyCount,
            listCount:req.session.listCount,
            user:req.session.user,
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
        // console.log("dropdwn",req.body);
        // const offertypeobject = req.body.offer_type;
        // console.log("offer",req.body.offer_type);
        // console.log("offer", offertypeobject);
        // Store dropdown values in session
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
        const reason = req.session.cancelReason
        console.log("order id : ",odrid);
        console.log("cancel reason : ",odrid);
       
        const cancelled = await Order.updateOne(
            { _id: odrid },
           { $set: { 
                orderstatus: "cancel request",
                cancel_reason: reason
            } } 
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
        
        const odrid = req.params.odrid  
        const reason = req.session.returnReason
        const orderData = await Order.findById(odrid).exec()      
        if(orderData.return_date >= new Date()){
            const returned = await Order.updateOne(
                { _id: odrid },
               { $set: { 
                    orderstatus: "return request",
                    return_reason: reason,
                    returned_date : new Date()               
                } } 
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

const selectAdminAction = async(req,res)=>{
    try{
        const adminaction = req.body.adminaction
        console.log("dropdwn",req.body.adminaction);
        req.session.adminaction =  adminaction
        console.log("dropdwn session : ",req.session.adminaction);
        console.log( req.session.adminaction); 
        res.status(200).send({success:true});   
    }
    catch(err){
        console.log(err.message);
    }
}


const applyAdminAction = async(req,res)=>{
    try{
        const pdtid = req.params.pdtid
        const odrid = req.params.odrid
        const userid = req.params.userid
        //const cartid = req.params.cartid
        const qty = req.params.qty
        let result = false
        let action = req.session.adminaction
        console.log("action :",action)

        if(action === 'complete'){
             result = await OrderApproved(req,res,pdtid,odrid,userid,qty)
        } else if(action === 'to pack'){
             result = await changeOrderStatus(req,res,odrid,action)
        } else if(action === 'to dispatch'){
            result = await changeOrderStatus(req,res,odrid,action)
        } else if(action === 'to ship'){
            result = await changeOrderStatus(req,res,odrid,action)
        } else if(action === 'approve cancel'){
            result = await OrderCancelled(req,res,odrid)
        } else if(action === 'approve'){
            result = await changeOrderStatus(req,res,odrid,action)
        } else if(action === 'approve return'){
            result = await OrderReturned(req,res,odrid)
        }

        if( result ){
            req.flash("successMessage", "Process successfull...");
            res.status(200).send({success:true})
        } else {
            req.flash("errorMessage", "Process Failed !!");
            res.status(400).send({success:false})
        }
    }
    catch(err){
        console.log(err.message);
    }
}

const changeOrderStatus= async(req,res)=>{
    try{
        console.log("change status @",req.params.odrid)
        const odrid = req.params.odrid
        let action = req.params.action
        let orderstat = ''
        if( action === 'to pack'){
            orderstat = 'packed'
        } else if( action === 'to dispatch'){
            orderstat = 'dispatched'
        } else if( action === 'to ship'){
            orderstat = 'shipped'
        } else if( action === 'approve'){
            orderstat = 'processing'
        }
        console.log("orderstatus :", orderstat , action)
        const changeStat = await Order.updateOne(
            {_id:odrid},
            { $set : {
                orderstatus : orderstat
            }}
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
        // console.log("order id :",odrid)
        // console.log("order id :",odrid)
        let qty = 0
        const order = await Order.findOne({_id:odrid}).exec()
        order.product_list.forEach((odr)=>{
            qty = odr.quantity
        })
        console.log("order det :",order)

        const products = await Product.findOne({_id:pdtid})
        let changeStock = 0
        if(products){
            // console.log("stock : "+products[0].stock );
            // console.log("qty : "+qty+ typeof (qty) );
            changeStock = products.stock - parseFloat(qty) 
            console.log("stock : "+changeStock + typeof (changeStock) );
        }
        console.log("ordrid: " + odrid);
        console.log("usrrid: " + userid);

        const currentDate = new Date();
        const returnDate = new Date(currentDate.setDate(currentDate.getDate() + 14));
        console.log ("return date :",returnDate)


        const orderStat = await Order.updateOne(
            { _id: odrid },
           { $set: { 
                orderstatus:"delivered",
                paymentstatus:"completed",
                adminaction:"delivered",
                delivered_date:new Date(),
                return_date: returnDate
                // update delivery date
            } } )

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
        // const pdtid = req.params.pdtid
        const odrid = req.params.odrid
        // const userid = req.params.userid
        // const qty = req.params.qty
        // const total = req.params.total

        
                
         const orders = await Order.findOne({_id:odrid}).populate('user').exec()       
        //console.log("orders",orders)

        let pdtid = ''
        let qty = 0
        orders.product_list.forEach((odr)=>{
            pdtid = odr.productId
            qty = odr.quantity
        })

        const products = await Product.findOne({_id:pdtid}).exec()
        let newStock = products.stock + qty
        console.log("new stock :",newStock, "stock :",products.stock , "qty :",qty)

        // if(orders.product_list.length>1){
        //     await Order.updateOne(
        //         { _id: odrid },
        //         { $pull: { product_list:  pdtid  }},
        //         { $set: { 
        //             payment_amount : payment_amount - total,
        //             status: "cancelled"                
        //         } } 
        //     )
        // }
        // else {
           const orderStat = await Order.updateOne(
                { _id: odrid },              
                { $set: {     
                    orderstatus: "refund received",
                    adminaction:"approve return",
                    paymentstatus:"refund granted"
                } } 
            )
            const prodStat = await Product.updateOne(
                { _id:pdtid },
                { $set : {
                    stock : newStock
                }}
            )
            //add wallet to user collection
            if(orders.user.wallet != null){
                let amount = orders.user.wallet + orders.payment_amount
                console.log("wallet :",orders.user.wallet,"amount :",amount)
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
                        wallet : orders.payment_amount
                    }}
                )
            }

            if(orderStat && prodStat){
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
            // const pdtid = req.params.pdtid
            const odrid = req.params.odrid
            // const userid = req.params.userid
            // const qty = req.params.qty
            // const total = req.params.total
            
           
            const orders = await Order.findOne({_id:odrid}).populate('user').exec()       
           
                const orderStat = await Order.updateOne(
                    { _id: odrid },              
                    { $set: {     
                        orderstatus: "cancelled" ,
                        cancelled_date: new Date(),
                        paymentstatus:'cancelled',
                        adminaction :'approve cancel'           
                    } } 
                )
                //update wallet(Add paymentamount) based on payment method
                if(orders.payment === 'Razorpay'){
                    if(orders.user.wallet != null){
                        let amount = orders.user.wallet + orders.payment_amount
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
                                wallet : orders.payment_amount
                            }}
                        )
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

        OrderApproved,

        loadCancelPage,
        loadReturnPage,

        selectCancelReason,
        selectReturnReason,

        selectAdminAction,
        applyAdminAction,

        changeOrderStatus,

        cancelOrder,
        returnOrder,
        OrderCancelled,
        OrderReturned,


    }