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
        require : true,
        default : 0
    },
    status: {
        type: String, 
        enum: ['Verified','Pending','Blocked','Inactive'],
        default:'Pending'
    },    
    referalCode: {
        type: String,
        require:true    
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