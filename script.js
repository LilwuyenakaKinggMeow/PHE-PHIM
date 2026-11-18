"use strict";
const FEATURED_MOVIES_COUNT = 3;
let showAllMovies = false;
const MOVIES_DATA = [
    {
        id: "spiderverse",
        title: "Người Nhện: Du Hành Vũ Trụ Nhện",
        genre: "Hoạt hình · Hành động · 140 phút",
        age: "T13",
        rating: "9.0",
        poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        fallback: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500&q=85",
        showtimes: [
            { id: "st-6", time: "17:45", room: "Phòng 02 · 2D" },
            { id: "st-7", time: "20:30", room: "Phòng 05 · 2D" }
        ]
    },
    {
        id: "interstellar",
        title: "Hố Đen Tử Thần",
        genre: "Khoa học viễn tưởng · 169 phút",
        age: "T13",
        rating: "9.0",
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        fallback: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&q=85",
        showtimes: [
            { id: "st-8", time: "09:00", room: "Phòng 01 · 2D" },
            { id: "st-9", time: "14:30", room: "Phòng 03 · IMAX" },
            { id: "st-10", time: "20:00", room: "Phòng 02 · 2D" }
        ]
    },
    {
        id: "toy-story-4",
        title: "Câu Chuyện Đồ Chơi 4",
        genre: "Hoạt hình · Gia đình · 100 phút",
        age: "P",
        rating: "8.2",
        poster: "https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg",
        fallback: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&q=85",
        showtimes: [
            { id: "st-29", time: "08:00", room: "Phòng 01 · 2D" },
            { id: "st-30", time: "12:00", room: "Phòng 05 · 2D" },
            { id: "st-31", time: "16:30", room: "Phòng 02 · 2D" }
        ]
    },
    {
        id: "inception",
        title: "Kẻ Đánh Cắp Giấc Mơ",
        genre: "Hành động · Khoa học viễn tưởng · 148 phút",
        age: "T13",
        rating: "8.8",
        poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        fallback: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=85",
        showtimes: [
            { id: "st-11", time: "10:00", room: "Phòng 02 · 2D" },
            { id: "st-12", time: "16:00", room: "Phòng 04 · 2D" },
            { id: "st-13", time: "21:00", room: "Phòng 03 · IMAX" }
        ]
    },
    {
        id: "batman",
        title: "Người Dơi",
        genre: "Hành động · Trinh thám · 176 phút",
        age: "T16",
        rating: "8.5",
        poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        fallback: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=85",
        showtimes: [
            { id: "st-14", time: "11:00", room: "Phòng 01 · 2D" },
            { id: "st-15", time: "17:30", room: "Phòng 05 · 2D" },
            { id: "st-16", time: "20:45", room: "Phòng 03 · IMAX" }
        ]
    },
    {
        id: "avatar-2",
        title: "Avatar: Dòng Chảy Của Nước",
        genre: "Khoa học viễn tưởng · 192 phút",
        age: "T13",
        rating: "8.7",
        poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        fallback: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=500&q=85",
        showtimes: [
            { id: "st-17", time: "09:30", room: "Phòng 03 · IMAX" },
            { id: "st-18", time: "14:00", room: "Phòng 01 · 2D" },
            { id: "st-19", time: "19:30", room: "Phòng 03 · IMAX" }
        ]
    },
    {
        id: "your-name",
        title: "Tên Cậu Là Gì?",
        genre: "Hoạt hình · Tình cảm · 106 phút",
        age: "T13",
        rating: "8.9",
        poster: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
        fallback: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=500&q=85",
        showtimes: [
            { id: "st-20", time: "08:30", room: "Phòng 02 · 2D" },
            { id: "st-21", time: "13:00", room: "Phòng 04 · 2D" },
            { id: "st-22", time: "18:00", room: "Phòng 02 · 2D" }
        ]
    },
    {
        id: "coco",
        title: "Coco: Hội Ngộ Diệu Kỳ",
        genre: "Hoạt hình · Gia đình · 105 phút",
        age: "P",
        rating: "8.8",
        poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
        fallback: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500&q=85",
        showtimes: [
            { id: "st-23", time: "09:00", room: "Phòng 05 · 2D" },
            { id: "st-24", time: "14:00", room: "Phòng 02 · 2D" },
            { id: "st-25", time: "19:00", room: "Phòng 04 · 2D" }
        ]
    },
    {
        id: "dune-2",
        title: "Hành Tinh Cát: Phần Hai",
        genre: "Khoa học viễn tưởng · 166 phút",
        age: "T16",
        rating: "9.1",
        poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        fallback: "https://images.unsplash.com/photo-1440404653325-ab127d49abcd?w=500&q=85",
        showtimes: [
            { id: "st-1", time: "18:30", room: "Phòng 01 · 2D" },
            { id: "st-2", time: "20:15", room: "Phòng 03 · IMAX" },
            { id: "st-3", time: "22:45", room: "Phòng 02 · 2D" }
        ]
    },
    {
        id: "grand-budapest",
        title: "Khách Sạn Đế Vương",
        genre: "Hài · Phiêu lưu · 99 phút",
        age: "T13",
        rating: "8.5",
        poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
        fallback: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=500&q=85",
        showtimes: [
            { id: "st-26", time: "10:30", room: "Phòng 04 · 2D" },
            { id: "st-27", time: "15:00", room: "Phòng 01 · 2D" },
            { id: "st-28", time: "20:30", room: "Phòng 05 · 2D" }
        ]
    },
    {
        id: "oppenheimer",
        title: "Oppenheimer: Cha Đẻ Bom Nguyên Tử",
        genre: "Tâm lý · Lịch sử · 180 phút",
        age: "T18",
        rating: "9.3",
        poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
        fallback: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=85",
        showtimes: [
            { id: "st-4", time: "19:00", room: "Phòng 03 · IMAX" },
            { id: "st-5", time: "21:50", room: "Phòng 04 · 2D" }
        ]
    },
    {
        id: "spiderman-no-way-home",
        title: "Người Nhện: Không Còn Nhà (Spider-Man: No Way Home)",
        genre: "Hành động · Phiêu lưu · Khoa học viễn tưởng · 148 phút",
        age: "T13",
        rating: "8.2",
        poster: "https://image.tmdb.org/t/p/original/7XzmrGu23xFPPWdaF29357Y420a.jpg",
        fallback: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500&q=85",
        showtimes: [
            { id: "st-35", time: "09:00", room: "Phòng 01 · 2D" },
            { id: "st-36", time: "14:30", room: "Phòng 03 · IMAX" },
            { id: "st-37", time: "18:00", room: "Phòng 02 · 2D" },
            { id: "st-38", time: "21:00", room: "Phòng 05 · 2D" }
        ]
    }
];

