
"use strict";

// ==============================
// CẤU HÌNH GHẾ
// ==============================

const SEAT_CONFIG = {
    standard: 85000,
    vip: 115000,
    sweetbox: 240000
};

const MAX_SEATS = 6;
const SEAT_API_URL = "http://localhost:3000/api/seats";

// ==============================
// TRẠNG THÁI GHẾ
// ==============================

const seatState = {
    selectedSeats: [],
    seats: [],
    loading: false
};

window.seatState = seatState;

// ==============================
// TẢI GHẾ TỪ DATABASE
// ==============================

async function loadSeats() {
    const container = document.getElementById("seatGrid");

    if (!container) return;

    const showtimeId = window.selectedShowtimeId;

    if (!showtimeId) {
        container.innerHTML =
            '<p class="seat-message">Vui lòng chọn suất chiếu để xem sơ đồ ghế.</p>';
        seatState.seats = [];
        seatState.selectedSeats = [];
        updateSelectedSeats();
        return;
    }

    seatState.loading = true;

    container.innerHTML =
        '<p class="seat-message">Đang tải sơ đồ ghế...</p>';

    try {
        const response = await fetch(
            `${SEAT_API_URL}?showtime=${encodeURIComponent(showtimeId)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Không thể tải sơ đồ ghế.");
        }

        seatState.seats = result.data.map(item => ({
            id: item.id,
            cinemaId: item.cinema_id,
            code: item.seat_code,
            type: item.seat_type,
            price: SEAT_CONFIG[item.seat_type] || SEAT_CONFIG.standard,
            status: item.status
        }));

        // Loại bỏ ghế đã không còn trong danh sách hoặc đã được đặt
        seatState.selectedSeats = seatState.selectedSeats.filter(code =>
            seatState.seats.some(seat =>
                seat.code === code && seat.status === "available"
            )
        );

        renderSeatSelection();

    } catch (error) {
        console.error("Load seats error:", error);

        container.innerHTML =
            '<p class="seat-message">Không thể tải sơ đồ ghế. Vui lòng thử lại.</p>';

    } finally {
        seatState.loading = false;
    }
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
    button.dataset.id = seat.id;

    button.classList.add(seat.type);

    if (seat.status === "booked") {
        button.classList.add("booked");
        button.disabled = true;
        button.title = "Ghế đã được đặt";
    } else if (seat.status === "held") {
        button.classList.add("held");
        button.disabled = true;
        button.title = "Ghế đang được giữ";
    } else {
        button.disabled = false;

        if (seatState.selectedSeats.includes(seat.code)) {
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        } else {
            button.setAttribute("aria-pressed", "false");
        }

        button.addEventListener("click", () => {
            toggleSeat(seat.code);
        });
    }

    return button;
}

// ==============================
// HIỂN THỊ SƠ ĐỒ GHẾ
// ==============================

function renderSeatSelection() {
    const container = document.getElementById("seatGrid");

    if (!container) return;

    container.replaceChildren();

    const rows = [...new Set(
        seatState.seats.map(seat => seat.code.charAt(0))
    )];

    rows.forEach(row => {
        const rowElement = document.createElement("div");

        rowElement.className = "seat-row";
        rowElement.dataset.row = row;

        const rowSeats = seatState.seats.filter(seat =>
            seat.code.startsWith(row)
        );

        rowSeats.forEach(seat => {
            rowElement.appendChild(createSeatElement(seat));
        });

        container.appendChild(rowElement);
    });

    updateSelectedSeats();

    if (typeof window.updateCheckoutButton === "function") {
        window.updateCheckoutButton();
    }
}

// ==============================
// CHỌN / BỎ CHỌN GHẾ
// ==============================

function toggleSeat(code) {
    const seat = seatState.seats.find(item => item.code === code);

    if (!seat || seat.status !== "available") return;

    const index = seatState.selectedSeats.indexOf(code);

    if (index !== -1) {
        seatState.selectedSeats.splice(index, 1);
    } else {
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

    const total = selected.reduce(
        (sum, seat) => sum + seat.price,
        0
    );

    if (countElement) {
        countElement.textContent = selected.length;
    }

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

    if (totalElement) {
        totalElement.textContent =
            total.toLocaleString("vi-VN") + " đ";
    }

    if (clearBtn) {
        clearBtn.disabled = selected.length === 0;
        clearBtn.classList.toggle("hidden", selected.length === 0);
    }

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

    if (!clearBtn || clearBtn.dataset.initialized) return;

    clearBtn.dataset.initialized = "true";

    clearBtn.addEventListener("click", resetSelectedSeats);
}

// ==============================
// KHỞI TẠO
// ==============================

function initSeatSelection() {
    const container = document.getElementById("seatGrid");

    if (!container) return;

    setupClearSeatsButton();

    // Tải ghế khi đã có suất chiếu
    if (window.selectedShowtimeId) {
        loadSeats();
    }
}

// ==============================
// CHIA SẺ HÀM
// ==============================

window.loadSeats = loadSeats;
window.updateSelectedSeats = updateSelectedSeats;
window.resetSelectedSeats = resetSelectedSeats;
window.renderSeatSelection = renderSeatSelection;

// ==============================
// KHỞI ĐỘNG
// ==============================

document.addEventListener("DOMContentLoaded", initSeatSelection);
