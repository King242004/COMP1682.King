import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { NhanDiUng } from '../../di-ung/NhanDiUng';
import { vietKhoiLuong } from '../../don-vi/DoiDonVi';
import { useDonVi } from '../../don-vi/DonViContext';
import type { MonDaChon } from '../../quet-mon/MonDaChon';
import { Card } from '../../shared/components/Card';
import { ErrorBox } from '../../shared/components/ErrorBox';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../shared/theme';
import { layTatCaMon, layTatCaThucPham } from '../../tra-mon/TraMonApi';
import type { MonTraCuu, ThucPham } from '../../tra-mon/TraMonApi';
import { ChonSoGam } from './tim-mon/ChonSoGam';
import { ChonSoSuat } from './tim-mon/ChonSoSuat';

// Mỗi nhóm hiện tối đa 5 dòng vì danh sách nằm ngay trong màn thêm món; là lựa chọn giao diện
const SO_DONG_MOI_NHOM = 5;

type TimMonProps = {
  isDisabled: boolean;
  onChon: (mon: MonDaChon) => void;
};

// Đưa chữ về dạng để so: chữ thường, bỏ dấu phẩy (gõ "khoai lang luộc" vẫn ra "Khoai lang, luộc")
function chuDeSo(chu: string): string {
  return chu.trim().toLowerCase().replaceAll(',', '');
}

