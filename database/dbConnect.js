require("dotenv").config()
const  mongoose  = require("mongoose")

module.exports = async(req,res)=>{
    try{
        await mongoose.connect(process.env.DB_URI/*{
            useNewUrlParser:true,
            useUnifiedTopology:true
            
        }*/).then(()=>{
            console.log("Database connected..!!");
        }).catch((err)=>{
            console.log(err);
        })

    } catch(err){
        console.log(err.message)
    }
}