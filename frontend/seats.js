
"use strict";

// ==============================
// CẤU HÌNH GHẾ
// ==============================

const SEAT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const SEAT_CONFIG = {
    standard: 85000,
    vip: 115000,
    sweetbox: 240000
};

const MAX_SEATS = 6;

// ==============================
// TRẠNG THÁI GHẾ
// ==============================

const seatState = {
    selectedSeats: [],
    seats: []
};

// Chia sẻ trạng thái ghế với booking.js
window.seatState = seatState;

// ==============================
// TẠO DỮ LIỆU GHẾ
// ==============================

function createSeatData() {
    const seats = [];

    SEAT_ROWS.forEach(row => {
        // Hàng H dành cho ghế đôi
        const seatCount = row === "H" ? 6 : 12;

        for (let i = 1; i <= seatCount; i++) {
            const code = row + i;

            let type = "standard";

            if (row === "H") {
                type = "sweetbox";
            } else if (["D", "E", "F", "G"].includes(row)) {
                type = "vip";
            }

            seats.push({
                code,
                type,
                price: SEAT_CONFIG[type],
                status: "available"
            });
        }
    });

    return seats;
}

// ==============================
// TẠO PHẦN TỬ GHẾ
// ==============================

function createSeatElement(seat) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "seat";
    button.textContent = seat.code;

    button.dataset.seat = seat.code;
    button.dataset.type = seat.type;

    // Phân loại ghế
    if (seat.type === "standard") {
        button.classList.add("standard");
    }

    if (seat.type === "vip") {
        button.classList.add("vip");
    }

    if (seat.type === "sweetbox") {
        button.classList.add("sweetbox");
    }

    // Kiểm tra ghế đã chọn
    if (seatState.selectedSeats.includes(seat.code)) {
        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
    } else {
        button.setAttribute("aria-pressed", "false");
    }

    // Sự kiện chọn ghế
    button.addEventListener("click", () => {
        toggleSeat(seat.code);
    });

    return button;
}

// ==============================
// HIỂN THỊ SƠ ĐỒ GHẾ
// ==============================

function renderSeatSelection() {
    const container = document.getElementById("seatGrid");

    if (!container) return;

    container.replaceChildren();

    SEAT_ROWS.forEach(row => {
        const rowElement = document.createElement("div");

        rowElement.className = "seat-row";
        rowElement.dataset.row = row;

        const rowSeats = seatState.seats.filter(seat =>
            seat.code.startsWith(row)
        );

        rowSeats.forEach(seat => {
            const seatElement = createSeatElement(seat);

            rowElement.appendChild(seatElement);
        });

        container.appendChild(rowElement);
    });

    updateSelectedSeats();

    // Cập nhật điều kiện thanh toán
    if (typeof window.updateCheckoutButton === "function") {
        window.updateCheckoutButton();
    }
}

// ==============================
// CHỌN / BỎ CHỌN GHẾ
// ==============================

function toggleSeat(code) {
    const index = seatState.selectedSeats.indexOf(code);

    // Nếu ghế đã được chọn thì bỏ chọn
    if (index !== -1) {
        seatState.selectedSeats.splice(index, 1);
    } else {
        // Giới hạn số lượng ghế
        if (seatState.selectedSeats.length >= MAX_SEATS) {
            alert(`Bạn chỉ được chọn tối đa ${MAX_SEATS} ghế!`);
            return;
        }

        seatState.selectedSeats.push(code);
    }

    renderSeatSelection();
}

// ==============================
// CẬP NHẬT GHẾ ĐÃ CHỌN
// ==============================

function updateSelectedSeats() {
    const countElement = document.getElementById("selectedCountNum");
    const container = document.getElementById("selectedSeatsContainer");
    const totalElement = document.getElementById("totalAmountText");
    const clearBtn = document.getElementById("clearAllSeats");

    const selected = seatState.seats.filter(seat =>
        seatState.selectedSeats.includes(seat.code)
    );

    // Tổng tiền
    const total = selected.reduce(
        (sum, seat) => sum + seat.price,
        0
    );

    // Cập nhật số lượng ghế
    if (countElement) {
        countElement.textContent = selected.length;
    }

    // Cập nhật danh sách ghế
    if (container) {
        container.replaceChildren();

        if (selected.length === 0) {
            const empty = document.createElement("div");

            empty.className = "empty-seats-placeholder";
            empty.textContent = "Vui lòng chọn ghế yêu thích bên dưới.";

            container.appendChild(empty);
        } else {
            selected.forEach(seat => {
                const item = document.createElement("div");

                item.className = "selected-seat-item";
                item.textContent =
                    `${seat.code} · ${seat.price.toLocaleString("vi-VN")} đ`;

                container.appendChild(item);
            });
        }
    }

    // Cập nhật tổng tiền
    if (totalElement) {
        totalElement.textContent =
            total.toLocaleString("vi-VN") + " đ";
    }

    // Cập nhật nút xóa ghế
    if (clearBtn) {
        clearBtn.disabled = selected.length === 0;
        clearBtn.classList.toggle("hidden", selected.length === 0);
    }

    // Cập nhật nút thanh toán
    if (typeof window.updateCheckoutButton === "function") {
        window.updateCheckoutButton();
    }
}

// ==============================
// XÓA TOÀN BỘ GHẾ ĐÃ CHỌN
// ==============================

function resetSelectedSeats() {
    seatState.selectedSeats = [];

    renderSeatSelection();
}

// ==============================
// SỰ KIỆN XÓA GHẾ
// ==============================

function setupClearSeatsButton() {
    const clearBtn = document.getElementById("clearAllSeats");

    if (!clearBtn) return;

    clearBtn.addEventListener("click", () => {
        resetSelectedSeats();
    });
}

// ==============================
// KHỞI TẠO SƠ ĐỒ GHẾ
// ==============================

function initSeatSelection() {
    const container = document.getElementById("seatGrid");

    // Chỉ chạy tại trang đặt vé
    if (!container) return;

    seatState.seats = createSeatData();

    renderSeatSelection();

    setupClearSeatsButton();
}

// ==============================
// CHIA SẺ HÀM VỚI FILE KHÁC
// ==============================

window.updateSelectedSeats = updateSelectedSeats;
window.resetSelectedSeats = resetSelectedSeats;
window.renderSeatSelection = renderSeatSelection;

// ==============================
// KHỞI ĐỘNG
// ==============================

document.addEventListener("DOMContentLoaded", initSeatSelection);
