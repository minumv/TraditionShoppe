const express = require("express")
const productRoute = express()
const productController = require('../controller/productController')
const userAuthent = require('../middleware/userAuthent')

const multer  = require('multer');
const fs = require('fs')


productRoute.set('view engine','ejs')

const bodyParser = require('body-parser');
const { start } = require("repl");
productRoute.use(bodyParser.json())
productRoute.use(bodyParser.urlencoded({extended:true}))
productRoute.use('/upload', express.static('upload'));

/*.................... multer handling to upload ................. */

// Set up Multer storage options
const storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        const dir = './upload'
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir)
        }
        const ext = file.mimetype.split("/")[0];
        if (ext === "image") {            
            cb(null, dir);
        } else {           
            cb(null, "./others");
        }
        console.log('inside destination');
    },

    filename: function (req, file, cb) {        
        cb(null, file.originalname);
        console.log('inside filename');
    }
});

// Create Multer instance with storage options
const upload = multer({storage:storage}).array('croppedImage',6)

//middleware
 const handleUpload = (req, res, next) => {
    req.uploadedFiles = [];
    console.log('inside middleware');
    upload(req, res, function (err) {
        console.log('inside upload middleware');
        if (err instanceof multer.MulterError) {           
            console.log('multer err:'+err.message);
        } else if (err) {           
            console.log('multer'+err.message);
        }
        req.uploadedFiles = req.files.map(file => file.originalname);
        console.log("upload files :",req.uploadedFiles)
        next();
    });

};


/*****************Routing Product page****************** */

productRoute.get("/admin/products",userAuthent.isAdminAuthenticated,productController.loadProducts)
productRoute.get('/newProducts',userAuthent.isAdminAuthenticated,productController.loadNewProducts)
productRoute.get('/addimage/:pdtid',userAuthent.isAdminAuthenticated,productController.loadImage)

productRoute.get("/admin/products/update/:id",userAuthent.isAdminAuthenticated,productController.loadProductsChange);

productRoute.post("/getDropdownEdit",productController.storeDropdownEdit)
productRoute.post("/update/:id",productController.updateProduct)
productRoute.post("/delete/:id",productController.deleteProduct)

productRoute.post("/getDropdownValues",productController.storeDropdownValues)
productRoute.post("/uploadPdtImage",handleUpload, productController.submitProducts)
productRoute.post("/uploadnewImage",handleUpload, productController.addimageTopdt)
productRoute.post('/removeImage',productController.deleteImage)

/*****************Routing Banner****************** */

productRoute.get("/admin/banner",userAuthent.isAdminAuthenticated,productController.loadBanner)
productRoute.post("/uploadBanner",handleUpload, productController.addimageBanner)
 


/*****************Routing Category page****************** */

productRoute.get("/admin/category",productController.loadCategory)
productRoute.get('/newCategory',userAuthent.isAdminAuthenticated,productController.loadNewCategory)

productRoute.post('/addCategory',productController.addNewCategory)

productRoute.get("/admin/categoryChange/:id",userAuthent.isAdminAuthenticated,productController.loadCategoryChange);

productRoute.post("/admin/categoryChange/:id",productController.updateCategory)
productRoute.post("/deleteCat/:id",productController.deleteCategory)

module.exports =  productRoute