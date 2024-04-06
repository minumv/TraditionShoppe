const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    user_id: {
        type : mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },
    name : {
        type : String,
        require : true 
    },
    mobile : {
         type : Number,
         require : true
    },
    house : {
        type : String,
        require : true
    },
    street : {
        type : String,
        require : true
    },
    landmark : {
        type : String,
        require : true
    },
    city : {
        type : String,
        require : true
    },
    pincode : {
        type : Number,
        require : true
    },
    state : {
       type : String,
       require : true
    },
    country : {
       type : String,
       require : true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Address',addressSchema)