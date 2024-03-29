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
        ref:'address'
    }],
    role:{
        type:String,
        required:true
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