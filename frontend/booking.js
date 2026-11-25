
"use strict";

// ========================================
// CẤU HÌNH
// ========================================

const BOOKING_API_URL = "/api/bookings";
const SEAT_LOCK_API_URL = "/api/seat-locks";
const PAYMENT_API_URL = "/api/payments";

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


// ========================================
// ĐỊNH DẠNG TIỀN
// ========================================

function formatCurrency(amount) {
    return Number(amount).toLocaleString("vi-VN") + " đ";
}


// ========================================
// CẬP NHẬT NÚT THANH TOÁN
// ========================================

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!checkoutBtn || !window.seatState) return;

    const hasSelectedSeats =
        window.seatState.selectedSeats.length > 0;

    const hasSelectedShowtime =
        Boolean(window.selectedShowtimeId);

    checkoutBtn.disabled =
        !(hasSelectedSeats && hasSelectedShowtime);
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
// ĐỊNH DẠNG NGÀY CHIẾU
// ========================================

function formatShowDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("vi-VN");
}


// ========================================
// HIỂN THỊ VÉ ĐIỆN TỬ
// ========================================

function showETicket(bookingData) {
    const ticketModal = document.getElementById("ticketModal");

    if (!ticketModal) return;

    const movie = window.selectedMovie;
    const cinemaSelect = document.getElementById("cinemaSelect");

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
        const selectedDate =
            document.getElementById("showDate")?.value;

        const dateText = formatShowDate(selectedDate);

        const timeText =
            bookingData.startTime?.slice(0, 5) ||
            window.selectedShowtime;

        showtimeText.textContent =
            `${timeText} - ${dateText}`;
    }

    if (seatsText) {
        seatsText.textContent = bookingData.seats
            .map(seat => seat.code)
            .join(", ");
    }

    if (codeText) {
        codeText.textContent = bookingData.bookingCode;
    }

    closePaymentModal();

    ticketModal.classList.add("active");
}


// ========================================
// XÁC NHẬN ĐẶT VÉ VỚI BACKEND
// ========================================


async function confirmPayment() {
    if (isProcessingPayment) return;

    const confirmBtn =
        document.getElementById("confirmPaymentBtn");

    const customerName =
        document.getElementById("customerName")?.value.trim();

    const customerEmail =
        document.getElementById("customerEmail")?.value.trim();

    const selectedSeats =
        window.seatState?.selectedSeats || [];

    const showtimeId =
        Number(window.selectedShowtimeId);

    // 1. Kiểm tra thông tin khách hàng
    if (!customerName) {
        alert("Vui lòng nhập họ và tên!");
        document.getElementById("customerName")?.focus();
        return;
    }

    if (!customerEmail) {
        alert("Vui lòng nhập email!");
        document.getElementById("customerEmail")?.focus();
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        alert("Địa chỉ email không hợp lệ!");
        document.getElementById("customerEmail")?.focus();
        return;
    }

    if (!showtimeId || selectedSeats.length === 0) {
        alert("Vui lòng chọn ghế và suất chiếu!");
        return;
    }

    // 2. Chuyển mã ghế thành ID database
    const selectedSeatIds = window.seatState.seats
        .filter(seat => selectedSeats.includes(seat.code))
        .map(seat => seat.id);

    if (selectedSeatIds.length !== selectedSeats.length) {
        alert("Không thể xác định ghế đã chọn. Vui lòng tải lại danh sách ghế.");
        return;
    }

    isProcessingPayment = true;

    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Đang xử lý...";
    }

    try {
        // 3. Khóa ghế bằng Redis
        const lockResponse = await fetch(SEAT_LOCK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                showtimeId,
                seatIds: selectedSeatIds
            })
        });

        const lockResult = await lockResponse.json();

        if (!lockResponse.ok || !lockResult.success) {
            throw new Error(
                lockResult.message || "Không thể giữ ghế."
            );
        }

        const lockToken = lockResult.data.lockToken;

        if (!lockToken) {
            throw new Error("Không nhận được mã khóa ghế từ server.");
        }

        // 4. Tạo đơn đặt vé
        const bookingResponse = await fetch(BOOKING_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                showtimeId,
                customerName,
                customerEmail,
                seatIds: selectedSeatIds,
                lockToken
            })
        });

        const bookingResult = await bookingResponse.json();

        if (!bookingResponse.ok || !bookingResult.success) {
            throw new Error(
                bookingResult.message || "Không thể tạo đơn đặt vé."
            );
        }

        const bookingData = bookingResult.data;

        // 5. Gọi API thanh toán giả lập
        const paymentResponse = await fetch(
            `${PAYMENT_API_URL}/${encodeURIComponent(bookingData.bookingCode)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    lockToken,
                    paymentMethod: selectedPaymentMethod,
                    simulateFailure: false
                })
            }
        );

        const paymentResult = await paymentResponse.json();

        if (
            !paymentResponse.ok ||
            !paymentResult.success ||
            paymentResult.data?.status !== "confirmed"
        ) {
            throw new Error(
                paymentResult.message || "Thanh toán không thành công."
            );
        }

        // 6. Chỉ hiển thị vé sau khi thanh toán thành công
        bookingData.status = paymentResult.data.status;

        showETicket(bookingData);

        // Cập nhật lại trạng thái ghế
        if (typeof window.loadSeats === "function") {
            await window.loadSeats();
        }

    } catch (error) {
        console.error("Booking/Payment error:", error);

        alert(error.message || "Có lỗi xảy ra trong quá trình đặt vé.");

        // Cập nhật lại trạng thái ghế trên giao diện
        if (typeof window.loadSeats === "function") {
            try {
                await window.loadSeats();
            } catch (reloadError) {
                console.error("Reload seats error:", reloadError);
            }
        }

    } finally {
        isProcessingPayment = false;

        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = "Thanh Toán";
        }
    }
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
    const checkoutBtn =
        document.getElementById("checkoutBtn");

    const closePaymentBtn =
        document.getElementById("closePaymentModal");

    const confirmBtn =
        document.getElementById("confirmPaymentBtn");

    const closeTicketBtn =
        document.getElementById("closeTicketModal");

    const finishBtn =
        document.getElementById("finishBookingBtn");

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
