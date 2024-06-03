const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    product_name : {
        type : String,
        require : true
    },
    category : {
        type : mongoose.Types.ObjectId,
        ref: 'Category',
        require: true
    },
    seller : {
        type : mongoose.Types.ObjectId,
        ref: 'Seller',
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
        ref: 'Discount',
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
    product_type:{
        type : String,
        require : true
    },
    images : {
        type : Array,
        require : true 
    },
    ratings:[
        {
            star : Number,
            ratedby : {  type : mongoose.Schema.Types.ObjectId, ref : "User"}
        }
    ],
    totalrating : {
        type : Number,
        default : 0
    },
    feedback:[
        {
            reviews : String,
            reviewby : {  type : mongoose.Schema.Types.ObjectId, ref : "User"},
            reviewDate : Date
        }
    ],
    status : {
        type : String,
        enum: ['new','active','inactive'],
        require : true
    },
    isListing: {
        type : Boolean,
        required : true 
    },    
    created:{
        type:Date,
        required:true,
        default:Date.now
    }
})
module.exports = mongoose.model('Product',productSchema)
