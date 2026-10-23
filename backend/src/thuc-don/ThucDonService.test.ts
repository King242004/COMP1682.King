import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { MonTraCuu } from '../tra-mon/TraMonQueries.ts';
import { docCaiDat, docThucDon } from './ThucDonService.ts';
import type { CaiDatThucDon } from './ThucDonService.ts';

// Cài đặt hợp lệ như app gửi lên: ăn cơm gia đình bữa tối, mâm 3 món có cá, rau, canh
const caiDatDung = {
  bua_com_nha: ['toi'],
  so_mon_com_nha: 3,
  thu_trong_mam: ['ca', 'rau', 'canh'],
  co_bua_phu: true,
  nhom_mon: ['bun_pho'],
  uu_tien: 'giau_dam',
  ghi_chu: '  thích cá  ',
};

// Hai món Viện mẫu (số như trong database)
const phoBo: MonTraCuu = {
  ma_so: 'HAN-113090', ten_mon: 'Phở bò tái chín', ten_khong_dau: 'pho bo tai chin', so_calo: 503.6, dam_g: 36.4, tinh_bot_g: 62.6,
  beo_g: 11.9, muoi_g: 3.3, anh_url: 'https://anh/pho.png', ten_goc: 'Phở bò tái chín', ghi_chu_suat: null, hien_o_kham_pha: true, nhom_mon: 'bun_pho',
};
const cheDoXanh: MonTraCuu = {
  ma_so: 'HAN-121002', ten_mon: 'Chè đỗ xanh trân châu', ten_khong_dau: 'che do xanh tran chau', so_calo: 300.4, dam_g: 8, tinh_bot_g: 60,
  beo_g: 2, muoi_g: 0.1, anh_url: 'https://anh/che.png', ten_goc: 'Chè đỗ xanh trân châu', ghi_chu_suat: null, hien_o_kham_pha: true, nhom_mon: 'che_do_uong',
};

// Bối cảnh kiểm: phở chỉ cho bữa chính, chè chỉ cho bữa phụ
function taoBoiCanh(caiDat: CaiDatThucDon) {
  return {
    caiDat: caiDat,
    monBuaChinh: new Map([[phoBo.ma_so, phoBo]]),
    monBuaPhu: new Map([[cheDoXanh.ma_so, cheDoXanh]]),
    khauPhanDaiNhat: 100,
  };
}

// Mâm cơm nhà hợp lệ cho bữa tối
const mamDung = {
  loai_bua: 'toi', cac_mon: ['Cá rô phi kho', 'Rau muống luộc', 'Canh chua'],
  so_calo: 620.4, dam_g: 35.26, tinh_bot_g: 80, beo_g: 15, muoi_g: 2.04, duong_g: 3, beo_no_g: 4,
  nguyen_lieu: ['Gạo 80 g', 'Cá rô phi 150 g', ''], cach_nau: ['Kho cá', 'Luộc rau', 'Nấu canh'],
};

test('docCaiDat: cài đặt đúng thì giữ nguyên, ghi chú bỏ khoảng trắng hai đầu', () => {
  assert.deepEqual(docCaiDat(caiDatDung), { ...caiDatDung, ghi_chu: 'thích cá' });
});

test('docCaiDat: sai số món, bữa lạ, trùng bữa, chọn nhiều thứ hơn số món, nhóm lạ, ưu tiên lạ, ghi chú quá dài thì trả null', () => {
  assert.equal(docCaiDat({ ...caiDatDung, so_mon_com_nha: 9 }), null);
  assert.equal(docCaiDat({ ...caiDatDung, so_mon_com_nha: 2.5 }), null);
  assert.equal(docCaiDat({ ...caiDatDung, bua_com_nha: ['khuya'] }), null);
  assert.equal(docCaiDat({ ...caiDatDung, bua_com_nha: ['toi', 'toi'] }), null);
  assert.equal(docCaiDat({ ...caiDatDung, so_mon_com_nha: 2 }), null);
  assert.equal(docCaiDat({ ...caiDatDung, nhom_mon: ['che_do_uong'] }), null);
  assert.equal(docCaiDat({ ...caiDatDung, uu_tien: 'nhieu_beo' }), null);
  assert.equal(docCaiDat({ ...caiDatDung, ghi_chu: 'a'.repeat(201) }), null);
  assert.equal(docCaiDat({ ...caiDatDung, co_bua_phu: 'co' }), null);
});

