import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./src/app.js";
import {connectDB}  from "./src/db/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 4000;
connectDB();
app.listen(PORT,()=>{
    console.log(`Server is listening on Port ${PORT}`);
    
})