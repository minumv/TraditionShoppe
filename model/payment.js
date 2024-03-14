const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    method : {
        type : String,
        require : true 
    },
    status : {
        type : Boolean,
        require : true
    },
    coupon : {
        type : mongoose.Types.ObjectId,
        ref: 'coupon',
        require : true
    },
    payment_amount : {
        type : Number,
        require : true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Payment',paymentSchema)