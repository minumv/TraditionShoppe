// require("dotenv").config()
// const  mongoose  = require("mongoose")

// module.exports = async(req,res)=>{
//     try{
//         await mongoose.connect(process.env.DB_URI/*{
//             useNewUrlParser:true,
//             useUnifiedTopology:true
            
//         }*/).then(()=>{
//             console.log("Database connected..!!");
//         }).catch((err)=>{
//             console.log(err);
//         })

//     } catch(err){
//         console.log(err.message)
//     }
// }

require("dotenv").config();

// Import Mongoose
const mongoose = require("mongoose");

// Asynchronous function to connect to the database
module.exports = async (req, res) => {
    try {
        // Connect to the MongoDB database using the connection URI from the environment variable
        await mongoose.connect(process.env.DB_URI, {
            // useNewUrlParser: true,       // Use the new MongoDB URL string parser
            // useUnifiedTopology: true,    // Use the new MongoDB server discovery and monitoring engine
            tls: true, // Enable TLS explicitly
            tlsAllowInvalidCertificates: true 
            
        });
        
        console.log("Database connected..!!");

        // You can handle further processing here after the database connection is successful
       // res.status(200).send("Database connection successful");

    } catch (err) {
        console.error("Database connection error:", err.message);
       // res.status(500).send("Database connection failed");
    }
};