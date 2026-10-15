require("dotenv").config();
const express = require("express");
const app = express();

const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./utils/connectDb");
const notFoud = require("./middlewares/notFound");
const errorMiddleware = require("./middlewares/errorMiddleware");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../client")));

app.use("/api/v1/posts", require("./routes/posts.routes"));
app.use("/api/v1/users", require("./routes/users.routes"));

app.use(notFoud);
app.use(errorMiddleware);

connectDB(app);