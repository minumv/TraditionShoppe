const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
   
    images : {
        type : Array,
        require : true
    }
    
})

module.exports = mongoose.model('Banner',bannerSchema)