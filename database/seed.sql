
-- PHÊ PHIM - TẠO 100 GHẾ THỬ NGHIỆM

INSERT INTO seats (room_name, seat_code)
SELECT
    'PHONG-01',
    chr(65 + r) || c::text
FROM generate_series(0, 9) AS r
CROSS JOIN generate_series(1, 10) AS c
ON CONFLICT (room_name, seat_code) DO NOTHING;
