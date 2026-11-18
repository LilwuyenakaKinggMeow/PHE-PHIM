
"use strict";

// ========================================
// PHE PHIM - BOOKING
// Redis + PostgreSQL + Thanh toan gia lap
// ========================================

(() => {
    const API = "http://localhost:3000/api";
    const HOLD_SECONDS = 300;

    let currentHold = null;
    let countdownInterval = null;
    let expiresAt = 0;
    let isProcessing = false;
    let selectedPaymentMethod = "momo";

    const $booking = id => document.getElementById(id);

    function showMessage(message) {
        alert(message);
    }

    function formatMoney(amount) {
        return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
    }

    function openModal(id) {
        const modal = $booking(id);
        if (!modal) return;

        modal.classList.remove("hidden");
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
    }

    function closeModal(id) {
        const modal = $booking(id);
        if (!modal) return;

        modal.classList.add("hidden");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    }

    function getSelectedSeat() {
        if (typeof seatState === "undefined") return null;

        return seatState.selectedSeats[0] || null;
    }

    function getSelectedSeatPrice() {
        const code = getSelectedSeat();

        if (!code || typeof seatState === "undefined") {
            return 0;
        }

        const seat = seatState.seats.find(item => item.code === code);

        return seat ? seat.price : 0;
    }

    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    function clearHoldState() {
        stopCountdown();
        currentHold = null;
        expiresAt = 0;

        const timerBox = $booking("holdTimerBox");
        if (timerBox) timerBox.classList.add("hidden");
    }

    function updateCountdown() {
        const timer = $booking("timerCountdown");
        if (!timer || !currentHold) return;

        const seconds = Math.max(
            0,
            Math.ceil((expiresAt - Date.now()) / 1000)
        );

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        timer.textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(remainingSeconds).padStart(2, "0");

        if (seconds === 0) {
            clearHoldState();
            closeModal("paymentModal");

            showMessage(
                "Hết thời gian giữ ghế 5 phút. Vui lòng chọn lại ghế."
            );

            if (typeof window.resetSelectedSeats === "function") {
                window.resetSelectedSeats();
            }

            if (
                window.selectedShowtimeId &&
                typeof window.loadSeatsFromAPI === "function"
            ) {
                window.loadSeatsFromAPI(window.selectedShowtimeId);
            }
        }
    }

    function startCountdown() {
        stopCountdown();

        expiresAt = Date.now() + HOLD_SECONDS * 1000;

        const timerBox = $booking("holdTimerBox");
        if (timerBox) timerBox.classList.remove("hidden");

        updateCountdown();

        countdownInterval = setInterval(updateCountdown, 1000);
    }

    async function requestHold(showtimeId, seatCode) {
        const response = await fetch(`${API}/seats/hold`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                showtimeId,
                seatCode
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Không thể giữ ghế."
            );
        }

        return data;
    }

    async function confirmBooking(paymentResult) {
        if (!currentHold || isProcessing) return;

        isProcessing = true;

        const confirmBtn = $booking("confirmPaymentBtn");

        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Đang xử lý...";
        }

        try {
            const response = await fetch(`${API}/bookings/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    showtimeId: currentHold.showtimeId,
                    seatCode: currentHold.seatCode,
                    holdToken: currentHold.holdToken,
                    customerName: "Khach hang PHE PHIM",
                    paymentResult
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Đặt vé thất bại."
                );
            }

            const bookedSeat = currentHold.seatCode;
            const bookedShowtime = window.selectedShowtime || "";

            clearHoldState();
            closeModal("paymentModal");

            if (paymentResult === "success") {
                showTicket(data, bookedSeat, bookedShowtime);

                if (typeof window.resetSelectedSeats === "function") {
                    window.resetSelectedSeats();
                }

                if (
                    window.selectedShowtimeId &&
                    typeof window.loadSeatsFromAPI === "function"
                ) {
                    await window.loadSeatsFromAPI(
                        window.selectedShowtimeId
                    );
                }
            } else {
                showMessage("Thanh toán giả lập thất bại.");

                if (typeof window.resetSelectedSeats === "function") {
                    window.resetSelectedSeats();
                }

                if (
                    window.selectedShowtimeId &&
                    typeof window.loadSeatsFromAPI === "function"
                ) {
                    await window.loadSeatsFromAPI(
                        window.selectedShowtimeId
                    );
                }
            }

        } catch (error) {
            console.error("Booking error:", error);
            showMessage(error.message);

        } finally {
            isProcessing = false;

            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent =
                    "Xác Nhận Thanh Toán (Giả Lập)";
            }
        }
    }

    function showTicket(data, seatCode, showtimeText) {
        const movieTitle =
            $booking("movieDetailTitle")?.textContent ||
            "PHÊ PHIM";

        const ticketTitle = $booking("ticketMovieTitle");
        const ticketCinema = $booking("ticketCinemaName");
        const ticketTime = $booking("ticketShowtimeText");
        const ticketSeats = $booking("ticketSeatsText");
        const ticketCode = $booking("ticketCodeText");

        if (ticketTitle) ticketTitle.textContent = movieTitle;
        if (ticketCinema) ticketCinema.textContent = "PHÊ PHIM";
        if (ticketTime) ticketTime.textContent = showtimeText;
        if (ticketSeats) ticketSeats.textContent = seatCode;

        if (ticketCode) {
    ticketCode.textContent =
        "PHEPHIM-" + data.bookingId;
}

        openModal("ticketModal");
    }

    async function handleCheckout() {
        if (isProcessing) return;

        const showtimeId = window.selectedShowtimeId;
        const seatCode = getSelectedSeat();

        if (!showtimeId) {
            showMessage("Vui lòng chọn suất chiếu.");
            return;
        }

        if (!seatCode) {
            showMessage("Vui lòng chọn ghế.");
            return;
        }

        if (currentHold) {
            showMessage(
                "Bạn đang giữ một ghế. Vui lòng hoàn tất hoặc chờ hết hạn."
            );
            return;
        }

        const checkoutBtn = $booking("checkoutBtn");
        isProcessing = true;

        if (checkoutBtn) checkoutBtn.disabled = true;

        try {
            const data = await requestHold(showtimeId, seatCode);

            currentHold = {
                showtimeId,
                seatCode,
                holdToken: data.holdToken
            };

            startCountdown();

            const totalBadge = $booking("modalTotalBadge");
            if (totalBadge) {
                totalBadge.textContent =
                    formatMoney(getSelectedSeatPrice());
            }

            openModal("paymentModal");

        } catch (error) {
            console.error("Hold error:", error);
            showMessage(error.message);

            if (typeof window.loadSeatsFromAPI === "function") {
                await window.loadSeatsFromAPI(showtimeId);
            }

        } finally {
            isProcessing = false;

            if (typeof window.updateSelectedSeats === "function") {
                window.updateSelectedSeats();
            }
        }
    }

    function setupPaymentMethods() {
        const cards = document.querySelectorAll(
            ".pay-method-card"
        );

        cards.forEach(card => {
            card.addEventListener("click", () => {
                selectedPaymentMethod =
                    card.dataset.method || "momo";

                cards.forEach(item =>
                    item.classList.remove("active")
                );

                card.classList.add("active");

                const methodTitle = $booking("qrMethodTitle");

                if (methodTitle) {
                    const names = {
                        momo: "MoMo (Giả lập)",
                        vnpay: "VNPay (Giả lập)",
                        card: "Thẻ ngân hàng (Giả lập)"
                    };

                    methodTitle.textContent =
                        names[selectedPaymentMethod] ||
                        "Thanh toán giả lập";
                }
            });
        });
    }

    function initBooking() {
        const checkoutBtn = $booking("checkoutBtn");
        const confirmBtn = $booking("confirmPaymentBtn");

        if (!checkoutBtn) return;

        checkoutBtn.addEventListener("click", handleCheckout);

        if (confirmBtn) {
            confirmBtn.textContent =
                "Xác Nhận Thanh Toán (Giả Lập)";

            confirmBtn.addEventListener("click", () => {
                confirmBooking("success");
            });
        }

        $booking("closePaymentModal")?.addEventListener(
            "click",
            () => closeModal("paymentModal")
        );

        $booking("closeTicketModal")?.addEventListener(
            "click",
            () => closeModal("ticketModal")
        );

        $booking("finishBookingBtn")?.addEventListener(
            "click",
            () => closeModal("ticketModal")
        );

        setupPaymentMethods();

        closeModal("paymentModal");
        closeModal("ticketModal");
    }

    document.addEventListener("DOMContentLoaded", initBooking);
})();
