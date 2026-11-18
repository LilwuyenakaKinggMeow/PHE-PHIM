
-- =========================================
-- PHÊ PHIM - IMPORT 15 MOVIES
-- =========================================

INSERT INTO movies
(movie_code, title, poster, age_rating, rating, genre, duration)
VALUES

('the-odyssey',
 'The Odyssey',
 'https://image.tmdb.org/t/p/original/7876PK6gosE13Uq1B6nRxf7AJLT.jpg',
 'R', 9.0, 'Phiêu lưu · Hành động · Giả tưởng', NULL),

('doctor-x',
 'Bác Sĩ X',
 'https://image.tmdb.org/t/p/original/jzqPdwpiDTPzvnbV0pZzTtOIgWz.jpg',
 'T18', 9.0, 'Bí ẩn · Chính kịch · Hình sự · Tâm lý', NULL),

('heart-of-the-beast',
 'Trái Tim Quái Thú',
 'https://image.tmdb.org/t/p/original/2nVdUaSsD4cV2GwwZpuXbiHIXM.jpg',
 'T13', 8.8, 'Hành động · Phiêu lưu', NULL),

('interstellar',
 'Hố Đen Tử Thần',
 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
 'T13', 9.0, 'Khoa học viễn tưởng · 169 phút', 169),

('spiderverse',
 'Người Nhện: Du Hành Vũ Trụ Nhện',
 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
 'T13', 9.0, 'Hoạt hình · Hành động · 140 phút', 140),

('toy-story-4',
 'Câu Chuyện Đồ Chơi 4',
 'https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg',
 'P', 8.2, 'Hoạt hình · Gia đình · 100 phút', 100),

('inception',
 'Kẻ Đánh Cắp Giấc Mơ',
 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
 'T13', 8.8, 'Hành động · Khoa học viễn tưởng · 148 phút', 148),

('batman',
 'Người Dơi',
 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
 'T16', 8.5, 'Hành động · Trinh thám · 176 phút', 176),

('avatar-2',
 'Avatar: Dòng Chảy Của Nước',
 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
 'T13', 8.7, 'Khoa học viễn tưởng · 192 phút', 192),

('your-name',
 'Tên Cậu Là Gì?',
 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg',
 'T13', 8.9, 'Hoạt hình · Tình cảm · 106 phút', 106),

('coco',
 'Coco: Hội Ngộ Diệu Kỳ',
 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
 'P', 8.8, 'Hoạt hình · Gia đình · 105 phút', 105),

('dune-2',
 'Hành Tinh Cát: Phần Hai',
 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
 'T16', 9.1, 'Khoa học viễn tưởng · 166 phút', 166),

('grand-budapest',
 'Khách Sạn Đế Vương',
 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
 'T13', 8.5, 'Hài · Phiêu lưu · 99 phút', 99),

('oppenheimer',
 'Oppenheimer: Cha Đẻ Bom Nguyên Tử',
 'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',
 'T18', 9.3, 'Tâm lý · Lịch sử · 180 phút', 180),

('spiderman-no-way-home',
 'Người Nhện: Không Còn Nhà (Spider-Man: No Way Home)',
 'https://image.tmdb.org/t/p/original/7XzmrGu23xFPPWdaF29357Y420a.jpg',
 'T13', 8.2, 'Hành động · Phiêu lưu · Khoa học viễn tưởng · 148 phút', 148)

ON CONFLICT (movie_code)
DO UPDATE SET
    title = EXCLUDED.title,
    poster = EXCLUDED.poster,
    age_rating = EXCLUDED.age_rating,
    rating = EXCLUDED.rating,
    genre = EXCLUDED.genre,
    duration = EXCLUDED.duration;
