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




    module.exports = {
        loadOrder,
        viewOrderMore
    }