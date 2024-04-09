const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    offer_name: {
        type : String,
        require : true 
    },
    offer_type:{
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
    status : {
        // type: String,
        // enum : ['active','inactive','expired','deleted'],
        // require:true
        type: Boolean,
        require:true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Offer',offerSchema)