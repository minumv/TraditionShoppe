const express = require("express")
const User = require('../model/user')
const Products = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')
const List = require('../model/wishlist')
const bcrypt = require('bcrypt')

/*********load cart*********/
const loadCart = async(req,res)=>{
    try{
        res.render('content/myCart',{
            title: "My Cart - TraditionShoppe",
            page:"My Cart",   
            user : req.session.user,          
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

/*********add to cart table*********/
const addToCartTable = async(req,res)=>{
    try{
        let pdt_id = req.params.id;
        const user = req.session.user
        const user_id = await User.findOne({email:user},{_id:1}).exec()
        const user_list_id = await List.findOne({user:user_id},{_id:1}).exec()

        if (user_list_id){

            await List.updateOne({_id:user_list_id},
                { $push: { product_list: pdt_id }})
                
                console.log('successful');
                req.flash("successMessage", "Product is successfully updated to cart...");
                res.redirect('/viewProduct/:pdt_id')

        } else {
            const list = new List({
                 user:user_id,
                 product_list:pdt_id,
            })
            const listData = await list.save()
            if(listData){
                console.log('successful');
                req.flash("successMessage", "Product is successfully added to cart...");
                res.redirect('/viewProduct/:pdt_id')
            } else {
                console.log('failed');
                req.flash("errorMessage", "Product is not added to cart... Try again!!");
                res.redirect("/newProducts");
            }  

        }
    }
    catch(err){
        console.log(err.message);
    }
}

/*********add to wishlist table*********/
const addToWishlist = async(req,res)=>{
    try{
        //add user, productlist; user exist- update, otherwise insert
        let pdt_id = req.params.id;
        const user = req.session.user
        const user_id = await User.findOne({email:user},{_id:1}).exec()
        const user_list_id = await List.findOne({user:user_id},{_id:1}).exec()

        if (user_list_id){

            await List.updateOne({_id:user_list_id},
                { $push: { product_list: pdt_id }})

                console.log('successful');
                req.flash("successMessage", "Product is successfully updated to cart...");
                res.redirect('/viewProduct/pdt_id')

        } else {
            const list = new List({
                 user:user_id,
                 product_list:pdt_id,
            })
            const listData = await list.save()
            if(listData){
                console.log('successful');
                req.flash("successMessage", "Product is successfully added to cart...");
                res.redirect(`/viewProduct/${pdt_id}`)
            } else {
                console.log('failed');
                req.flash("errorMessage", "Product is not added to cart... Try again!!");
                res.redirect("/newProducts");
            }  

        }
        
    }
    catch(err){
        console.log(err.message);
    }
}
/*********add to saving*********/
const addToSave = async(req,res)=>{
    try{
        res.render('content/myCart',{
            title: "My Cart - TraditionShoppe",
            page:"My Cart",   
            user : req.session.user,          
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

/*********load checkout*********/
const loadCheckout = async(req,res)=>{
    try{
        res.render('content/checkout',{
            title: "Checkout - TraditionShoppe",
            page:"Checkout",   
            user : req.session.user,          
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

/*********load wishlist*********/
const loadWishlist = async(req,res)=>{
    try{
        res.render('content/myWishlist',{
            title: "My Wishlist - TraditionShoppe",
            page:"Checkout",   
            user : req.session.user,          
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}

/*********load saved list*********/
const loadSaved = async(req,res)=>{
    try{
        res.render('content/savedList',{
            title: "Checkout - TraditionShoppe",
            page:"Checkout",  
            user : req.session.user,           
            errorMessage : req.flash('errorMessage'),
            successMesssage : req.flash('successMessage')
        })
    }
    catch(err){
        console.log(err.message);
    }
}




module.exports = {
    loadCart,
    loadCheckout,
    loadWishlist,
    loadSaved,
    addToCartTable,
    addToWishlist,
    addToSave
}