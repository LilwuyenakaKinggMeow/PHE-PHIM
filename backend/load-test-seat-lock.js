"use strict";

const redisClient = require("./src/config/redis");
const {
    releaseSeatLock
} = require("./src/services/seatLockService");

const TOTAL_USERS = 500;
const SHOWTIME_ID = 492;
const SEAT_ID = 73;

async function main() {
    let winnerToken = null;

    try {
        await redisClient.connect();

        console.log(`Bat dau ${TOTAL_USERS} nguoi tranh chap ghe A10...`);

        const start = Date.now();

        const results = await Promise.all(
            Array.from({ length: TOTAL_USERS }, async (_, index) => {
                try {
                    const response = await fetch(
                        "http://localhost:3000/api/seat-locks",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                showtimeId: SHOWTIME_ID,
                                seatIds: [SEAT_ID]
                            })
                        }
                    );

                    const body = await response.json();

                    if (
                        body.success &&
                        body.data &&
                        body.data.lockToken
                    ) {
                        winnerToken = body.data.lockToken;
                    }

                    return {
                        user: index + 1,
                        status: response.status,
                        success: body.success,
                        message: body.message
                    };
                } catch (error) {
                    return {
                        user: index + 1,
                        status: 0,
                        success: false,
                        message: error.message
                    };
                }
            })
        );

        const elapsed = Date.now() - start;

        const successCount = results.filter(
            item => item.success
        ).length;

        const conflictCount = results.filter(
            item => item.status === 409
        ).length;

        const otherCount = TOTAL_USERS - successCount - conflictCount;

        console.log("\n========== KET QUA ==========");
        console.log("Tong nguoi dung:", TOTAL_USERS);
        console.log("Thanh cong:", successCount);
        console.log("Bi tu choi (409):", conflictCount);
        console.log("Loi khac:", otherCount);
        console.log("Thoi gian:", elapsed, "ms");

        console.log("\nMa HTTP:");
        console.table(
            results.reduce((acc, item) => {
                const key = item.status || "Network Error";
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {})
        );

        if (successCount !== 1) {
            console.log("CAN KIEM TRA: So luong lock thanh cong khong bang 1.");
        }

        if (winnerToken) {
            await releaseSeatLock(
                SHOWTIME_ID,
                SEAT_ID,
                winnerToken
            );

            console.log("\nDa giai phong khoa Redis cua nguoi thang.");
        }

    } catch (error) {
        console.error("Load test error:", error);
    } finally {
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
    }
}

main();
