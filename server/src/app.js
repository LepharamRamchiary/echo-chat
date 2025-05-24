import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// import swaggerSetup from "./utils/swagger.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// console.log(process.env.CORS_ORIGIN);

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//json data
app.use(express.json({ limit: "20kb" }));
//url data
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

app.use(express.static("public"));



// routes import
// import bookRouter from "./routes/book.routes.js";
// import userRouter from "./routes/user.routes.js";
// import commentRouter from "./routes/comment.routes.js";
// import orderRouter from "./routes/order.route.js";

// routes declaration


// Swagger
// swaggerSetup(app);


export { app };
