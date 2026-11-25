"use strict";

// ==============================
// CẤU HÌNH API
// ==============================

const API_URL = "/api/movies";
const CINEMA_API_URL = "/api/cinemas";
const SHOWTIME_API_URL = "/api/showtimes";

const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
}).format(new Date());

// ==============================
// POSTER DỰ PHÒNG
// ==============================

const FALLBACK_POSTERS = {
    "the-odyssey":
        "https://image.tmdb.org/t/p/original/7876PK6gosE13Uq1B6nRxf7AJLT.jpg",

    "doctor-x":
        "https://image.tmdb.org/t/p/original/jzqPdwpiDTPzvnbV0pZzTtOIgWz.jpg",

    "heart-of-the-beast":
        "https://image.tmdb.org/t/p/original/2nVdUaSsD4cV2GwwZpuXbiHIXM.jpg",

    "interstellar":
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&q=85",

    "spiderverse":
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500&q=85",

    "toy-story-4":
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&q=85",

    "inception":
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=85",

    "batman":
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=85",

    "avatar-2":
        "https://images.unsplash.com/photo-1470252649378-9c29740a8fa8?w=500&q=85",

    "your-name":
        "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=500&q=85",

    "coco":
        "https://images.unsplash.com/photo-1500530850857-b586d89ba3ee?w=500&q=85",

    "dune-2":
        "https://images.unsplash.com/photo-1440404653325-ab127d49abcd?w=500&q=85",

    "grand-budapest":
        "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=500&q=85",

    "oppenheimer":
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=85",

    "spiderman-no-way-home":
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500&q=85"
};

// ==============================
// BIẾN TOÀN CỤC
// ==============================

const $ = (id) => document.getElementById(id);

let MOVIES_DATA = [];
let CINEMAS_DATA = [];
let SHOWTIMES_DATA = [];

let selectedMovie = null;

window.MOVIES_DATA = MOVIES_DATA;
window.CINEMAS_DATA = CINEMAS_DATA;
window.SHOWTIMES_DATA = SHOWTIMES_DATA;

window.selectedMovie = null;
window.selectedShowtime = null;
window.selectedShowtimeId = null;

// ==============================
// LẤY DỮ LIỆU PHIM TỪ API
// ==============================

async function loadMovies() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("Dữ liệu phim từ API không hợp lệ.");
        }

        MOVIES_DATA = result.data.map(movie => {
            const movieCode = movie.id_code;

            return {
                id: movieCode,
                databaseId: movie.id,
                title: movie.title,
                poster: movie.poster,
                fallback: FALLBACK_POSTERS[movieCode] || movie.poster,
                age: movie.age,
                genre: movie.genre || "Chưa cập nhật",
                rating: Number(movie.rating) || 0,
                duration: movie.duration
            };
        });

        window.MOVIES_DATA = MOVIES_DATA;

        console.log(
            `Đã tải ${MOVIES_DATA.length} phim từ PostgreSQL API.`
        );

        return true;

    } catch (error) {
        console.error("Không thể tải danh sách phim:", error);

        MOVIES_DATA = [];
        window.MOVIES_DATA = MOVIES_DATA;

        return false;
    }
}

// ==============================
// LẤY DANH SÁCH RẠP TỪ API
// ==============================

async function loadCinemas() {
    try {
        const response = await fetch(CINEMA_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("Dữ liệu rạp từ API không hợp lệ.");
        }

        CINEMAS_DATA = result.data;
        window.CINEMAS_DATA = CINEMAS_DATA;

        const cinemaSelect = $("cinemaSelect");

        if (!cinemaSelect) {
            return true;
        }

        cinemaSelect.replaceChildren();

        if (CINEMAS_DATA.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Chưa có rạp chiếu";

            cinemaSelect.append(option);
            return true;
        }

        CINEMAS_DATA.forEach(cinema => {
            const option = document.createElement("option");

            option.value = cinema.id;
            option.textContent = cinema.name;

            cinemaSelect.append(option);
        });

        // Mặc định chọn rạp đầu tiên
        cinemaSelect.value = String(CINEMAS_DATA[0].id);

        console.log(
            `Đã tải ${CINEMAS_DATA.length} rạp từ PostgreSQL API.`
        );

        return true;

    } catch (error) {
        console.error("Không thể tải danh sách rạp:", error);

        const cinemaSelect = $("cinemaSelect");

        if (cinemaSelect) {
            cinemaSelect.replaceChildren();

            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Không thể tải danh sách rạp";

            cinemaSelect.append(option);
        }

        return false;
    }
}

