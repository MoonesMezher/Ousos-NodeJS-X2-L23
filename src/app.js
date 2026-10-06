require("dotenv").config();
const express = require("express");
const app = express();

const morgan = require("morgan");
const connectDB = require("./utils/connectDb");
const notFoud = require("./middlewares/notFound");
const errorMiddleware = require("./middlewares/errorMiddleware");

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/posts", require("./routes/posts.routes"));

app.use(errorMiddleware);
app.use(notFoud);

connectDB(app);