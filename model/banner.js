const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    banner_name : {
        type : String,
        require : true 
    },
    start_date : {
        type : Date,
        require : true
    },
    end_date : {
        type : Date,
        require : true
    },
    status : {
        type : Boolean,
        require : true
    },
    images : {
        type : Array,
        require : true
    },
    created : {
        type : Date,
        require : true,
        default : Date.now
    }
})

module.exports = mongoose.model('Banner',bannerSchema)