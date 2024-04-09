const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    coupon_code: {
        type : String,
        require : true 
    },
    discount_per : {
        type : String,
        require : true
    },
   start_date : {
    type : Date,
        require : true
   },
    expire_date : {
        type : Date,
        require : true
    },
    minimum_purchase : {
        type : Number,
        require : true
    },
    maximum_discount_amt : {
        type : Number,
        require : true
    },
    status : {
        type: Boolean,
        require:true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Coupon',couponSchema)