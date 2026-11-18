
"use strict";

// Cấu hình sơ đồ ghế
const SEAT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const SEAT_CONFIG = {
    standard: 85000,
    vip: 115000,
    sweetbox: 240000
};

const MAX_SEATS = 6;

// Trạng thái ghế
const seatState = {
    selectedSeats: [],
    seats: []
};

// Tạo dữ liệu ghế
function createSeatData() {
    const seats = [];

    SEAT_ROWS.forEach(row => {
        const isSweetbox = row === "H";
        const isVip = ["D", "E", "F", "G"].includes(row);

        const total = isSweetbox ? 6 : 12;

        for (let col = 1; col <= total; col++) {
            const code = isSweetbox
                ? `${row}${col * 2 - 1}-${col * 2}`
                : `${row}${col}`;

            const type = isSweetbox
                ? "sweetbox"
                : isVip
                    ? "vip"
                    : "standard";

            seats.push({
                id: code,
                code,
                row,
                type,
                price: SEAT_CONFIG[type],
                status: "available"
            });
        }
    });

    return seats;
}

// Hiển thị sơ đồ ghế
function renderSeatSelection() {
    const grid = document.getElementById("seatGrid");

    if (!grid) return;

    grid.replaceChildren();

    SEAT_ROWS.forEach(row => {
        const rowElement = document.createElement("div");
        rowElement.className = "seat-row";

        const label = document.createElement("span");
        label.className = "row-label";
        label.textContent = row;

        const container = document.createElement("div");
        container.className = "seats-in-row";

        const rowSeats = seatState.seats.filter(
            seat => seat.row === row
        );

        rowSeats.forEach((seat, index) => {
            if (
                (row !== "H" && index === 6) ||
                (row === "H" && index === 3)
            ) {
                const gap = document.createElement("div");
                gap.className = "seat-gap";
                container.append(gap);
            }

            const button = document.createElement("button");

            button.type = "button";
            button.className = `seat ${seat.type}`;
            button.textContent = seat.code;

            if (seatState.selectedSeats.includes(seat.code)) {
                button.classList.add("selected");
            }

            button.addEventListener("click", () => {
                toggleSeat(seat.code);
            });

            container.append(button);
        });

        const rightLabel = label.cloneNode(true);

        rowElement.append(label, container, rightLabel);
        grid.append(rowElement);
    });

    updateSelectedSeats();
}

// Chọn hoặc bỏ chọn ghế
function toggleSeat(code) {
    const index = seatState.selectedSeats.indexOf(code);

    if (index >= 0) {
        seatState.selectedSeats.splice(index, 1);
    } else {
        if (seatState.selectedSeats.length >= MAX_SEATS) {
            alert(`Bạn chỉ được chọn tối đa ${MAX_SEATS} ghế.`);
            return;
        }

        seatState.selectedSeats.push(code);
    }

    renderSeatSelection();
}

// Cập nhật thông tin ghế
function updateSelectedSeats() {
    const countElement = document.getElementById("selectedCountNum");
    const container = document.getElementById("selectedSeatsContainer");
    const totalElement = document.getElementById("totalAmountText");
    const clearBtn = document.getElementById("clearAllSeats");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const selected = seatState.seats.filter(seat =>
        seatState.selectedSeats.includes(seat.code)
    );

    const total = selected.reduce(
        (sum, seat) => sum + seat.price,
        0
    );

    if (countElement) {
        countElement.textContent = selected.length;
    }

    if (container) {
        if (selected.length > 0) {
            container.textContent = selected
                .map(seat => seat.code)
                .join(", ");
        } else {
            container.innerHTML = `
                <div class="empty-seats-placeholder">
                    Vui lòng chọn suất chiếu trước, sau đó chọn ghế.
                </div>
            `;
        }
    }

    if (totalElement) {
        totalElement.textContent =
            new Intl.NumberFormat("vi-VN").format(total) + " đ";
    }

    // Hiện hoặc ẩn nút Xóa tất cả
    if (clearBtn) {
        clearBtn.classList.toggle("hidden", selected.length === 0);
    }

    // Khóa hoặc mở nút thanh toán
    if (checkoutBtn) {
        checkoutBtn.disabled = selected.length === 0;
    }
}

// Xóa toàn bộ ghế đang chọn
function resetSelectedSeats() {
    seatState.selectedSeats = [];
    renderSeatSelection();
}

// Cho phép script.js gọi hàm này
window.resetSelectedSeats = resetSelectedSeats;

// Gắn sự kiện nút Xóa tất cả
function setupClearSeatsButton() {
    const clearBtn = document.getElementById("clearAllSeats");

    if (!clearBtn) return;

    clearBtn.addEventListener("click", () => {
        resetSelectedSeats();
    });
}

// Khởi tạo sơ đồ ghế
function initSeatSelection() {
    const grid = document.getElementById("seatGrid");

    if (!grid) return;

    seatState.seats = createSeatData();

    renderSeatSelection();
    setupClearSeatsButton();
}

document.addEventListener("DOMContentLoaded", initSeatSelection);
