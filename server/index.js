const express = require("express");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:3000', // for local development
  'https://ecommerce-aichatbot.vercel.app/' // replace with your Vercel URL after deploying
];
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // only needed if you’re sending cookies or auth headers
}));
