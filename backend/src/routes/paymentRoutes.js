
"use strict";

const express = require("express");
const router = express.Router();

const {
    processPayment
} = require("../controllers/paymentController");

// Xử lý thanh toán giả lập
router.post("/:bookingCode", processPayment);

module.exports = router;
