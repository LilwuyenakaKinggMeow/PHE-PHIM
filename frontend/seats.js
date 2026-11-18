
"use strict";

// ========================================
// CAU HINH GHE - PHE PHIM
// ========================================

const SEAT_ROWS = [
    "A", "B", "C", "D", "E",
    "F", "G", "H", "I", "J"
];

const SEAT_PRICE = 75000;

// API xac nhan hien tai moi ho tro 1 ghe/lan
const MAX_SEATS = 1;

const seatState = {
    selectedSeats: [],
    seats: []
};

// ========================================
// HIEN THI SO DO GHE
// ========================================

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
            if (index === 5) {
                const gap = document.createElement("div");
                gap.className = "seat-gap";
                container.append(gap);
            }

            const button = document.createElement("button");

            button.type = "button";
            button.className = `seat ${seat.type}`;
            button.textContent = seat.code;
            button.title = `${seat.code} - ${seat.status}`;

            if (seat.status === "sold") {
                button.classList.add("sold");
                button.disabled = true;
            }

            if (seat.status === "held") {
                button.classList.add("held");
                button.disabled = true;
            }

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

// ========================================
// CHON GHE
// ========================================

function toggleSeat(code) {
    const seat = seatState.seats.find(
        item => item.code === code
    );

    if (!seat || seat.status !== "available") {
        alert("Ghế này không còn khả dụng.");
        return;
    }

    const index = seatState.selectedSeats.indexOf(code);

    if (index >= 0) {
        seatState.selectedSeats.splice(index, 1);
    } else {
        if (seatState.selectedSeats.length >= MAX_SEATS) {
            alert("Hiện tại chỉ hỗ trợ đặt 1 ghế mỗi lần.");
            return;
        }

        seatState.selectedSeats.push(code);
    }

    renderSeatSelection();
}

// ========================================
// CAP NHAT THONG TIN DAT VE
// ========================================

function updateSelectedSeats() {
    const countElement =
        document.getElementById("selectedCountNum");

    const container =
        document.getElementById("selectedSeatsContainer");

    const totalElement =
        document.getElementById("totalAmountText");

    const clearBtn =
        document.getElementById("clearAllSeats");

    const checkoutBtn =
        document.getElementById("checkoutBtn");

    const selected = seatState.seats.filter(
        seat => seatState.selectedSeats.includes(seat.code)
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
            container.innerHTML =
                '<div class="empty-seats-placeholder">' +
                'Vui lòng chọn ghế yêu thích bên dưới.' +
                '</div>';
        }
    }

    if (totalElement) {
        totalElement.textContent =
            new Intl.NumberFormat("vi-VN").format(total) +
            " đ";
    }

    if (clearBtn) {
        clearBtn.classList.toggle(
            "hidden",
            selected.length === 0
        );
    }

    if (checkoutBtn) {
        checkoutBtn.disabled =
            selected.length === 0 ||
            !window.selectedShowtimeId;
    }
}

window.updateSelectedSeats = updateSelectedSeats;

// ========================================
// XOA GHE DA CHON
// ========================================

function resetSelectedSeats() {
    seatState.selectedSeats = [];
    renderSeatSelection();
}

window.resetSelectedSeats = resetSelectedSeats;

// ========================================
// LAY 100 GHE TU POSTGRESQL + REDIS
// ========================================

async function loadSeatsFromAPI(showtimeId) {
    const grid = document.getElementById("seatGrid");

    if (!grid) return;

    // Khong cho dat ve trong luc tai du lieu
    seatState.seats = [];
    seatState.selectedSeats = [];
    grid.textContent = "Đang tải sơ đồ ghế...";
    updateSelectedSeats();

    try {
        const response = await fetch(
            `http://localhost:3000/api/seats?showtimeId=${showtimeId}`
        );

        if (!response.ok) {
            throw new Error("Không thể tải ghế");
        }

        const data = await response.json();

        // Bo qua ket qua cu neu nguoi dung doi suat chieu
        if (window.selectedShowtimeId !== showtimeId) {
            return;
        }

        if (!data.success || !Array.isArray(data.seats)) {
            throw new Error("Dữ liệu ghế không hợp lệ");
        }

        seatState.seats = data.seats.map(seat => ({
            id: seat.seatCode,
            code: seat.seatCode,
            row: seat.seatCode.charAt(0),
            type: "standard",
            price: SEAT_PRICE,
            status: seat.status
        }));

        seatState.selectedSeats = [];

        renderSeatSelection();

        console.log(
            `Đã tải ${seatState.seats.length} ghế`,
            seatState.seats
        );

    } catch (error) {
        console.error("Seat API error:", error);

        if (window.selectedShowtimeId !== showtimeId) {
            return;
        }

        seatState.seats = [];
        seatState.selectedSeats = [];
        grid.textContent =
            "Không thể tải sơ đồ ghế. Vui lòng thử lại.";
        updateSelectedSeats();
    }
}

window.loadSeatsFromAPI = loadSeatsFromAPI;

// ========================================
// NUT BO CHON TAT CA
// ========================================

function setupClearSeatsButton() {
    const clearBtn = document.getElementById("clearAllSeats");

    if (!clearBtn) return;

    clearBtn.addEventListener("click", resetSelectedSeats);
}

// ========================================
// KHOI TAO
// ========================================

function initSeatSelection() {
    const grid = document.getElementById("seatGrid");

    if (!grid) return;

    grid.textContent = "Vui lòng chọn suất chiếu trước.";

    setupClearSeatsButton();
    updateSelectedSeats();
}

document.addEventListener(
    "DOMContentLoaded",
    initSeatSelection
);
