const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    order_date : {
        type : Date,
        require : true
    },
    user : {
        type : mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },
    address : {
        type : mongoose.Types.ObjectId,
        ref: 'Address',
        required : true
    },
    coupon : {
        type : mongoose.Types.ObjectId,
        ref: 'coupon',
        require : true
    },
    payment : { //method
        type :String,        
        required : true
    },
     product_list :  [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: { type: Number, required: true, min: 1 },
          price: { type: Number, required: true },
          total: { type: Number, required: true },
        },
    ], 
   
    payment_amount : {
        type : Number,
        require : true
    },
    delivery_date:{ //expected delivery date
        type : Date,
        require : true,
    },
    return_date:{   //day limit for return request
        type : Date,
        require : true,
    },
    paymentstatus : {
        type : String,
        enum: ['pending','completed','cancelled'],
        require : true
    },
    orderstatus : {
        type : String,
        enum: ['pending','packed','shipped','cancel request','cancelled','delivered','refund received','return request'],
        require : true
    }, 

    adminaction : {
        type : String,
        enum: ['approve','order cancelled','delivered','refund granted','approve return',],
        require : true
    },
    delivered_date : {  //delivered to customer
        type : Date,
        require : true,
    },
    returned_date : { //customer returned the product
        type : Date,
        require : true,
    },
    return_reason : {
        type : String,
        require : true
    },
    cancelled_date : { //customer cancelled the product
        type : Date,
        require : true,
    },
    cancel_reason : {
        type : String,
        require : true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Order',orderSchema)