test('docThucDon: món Viện lấy tên, ảnh, số từ database; mâm cơm nhà làm tròn số, ghi các món vào khẩu phần', () => {
  const caiDat = docCaiDat(caiDatDung) as CaiDatThucDon;
  const duLieu = {
    mon_vien: [
      { loai_bua: 'sang', ma_so: 'HAN-113090' },
      { loai_bua: 'phu', ma_so: 'HAN-121002' },
    ],
    com_nha: [mamDung],
  };
  assert.deepEqual(docThucDon(duLieu, taoBoiCanh(caiDat)), [
    {
      loai_bua: 'sang', kieu: 'mon_vien', ma_so: 'HAN-113090', anh_url: 'https://anh/pho.png', ten_mon: 'Phở bò tái chín', khau_phan: '1 suất',
      so_calo: 504, dam_g: 36.4, tinh_bot_g: 62.6, beo_g: 11.9, muoi_g: 3.3, duong_g: null, beo_no_g: null, nguyen_lieu: [], cach_nau: [],
    },
    {
      loai_bua: 'phu', kieu: 'mon_vien', ma_so: 'HAN-121002', anh_url: 'https://anh/che.png', ten_mon: 'Chè đỗ xanh trân châu', khau_phan: '1 suất',
      so_calo: 300, dam_g: 8, tinh_bot_g: 60, beo_g: 2, muoi_g: 0.1, duong_g: null, beo_no_g: null, nguyen_lieu: [], cach_nau: [],
    },
    {
      loai_bua: 'toi', kieu: 'com_nha', ma_so: null, anh_url: null, ten_mon: 'Cơm nhà', khau_phan: 'Cá rô phi kho, Rau muống luộc, Canh chua',
      so_calo: 620, dam_g: 35.3, tinh_bot_g: 80, beo_g: 15, muoi_g: 2, duong_g: 3, beo_no_g: 4,
      nguyen_lieu: ['Gạo 80 g', 'Cá rô phi 150 g'], cach_nau: ['Kho cá', 'Luộc rau', 'Nấu canh'],
    },
  ]);
});

test('docThucDon: bỏ món Viện ngoài danh sách, sai loại bữa, trùng bữa, rơi vào bữa cơm gia đình; bỏ bữa phụ khi không có bữa phụ', () => {
  const caiDat = docCaiDat({ ...caiDatDung, co_bua_phu: false }) as CaiDatThucDon;
  const duLieu = {
    mon_vien: [
      { loai_bua: 'sang', ma_so: 'MA-LA' },
      { loai_bua: 'sang', ma_so: 'HAN-121002' },
      { loai_bua: 'toi', ma_so: 'HAN-113090' },
      { loai_bua: 'phu', ma_so: 'HAN-121002' },
      { loai_bua: 'trua', ma_so: 'HAN-113090' },
      { loai_bua: 'trua', ma_so: 'HAN-113090' },
    ],
    com_nha: [],
  };
  const ketQua = docThucDon(duLieu, taoBoiCanh(caiDat));
  assert.deepEqual(
    ketQua.map((mon) => mon.loai_bua + ' ' + mon.ma_so),
    ['trua HAN-113090'],
  );
});

test('docThucDon: bỏ mâm cơm nhà sai bữa, sai số món, thiếu nguyên liệu, thiếu cách nấu, calo âm, khẩu phần quá dài', () => {
  const caiDat = docCaiDat(caiDatDung) as CaiDatThucDon;
  const duLieu = {
    mon_vien: [],
    com_nha: [
      { ...mamDung, loai_bua: 'trua' },
      { ...mamDung, cac_mon: ['Cá kho', 'Canh chua'] },
      { ...mamDung, nguyen_lieu: [] },
      { ...mamDung, cach_nau: [' '] },
      { ...mamDung, so_calo: -5 },
      { ...mamDung, cac_mon: ['a'.repeat(40), 'b'.repeat(40), 'c'.repeat(40)] },
    ],
  };
  assert.deepEqual(docThucDon(duLieu, taoBoiCanh(caiDat)), []);
});

test('docThucDon: dữ liệu không đúng dạng thì trả về danh sách rỗng', () => {
  const caiDat = docCaiDat(caiDatDung) as CaiDatThucDon;
  assert.deepEqual(docThucDon(null, taoBoiCanh(caiDat)), []);
  assert.deepEqual(docThucDon({ mon_vien: 'không phải danh sách' }, taoBoiCanh(caiDat)), []);
});