const ROWS_DEF = ["A", "B", "C", "D", "E", "F", "G", "H"];

const PRICE_MAP = {
    std: 85000,
    vip: 115000,
    sweetbox: 240000
};

const HOLD_TIME_LIMIT = 300;
const MAX_SELECTED_SEATS = 6;


const appState = {
    currentMovie: MOVIES_DATA[0],
    currentShowtime: MOVIES_DATA[0].showtimes[1],

    selectedCinema: "CineLux Vincom Center",

    selectedSeats: [],

    holdTimeRemaining: HOLD_TIME_LIMIT,

    timerInterval: null,

    seatDatabase: {},

    paymentMethod: "momo"
};

const $ = (id) => document.getElementById(id);
// Chuẩn hóa văn bản: bỏ dấu tiếng Việt và chuyển về chữ thường
function normalizeText(text) {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim();
}


function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}


function showToastNotification(title, desc) {
    const container = $("toastContainer");

    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";

    const content = document.createElement("div");

    const heading = document.createElement("div");
    heading.className = "toast-title";
    heading.textContent = title;

    const message = document.createElement("div");
    message.className = "toast-desc";
    message.textContent = desc;

    content.append(heading, message);
    toast.append(content);

    container.append(toast);

    setTimeout(() => toast.remove(), 4000);
}

function createPosterMarkup(movie, extraClass = "") {
    const img = document.createElement("img");

    img.className = extraClass;
    img.src = movie.poster;
    img.alt = `Poster phim ${movie.title}`;
    img.loading = "lazy";

    img.onerror = () => {
        img.onerror = null;
        img.src = movie.fallback;
    };

    return img;
}

