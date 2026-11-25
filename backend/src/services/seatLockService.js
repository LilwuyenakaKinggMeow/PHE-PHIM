
"use strict";

const crypto = require("crypto");
const redisClient = require("../config/redis");

const LOCK_TTL = 5 * 60 * 1000; // 5 phút

// Tạo khóa riêng cho từng ghế và suất chiếu
function getSeatLockKey(showtimeId, seatId) {
    return `phephim:lock:showtime:${showtimeId}:seat:${seatId}`;
}

// Tạo mã nhận diện người đang giữ ghế
function generateLockToken() {
    return crypto.randomBytes(32).toString("hex");
}

// Giữ một ghế trong Redis
async function acquireSeatLock(showtimeId, seatId, token) {
    const key = getSeatLockKey(showtimeId, seatId);

    const result = await redisClient.set(key, token, {
        NX: true,
        PX: LOCK_TTL
    });

    return result === "OK";
}

// Kiểm tra người dùng có đang sở hữu khóa không
async function verifySeatLock(showtimeId, seatId, token) {
    const key = getSeatLockKey(showtimeId, seatId);
    const currentToken = await redisClient.get(key);

    return currentToken === token;
}

// Chỉ người sở hữu khóa mới được giải phóng khóa
async function releaseSeatLock(showtimeId, seatId, token) {
    const key = getSeatLockKey(showtimeId, seatId);

    const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
        end
        return 0
    `;

    return await redisClient.eval(script, {
        keys: [key],
        arguments: [token]
    });
}

module.exports = {
    LOCK_TTL,
    getSeatLockKey,
    generateLockToken,
    acquireSeatLock,
    verifySeatLock,
    releaseSeatLock
};
