const mongoose = require('mongoose');

const proudctSchema = mongoose.Schema({
    name : {
        type:String,
        required:[true,"please enter product Name"],
        trim:true
    },
    descreption:{
        type:String,
        required:[true,"plese enter product descreption"]
    },
    price:{
        type:Number,
        required:[true,"please enter producr price"],
        maxLength:[8,"price cannot exceed 8 characters"]
    },
    rating:{
        type:Number,
        default:4
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,'please enter product category'],
    },
    stock:{
        type:Number,
        required:[true,'please the product stock'],
        maxLength:[4,'stock cannot exceed 4 characters'],
        default:1
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }

        }
        
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Product",proudctSchema)