function getSeatDataForShowtime(showtimeId) {

    if (appState.seatDatabase[showtimeId]) {
        return appState.seatDatabase[showtimeId];
    }

    const seats = [];

    ROWS_DEF.forEach((row) => {

        const isSweetbox = row === "H";

        const isVip = ["D", "E", "F", "G"].includes(row);

        const colTotal = isSweetbox ? 6 : 12;

        for (let col = 1; col <= colTotal; col++) {

            const code = isSweetbox
                ? `${row}${col * 2 - 1}-${col * 2}`
                : `${row}${col}`;

            const type = isSweetbox
                ? "sweetbox"
                : isVip
                    ? "vip"
                    : "std";

            const random = Math.random();

            let status = "available";
            let lockTTL = 0;

            if (random < 0.15) {

                status = "sold";

            } else if (random < 0.23) {

                status = "locked";

                lockTTL = Math.floor(Math.random() * 50) + 15;
            }

            seats.push({
                id: `${showtimeId}-${code}`,
                code,
                row,
                type,
                price: PRICE_MAP[type],
                status,
                lockTTL
            });
        }
    });

    appState.seatDatabase[showtimeId] = seats;

    return seats;
}


function renderMoviesList(keyword = "") {
    const row = $("movieCardsRow");

    if (!row) return;

    const normalizedKeyword = normalizeText(keyword);

    const filtered = MOVIES_DATA.filter(movie => {
        const searchableText = normalizeText([
            movie.title,
            movie.genre,
            movie.age,
            movie.id,
            movie.rating
        ].join(" "));

        return searchableText.includes(normalizedKeyword);
    });

    // Xóa nút cũ trước khi render lại
    $("toggleMoviesBtn")?.remove();

    row.replaceChildren();

    if (filtered.length === 0) {
        const empty = document.createElement("p");

        empty.className = "empty-movies";
        empty.textContent = "Không tìm thấy phim phù hợp.";

        row.append(empty);
        return;
    }

    // Khi tìm kiếm: hiển thị toàn bộ kết quả
    // Khi không tìm kiếm: chỉ hiện 3 phim hoặc toàn bộ tùy trạng thái
    const isSearching = normalizedKeyword.length > 0;

    const displayedMovies = isSearching || showAllMovies
        ? filtered
        : filtered.slice(0, FEATURED_MOVIES_COUNT);

    displayedMovies.forEach(movie => {
        const card = document.createElement("article");

        card.className = `movie-card ${movie.id === appState.currentMovie.id ? "active" : ""
            }`;

        card.dataset.movieId = movie.id;
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");

        const poster = document.createElement("div");
        poster.className = "movie-poster image-poster";
        poster.append(createPosterMarkup(movie));

        const age = document.createElement("span");
        age.className = "poster-age";
        age.textContent = movie.age;

        poster.append(age);

        const info = document.createElement("div");
        info.className = "movie-info";

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.className = "movie-title";
        title.textContent = movie.title;

        const meta = document.createElement("div");
        meta.className = "movie-meta";
        meta.textContent = `★ ${movie.rating} · ${movie.genre}`;

        details.append(title, meta);

        const showtimeList = document.createElement("div");
        showtimeList.className = "showtime-list";

        movie.showtimes.forEach(showtime => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = `showtime-btn ${showtime.id === appState.currentShowtime.id &&
                movie.id === appState.currentMovie.id
                ? "active"
                : ""
                }`;

            button.dataset.stId = showtime.id;
            button.textContent = showtime.time;

            button.addEventListener("click", event => {
                event.stopPropagation();
                selectMovieAndShowtime(movie, showtime);
            });

            showtimeList.append(button);
        });

        info.append(details, showtimeList);
        card.append(poster, info);

        const chooseMovie = () => {
            if (movie.id !== appState.currentMovie.id) {
                selectMovieAndShowtime(movie, movie.showtimes[0]);
            }
        };

        card.addEventListener("click", event => {
            if (!event.target.closest(".showtime-btn")) {
                chooseMovie();
            }
        });

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                chooseMovie();
            }
        });

        row.append(card);
    });

    // Tạo nút xem tất cả / thu gọn
    if (!isSearching && filtered.length > FEATURED_MOVIES_COUNT) {
        const button = document.createElement("button");

        button.id = "toggleMoviesBtn";
        button.className = "toggle-movies-btn";

        button.textContent = showAllMovies
            ? "Thu gọn phim ↑"
            : `Xem tất cả (${filtered.length}) ↓`;

        button.addEventListener("click", () => {
            showAllMovies = !showAllMovies;

            renderMoviesList($("searchInput")?.value || "");
        });

        row.insertAdjacentElement("afterend", button);
    }
}


