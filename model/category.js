const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    category_name : {
        type : String,
        require : true 
    },
    description : {
        type : String,
        require : true
    },
    status : {
        type : Boolean,
        require : true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Category',categorySchema)
