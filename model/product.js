const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    product_name : {
        type : String,
        require : true
    },
    category : {
        type : mongoose.Types.ObjectId,
        ref: 'category',
        require: true
    },
    seller : {
        type : mongoose.Types.ObjectId,
        ref: 'seller',
        require : true
    },
    description:{
        type: String,
        required:true
    },
    stock : {
        type : Number,
        require : true
    },
    price_unit : {
        type : Number,
        require : true
    },
    discount: {
        type : mongoose.Types.ObjectId,
        ref: 'discount',
        require : true
    },
    material : {
        type : String,
        require : true
    },
    color : {
        type : String,
        require : true
    },
    size : {
        type : Number,
        require : true
    },
    weight : {
        type : Number,
        require : true
    },
    images : {
        type : Array,
        require : true 
    },
    status : {
        type : String,
        enum: ['new','active','inactive'],
        require : true
    },
    isListing: {
        type : Boolean,
        require : true 
    },
    created:{
        type:Date,
        required:true,
        default:Date.now
    }
})
module.exports = mongoose.model('Product',productSchema)
