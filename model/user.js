const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true,
        unique : true
    },
    phone:{
        type : Number,
        required : true,
    },
    password:{
        type : String,
        required : true,
    },
    address:
    [{
        type : mongoose.Schema.Types.ObjectId,
        ref:'Address'
    }],
    role:{
        type:String,
        required:true
    },
    coupons:
    [{
        type : mongoose.Schema.Types.ObjectId,
        ref:'Coupon'
    }],
    wallet:{
        type : Number,
        require : true
    },
    status: {
        type: String, 
        enum: ['verified','pending','blocked','inactive'],
        default:'Pending'
    },
    isVerifiedByOtp:{
        type: Boolean,
        require: true
    },
    created:{
        type:Date,
        required:true,
        default:Date.now
    }
})
module.exports = mongoose.model('User',userSchema)