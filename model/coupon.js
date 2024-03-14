const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    coupon_type : {
        type : String,
        require : true 
    },
    discount_amount : {
        type : Number,
        require : true
    },
    description : {
        type : String,
        require : true
    },
    limit : {
        type :Number,
        require : true
    },
    expire_date : {
        type : Date,
        require : true
    },
    
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Coupon',couponSchema)