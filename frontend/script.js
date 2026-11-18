
"use strict";

// ==========================================
// PHÊ PHIM - DANH SÁCH PHIM
// ==========================================

const MOVIES_DATA = [
    {
        id: "the-odyssey",
        title: "The Odyssey",
        poster: "https://image.tmdb.org/t/p/original/7876PK6gosE13Uq1B6nRxf7AJLT.jpg",
        fallback: "https://image.tmdb.org/t/p/original/7876PK6gosE13Uq1B6nRxf7AJLT.jpg",
        age: "R",
        genre: "Phiêu lưu · Hành động · Giả tưởng",
        rating: 9.0
    },
    {
        id: "doctor-x",
        title: "Bác Sĩ X",
        poster: "https://image.tmdb.org/t/p/original/jzqPdwpiDTPzvnbV0pZzTtOIgWz.jpg",
        fallback: "https://image.tmdb.org/t/p/original/jzqPdwpiDTPzvnbV0pZzTtOIgWz.jpg",
        age: "T18",
        genre: "Bí ẩn · Chính kịch · Hình sự · Tâm lý",
        rating: 9.0
    },
    {
        id: "heart-of-the-beast",
        title: "Trái Tim Quái Thú",
        poster: "https://image.tmdb.org/t/p/original/2nVdUaSsD4cV2GwwZpuXbiHIXM.jpg",
        fallback: "https://image.tmdb.org/t/p/original/2nVdUaSsD4cV2GwwZpuXbiHIXM.jpg",
        age: "T13",
        genre: "Hành động · Phiêu lưu",
        rating: 8.8
    },
    {
        id: "interstellar",
        title: "Hố Đen Tử Thần",
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        fallback: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&q=85",
        age: "T13",
        genre: "Khoa học viễn tưởng · 169 phút",
        rating: 9.0
    },
    {
        id: "spiderverse",
        title: "Người Nhện: Du Hành Vũ Trụ Nhện",
        poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        fallback: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500&q=85",
        age: "T13",
        genre: "Hoạt hình · Hành động · 140 phút",
        rating: 9.0
    },
    {
        id: "toy-story-4",
        title: "Câu Chuyện Đồ Chơi 4",
        poster: "https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg",
        fallback: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=500&q=85",
        age: "P",
        genre: "Hoạt hình · Gia đình · 100 phút",
        rating: 8.2
    },
    {
        id: "inception",
        title: "Kẻ Đánh Cắp Giấc Mơ",
        poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        fallback: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=85",
        age: "T13",
        genre: "Hành động · Khoa học viễn tưởng · 148 phút",
        rating: 8.8
    },
    {
        id: "batman",
        title: "Người Dơi",
        poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        fallback: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=85",
        age: "T16",
        genre: "Hành động · Trinh thám · 176 phút",
        rating: 8.5
    },
    {
        id: "avatar-2",
        title: "Avatar: Dòng Chảy Của Nước",
        poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
        fallback: "https://images.unsplash.com/photo-1470252649378-9c29740a8fa8?w=500&q=85",
        age: "T13",
        genre: "Khoa học viễn tưởng · 192 phút",
        rating: 8.7
    },
    {
        id: "your-name",
        title: "Tên Cậu Là Gì?",
        poster: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
        fallback: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=500&q=85",
        age: "T13",
        genre: "Hoạt hình · Tình cảm · 106 phút",
        rating: 8.9
    },
    {
        id: "coco",
        title: "Coco: Hội Ngộ Diệu Kỳ",
        poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
        fallback: "https://images.unsplash.com/photo-1500530850857-b586d89ba3ee?w=500&q=85",
        age: "P",
        genre: "Hoạt hình · Gia đình · 105 phút",
        rating: 8.8
    },
    {
        id: "dune-2",
        title: "Hành Tinh Cát: Phần Hai",
        poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        fallback: "https://images.unsplash.com/photo-1440404653325-ab127d49abcd?w=500&q=85",
        age: "T16",
        genre: "Khoa học viễn tưởng · 166 phút",
        rating: 9.1
    },
    {
        id: "grand-budapest",
        title: "Khách Sạn Đế Vương",
        poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
        fallback: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=500&q=85",
        age: "T13",
        genre: "Hài · Phiêu lưu · 99 phút",
        rating: 8.5
    },
    {
        id: "oppenheimer",
        title: "Oppenheimer: Cha Đẻ Bom Nguyên Tử",
        poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
        fallback: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=85",
        age: "T18",
        genre: "Tâm lý · Lịch sử · 180 phút",
        rating: 9.3
    },
    {
        id: "spiderman-no-way-home",
        title: "Người Nhện: Không Còn Nhà (Spider-Man: No Way Home)",
        poster: "https://image.tmdb.org/t/p/original/7XzmrGu23xFPPWdaF29357Y420a.jpg",
        fallback: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=500&q=85",
        age: "T13",
        genre: "Hành động · Phiêu lưu · Khoa học viễn tưởng · 148 phút",
        rating: 8.2
    }
];

// ==========================================
// CẤU HÌNH
// ==========================================

const API_BASE_URL = "http://localhost:3000/api";

const MOVIE_ID_MAP = {
    "the-odyssey": 1,
    "doctor-x": 2
};

const $ = id => document.getElementById(id);

let selectedMovie = null;

window.selectedShowtime = null;
window.selectedShowtimeId = null;

// ==========================================
// TÌM KIẾM PHIM
// ==========================================

function normalizeText(text) {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim();
}

// ==========================================
// TẠO POSTER
// ==========================================

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

