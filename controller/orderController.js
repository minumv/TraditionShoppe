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


// const userAuthent = require('../middleware/userAuthent')


/****************load order page*******************/
    const loadOrder = async (req,res)=>{
        try{
            console.log("controller");
            const orders = await Order.find().exec() 
            const cart =await Cart.find().exec()
            const users = await User.find({status : {$nin:["deleted","blocked"]}}).exec()
            const products = await Product.find({isListing:true}).exec()
            const address = await Address.find().exec()
            res.render('admin/orderManage',{
                title: "Order Management | TraditionShoppe",
                page:"Orders",
                orders:orders,
                users:users,
                products:products,
                address:address,
                cart:cart,
                errorMessage:req.flash('errorMessage'),
                successMessage:req.flash('successMessage')
            })

        } catch(err){
            console.log(err.message);
        }
    }


    /****************viw order details*******************/
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

    const OrderApproved = async (req,res)=>{
        try{
            const pdtid = req.params.pdtid
            const odrid = req.params.odrid
            const userid = req.params.userid
            //const cartid = req.params.cartid
            const qty = req.params.qty
           
            // const email = req.session.user
            // const users = await User.find({email:email}).exec()        
            // const orders = await Order.find({_id:odrid}).exec()       
            // const cart  = await Cart.find().exec()       
            const products = await Product.find({ _id:pdtid}).exec()
            // const address = await Address.find().exec()
           
            let changeStock = 0
            if(products){
                // console.log("stock : "+products[0].stock );
                // console.log("qty : "+qty+ typeof (qty) );
                changeStock = products[0].stock - parseFloat(qty) 
                console.log("stock : "+changeStock + typeof (changeStock) );
            }
            console.log("ordrid: " + odrid);
            console.log("usrrid: " + userid);

            await Order.updateOne(
                { _id: odrid },
               { $set: { 
                    status:"delivered",
                    action:"delivered",
                    // update delivery date
                } } )
            
            await Cart.updateOne(
                { user: userid },{$set:{status:"purchased"}})

             await Product. updateOne(
                { _id: pdtid },{$set:{stock:changeStock}})  

            console.log('successful');
            req.flash("successMessage", "Order delivered...");
            res.redirect('/orderManage')
        }
        catch(err){
            console.log(err.message);
        }
    }
    



        /*   load orderlist */
const cancelOrder = async (req,res)=>{
    try{
        console.log("cancel request");
        const pdtid = req.params.pdtid
        const odrid = req.params.odrid
        const userid = req.params.userid
        const qty = req.params.qty
        const total = req.params.total
        console.log("cancel request"+odrid);
        // const email = req.session.user
        // const users = await User.find({email:email}).exec()        
        // const orders = await Order.find({_id:odrid}).exec()       
        // const cart  = await Cart.find().exec()       
        // const products = await Products.find({ isListing:true }).exec()
        // const address = await Address.find().exec()

        await Order.updateOne(
            { _id: odrid },
           { $set: { 
                status: "cancel request",
                action:"order cancelled"
            } } 
        )
        console.log('successful');
        req.flash("successMessage", "cancel request send successfully...");
        res.redirect('/getOrder')
    }
    catch(err){
        console.log(err.message);
    }
}




const returnOrder = async (req,res)=>{
    try{
        const pdtid = req.params.pdtid
        const odrid = req.params.odrid
        const userid = req.params.userid
        const qty = req.params.qty
        const total = req.params.total

        // const email = req.session.user
        // const users = await User.find({email:email}).exec()        
        // const orders = await Order.find({_id:odrid}).exec()       
        // const cart  = await Cart.find().exec()       
        // const products = await Products.find({ isListing:true }).exec()
        // const address = await Address.find().exec()

        await Order.updateOne(
            { _id: odrid },
           { $set: { 
                status: "return request",
                action:"approve return"
            } } 
        )
        console.log('successful');
        req.flash("successMessage", "return request send successfully...");
        res.redirect('/getOrder')
    }
    catch(err){
        console.log(err.message);
    }
}


const OrderReturned = async (req,res)=>{
    try{
        const pdtid = req.params.pdtid
        const odrid = req.params.odrid
        const userid = req.params.userid
        const qty = req.params.qty
        const total = req.params.total

        // const email = req.session.user
        // const users = await User.find({email:email}).exec()        
         const orders = await Order.find({_id:odrid}).exec()       
        // const cart  = await Cart.find().exec()       
        // const products = await Products.find({ isListing:true }).exec()
        // const address = await Address.find().exec()



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
            await Order.updateOne(
                { _id: odrid },              
                { $set: {     
                    status: "refund received",
                    action:"refund granted"
                } } 
            )
        
       
        console.log('successful');
        req.flash("successMessage", "Refund granted  successfully...");
        res.redirect('/orderManage')
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
            const userid = req.params.userid
            const qty = req.params.qty
            const total = req.params.total
    
            // const email = req.session.user
            // const users = await User.find({email:email}).exec()        
             const orders = await Order.find({_id:odrid}).exec()       
            // const cart  = await Cart.find().exec()       
            // const products = await Products.find({ isListing:true }).exec()
            // const address = await Address.find().exec()
    
    
    
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
                await Order.updateOne(
                    { _id: odrid },              
                    { $set: {     
                        status: "cancelled"                
                    } } 
                )
            
           
            console.log('successful');
            req.flash("successMessage", "cancelled the order successfully...");
            res.redirect('/orderManage')
        }
        catch(err){
            console.log(err.message);
        }
    }



    module.exports = {
        loadOrder,
        viewOrderMore,

        OrderApproved,

        cancelOrder,
        returnOrder,
        OrderCancelled,
        OrderReturned,

    }