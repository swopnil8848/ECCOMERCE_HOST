const app = require('./app')
const cloudinary = require('cloudinary')
const dotenv = require('dotenv')

// app.use(cors(
//     {
//         origin:['https://deploy-mern-1whq.vercel.app'],
//         methods:["POST","GET","DELETE","PUT"],
//         Credential:true
//     }
// ))

//config
// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
}
const connectDatabase = require('./config/database')

connectDatabase();

cloudinary.config({
    cloud_name : process.env.ClOUDINARY_NAME,
    api_key:process.env.ClOUDINARY_API_KEY,
    api_secret:process.env.ClOUDINARY_API_SECRET
});

app.listen(process.env.PORT,()=>{
    console.log(`server running on http://localhost:${process.env.PORT}`);
})