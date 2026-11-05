import assert from 'node:assert/strict';
import { test } from 'node:test';

import { phanLoaiEo, tinhCacMoc, tinhSoThang, tinhTienDo, vietCauNhanXet } from './LoTrinhService.ts';

// Mốc vòng eo / chiều cao giống bảng quy_dinh (NICE NG246, khuyến nghị 1.9.14)
const nguongEo = { cao: 0.5, ratCao: 0.6 };

test('phân loại eo ở từng mốc', () => {
  assert.equal(phanLoaiEo(0.49, nguongEo), 'trong_khuyen_nghi');
  assert.equal(phanLoaiEo(0.5, nguongEo), 'cao');
  assert.equal(phanLoaiEo(0.59, nguongEo), 'cao');
  assert.equal(phanLoaiEo(0.6, nguongEo), 'rat_cao');
});

test('câu nhận xét ghép nhãn BMI và nhãn eo', () => {
  assert.equal(vietCauNhanXet('Bình thường', 'cao'), 'Cân nặng bình thường, mỡ bụng cao hơn khuyến nghị');
  assert.equal(vietCauNhanXet('Thừa cân', 'rat_cao'), 'Thừa cân, mỡ bụng rất cao');
  assert.equal(vietCauNhanXet('Thiếu cân', 'trong_khuyen_nghi'), 'Thiếu cân, vòng eo trong khuyến nghị');
  assert.equal(vietCauNhanXet('Béo phì độ II', null), 'Béo phì độ II');
  assert.equal(vietCauNhanXet('Bình thường', null), 'Cân nặng bình thường');
});

test('số tháng giảm cân với 2–3 kg mỗi tháng', () => {
  assert.deepEqual(tinhSoThang(7, 2, 3), { it_nhat: 3, nhieu_nhat: 4 });
  assert.deepEqual(tinhSoThang(12, 2, 3), { it_nhat: 4, nhieu_nhat: 6 });
  assert.deepEqual(tinhSoThang(6, 2, 3), { it_nhat: 2, nhieu_nhat: 3 });
  assert.deepEqual(tinhSoThang(1, 2, 3), { it_nhat: 1, nhieu_nhat: 1 });
});

test('các mốc theo tháng: trừ 2 kg mỗi tháng, mốc cuối là cân mục tiêu', () => {
  assert.deepEqual(tinhCacMoc(72, 65, 72, 2), [
    { thang: 1, can_kg: 70, trang_thai: 'dang_toi' },
    { thang: 2, can_kg: 68, trang_thai: 'chua_toi' },
    { thang: 3, can_kg: 66, trang_thai: 'chua_toi' },
    { thang: 4, can_kg: 65, trang_thai: 'chua_toi' },
  ]);
  assert.deepEqual(
    tinhCacMoc(72, 65, 70, 2).map((moc) => moc.trang_thai),
    ['da_dat', 'dang_toi', 'chua_toi', 'chua_toi'],
  );
  assert.deepEqual(tinhCacMoc(72, 64, 72, 2).map((moc) => moc.can_kg), [70, 68, 66, 64]);
  assert.deepEqual(tinhCacMoc(72.4, 65, 72.4, 2).map((moc) => moc.can_kg), [70.4, 68.4, 66.4, 65]);
  assert.deepEqual(
    tinhCacMoc(72, 65, 64, 2).map((moc) => moc.trang_thai),
    ['da_dat', 'da_dat', 'da_dat', 'da_dat'],
  );
});

test('tiến độ: kẹp từ 0 tới số kg cần đi, phần trăm làm tròn', () => {
  assert.deepEqual(tinhTienDo('giam', 72, 65, 70), { so_kg_da_di: 2, so_kg_can_di: 7, phan_tram: 29 });
  assert.deepEqual(tinhTienDo('giam', 72, 65, 73), { so_kg_da_di: 0, so_kg_can_di: 7, phan_tram: 0 });
  assert.deepEqual(tinhTienDo('giam', 72, 65, 64), { so_kg_da_di: 7, so_kg_can_di: 7, phan_tram: 100 });
  assert.deepEqual(tinhTienDo('tang', 55, 62, 56), { so_kg_da_di: 1, so_kg_can_di: 7, phan_tram: 14 });
});
