
"use strict";

const express = require("express");
const router = express.Router();

const {
    createBooking,
    getBookingByCode
} = require("../controllers/bookingController");

// Tạo đơn đặt vé
router.post("/", createBooking);

// Tra cứu vé bằng mã đặt vé
router.get("/:bookingCode", getBookingByCode);

module.exports = router;
