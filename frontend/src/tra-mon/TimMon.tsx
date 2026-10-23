import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MonDaChon } from '../quet-mon/MonDaChon';
import { ErrorBox } from '../shared/components/ErrorBox';
import { Screen } from '../shared/components/Screen';
import { ScreenTitle } from '../shared/components/ScreenTitle';
import { TextField } from '../shared/components/TextField';
import { colors, fontSizes, pressedOpacity, spacing } from '../shared/theme';
import { layTatCaMon, layTatCaThucPham } from './TraMonApi';
import type { MonTraCuu, ThucPham } from './TraMonApi';
import { ChonSoGam } from './tim-mon/ChonSoGam';
import { ChonSoSuat } from './tim-mon/ChonSoSuat';

// Mỗi nhóm hiện tối đa 20 dòng để danh sách không quá dài; là lựa chọn giao diện
const SO_DONG_MOI_NHOM = 20;

type TimMonProps = {
  // Chữ đang có ở ô Tên món, điền sẵn vào ô tìm
  tuKhoaBanDau: string;
  onChon: (mon: MonDaChon) => void;
  onDong: () => void;
};

// Đưa chữ về dạng để so: chữ thường, bỏ dấu phẩy (gõ "khoai lang luộc" vẫn ra "Khoai lang, luộc")
function chuDeSo(chu: string): string {
  return chu.trim().toLowerCase().replaceAll(',', '');
}

// Màn tìm mở từ kính lúp ở ô Tên món: 2 nhóm món của Viện (theo suất) và thực phẩm (trên 100 g)
export function TimMon({ tuKhoaBanDau, onChon, onDong }: TimMonProps) {
  // Cả 2 kho tải một lần; null là đang tải
  const [tatCaMon, setTatCaMon] = useState<MonTraCuu[] | null>(null);
  const [tatCaThucPham, setTatCaThucPham] = useState<ThucPham[] | null>(null);
  const [tuKhoa, setTuKhoa] = useState(tuKhoaBanDau);
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

  return (
    <Screen>
      <ScreenTitle title="Tìm món" onBack={onDong} />
      {loi ? <ErrorBox message={loi} onRetry={taiHaiKho} /> : null}

      {/* Đã bấm một món: chọn số suất */}
      {monDangChon ? <ChonSoSuat mon={monDangChon} onChon={onChon} onChonKhac={chonMonKhac} /> : null}

      {/* Đã bấm một thực phẩm: gõ số gam */}
      {thucPhamDangChon ? <ChonSoGam thucPham={thucPhamDangChon} onChon={onChon} onChonKhac={chonMonKhac} /> : null}

      {/* Chưa bấm dòng nào: ô tìm và 2 nhóm */}
      {!monDangChon && !thucPhamDangChon ? (
        <View>
          <TextField label="Tìm món hoặc thực phẩm" value={tuKhoa} onChangeText={setTuKhoa} error="" placeholder="Ví dụ: phở bò, khoai lang" />
          {!daTaiXong && !loi ? <ActivityIndicator color={colors.primary} /> : null}

          {/* Cả 2 nhóm đều không có gì */}
          {daTaiXong && monPhuHop.length === 0 && thucPhamPhuHop.length === 0 ? (
            <Text style={styles.chuPhu}>Không thấy món này. Quay lại và dùng thẻ Mô tả để AI ước tính.</Text>
          ) : null}

          {/* Nhóm món của Viện, calo là của 1 suất */}
          {daTaiXong ? (
            <View style={styles.nhom}>
              <View style={styles.hangTieuDe}>
                <Text style={styles.tieuDe}>Món của Viện</Text>
                <Text style={styles.chuPhu}>tính theo 1 suất</Text>
              </View>
              {monPhuHop.length === 0 ? <Text style={styles.chuPhu}>Không thấy</Text> : null}
              {monPhuHop.slice(0, SO_DONG_MOI_NHOM).map((mon) => (
                <Pressable
                  key={mon.ma_so}
                  style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]}
                  onPress={() => setMonDangChon(mon)}
                >
                  <Text style={styles.tenDong}>{mon.ten_mon}</Text>
                  <Text style={styles.chuPhu}>{Math.round(mon.so_calo).toLocaleString('vi-VN')} kcal</Text>
                </Pressable>
              ))}
              {monPhuHop.length > SO_DONG_MOI_NHOM ? <Text style={styles.chuPhu}>Còn nữa, gõ thêm chữ để thu hẹp</Text> : null}
            </View>
          ) : null}

          {/* Nhóm thực phẩm, calo là của 100 g */}
          {daTaiXong ? (
            <View style={styles.nhom}>
              <View style={styles.hangTieuDe}>
                <Text style={styles.tieuDe}>Thực phẩm</Text>
                <Text style={styles.chuPhu}>tính trên 100 g</Text>
              </View>
              {thucPhamPhuHop.length === 0 ? <Text style={styles.chuPhu}>Không thấy</Text> : null}
              {thucPhamPhuHop.slice(0, SO_DONG_MOI_NHOM).map((thucPham) => (
                <Pressable
                  key={thucPham.ma_so}
                  style={({ pressed }) => [styles.dong, pressed ? styles.dangBam : null]}
                  onPress={() => setThucPhamDangChon(thucPham)}
                >
                  <Text style={styles.tenDong}>{thucPham.ten_thuc_pham}</Text>
                  <Text style={styles.chuPhu}>{Math.round(thucPham.kcal_100g).toLocaleString('vi-VN')} kcal</Text>
                </Pressable>
              ))}
              {thucPhamPhuHop.length > SO_DONG_MOI_NHOM ? <Text style={styles.chuPhu}>Còn nữa, gõ thêm chữ để thu hẹp</Text> : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  nhom: {
    marginBottom: spacing.large,
  },
  hangTieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.small,
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
  },
  dong: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.medium,
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  tenDong: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
});