// ==============================
// LẤY SUẤT CHIẾU TỪ API
// ==============================

async function loadShowtimes() {
    const container = $("showtimeOptions");

    if (!selectedMovie || !container) {
        return;
    }

    const cinemaSelect = $("cinemaSelect");
    const cinemaId = cinemaSelect ? cinemaSelect.value : "";

    if (!cinemaId) {
        renderShowtimeMessage("Vui lòng chọn rạp chiếu.");
        return;
    }

    renderShowtimeMessage("Đang tải suất chiếu...");

    try {
        const dateInput = $("showDate");
        const selectedDate = dateInput ? dateInput.value : today;

        const params = new URLSearchParams({
            movie: selectedMovie.id,
            cinema: cinemaId,
            date: selectedDate
        });

        const response = await fetch(
            `${SHOWTIME_API_URL}?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("Dữ liệu suất chiếu không hợp lệ.");
        }

        SHOWTIMES_DATA = result.data;
        window.SHOWTIMES_DATA = SHOWTIMES_DATA;

        renderShowtimes();

        console.log(
            `Đã tải ${SHOWTIMES_DATA.length} suất chiếu.`
        );

    } catch (error) {
        console.error("Không thể tải suất chiếu:", error);

        SHOWTIMES_DATA = [];
        window.SHOWTIMES_DATA = SHOWTIMES_DATA;

        renderShowtimeMessage(
            "Không thể tải suất chiếu. Vui lòng thử lại."
        );
    }
}

// ==============================
// HIỂN THỊ THÔNG BÁO SUẤT CHIẾU
// ==============================

function renderShowtimeMessage(message) {
    const container = $("showtimeOptions");

    if (!container) return;

    container.replaceChildren();

    const text = document.createElement("p");
    text.className = "empty-showtimes";
    text.textContent = message;

    container.append(text);
}

// ==============================
// KHỞI TẠO NGÀY CHIẾU
// ==============================

function setupDatePicker() {
    const dateInput = $("showDate");

    if (!dateInput) return;

    dateInput.min = today;
    dateInput.value = today;

    dateInput.addEventListener("change", async () => {
        window.selectedShowtime = null;
        window.selectedShowtimeId = null;

        // Xóa ghế đã chọn của suất chiếu cũ
        if (typeof window.resetSelectedSeats === "function") {
            window.resetSelectedSeats();
        }

        await loadShowtimes();

        if (typeof window.updateCheckoutButton === "function") {
            window.updateCheckoutButton();
        }
    });
}

// ==============================
// XỬ LÝ KHI ĐỔI RẠP
// ==============================

function setupCinemaEvents() {
    const cinemaSelect = $("cinemaSelect");

    if (!cinemaSelect) return;

    cinemaSelect.addEventListener("change", async () => {
        // Đổi rạp thì cần chọn lại suất chiếu
        window.selectedShowtime = null;
        window.selectedShowtimeId = null;

        // Xóa lựa chọn ghế cũ khi đổi rạp
        if (typeof window.resetSelectedSeats === "function") {
            window.resetSelectedSeats();
        }

        // Tải lại suất chiếu
        await loadShowtimes();

        if (typeof window.updateCheckoutButton === "function") {
            window.updateCheckoutButton();
        }
    });
}

// ==============================
// XỬ LÝ TÌM KIẾM
// ==============================

function normalizeText(text) {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim();
}

// ==============================
// TẠO POSTER
// ==============================

function createPosterMarkup(movie) {
    const img = document.createElement("img");

    img.className = "movie-poster-img";
    img.src = movie.poster;
    img.alt = `Poster phim ${movie.title}`;
    img.loading = "lazy";

    img.onerror = () => {
        img.onerror = null;
        img.src = movie.fallback;
    };

    return img;
}

// ==============================
// HIỂN THỊ DANH SÁCH PHIM
// ==============================

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

    row.replaceChildren();

    if (filtered.length === 0) {
        const empty = document.createElement("p");

        empty.className = "empty-movies";
        empty.textContent = MOVIES_DATA.length === 0
            ? "Không thể tải danh sách phim. Vui lòng thử tải lại trang."
            : "Không tìm thấy phim phù hợp.";

        row.append(empty);
        return;
    }

    filtered.forEach(movie => {
        const card = document.createElement("article");

        card.className = "movie-card";
        card.dataset.movieId = movie.id;
        card.style.cursor = "pointer";

        card.setAttribute("role", "link");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Đặt vé phim ${movie.title}`);

        card.addEventListener("click", () => {
            goToBooking(movie.id);
        });

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                goToBooking(movie.id);
            }
        });

        const poster = document.createElement("div");
        poster.className = "movie-poster image-poster";
        poster.append(createPosterMarkup(movie));

        const age = document.createElement("span");
        age.className = "poster-age";
        age.textContent = movie.age || "Chưa phân loại";

        poster.append(age);

        const info = document.createElement("div");
        info.className = "movie-info";

        const title = document.createElement("h3");
        title.className = "movie-title";
        title.textContent = movie.title;

        const meta = document.createElement("div");
        meta.className = "movie-meta";
        meta.textContent = `★ ${movie.rating} · ${movie.genre}`;

        info.append(title, meta);
        card.append(poster, info);

        row.append(card);
    });
}

