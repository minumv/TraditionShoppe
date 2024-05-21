const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        
      },    
      transactiontype: {
        type: String,
      },
      amount: {
        type: Number,
      },
      created : {
        type : Date,
        require : true,
        default : Date.now
    }
    });

module.exports = mongoose.model('Wallet',walletSchema)