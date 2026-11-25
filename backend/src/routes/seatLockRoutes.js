
"use strict";

const express = require("express");
const router = express.Router();

const {
    lockSeats
} = require("../controllers/seatLockController");

router.post("/", lockSeats);

module.exports = router;
