const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Types.ObjectId,
        require:true,
        ref:'User'
    },
    otp:String,
    createdAt: Date,
    expiresAt: Date,

    // timestamp:{
    //     type:Date,
    //     default: Date.now,
    //     required:true,
    //     get: (timestamp)=> timestamp.getTime(),
    //     set: (timestamp)=> new Date(timestamp)
    // }
    
})

module.exports = mongoose.model('Otp',otpSchema)