function selectMovieAndShowtime(movie, showtime) {

    appState.currentMovie = movie;

    appState.currentShowtime = showtime;

    resetSelectedSeatsAndTimer();

    renderMoviesList($("searchInput")?.value || "");

    renderSeatMap();

    updateSummaryPanel();
}

function renderSeatMap() {

    const seats = getSeatDataForShowtime(
        appState.currentShowtime.id
    );

    const grid = $("seatGrid");

    if (!grid) return;

    grid.replaceChildren();

    $("currentRoomName").textContent =
        appState.currentShowtime.room;

    ROWS_DEF.forEach(row => {

        const rowElement = document.createElement("div");

        rowElement.className = "seat-row";

        const leftLabel = document.createElement("span");

        leftLabel.className = "row-label";
        leftLabel.textContent = row;

        const seatContainer = document.createElement("div");

        seatContainer.className = "seats-in-row";

        const rowSeats = seats.filter(seat => seat.row === row);

        rowSeats.forEach((seat, index) => {

            if (
                (row !== "H" && index === 6) ||
                (row === "H" && index === 3)
            ) {

                const aisle = document.createElement("div");

                aisle.className = "seat-gap";

                seatContainer.append(aisle);
            }

            const selected = appState.selectedSeats.some(
                item => item.id === seat.id
            );

            const button = document.createElement("button");

            button.type = "button";

            button.className = `seat ${seat.type}`;

            button.textContent =
                seat.status === "sold"
                    ? "✕"
                    : seat.status === "locked"
                        ? `🔒 ${seat.lockTTL}s`
                        : seat.code;

            button.setAttribute(
                "aria-label",
                `Ghế ${seat.code} - ${seat.status}`
            );

            if (selected) {
                button.classList.add("selected");
            }

            if (seat.status === "sold") {

                button.classList.add("sold");

                button.disabled = true;

            } else if (seat.status === "locked") {

                button.classList.add("locked-other");

                button.disabled = true;

            } else {

                button.addEventListener("click", () => {
                    handleSeatSelection(seat);
                });
            }

            seatContainer.append(button);
        });

        const rightLabel = document.createElement("span");

        rightLabel.className = "row-label";
        rightLabel.textContent = row;

        rowElement.append(
            leftLabel,
            seatContainer,
            rightLabel
        );

        grid.append(rowElement);
    });
}

function handleSeatSelection(seat) {

    if (seat.status !== "available") return;

    const selectedIndex = appState.selectedSeats.findIndex(
        item => item.id === seat.id
    );

    if (selectedIndex >= 0) {

        appState.selectedSeats.splice(selectedIndex, 1);

        if (appState.selectedSeats.length === 0) {
            stopHoldTimer();
        }

    } else {

        if (appState.selectedSeats.length >= MAX_SELECTED_SEATS) {

            showToastNotification(
                "Đã đạt giới hạn",
                `Bạn chỉ có thể chọn tối đa ${MAX_SELECTED_SEATS} ghế.`
            );

            return;
        }

        appState.selectedSeats.push(seat);

        if (appState.selectedSeats.length === 1) {
            startHoldTimer();
        }
    }

    renderSeatMap();

    updateSummaryPanel();
}

function resetSelectedSeatsAndTimer() {

    appState.selectedSeats = [];

    stopHoldTimer();
}


function startHoldTimer() {

    stopHoldTimer();

    appState.holdTimeRemaining = HOLD_TIME_LIMIT;

    $("holdTimerBox")?.classList.remove("hidden");

    updateTimerDisplay();

    appState.timerInterval = setInterval(() => {

        appState.holdTimeRemaining--;

        updateTimerDisplay();

        if (appState.holdTimeRemaining <= 0) {

            resetSelectedSeatsAndTimer();

            renderSeatMap();

            updateSummaryPanel();

            showToastNotification(
                "Hết thời gian demo",
                "Lựa chọn ghế đã được xóa khỏi phiên đặt vé này."
            );
        }

    }, 1000);
}


function stopHoldTimer() {

    if (appState.timerInterval) {

        clearInterval(appState.timerInterval);

        appState.timerInterval = null;
    }

    $("holdTimerBox")?.classList.add("hidden");
}