// ==============================
// CHUYỂN SANG TRANG ĐẶT VÉ
// ==============================

function goToBooking(movieId) {
    window.location.href =
        `booking.html?movie=${encodeURIComponent(movieId)}`;
}

// ==============================
// TÌM KIẾM PHIM
// ==============================

function setupEvents() {
    const searchInput = $("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", event => {
            renderMoviesList(event.target.value);
        });
    }
}

// ==============================
// KHỞI TẠO TRANG CHỦ
// ==============================

async function initHomePage() {
    setupEvents();

    await loadCinemas();

    renderMoviesList();
}

// ==============================
// KHỞI TẠO TRANG ĐẶT VÉ
// ==============================

async function initBookingPage() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("movie");

    selectedMovie = MOVIES_DATA.find(movie => movie.id === movieId);

    if (!selectedMovie) {
        alert("Không tìm thấy thông tin phim!");

        window.location.href = "index.html";
        return;
    }

    window.selectedMovie = selectedMovie;

    // Reset suất chiếu khi vào trang
    window.selectedShowtime = null;
    window.selectedShowtimeId = null;

    // ==============================
    // BACKDROP BANNER
    // ==============================

    const backdropBg = $("movieBackdropBg");

    if (backdropBg) {
        backdropBg.style.backgroundImage =
            `url("${selectedMovie.poster}")`;
    }

    // ==============================
    // POSTER PHIM
    // ==============================

    const posterContainer = $("movieDetailPosterContainer");

    if (posterContainer) {
        posterContainer.replaceChildren();

        const img = document.createElement("img");

        img.src = selectedMovie.poster;
        img.alt = `Poster phim ${selectedMovie.title}`;
        img.loading = "lazy";

        img.onerror = () => {
            img.onerror = null;
            img.src = selectedMovie.fallback;
        };

        posterContainer.append(img);
    }

    // ==============================
    // THÔNG TIN PHIM
    // ==============================

    if ($("movieDetailTitle")) {
        $("movieDetailTitle").textContent = selectedMovie.title;
    }

    if ($("movieDetailAge")) {
        $("movieDetailAge").textContent = selectedMovie.age;
    }

    if ($("movieDetailRating")) {
        $("movieDetailRating").textContent =
            `★ ${selectedMovie.rating}/10`;
    }

    if ($("movieDetailGenre")) {
        $("movieDetailGenre").textContent = selectedMovie.genre;
    }

    if ($("movieDetailDescription")) {
        $("movieDetailDescription").textContent =
            selectedMovie.description || "";
    }

    // ==============================
    // THÔNG TIN SIDEBAR
    // ==============================

    if ($("summaryTitle")) {
        $("summaryTitle").textContent = selectedMovie.title;
    }

    if ($("summaryAge")) {
        $("summaryAge").textContent = selectedMovie.age;
    }

    if ($("summaryThumb")) {
        $("summaryThumb").style.backgroundImage =
            `url("${selectedMovie.poster}")`;

        $("summaryThumb").style.backgroundSize = "cover";
        $("summaryThumb").style.backgroundPosition = "center";
    }

    // ==============================
    // THỜI LƯỢNG PHIM
    // ==============================

    const durationMatch = selectedMovie.genre.match(/(\d+)\s*phút/i);

    if ($("summaryDuration")) {
        $("summaryDuration").textContent = selectedMovie.duration
            ? `${selectedMovie.duration} phút`
            : durationMatch
                ? `${durationMatch[1]} phút`
                : "Chưa cập nhật";
    }

    // ==============================
    // TẢI RẠP VÀ SUẤT CHIẾU
    // ==============================

    setupDatePicker();
    setupCinemaEvents();

    const cinemasLoaded = await loadCinemas();

    if (cinemasLoaded && CINEMAS_DATA.length > 0) {
        await loadShowtimes();
    } else {
        renderShowtimeMessage(
            "Không thể tải danh sách rạp chiếu."
        );
    }

    // Cập nhật trạng thái nút thanh toán
    if (typeof window.updateCheckoutButton === "function") {
        window.updateCheckoutButton();
    }
}

