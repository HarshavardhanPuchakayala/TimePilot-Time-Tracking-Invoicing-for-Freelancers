import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import router from "./routes/health.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clients.js";
import projectRoutes from "./routes/projects.js";
import timeSessionRoutes from "./routes/timeSessions.js";
import invoiceRoutes from "./routes/invoices.js";

dotenv.config();

const port = process.env.PORT;
connectDB();
const app = express();

app.use(express.json());
app.use(cors());



app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Api running"
    })
});
app.use("/api/auth", authRoutes);
app.use("/api/health",router);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/time-sessions", timeSessionRoutes);
app.use("/api/invoices", invoiceRoutes);

app.listen(port,()=>{
    console.log(`API running on port ${port}`)
});