function updateTimerDisplay() {

    const minutes = String(
        Math.floor(appState.holdTimeRemaining / 60)
    ).padStart(2, "0");

    const seconds = String(
        appState.holdTimeRemaining % 60
    ).padStart(2, "0");

    if ($("timerCountdown")) {

        $("timerCountdown").textContent =
            `${minutes}:${seconds}`;
    }
}

function updateSummaryPanel() {

    const movie = appState.currentMovie;

    const thumb = $("summaryThumb");

    if (thumb) {

        thumb.replaceChildren(
            createPosterMarkup(movie)
        );
    }

    $("summaryTitle").textContent = movie.title;

    $("summaryAge").textContent = movie.age;

    $("summaryDuration").textContent =
        movie.genre.split("·").pop().trim();

    $("summaryCinema").textContent =
        appState.selectedCinema;

    $("summaryShowtime").textContent =
        `${appState.currentShowtime.time} · Hôm nay`;

    const count = appState.selectedSeats.length;

    $("selectedCountNum").textContent = count;

    $("clearAllSeats").style.display =
        count > 0 ? "inline" : "none";

    const container = $("selectedSeatsContainer");

    const checkoutButton = $("checkoutBtn");

    container.replaceChildren();

    if (count === 0) {

        const placeholder = document.createElement("div");

        placeholder.className = "empty-seats-placeholder";

        placeholder.textContent =
            "Vui lòng chọn ghế trên sơ đồ bên trái để tiếp tục";

        container.append(placeholder);

        $("totalAmountText").textContent = "0 đ";

        checkoutButton.disabled = true;

        return;
    }

    const list = document.createElement("div");

    list.className = "selected-list";

    const total = appState.selectedSeats.reduce(
        (sum, seat) => sum + seat.price,
        0
    );

    appState.selectedSeats.forEach(seat => {

        const item = document.createElement("div");

        item.className = "selected-seat-row";

        const left = document.createElement("div");

        left.className = "seat-chip-left";

        const code = document.createElement("div");

        code.className = "seat-code-badge";

        code.textContent = seat.code;

        const details = document.createElement("div");

        const type = document.createElement("div");

        type.className = "seat-type-name";

        type.textContent =
            seat.type === "vip"
                ? "Ghế VIP"
                : seat.type === "sweetbox"
                    ? "Ghế Đôi"
                    : "Ghế Thường";

        const room = document.createElement("div");

        room.className = "seat-room-name";

        room.textContent = appState.currentShowtime.room;

        details.append(type, room);

        left.append(code, details);

        const right = document.createElement("div");

        right.className = "seat-price-right";

        const price = document.createElement("span");

        price.className = "seat-price-text";

        price.textContent = formatCurrency(seat.price);

        const remove = document.createElement("button");

        remove.type = "button";

        remove.className = "remove-seat-btn";

        remove.textContent = "✕";

        remove.setAttribute(
            "aria-label",
            `Bỏ ghế ${seat.code}`
        );

        remove.addEventListener("click", () => {
            removeSpecificSeat(seat.id);
        });

        right.append(price, remove);

        item.append(left, right);

        list.append(item);
    });

    container.append(list);

    $("totalAmountText").textContent =
        formatCurrency(total);

    checkoutButton.disabled = false;
}

function removeSpecificSeat(seatId) {

    appState.selectedSeats =
        appState.selectedSeats.filter(
            seat => seat.id !== seatId
        );

    if (appState.selectedSeats.length === 0) {
        stopHoldTimer();
    }

    renderSeatMap();

    updateSummaryPanel();
}


function clearAllSeats() {

    if (appState.selectedSeats.length === 0) return;

    resetSelectedSeatsAndTimer();

    renderSeatMap();

    updateSummaryPanel();

    showToastNotification(
        "Đã xóa lựa chọn",
        "Tất cả ghế đã chọn đã được bỏ."
    );
}


function openPaymentModal() {

    if (appState.selectedSeats.length === 0) return;

    const total = appState.selectedSeats.reduce(
        (sum, seat) => sum + seat.price,
        0
    );

    $("modalTotalBadge").textContent =
        formatCurrency(total);

    $("paymentModal").classList.add("open");
}


function closeModal(modal) {

    modal?.classList.remove("open");
}

