const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy",
    uptime: process.uptime(),
  });
});

module.exports = router;