// ==========================================
// HIỂN THỊ DANH SÁCH PHIM
// ==========================================

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
        empty.textContent = "Không tìm thấy phim phù hợp.";

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
        card.setAttribute(
            "aria-label",
            `Đặt vé phim ${movie.title}`
        );

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
        age.textContent = movie.age;

        poster.append(age);

        const info = document.createElement("div");
        info.className = "movie-info";

        const title = document.createElement("h3");
        title.className = "movie-title";
        title.textContent = movie.title;

        const meta = document.createElement("div");
        meta.className = "movie-meta";
        meta.textContent =
            `★ ${movie.rating} · ${movie.genre}`;

        info.append(title, meta);
        card.append(poster, info);

        row.append(card);
    });
}

// ==========================================
// CHUYỂN SANG TRANG ĐẶT VÉ
// ==========================================

function goToBooking(movieId) {
    window.location.href =
        `booking.html?movie=${encodeURIComponent(movieId)}`;
}

// ==========================================
// SỰ KIỆN TÌM KIẾM
// ==========================================

function setupEvents() {
    const searchInput = $("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", event => {
            renderMoviesList(event.target.value);
        });
    }
}

// ==========================================
// KHỞI TẠO TRANG CHỦ
// ==========================================

function initHomePage() {
    setupEvents();
    renderMoviesList();
}

// ==========================================
// KHỞI TẠO TRANG ĐẶT VÉ
// ==========================================

function initBookingPage() {
    const params = new URLSearchParams(window.location.search);

    // Nếu URL không có mã phim, mặc định The Odyssey
    const movieId = params.get("movie") || "the-odyssey";

    selectedMovie = MOVIES_DATA.find(
        movie => movie.id === movieId
    );

    // Nếu mã phim không tồn tại, dùng phim mặc định
    if (!selectedMovie) {
        console.warn(
            "Không tìm thấy mã phim:",
            movieId,
            "- Chuyển sang The Odyssey"
        );

        selectedMovie = MOVIES_DATA.find(
            movie => movie.id === "the-odyssey"
        );
    }

    if (!selectedMovie) {
        alert("Danh sách phim chưa có dữ liệu!");
        return;
    }

    window.selectedShowtime = null;
    window.selectedShowtimeId = null;

    // Ảnh nền banner
    const backdropBg = $("movieBackdropBg");

    if (backdropBg) {
        backdropBg.style.backgroundImage =
            `url("${selectedMovie.poster}")`;
    }

    // Poster phim
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

    // Tên phim
    if ($("movieDetailTitle")) {
        $("movieDetailTitle").textContent = selectedMovie.title;
    }

    // Độ tuổi
    if ($("movieDetailAge")) {
        $("movieDetailAge").textContent = selectedMovie.age;
    }

    // Đánh giá
    if ($("movieDetailRating")) {
        $("movieDetailRating").textContent =
            `★ ${selectedMovie.rating}/10`;
    }

    // Thể loại
    if ($("movieDetailGenre")) {
        $("movieDetailGenre").textContent = selectedMovie.genre;
    }

    // Tóm tắt đặt vé
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

    // Thời lượng phim
    const durationMatch =
        selectedMovie.genre.match(/(\d+)\s*phút/i);

    if ($("summaryDuration")) {
        $("summaryDuration").textContent = durationMatch
            ? durationMatch[1] + " phút"
            : "Chưa cập nhật";
    }

    // Tải suất chiếu từ PostgreSQL
    renderShowtimes();
}

// ==========================================
// LẤY SUẤT CHIẾU TỪ POSTGRESQL
// ==========================================

async function renderShowtimes() {
    const container = $("showtimeOptions");

    if (!container || !selectedMovie) return;

    container.replaceChildren();
    container.textContent = "Đang tải suất chiếu...";

    const movieId = MOVIE_ID_MAP[selectedMovie.id];

    window.selectedShowtime = null;
    window.selectedShowtimeId = null;

    if (typeof window.resetSelectedSeats === "function") {
        window.resetSelectedSeats();
    }

    if (!movieId) {
        container.textContent =
            "Phim này chưa có suất chiếu trong hệ thống.";
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/showtimes?movieId=${movieId}`
        );

        if (!response.ok) {
            throw new Error("Không thể lấy suất chiếu");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.showtimes)) {
            throw new Error("Dữ liệu suất chiếu không hợp lệ");
        }

        container.replaceChildren();

        if (data.showtimes.length === 0) {
            container.textContent = "Chưa có suất chiếu.";
            return;
        }

        data.showtimes.forEach(showtime => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "showtime-option";

            const date = new Date(showtime.startTime);

            button.textContent = date.toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });

            button.addEventListener("click", async () => {
                window.selectedShowtimeId = showtime.id;
                window.selectedShowtime = button.textContent;

                container.querySelectorAll("button").forEach(item => {
                    item.classList.remove("active");
                });

                button.classList.add("active");

                if (typeof window.resetSelectedSeats === "function") {
                    window.resetSelectedSeats();
                }

                if (typeof window.loadSeatsFromAPI === "function") {
                    await window.loadSeatsFromAPI(showtime.id);
                }

                if (typeof window.updateSelectedSeats === "function") {
                    window.updateSelectedSeats();
                }
            });

            container.append(button);
        });

    } catch (error) {
        console.error("Lỗi tải suất chiếu:", error);

        container.textContent =
            "Không thể kết nối Backend để tải suất chiếu.";
    }
}

// ==========================================
// KHỞI ĐỘNG WEBSITE
// ==========================================

function init() {
    // Trang chủ
    if ($("movieCardsRow")) {
        initHomePage();
    }

    // Trang đặt vé
    if ($("movieBackdropBg") || $("movieDetailTitle")) {
        initBookingPage();
    }
}

document.addEventListener("DOMContentLoaded", init);
