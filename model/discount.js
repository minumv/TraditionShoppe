const mongoose = require('mongoose')

const discountSchema = new mongoose.Schema({
    discount_name : {
        type : String,
        require : true 
    },
    percentage : {
        type : Number,
        require : true
    },
    status : {
        type : Boolean,
        require : true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Discount',discountSchema)