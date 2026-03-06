import express from "express";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

app.get("/",(req,res)=>{
    res.send("Hello from Harvest Hub");
})

app.listen(PORT,()=>{
    console.log(`Server is listen on Port ${PORT}`);
    
})