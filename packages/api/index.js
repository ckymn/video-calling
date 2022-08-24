require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./v1/routes")
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json())

app.use(routes);

app.listen(PORT , () =>{
  console.log(`Server is running on ${PORT}`);
});