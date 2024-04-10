const express = require("express")
const User = require('../model/user')
const Products = require('../model/product')
const Category = require('../model/category')
const Seller = require('../model/seller')
const Discount = require('../model/discount')
const bcrypt = require('bcrypt')





/*.................... Product details ................. */

  // load products page
  const loadProducts = async(req,res)=>{
    try{
        const productQuery = Products.find().sort({'created':-1}).exec()
        const categoryQuery = Category.find({status:true}).exec()
        const sellerQuery = Seller.find({status:true}).exec()
        const discountQuery = Discount.find({status:true}).exec()

        const [products, categories, sellers, discounts] = await Promise.all([productQuery, categoryQuery, sellerQuery, discountQuery]);
            //console.log(products[0].images[0]);
        res.render('admin/products',{
            title : "Admin Panel - TraditionShoppe",
            page:"Products",
            products:products,
            categories:categories,
            sellers:sellers,
            discounts:discounts,
            errorMessage: req.flash("errorMessage"), 
            successMessage: req.flash("successMessage") 
       
    })
        
    } catch (err){
        console.log(err.message);
    }
}

//load new products page
const loadNewProducts = async(req,res)=>{
    try{
        const categoryQuery = Category.find({status:true}).exec()
        const sellerQuery = Seller.find({status:{$ne:'inactive'}}).exec()
        const discountQuery = Discount.find({status:true}).exec()

        const [categories, sellers, discounts] = await Promise.all([categoryQuery, sellerQuery, discountQuery]);
        
        // console.log(sellers)
        
        res.render('admin/addProducts',{
            title:'Add products - TraditionShoppe',
            page:"New Products",
            categories:categories,
            sellers:sellers,
            discounts:discounts,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })           
    }
    catch(err){
        console.log(err.message);
    }
}

//upload images into folder

const storeDropdownValues = async (req,res,next)=>{
    try{

        // Extract dropdown values from the request body
        console.log(req.body);
        const { category, seller, discount, material, color, product_type } = req.body;

        // Store dropdown values in session
        req.session.dropdownValues = { category, seller, discount, material, color, product_type  };  
        console.log("session values in storeDropdonValues:");
        console.log(req.session.dropdownValues); 
        res.sendStatus(200);    
    
    }
    catch(err){
        console.log(err.message);
    }
   
}

