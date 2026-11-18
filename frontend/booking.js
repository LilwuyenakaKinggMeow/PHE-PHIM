
"use strict";

// ========================================
// CẤU HÌNH THANH TOÁN
// ========================================

let selectedPaymentMethod = "momo";
let isProcessingPayment = false;


// ========================================
// LẤY TỔNG TIỀN GHẾ ĐÃ CHỌN
// ========================================

function getTotalAmount() {
    if (!window.seatState) return 0;

    return window.seatState.seats
        .filter(seat =>
            window.seatState.selectedSeats.includes(seat.code)
        )
        .reduce((total, seat) => total + seat.price, 0);
}
window.loadSeats();

// ========================================
// CẬP NHẬT NÚT THANH TOÁN
// ========================================

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!checkoutBtn || !window.seatState) return;

    const hasSelectedSeats =
        window.seatState.selectedSeats.length > 0;

    const hasSelectedShowtime =
        Boolean(window.selectedShowtime);

    checkoutBtn.disabled =
        !(hasSelectedSeats && hasSelectedShowtime);
}


// ========================================
// ĐỊNH DẠNG TIỀN
// ========================================

function formatCurrency(amount) {
    return amount.toLocaleString("vi-VN") + " đ";
}


// ========================================
// MỞ MODAL THANH TOÁN
// ========================================

function openPaymentModal() {
    const paymentModal = document.getElementById("paymentModal");
    const modalTotalBadge = document.getElementById("modalTotalBadge");

    if (!paymentModal) return;

    updateCheckoutButton();

    const checkoutBtn = document.getElementById("checkoutBtn");

    if (checkoutBtn && checkoutBtn.disabled) {
        alert("Vui lòng chọn ghế và suất chiếu trước khi thanh toán!");
        return;
    }

    if (modalTotalBadge) {
        modalTotalBadge.textContent =
            formatCurrency(getTotalAmount());
    }

    paymentModal.classList.add("active");
}


// ========================================
// ĐÓNG MODAL THANH TOÁN
// ========================================

function closePaymentModal() {
    const paymentModal = document.getElementById("paymentModal");

    if (paymentModal) {
        paymentModal.classList.remove("active");
    }
}


// ========================================
// CHỌN PHƯƠNG THỨC THANH TOÁN
// ========================================

function setupPaymentMethods() {
    const methods = document.querySelectorAll(".pay-method-card");
    const qrMethodTitle = document.getElementById("qrMethodTitle");

    methods.forEach(method => {
        method.addEventListener("click", () => {
            methods.forEach(item => {
                item.classList.remove("active");
            });

            method.classList.add("active");

            selectedPaymentMethod = method.dataset.method;

            if (qrMethodTitle) {
                const methodNames = {
                    momo: "Thanh toán qua MoMo",
                    vnpay: "Thanh toán qua VNPay",
                    card: "Thanh toán bằng thẻ"
                };

                qrMethodTitle.textContent =
                    methodNames[selectedPaymentMethod] ||
                    "Phương thức thanh toán";
            }
        });
    });
}


// ========================================
// TẠO MÃ GIAO DỊCH
// ========================================

function generateTransactionCode() {
    const randomCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return "PPH-" + Date.now().toString().slice(-6) + randomCode;
}


// ========================================
// HIỂN THỊ VÉ ĐIỆN TỬ
// ========================================

function showETicket() {
    const ticketModal = document.getElementById("ticketModal");

    if (!ticketModal) return;

    const movie = window.selectedMovie;
    const showtime = window.selectedShowtime;
    const cinemaSelect = document.getElementById("cinemaSelect");

    const selectedSeats = window.seatState.selectedSeats;

    const movieTitle = document.getElementById("ticketMovieTitle");
    const cinemaName = document.getElementById("ticketCinemaName");
    const showtimeText = document.getElementById("ticketShowtimeText");
    const seatsText = document.getElementById("ticketSeatsText");
    const codeText = document.getElementById("ticketCodeText");

    if (movieTitle) {
        movieTitle.textContent = movie ? movie.title : "PHÊ PHIM";
    }

    if (cinemaName) {
        cinemaName.textContent =
            cinemaSelect?.selectedOptions[0]?.textContent ||
            "Rạp PHÊ PHIM";
    }

    if (showtimeText) {
        const today = new Date();

        const dateText = today.toLocaleDateString("vi-VN");

        showtimeText.textContent =
            `${showtime} - ${dateText}`;
    }

    if (seatsText) {
        seatsText.textContent = selectedSeats.join(", ");
    }

    if (codeText) {
        codeText.textContent = generateTransactionCode();
    }

    closePaymentModal();

    ticketModal.classList.add("active");
}


// ========================================
// XÁC NHẬN THANH TOÁN
// ========================================

function confirmPayment() {
    if (isProcessingPayment) return;

    const selectedSeats = window.seatState?.selectedSeats || [];

    if (selectedSeats.length === 0 || !window.selectedShowtime) {
        alert("Vui lòng chọn ghế và suất chiếu!");
        return;
    }

    const confirmBtn = document.getElementById("confirmPaymentBtn");

    isProcessingPayment = true;

    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Đang xử lý...";
    }

    // Mô phỏng thanh toán thành công
    setTimeout(() => {
        showETicket();

        isProcessingPayment = false;

        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = "Xác nhận thanh toán";
        }
    }, 1000);
}


// ========================================
// ĐÓNG MODAL VÉ
// ========================================

function closeTicketModal() {
    const ticketModal = document.getElementById("ticketModal");

    if (ticketModal) {
        ticketModal.classList.remove("active");
    }
}


// ========================================
// HOÀN TẤT ĐẶT VÉ
// ========================================

function finishBooking() {
    window.location.href = "index.html";
}


// ========================================
// ĐÓNG MODAL KHI BẤM RA NGOÀI
// ========================================

function setupModalBackdrop() {
    const paymentModal = document.getElementById("paymentModal");
    const ticketModal = document.getElementById("ticketModal");

    if (paymentModal) {
        paymentModal.addEventListener("click", event => {
            if (event.target === paymentModal) {
                closePaymentModal();
            }
        });
    }

    if (ticketModal) {
        ticketModal.addEventListener("click", event => {
            if (event.target === ticketModal) {
                closeTicketModal();
            }
        });
    }
}


// ========================================
// KHỞI TẠO SỰ KIỆN
// ========================================

function initBookingPayment() {
    const checkoutBtn = document.getElementById("checkoutBtn");
    const closePaymentBtn = document.getElementById("closePaymentModal");
    const confirmBtn = document.getElementById("confirmPaymentBtn");
    const closeTicketBtn = document.getElementById("closeTicketModal");
    const finishBtn = document.getElementById("finishBookingBtn");

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", openPaymentModal);
    }

    if (closePaymentBtn) {
        closePaymentBtn.addEventListener("click", closePaymentModal);
    }

    if (confirmBtn) {
        confirmBtn.addEventListener("click", confirmPayment);
    }

    if (closeTicketBtn) {
        closeTicketBtn.addEventListener("click", closeTicketModal);
    }

    if (finishBtn) {
        finishBtn.addEventListener("click", finishBooking);
    }

    setupPaymentMethods();
    setupModalBackdrop();
    updateCheckoutButton();
}


// ========================================
// EXPOSE FUNCTIONS
// ========================================

window.updateCheckoutButton = updateCheckoutButton;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.confirmPayment = confirmPayment;
window.closeTicketModal = closeTicketModal;
window.finishBooking = finishBooking;


// ========================================
// CHẠY KHI TRANG ĐÃ TẢI
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    initBookingPayment();
});
