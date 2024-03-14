const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    user : {
        type : mongoose.Types.ObjectId,
        ref: 'user',
        require : true 
    },
    product_list : {
        type : Array,
        require : true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Wishlist',wishlistSchema)