const submitProducts = async (req,res)=>{
    try{
      
        console.log(req.body);
        console.log("try for session in /submitProducts");
        console.log(req.session.dropdownValues);
        const { category, seller, discount, material, color, product_type} = req.session.dropdownValues;
        // const catName = req.body.category;
        const categ = await Category.findOne({ category_name: category }, { _id: 1 }).exec();
        console.log('Category:', category, categ);

        // const sellName = req.body.seller;
        const sellr = await Seller.findOne({ seller_name: seller }, { _id: 1 }).exec();
        console.log('Seller:', seller, sellr);

        // const discName = req.body.discount;
        const disc = await Discount.findOne({ discount_name: discount }, { _id: 1 }).exec();
        console.log('Discount:', discount, disc);

        // Ensure that categ, sellr, and disc are not null before proceeding
        if (!categ || !sellr || !disc) {
            console.log('One or more documents not found in the database.');
            // Handle the case where one or more documents are not found
        }

        const product = new Products({

            product_name: req.body.name,
            category: categ,
            seller: sellr,
            description : req.body.description,
            stock:req.body.stock,
            price_unit:req.body.price,
            discount: disc,
            material:material,
            color:color,
            size:req.body.size,
            weight:req.body.weight,
            images:req.uploadedFiles ,
            product_type:product_type,
            status:'new',
            isListing:true
        })

        console.log('Final Product:', product);

        const productData = await product.save()
        if(productData){
            console.log('successful');
           
             res.redirect('/admin/products')
        } else {
            console.log('failed');
            //  req.flash("errorMessage", "Product registration failed.. Try again!!");
             res.redirect("/newProducts");
        }  
    }
    catch(err){
        console.log(err.message)
    }
}
//load update product page
const loadProductsChange = async(req,res)=>{
    try{
        const categoryQuery = Category.find({status:true}).exec()
        const sellerQuery = Seller.find({status:{$ne:'inactive'}}).exec()
        const discountQuery = Discount.find({status:true}).exec()

        const [categories, sellers, discounts] = await Promise.all([categoryQuery, sellerQuery, discountQuery]);
        
        let id = req.params.id
        Products.findById(id)
        .then(products=>{
        res.render('admin/changeProduct',{
            title: " Update Product | TraditionShoppe ",
            page:"Change Products",
            categories:categories,
            sellers:sellers,
            discounts:discounts,
            products:products,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    })
    }
    catch(err){
        console.log(err.message);
    }
}


const storeDropdownEdit = async (req,res,next)=>{
    try{

        // Extract dropdown values from the request body
        console.log(req.body);
        const { category, seller, discount, material, color, product_type, status, isListing } = req.body;

        // Store dropdown values in session
        req.session.dropdownEdit = { category, seller, discount, material, color, product_type, status, isListing   };  
        console.log("session values in storeDropdonValues:");
        console.log(req.session.dropdownEdit); 
        res.sendStatus(200);    
    
    }
    catch(err){
        console.log(err.message);
    }
   
}
//update products
const updateProduct = async(req,res)=>{
    try{
        let id = req.params.id
        console.log(req.session.dropdownEdit);
        const { category, seller, discount, material, color, product_type, status, isListing } = req.session.dropdownEdit;
        // const catName = req.body.category;
        const categ = await Category.findOne({ category_name: category }, { _id: 1 }).exec();
        console.log('Category:', category, categ);

        // const sellName = req.body.seller;
        const sellr = await Seller.findOne({ seller_name: seller }, { _id: 1 }).exec();
        console.log('Seller:', seller, sellr);

        // const discName = req.body.discount;
        const disc = await Discount.findOne({ discount_name: discount }, { _id: 1 }).exec();
        console.log('Discount:', discount, disc);

        // Ensure that categ, sellr, and disc are not null before proceeding
        if (!categ || !sellr || !disc) {
            console.log('One or more documents not found in the database.');
            // Handle the case where one or more documents are not found
        }
        await Products.updateOne({_id:id},{$set:{
            product_name: req.body.name,
            category: categ,
            seller: sellr,
            description : req.body.description,
            stock:req.body.stock,
            price_unit:req.body.price,
            discount: disc,
            material:material,
            color:color,
            size:req.body.size,
            weight:req.body.weight,           
            product_type:product_type,
            status:status,
            isListing:isListing
        }})
        res.redirect('/admin/products')
    }
    catch(err){
        console.log(err.message);
    }
}


// delete product
const  deleteProduct = async (req,res)=>{
    try{       

        let id = req.params.id
        console.log(id)
        await Products.updateOne({_id:id},{$set:{
        status : "inactive"           
    }})
    res.redirect('/admin/products')
     
    } catch (err){
        console.log(err.message);
    }
    
}

/*.................... Category details ................. */

    //load category page
    const loadCategory = async (req, res)=>{
        try {
            const categQuery = Category.find({status:true})
            await categQuery.exec()
            .then(categories=>{
            res.render('admin/category',{
                title : "Category - TraditionShoppe",
                page:"Categories",
                categories:categories,
                errorMessage : req.flash('errorMessage'),
                successMessage : req.flash('successMessage')
            })
        })
            
        } catch (err) {
            console.log(err.message);
        }
}

//load change category page
const loadCategoryChange = async(req,res)=>{
    try{
                  
        let id = req.params.id
        Category.findById(id)
        .then(categories=>{
        res.render('admin/changeCategory',{
            title: " Update Category | TraditionShoppe ",
            page:"Change Category",
            categories:categories,
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')

        })
    })
    }
    catch(err){
        console.log(err.message);
    }
}

//load new products page
const loadNewCategory = async(req,res)=>{
    try{
        
        
        res.render('admin/addCategory',{
            title:'Category - TraditionShoppe',
            page:"New Category",
            // categories:categories,                
            errorMessage:req.flash('errorMessage'),
            successMessage:req.flash('successMessage')
        })           
    }
    catch(err){
        console.log(err.message);
    }
}

//Add category
const addNewCategory = async(req,res)=>{
    try{
        
        const name =  req.body.name
        const descr = req.body.description

        const categ = await Category.find({category_name:name}).exec()

        if(!categ){
                console.log(req.body.name,req.body.description);
                const categQuery = new Category({
                category_name:name,
                description : descr,
                status:true                
            })
            const categData = await categQuery.save();

        if(categData){
                console.log('successful');
                 req.flash("successMessage", "Category added successfully..");
                res.redirect('/admin/category')
            } else {
                console.log('failed');
                 req.flash("errorMessage", "Category registration failed.. Try again!!");
                res.redirect("/newCategory");
            } 
        } else {
            console.log('failed');
                 req.flash("errorMessage", "Category exist..Try new one!!");
                res.redirect("/newCategory");
        }

        
    }
    catch(err){
        console.log(err.message);
    }
}

//update products
const updateCategory = async(req,res)=>{
    try{
        console.log('update');
        //console.log(req.body.name,req.body.description);
        let id = req.params.id
        console.log(id);
        await Category.updateOne({_id:id},{$set:{
            category_name: req.body.name,
            description :  req.body.description,
            status:true
        }})

        res.redirect('/admin/category')
    }
    catch(err){
        console.log(err.message);
    }
}


// delete product
const  deleteCategory = async (req,res)=>{
    try{        
        console.log('delete')
    
            let id = req.params.id
            console.log(id);
            await Category.updateOne({_id:id},{$set:{
            status : false                        
            }})
            res.redirect('/admin/category') 
              
    } catch (err){
        console.log(err.message);
    }        
}


/*.................... Seller details ................. */

     //load sellers list

     const loadSellers = async (req,res)=>{
        try{
                const sellerQuery = Seller.find({status:true})
                await sellerQuery.exec()
                .then((sellers)=>{
                    res.render('admin/seller',{
                    title: "Admin Panel - TraditionShoppe",
                    page:"Seller",
                    sellers:sellers,
                    errorMessage : req.flash('errorMessage'),
                    successMesssage : req.flash('successMessage')
                })
            })
        } catch (err){
            console.log(err.message);
        }
    }


    
    module.exports = {
        loadProducts,
        loadNewProducts,       
        submitProducts,
        storeDropdownValues,
        loadProductsChange ,
        storeDropdownEdit,
        updateProduct,
        deleteProduct,
        loadCategory,
        loadNewCategory,
        addNewCategory,
        loadCategoryChange,
        updateCategory,
        deleteCategory,
    }
