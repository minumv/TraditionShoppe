const mongoose = require('mongoose')

const sellerSchema = new mongoose.Schema({
    seller_name : {
        type : String,
        require : true 
    },
    contact : {
        type : String,
        require : true
    },
    status : {
        type : String,
        enum: ['popular','active','Blocked','Inactive'],
        require : true        
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Seller',sellerSchema)