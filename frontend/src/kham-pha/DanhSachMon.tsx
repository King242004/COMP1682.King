import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../shared/components/Button';
import { ErrorBox } from '../shared/components/ErrorBox';
import { TextField } from '../shared/components/TextField';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../shared/theme';
import { layTatCaMon } from '../tra-mon/TraMonApi';
import type { MonTraCuu } from '../tra-mon/TraMonApi';
import { ChiTietMon } from './ChiTietMon';

// Mỗi lần hiện thêm 20 món, để không tải 414 ảnh cùng lúc; là lựa chọn giao diện
const SO_MON_MOI_LAN = 20;

// Phần "Món ăn" của tab Khám phá: ô tìm, danh sách món Viện Dinh dưỡng đã cân, bấm để xem chi tiết
export function DanhSachMon() {
  // Cả bảng món tải một lần; null là đang tải
  const [tatCaMon, setTatCaMon] = useState<MonTraCuu[] | null>(null);
  const [tuKhoa, setTuKhoa] = useState('');
  const [soMonDangHien, setSoMonDangHien] = useState(SO_MON_MOI_LAN);
  const [monDangXem, setMonDangXem] = useState<MonTraCuu | null>(null);
  const [cauBao, setCauBao] = useState('');
  const [loi, setLoi] = useState('');

  // Mở phần này là tải cả bảng món
  useEffect(() => {
    taiMon();
  }, []);

  async function taiMon() {
    setLoi('');
    try {
      setTatCaMon(await layTatCaMon());
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  // Gõ từ khóa mới thì quay về 20 món đầu
  function doiTuKhoa(chu: string) {
    setTuKhoa(chu);
    setSoMonDangHien(SO_MON_MOI_LAN);
  }

  // Thêm xong thì đóng chi tiết và hiện câu báo trên danh sách
  function khiDaThem(cauBaoMoi: string) {
    setMonDangXem(null);
    setCauBao(cauBaoMoi);
  }

  // Lọc theo từ khóa: so với tên có dấu và tên không dấu, không phân biệt chữ hoa
  const tuKhoaChuThuong = tuKhoa.trim().toLowerCase();
  let monPhuHop: MonTraCuu[] = [];
  if (tatCaMon !== null) {
    monPhuHop = tatCaMon.filter(
      (mon) => mon.ten_mon.toLowerCase().includes(tuKhoaChuThuong) || mon.ten_khong_dau.includes(tuKhoaChuThuong),
    );
  }
  const monDangHien = monPhuHop.slice(0, soMonDangHien);

  return (
    <View>
      {/* Ô tìm: gõ tới đâu lọc tới đó */}
      <TextField label="Tìm món" value={tuKhoa} onChangeText={doiTuKhoa} error="" placeholder="Ví dụ: phở bò" />
      <Text style={styles.chuPhu}>Số liệu do Viện Dinh dưỡng cân và phân tích, tính cho 1 suất.</Text>

      {cauBao ? <Text style={styles.cauBao}>{cauBao}</Text> : null}
      {loi ? <ErrorBox message={loi} onRetry={taiMon} /> : null}
      {!tatCaMon && !loi ? <ActivityIndicator color={colors.primary} /> : null}
      {tatCaMon && monPhuHop.length === 0 ? (
        <Text style={styles.chuPhu}>
          Không thấy món này. Bảng chỉ có món Viện Dinh dưỡng đã cân (chủ yếu miền Bắc); hãy thêm bằng nút + ở trang chủ (chụp ảnh hoặc gõ tên).
        </Text>
      ) : null}

      {/* Mỗi món một thẻ: ảnh suất, tên, calo, đạm */}
      {monDangHien.map((mon) => (
        <Pressable
          key={mon.ma_so}
          style={({ pressed }) => [styles.theMon, pressed ? styles.dangBam : null]}
          onPress={() => setMonDangXem(mon)}
        >
          <Image source={{ uri: mon.anh_url }} style={styles.anh} resizeMode="cover" />
          <View style={styles.thongTin}>
            <Text style={styles.tenMon}>{mon.ten_mon}</Text>
            <Text style={styles.chuSoLieu}>
              1 suất · {Math.round(mon.so_calo).toLocaleString('vi-VN')} kcal · đạm {Math.round(mon.dam_g)} g
            </Text>
          </View>
        </Pressable>
      ))}

      {/* Còn món chưa hiện thì cho xem thêm */}
      {monPhuHop.length > soMonDangHien ? (
        <Button
          title={`Xem thêm (còn ${monPhuHop.length - soMonDangHien} món)`}
          loadingTitle=""
          isLoading={false}
          isSecondary
          onPress={() => setSoMonDangHien(soMonDangHien + SO_MON_MOI_LAN)}
        />
      ) : null}

      {/* Bấm một món thì mở màn nổi chi tiết */}
      {monDangXem ? <ChiTietMon mon={monDangXem} onDong={() => setMonDangXem(null)} onDaThem={khiDaThem} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  cauBao: {
    fontSize: fontSizes.body,
    color: colors.textOnPrimaryLight,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.input,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    overflow: 'hidden',
  },
  // Không dùng overflow hidden ở thẻ vì iPhone sẽ cắt mất bóng; ảnh tự bo hai góc trên
  theMon: {
    backgroundColor: colors.surface,
    ...shadows.card,
    borderRadius: radius.card,
    marginBottom: spacing.medium,
  },
  anh: {
    width: '100%',
    aspectRatio: 2,
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
  thongTin: {
    padding: spacing.medium,
  },
  tenMon: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  chuSoLieu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