// ==============================
// HIỂN THỊ SUẤT CHIẾU
// ==============================

function renderShowtimes() {
    const container = $("showtimeOptions");

    if (!container) return;

    container.replaceChildren();

    if (SHOWTIMES_DATA.length === 0) {
        renderShowtimeMessage(
            "Không có"
        );
        return;
    }

    SHOWTIMES_DATA.forEach(showtime => {
        const time = String(showtime.start_time).slice(0, 5);

        const button = document.createElement("button");

        button.type = "button";
        button.className = "showtime-option";
        button.textContent = time;

        button.addEventListener("click", async () => {
            // Lưu thông tin suất chiếu
            window.selectedShowtime = time;
            window.selectedShowtimeId = showtime.id;

            // Bỏ trạng thái active ở các suất khác
            container.querySelectorAll("button").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            // Tải sơ đồ ghế theo suất chiếu vừa chọn
            if (typeof window.loadSeats === "function") {
                await window.loadSeats();
            }

            // Cập nhật nút thanh toán
            if (typeof window.updateCheckoutButton === "function") {
                window.updateCheckoutButton();
            }

            console.log("Suất chiếu đã chọn:", {
                id: window.selectedShowtimeId,
                time: window.selectedShowtime
            });
        });

        container.append(button);
    });
}

// ==============================
// KHỞI ĐỘNG ỨNG DỤNG
// ==============================

