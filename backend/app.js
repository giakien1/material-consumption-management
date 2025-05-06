  require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const routes = require("./routes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,  
}));
app.use(express.json());

routes(app);

db();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
