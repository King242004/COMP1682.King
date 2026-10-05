import assert from 'node:assert/strict';
import { test } from 'node:test';

import { docSanPhamMaVach } from './DocSanPhamMaVach.ts';

test('không tìm thấy sản phẩm (status 0) thì trả về null', () => {
  assert.equal(docSanPhamMaVach({ status: 0, status_verbose: 'product not found' }), null);
});

test('có sản phẩm nhưng không có kcal trên 100 g thì trả về null', () => {
  assert.equal(docSanPhamMaVach({ status: 1, product: { product_name: 'Nước', nutriments: {} } }), null);
});

test('đọc đủ tên, nhãn hiệu, số liệu và khối lượng 1 phần dạng chữ', () => {
  const sanPham = docSanPhamMaVach({
    status: 1,
    product: {
      product_name: 'Sữa chua có đường',
      brands: 'Vinamilk',
      serving_quantity: '100',
      nutriments: {
        'energy-kcal_100g': 95,
        proteins_100g: 3.2,
        carbohydrates_100g: 15.5,
        fat_100g: 2.4,
        salt_100g: 0.13,
        sugars_100g: 14,
        'saturated-fat_100g': 1.6,
      },
    },
  });
  assert.deepEqual(sanPham, {
    ten_san_pham: 'Sữa chua có đường (Vinamilk)',
    kcal_100g: 95,
    dam_100g: 3.2,
    tinh_bot_100g: 15.5,
    beo_100g: 2.4,
    muoi_100g: 0.13,
    duong_100g: 14,
    beo_no_100g: 1.6,
    khoi_luong_1_phan_g: 100,
  });
});

test('thiếu tên, thiếu chất và thiếu khối lượng 1 phần thì để mặc định', () => {
  const sanPham = docSanPhamMaVach({ status: 1, product: { nutriments: { 'energy-kcal_100g': 400 } } });
  assert.equal(sanPham?.ten_san_pham, 'Sản phẩm chưa có tên');
  assert.equal(sanPham?.dam_100g, null);
  assert.equal(sanPham?.muoi_100g, null);
  assert.equal(sanPham?.khoi_luong_1_phan_g, null);
});
