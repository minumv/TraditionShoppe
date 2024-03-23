const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    user : {
        type : mongoose.Types.ObjectId,
        ref: 'user',
        required : true
    },
    product_list :  [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
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
   
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Cart',cartSchema)