// Thẻ "Tìm món" ở bước 1 của màn thêm món: 2 nhóm món của Viện (theo suất) và thực phẩm (trên 100 g)
export function TimMon({ isDisabled, onChon }: TimMonProps) {
  const { donVi, heSo } = useDonVi();
  // Cả 2 kho tải một lần; null là đang tải
  const [tatCaMon, setTatCaMon] = useState<MonTraCuu[] | null>(null);
  const [tatCaThucPham, setTatCaThucPham] = useState<ThucPham[] | null>(null);
  const [tuKhoa, setTuKhoa] = useState('');
  // Dòng đang chọn: một món hoặc một thực phẩm; cả hai null là đang xem danh sách
  const [monDangChon, setMonDangChon] = useState<MonTraCuu | null>(null);
  const [thucPhamDangChon, setThucPhamDangChon] = useState<ThucPham | null>(null);
  const [loi, setLoi] = useState('');

  // Mở màn là tải cả 2 kho
  useEffect(() => {
    taiHaiKho();
  }, []);

  async function taiHaiKho() {
    setLoi('');
    try {
      setTatCaMon(await layTatCaMon());
      setTatCaThucPham(await layTatCaThucPham());
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Quay lại danh sách, giữ nguyên chữ đang tìm
  function chonMonKhac() {
    setMonDangChon(null);
    setThucPhamDangChon(null);
  }

  // Lọc 2 kho theo từ khóa: so với tên có dấu và tên không dấu
  const tuKhoaDeSo = chuDeSo(tuKhoa);
  let monPhuHop: MonTraCuu[] = [];
  if (tatCaMon !== null) {
    monPhuHop = tatCaMon.filter(
      (mon) => chuDeSo(mon.ten_mon).includes(tuKhoaDeSo) || chuDeSo(mon.ten_khong_dau).includes(tuKhoaDeSo),
    );
  }
  let thucPhamPhuHop: ThucPham[] = [];
  if (tatCaThucPham !== null) {
    thucPhamPhuHop = tatCaThucPham.filter(
      (thucPham) => chuDeSo(thucPham.ten_thuc_pham).includes(tuKhoaDeSo) || thucPham.ten_khong_dau.includes(tuKhoaDeSo),
    );
  }
  const daTaiXong = tatCaMon !== null && tatCaThucPham !== null;
  // Ô tìm còn trống thì chưa hiện danh sách, để bước 1 không dài
  const dangTim = tuKhoaDeSo !== '';

  return (
    <Card>
      <Text style={styles.tieuDeThe}>Tìm món</Text>
      {loi ? <ErrorBox message={loi} onRetry={taiHaiKho} /> : null}

      {/* Đã bấm một món: chọn số suất */}
      {monDangChon ? <ChonSoSuat mon={monDangChon} isDisabled={isDisabled} onChon={onChon} onChonKhac={chonMonKhac} /> : null}

      {/* Đã bấm một thực phẩm: gõ số gam */}
      {thucPhamDangChon ? <ChonSoGam thucPham={thucPhamDangChon} isDisabled={isDisabled} onChon={onChon} onChonKhac={chonMonKhac} /> : null}

      {/* Chưa bấm dòng nào: ô tìm, dòng nguồn và 2 nhóm */}
      {!monDangChon && !thucPhamDangChon ? (
        <View>
          <View style={styles.thanhTim}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.oTim}
              value={tuKhoa}
              onChangeText={setTuKhoa}
              placeholder="Ví dụ: phở bò, khoai lang"
              placeholderTextColor={colors.textSecondary}
              editable={!isDisabled}
            />
          </View>
          <Text style={styles.chuNguon}>Dữ liệu Viện Dinh dưỡng Quốc gia</Text>
          {dangTim && !daTaiXong && !loi ? <ActivityIndicator color={colors.primary} /> : null}

          {/* Cả 2 nhóm đều không có gì */}
          {dangTim && daTaiXong && monPhuHop.length === 0 && thucPhamPhuHop.length === 0 ? (
            <Text style={styles.chuPhu}>Không tìm thấy</Text>
          ) : null}

          {/* Nhóm món của Viện, calo là của 1 suất; không có món khớp thì ẩn cả nhóm */}
          {dangTim && daTaiXong && monPhuHop.length > 0 ? (
            <View style={styles.nhom}>
              <View style={styles.hangTieuDe}>
                <Text style={styles.tieuDeNhom}>Món của Viện</Text>
                <Text style={styles.chuPhu}>tính theo 1 suất</Text>
              </View>
              {monPhuHop.slice(0, SO_DONG_MOI_NHOM).map((mon) => (
                <Pressable
                  key={mon.ma_so}
                  style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]}
                  disabled={isDisabled}
                  onPress={() => setMonDangChon(mon)}
                >
                  {/* Tên món, dưới là nhãn ⚠ nếu món có thứ người dùng dị ứng */}
                  <View style={styles.cotTen}>
                    <Text style={styles.tenDong}>{mon.ten_mon}</Text>
                    <NhanDiUng danhSachNhom={mon.nhom_di_ung} />
                  </View>
                  <Text style={styles.chuPhu}>{Math.round(mon.so_calo).toLocaleString('vi-VN')} kcal</Text>
                </Pressable>
              ))}
              {monPhuHop.length > SO_DONG_MOI_NHOM ? <Text style={styles.chuPhu}>Còn nữa, gõ thêm chữ để thu hẹp</Text> : null}
            </View>
          ) : null}

          {/* Nhóm thực phẩm, calo là của 100 g; không có thực phẩm khớp thì ẩn cả nhóm */}
          {dangTim && daTaiXong && thucPhamPhuHop.length > 0 ? (
            <View style={styles.nhom}>
              <View style={styles.hangTieuDe}>
                <Text style={styles.tieuDeNhom}>Thực phẩm</Text>
                <Text style={styles.chuPhu}>tính trên 100 g{donVi === 'anh_my' && heSo !== null ? ` (${vietKhoiLuong(100, donVi, heSo)})` : ''}</Text>
              </View>
              {thucPhamPhuHop.slice(0, SO_DONG_MOI_NHOM).map((thucPham) => (
                <Pressable
                  key={thucPham.ma_so}
                  style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]}
                  disabled={isDisabled}
                  onPress={() => setThucPhamDangChon(thucPham)}
                >
                  {/* Tên thực phẩm, dưới là nhãn ⚠ nếu có thứ người dùng dị ứng */}
                  <View style={styles.cotTen}>
                    <Text style={styles.tenDong}>{thucPham.ten_thuc_pham}</Text>
                    <NhanDiUng danhSachNhom={thucPham.nhom_di_ung} />
                  </View>
                  <Text style={styles.chuPhu}>{Math.round(thucPham.kcal_100g).toLocaleString('vi-VN')} kcal</Text>
                </Pressable>
              ))}
              {thucPhamPhuHop.length > SO_DONG_MOI_NHOM ? <Text style={styles.chuPhu}>Còn nữa, gõ thêm chữ để thu hẹp</Text> : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tieuDeThe: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.small,
  },
  thanhTim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
  },
  oTim: {
    flex: 1,
    height: '100%',
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chuNguon: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.small,
  },
  nhom: {
    marginTop: spacing.small,
  },
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  tieuDeNhom: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.primary,
  },
  dong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.medium,
    minHeight: 44,
    padding: spacing.medium,
    borderRadius: radius.input,
    backgroundColor: colors.card,
    marginBottom: spacing.small,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  cotTen: {
    flex: 1,
  },
  tenDong: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
});
