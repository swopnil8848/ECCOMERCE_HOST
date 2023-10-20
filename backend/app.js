const express = require('express');
const app = express();
const errorMiddleware = require('./middleware/error')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const multer = require('multer')
const upload = multer({dest:'uploads/'})
const dotenv = require("dotenv")
const path = require('path')

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
  }

app.use(express.json());
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

//ROUTE IMPORTS
const product = require('./routes/productRoute')
const user = require("./routes/userRoute");
const order = require("./routes/orderRoutes");
const payment = require("./routes/paymentRoute");

app.use('/api/v1',product)
app.use('/api/v1', upload.single('avatar'),user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
// app.use(fileUpload({
    //     limits: { fileSize: 50 * 1024 * 1024 }, // Set a 50MB file size limit
    //   }));
    
    app.use(fileUpload());

    app.use(express.static(path.join(__dirname, "../frontend/build")));

    // app.get("*", (req, res) => {
    // res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
    // });

    app.get("*",function(req,res){
      res.sendFile(path.join(__dirname,'../frontend/build/index.html'))
    })

//middleware for error
app.use(errorMiddleware);

module.exports = app
