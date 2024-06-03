const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId type for user_id
    ref: "User", // Reference the User model
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isSeenBy : {
    type : Boolean,
    default : false    
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports =  mongoose.model("Notification", notificationSchema);
