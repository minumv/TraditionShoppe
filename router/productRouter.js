const express = require("express")
const productRoute = express()
//const User = require('../model/userModel')
const productController = require('../controller/productController')
// const userAuthent = require('../middleware/userAuthent')

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
        cb(null, dir); // Set the destination folder for uploaded files
        console.log('inside destination');
    },

    filename: function (req, file, cb) {
        // Use the original filename with a timestamp to avoid overwriting files
        cb(null, file.originalname);
        console.log('inside filename');
    }
});

// Create Multer instance with storage options
const upload = multer({storage:storage}).array('file',6)

//middleware
const handleUpload = (req, res, next) => {
    req.uploadedFiles = [];
    console.log('inside middleware');
    upload(req, res, function (err) {
        console.log('inside upload middleware');
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            // return res.status(500).json({ error: err.message });
            console.log('multer'+err.message);
        } else if (err) {
            // An unknown error occurred when uploading.
            // return res.status(500).json({ error: 'Unknown error occurred' });
            console.log('multer'+err.message);
        }
        // Everything went fine, proceed to the next middleware or route handler.
        
        req.uploadedFiles = req.files.map(file => file.originalname);
        next();
    });

};


/*****************Routing Product page****************** */

productRoute.get("/admin/products",productController.loadProducts)
productRoute.get('/newProducts',productController.loadNewProducts)

productRoute.get("/admin/products/update/:id",productController.loadProductsChange);

productRoute.post("/update/:id",productController.updateProduct)
productRoute.post("/delete/:id",productController.deleteProduct)

productRoute.post("/getDropdownValues",productController.storeDropdownValues)
productRoute.post("/upload",handleUpload, productController.submitProducts)




/*****************Routing Category page****************** */

productRoute.get("/admin/category",productController.loadCategory)
productRoute.get('/newCategory',productController.loadNewCategory)

productRoute.post('/addCategory',productController.addNewCategory)

productRoute.get("/admin/categoryChange/:id",productController.loadCategoryChange);

productRoute.post("/admin/categoryChange/:id",productController.updateCategory)
productRoute.post("/deleteCat/:id",productController.deleteCategory)



module.exports =  productRoute//router