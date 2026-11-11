-- Tên hiển thị tối đa 50 ký tự, email tối đa 254 ký tự (King chốt 11/11/2026); là giới hạn chặn gõ nhầm, giống mức 10000 kcal của calo
ALTER TABLE nguoi_dung
  ADD CHECK (length(ten_hien_thi) <= 50),
  ADD CHECK (length(email) <= 254);

-- Mỗi chất trong một món tối đa 2500 g (King chốt 11/11/2026): 2500 g tinh bột đã là 10000 kcal, bằng mức trần calo
ALTER TABLE bua_an
  ADD CHECK (dam_g <= 2500),
  ADD CHECK (tinh_bot_g <= 2500),
  ADD CHECK (beo_g <= 2500),
  ADD CHECK (muoi_g <= 2500),
  ADD CHECK (duong_g <= 2500),
  ADD CHECK (beo_no_g <= 2500);
