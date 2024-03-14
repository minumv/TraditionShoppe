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
    payment : {
        type : mongoose.Types.ObjectId,
        ref: 'payment',
        required : true
    },
    product_list : {
        type : Array,
        require : true
    },
    shipping_charge : {
        type : Number,
        require : true
    },
    total_amount : {
        type : Number,
        require : true
    },
    status : {
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