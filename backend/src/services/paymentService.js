
"use strict";

const crypto = require("crypto");

const ALLOWED_METHODS = ["momo", "vnpay", "card"];

// Thanh toán giả lập, không kết nối cổng thanh toán thật
async function processSimulatedPayment({
    bookingCode,
    amount,
    paymentMethod,
    simulateFailure = false
}) {
    if (!ALLOWED_METHODS.includes(paymentMethod)) {
        throw new Error("Phương thức thanh toán không hợp lệ.");
    }

    // Mô phỏng kết quả thanh toán
    if (simulateFailure) {
        return {
            success: false,
            message: "Thanh toán giả lập thất bại.",
            transactionRef: null
        };
    }

    return {
        success: true,
        message: "Thanh toán giả lập thành công.",
        transactionRef: `SIM-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        bookingCode,
        amount: Number(amount),
        paymentMethod,
        paidAt: new Date().toISOString()
    };
}

module.exports = {
    processSimulatedPayment,
    ALLOWED_METHODS
};
