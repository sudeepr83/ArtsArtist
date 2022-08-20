const app=require("./app")
const connectDatabase = require("./config/database")
const cloudinary=require('cloudinary')

//Handling Uncaught Exception
process.on("uncaughtException",(err) =>{
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1)
})

//Config
if(process.env.NODE_ENV!=="PRODUCTION"){
  require("dotenv").config({path:"backend/config/config.env"})
}

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}



connectDatabase()

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET

})
const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is working on http://localhost:${process.env.PORT} `)
})

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  
    server.close(() => {
      process.exit(1);
    });
  });
  
