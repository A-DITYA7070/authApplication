import express from "express";
import { connectToDb } from "./config/database.js";
import dotenv from "dotenv";
import user from './routes/userRoutes.js';
import errorMiddleWare from "./middlewares/error.js"
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({path:"./config/config.env"});

connectToDb();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.json());
app.use(
    express.urlencoded({
    extended: true, 
})
);
app.use(cors());

app.use("/api/v1",user);



export default app;

app.use(errorMiddleWare);