function confirmDemoPayment() {

    if (appState.selectedSeats.length === 0) {

        closeModal($("paymentModal"));

        return;
    }

    const seats = getSeatDataForShowtime(
        appState.currentShowtime.id
    );

    const selectedStillAvailable =
        appState.selectedSeats.every(selected =>
            seats.some(seat =>
                seat.id === selected.id &&
                seat.status === "available"
            )
        );

    if (!selectedStillAvailable) {

        showToastNotification(
            "Ghế không còn khả dụng",
            "Vui lòng kiểm tra và chọn lại ghế."
        );

        closeModal($("paymentModal"));

        renderSeatMap();

        return;
    }

    const bookedSeats = [...appState.selectedSeats];

    bookedSeats.forEach(selected => {

        const seat = seats.find(
            item => item.id === selected.id
        );

        if (seat) {
            seat.status = "sold";
        }
    });

    $("ticketMovieTitle").textContent =
        appState.currentMovie.title;

    $("ticketCinemaName").textContent =
        `${appState.selectedCinema} · ${appState.currentShowtime.room}`;

    $("ticketShowtimeText").textContent =
        `${appState.currentShowtime.time} · Hôm nay`;

    $("ticketSeatsText").textContent =
        bookedSeats.map(seat => seat.code).join(", ");

    $("ticketCodeText").textContent =
        "DEMO-" + Math.floor(100000 + Math.random() * 900000);

    closeModal($("paymentModal"));

    resetSelectedSeatsAndTimer();

    renderSeatMap();

    updateSummaryPanel();

    $("ticketModal").classList.add("open");

    showToastNotification(
        "Hoàn tất mô phỏng",
        "Vé demo đã được tạo trong phiên trình duyệt này. Chưa phát sinh thanh toán thật."
    );
}

//fake thanh toan
function setupPaymentMethods() {

    document.querySelectorAll(".pay-method-card").forEach(card => {

        card.addEventListener("click", () => {

            document.querySelectorAll(".pay-method-card")
                .forEach(item => {
                    item.classList.remove("active");
                });

            card.classList.add("active");

            const method = card.dataset.method;

            appState.paymentMethod = method;

            const titles = {
                momo: "Mô phỏng thanh toán qua Ví MoMo",
                vnpay: "Mô phỏng thanh toán qua VNPay QR",
                card: "Mô phỏng thanh toán bằng thẻ"
            };

            $("qrMethodTitle").textContent =
                titles[method] || "Phương thức thanh toán demo";
        });
    });
}


function setupModalBackdrop() {

    ["paymentModal", "ticketModal"].forEach(id => {

        const modal = $(id);

        modal.addEventListener("click", event => {

            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            closeModal($("paymentModal"));

            closeModal($("ticketModal"));
        }
    });
}


function setupEvents() {

    $("checkoutBtn").addEventListener(
        "click",
        openPaymentModal
    );

    $("confirmPaymentBtn").addEventListener(
        "click",
        confirmDemoPayment
    );

    $("closePaymentModal").addEventListener(
        "click",
        () => closeModal($("paymentModal"))
    );

    $("closeTicketModal").addEventListener(
        "click",
        () => closeModal($("ticketModal"))
    );

    $("finishBookingBtn").addEventListener(
        "click",
        () => closeModal($("ticketModal"))
    );

    $("clearAllSeats").addEventListener(
        "click",
        clearAllSeats
    );

    $("searchInput").addEventListener("input", event => {

        renderMoviesList(event.target.value);
    });

    // Chọn rạp
    $("cinemaSelect").addEventListener("change", event => {

        appState.selectedCinema = event.target.value;

        $("summaryCinema").textContent =
            appState.selectedCinema;
    });

    setupPaymentMethods();

    setupModalBackdrop();
}


// fake ghe
function startDemoLockCountdown() {

    setInterval(() => {

        const seats = getSeatDataForShowtime(
            appState.currentShowtime.id
        );

        let changed = false;

        seats.forEach(seat => {

            if (seat.status === "locked") {

                seat.lockTTL--;

                changed = true;

                if (seat.lockTTL <= 0) {

                    seat.status = "available";

                    seat.lockTTL = 0;
                }
            }
        });

        if (changed && !document.hidden) {

            renderSeatMap();
        }

    }, 1000);
}

function init() {
    setupEvents();

    renderMoviesList();

    renderSeatMap();

    updateSummaryPanel();

    startDemoLockCountdown();
}

document.addEventListener("DOMContentLoaded", init);

document.addEventListener("DOMContentLoaded", init);