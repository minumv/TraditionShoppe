const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    user : {
        type : mongoose.Types.ObjectId,
        ref: 'User',
        required : true
    },
    product_list :  [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: { type: Number, required: true, min: 1 },
          price: { type: Number, required: true },
          total: { type: Number, required: true },
        },
    ],    
    total_amount : {
        type : Number,
        require : true,
        default:0
    },
    // status for further check at admin side and also to gey buy again list
    status:{
        type:String,
        enum: ['listed','pending','purchased'],
        require:true
    },
   
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Cart',cartSchema)