async function init() {
    const loaded = await loadMovies();

    if (!loaded) {
        if ($("movieCardsRow")) {
            renderMoviesList();
        } else if ($("movieBackdropBg") || $("movieDetailTitle")) {
            alert("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
            window.location.href = "index.html";
        }

        return;
    }

    // Trang chủ
    if ($("movieCardsRow")) {
        initHomePage();
    }

    // Trang đặt vé
    if ($("movieBackdropBg") || $("movieDetailTitle")) {
        await initBookingPage();
    }
}

document.addEventListener("DOMContentLoaded", init);

// ==========================================
// TRA CỨU VÉ
// ==========================================

function initTicketLookup() {
    const modal = document.getElementById("ticketLookupModal");
    const openBtn = document.getElementById("openTicketLookup");
    const closeBtn = document.getElementById("closeTicketLookup");
    const codeInput = document.getElementById("ticketBookingCode");
    const searchBtn = document.getElementById("searchTicketBtn");
    const message = document.getElementById("ticketLookupMessage");
    const result = document.getElementById("ticketLookupResult");

    if (!modal || !openBtn || !closeBtn || !codeInput || !searchBtn) {
        return;
    }

    // Mở cửa sổ tra cứu
    openBtn.addEventListener("click", () => {
        modal.classList.add("active");
        codeInput.focus();
    });

    // Đóng cửa sổ
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Đóng khi nhấn bên ngoài
    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });

    // Đóng bằng phím Escape
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            modal.classList.remove("active");
        }
    });

    // Tra cứu khi nhấn Enter
    codeInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchTicket();
        }
    });

    // Tra cứu khi nhấn nút
    searchBtn.addEventListener("click", searchTicket);

    async function searchTicket() {
        const bookingCode = codeInput.value.trim().toUpperCase();

        message.textContent = "";
        message.className = "ticket-lookup-message";
        result.replaceChildren();

        if (!bookingCode) {
            showMessage("Vui lòng nhập mã đặt vé.", "error");
            codeInput.focus();
            return;
        }

        // Kiểm tra định dạng mã vé
        const codePattern = /^PPH-\d{13}-[A-F0-9]{8}$/;

        if (!codePattern.test(bookingCode)) {
            showMessage("Mã đặt vé không đúng định dạng.", "error");
            return;
        }

        searchBtn.disabled = true;
        searchBtn.textContent = "Đang tìm...";

        try {
            const response = await fetch(
                `/api/bookings/${encodeURIComponent(bookingCode)}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Không tìm thấy vé.");
            }

            renderTicket(data.data);
            showMessage("Tra cứu vé thành công!", "success");

        } catch (error) {
            showMessage(error.message || "Không thể kết nối máy chủ.", "error");

        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = "Tra cứu";
        }
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = `ticket-lookup-message ${type}`;
    }


    function renderTicket(ticket) {
        const formatMoney = amount =>
            Number(amount).toLocaleString("vi-VN") + " VNĐ";

        const statusText = {
            confirmed: "Đã xác nhận",
            pending: "Đang chờ xác nhận",
            cancelled: "Đã hủy"
        };

        const seats = Array.isArray(ticket.seats) ? ticket.seats : [];

        const card = document.createElement("div");
        card.className = "ticket-result-card";

        // Tiêu đề vé
        const heading = document.createElement("h3");
        heading.className = "ticket-result-heading";
        heading.textContent = "VÉ ĐIỆN TỬ PHÊ PHIM";

        const code = document.createElement("div");
        code.className = "ticket-result-code";
        code.textContent = ticket.bookingCode || "";

        card.append(heading, code);

        // Khu vực poster + thông tin
        const content = document.createElement("div");
        content.className = "ticket-result-content";

        // Poster phim
        const posterWrapper = document.createElement("div");
        posterWrapper.className = "ticket-result-poster";

        const poster = document.createElement("img");
        poster.src = ticket.poster || "";
        poster.alt = ticket.movieTitle || "Poster phim";
        poster.loading = "lazy";

        poster.onerror = () => {
            posterWrapper.classList.add("poster-unavailable");
            poster.remove();
        };

        if (ticket.poster) {
            posterWrapper.append(poster);
        } else {
            posterWrapper.classList.add("poster-unavailable");
        }

        // Thông tin vé
        const details = document.createElement("div");
        details.className = "ticket-result-details";

        const rows = [
            ["Khách hàng", ticket.customerName],
            ["Email", ticket.customerEmail],
            ["Phim", ticket.movieTitle],
            ["Rạp", ticket.cinemaName],
            ["Ngày chiếu", ticket.showDate],
            ["Giờ chiếu", ticket.startTime],
            ["Ghế", seats.map(seat => seat.seatCode).join(", ")],
            ["Tổng tiền", formatMoney(ticket.totalAmount)],
            ["Trạng thái", statusText[ticket.status] || ticket.status]
        ];

        rows.forEach(([label, value]) => {
            const row = document.createElement("div");
            row.className = "ticket-result-row";

            const labelElement = document.createElement("span");
            labelElement.className = "ticket-result-label";
            labelElement.textContent = label;

            const valueElement = document.createElement("strong");
            valueElement.className = "ticket-result-value";
            valueElement.textContent = value ?? "—";

            if (label === "Trạng thái") {
                valueElement.classList.add("ticket-status-confirmed");
            }

            row.append(labelElement, valueElement);
            details.append(row);
        });

        content.append(posterWrapper, details);
        card.append(content);
        result.append(card);
    }

}

// Khởi tạo chức năng tra cứu vé
document.addEventListener("DOMContentLoaded", initTicketLookup);
