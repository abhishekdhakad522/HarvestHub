import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import app from "./src/app.js";
import {connectDB}  from "./src/db/db.js";


const PORT = process.env.PORT || 4000;
connectDB();
app.listen(PORT,()=>{
    console.log(`Server is listening on Port ${PORT}`);
    
})