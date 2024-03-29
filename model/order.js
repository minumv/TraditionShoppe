const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    order_date : {
        type : Date,
        require : true
    },
    user : {
        type : mongoose.Types.ObjectId,
        ref: 'user',
        required : true
    },
    address : {
        type : mongoose.Types.ObjectId,
        ref: 'address',
        required : true
    },
    // coupon : {
    //     type : mongoose.Types.ObjectId,
    //     ref: 'coupon',
    //     require : true
    // },
    payment : {
        type :String,        
        required : true
    },
    product_list :[{
        type : Array,
        require : true
    }],
   
    payment_amount : {
        type : Number,
        require : true
    },
    delivery_date:{
        type : Date,
        require : true,
    },
    status : {
        type : String,
        enum: ['pending','cancelled','delivered','refund received','return request'],
        require : true
    },  
    action : {
        type : String,
        enum: ['approve','order cancelled','delivered','refund granted','approve return',],
        require : true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Order',orderSchema)