import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { layMonHayAn, layMotBuaAn, suaBuaAn, themBuaAn, xoaBuaAn } from '../../src/bua-an/BuaAnApi';
import type { LoaiBua, MonHayAn } from '../../src/bua-an/BuaAnApi';
import { TEN_BUA, THU_TU_BUA } from '../../src/bua-an/TenBua';
import { Button } from '../../src/shared/components/Button';
import { Chip } from '../../src/shared/components/Chip';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { TextField } from '../../src/shared/components/TextField';
import { formatDateLabel, todayKey } from '../../src/shared/dateKey';
import { colors } from '../../src/shared/theme';

// Giới hạn chặn gõ nhầm, giống backend (BuaAnService.ts)
const TEN_MON_DAI_NHAT = 100;
const KHAU_PHAN_DAI_NHAT = 100;
const CALO_LON_NHAT = 10000;

// Đổi chữ trong ô gam thành số: trống là null, sai dạng là NaN
function docSoGam(chu: string): number | null {
  if (chu.trim() === '') {
    return null;
  }
  return Number(chu.replace(',', '.'));
}

export default function SuaBuaAn() {
  // Có id là sửa món đã có; không có id là thêm món mới vào ngày và bữa được chọn sẵn ở trang chủ
  const thamSo = useLocalSearchParams<{ id?: string; ngay?: string; loaiBua?: LoaiBua }>();
  const buaAnId = thamSo.id;
  const dangSua = buaAnId !== undefined;

  // Ngày và bữa của món
  const [ngay, setNgay] = useState(thamSo.ngay ?? todayKey());
  const [loaiBua, setLoaiBua] = useState<LoaiBua>(thamSo.loaiBua ?? 'sang');

  // Các ô nhập
  const [tenMon, setTenMon] = useState('');
  const [khauPhan, setKhauPhan] = useState('');
  const [soCalo, setSoCalo] = useState('');
  const [dam, setDam] = useState('');
  const [tinhBot, setTinhBot] = useState('');
  const [beo, setBeo] = useState('');
  const [moChiTiet, setMoChiTiet] = useState(false);

  // Dữ liệu tải từ server và trạng thái màn hình
  const [monHayAn, setMonHayAn] = useState<MonHayAn[]>([]);
  const [dangTai, setDangTai] = useState(dangSua);
  const [loiNhap, setLoiNhap] = useState<Record<string, string>>({});
  const [loiServer, setLoiServer] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  // Mở màn: sửa thì tải món cũ để điền sẵn, thêm thì tải danh sách món hay ăn
  useEffect(() => {
    taiDuLieu();
  }, []);

  async function taiDuLieu() {
    setLoiServer('');
    try {
      if (buaAnId !== undefined) {
        const buaAn = await layMotBuaAn(buaAnId);
        setNgay(buaAn.ngay);
        setLoaiBua(buaAn.loai_bua);
        dienSan(buaAn);
      } else {
        setMonHayAn(await layMonHayAn());
      }
      setDangTai(false);
    } catch (loi) {
      setLoiServer((loi as Error).message);
    }
  }

  // Điền các ô từ một món có sẵn (món cũ đang sửa, hoặc món hay ăn vừa bấm)
  function dienSan(mon: MonHayAn) {
    setTenMon(mon.ten_mon);
    setKhauPhan(mon.khau_phan);
    setSoCalo(String(mon.so_calo));
    setDam(mon.dam_g === null ? '' : String(mon.dam_g));
    setTinhBot(mon.tinh_bot_g === null ? '' : String(mon.tinh_bot_g));
    setBeo(mon.beo_g === null ? '' : String(mon.beo_g));
    // Món có số liệu đạm, tinh bột, béo thì mở sẵn phần chi tiết
    setMoChiTiet(mon.dam_g !== null || mon.tinh_bot_g !== null || mon.beo_g !== null);
  }

  // Kiểm các ô, đúng thì gửi lên server
  async function handleLuu() {
    // Bước 1. Kiểm từng ô, gom lỗi theo tên ô
    const loiMoi: Record<string, string> = {};
    if (tenMon.trim() === '') {
      loiMoi.tenMon = 'Hãy nhập tên món';
    }
    const soCaloSo = Number(soCalo);
    if (soCalo.trim() === '' || !Number.isInteger(soCaloSo) || soCaloSo < 0 || soCaloSo > CALO_LON_NHAT) {
      loiMoi.soCalo = `Calo là số nguyên từ 0 đến ${CALO_LON_NHAT.toLocaleString('vi-VN')}`;
    }
    const damSo = docSoGam(dam);
    const tinhBotSo = docSoGam(tinhBot);
    const beoSo = docSoGam(beo);
    for (const soGam of [damSo, tinhBotSo, beoSo]) {
      if (soGam !== null && (Number.isNaN(soGam) || soGam < 0)) {
        loiMoi.chiTiet = 'Đạm, tinh bột, béo phải là số không âm';
        setMoChiTiet(true);
      }
    }
    setLoiNhap(loiMoi);
    if (Object.keys(loiMoi).length > 0) {
      return;
    }

    // Bước 2. Gửi lên server rồi quay lại trang chủ
    const buaAnGuiLen = {
      ngay: ngay,
      loai_bua: loaiBua,
      ten_mon: tenMon.trim(),
      khau_phan: khauPhan.trim(),
      so_calo: soCaloSo,
      dam_g: damSo,
      tinh_bot_g: tinhBotSo,
      beo_g: beoSo,
    };
    setLoiServer('');
    setDangLuu(true);
    try {
      if (buaAnId !== undefined) {
        await suaBuaAn(buaAnId, buaAnGuiLen);
      } else {
        await themBuaAn(buaAnGuiLen);
      }
      router.back();
    } catch (loi) {
      setLoiServer((loi as Error).message);
      setDangLuu(false);
    }
  }

  // Hỏi lại trước khi xóa món
  function xacNhanXoa() {
    if (buaAnId === undefined) {
      return;
    }
    Alert.alert('Xóa món này?', `${tenMon} sẽ bị xóa khỏi nhật ký.`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await xoaBuaAn(buaAnId);
            router.back();
          } catch (loi) {
            setLoiServer((loi as Error).message);
          }
        },
      },
    ]);
  }

  // Đang tải món cũ, hoặc tải lỗi
  if (dangTai) {
    return (
      <SafeAreaView style={styles.giuaManHinh}>
        {loiServer ? <ErrorBox message={loiServer} onRetry={taiDuLieu} /> : <ActivityIndicator color={colors.primary} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.tieuDe}>{dangSua ? 'Sửa món' : `Thêm ${TEN_BUA[loaiBua].toLowerCase()}`}</Text>
        <Text style={styles.moTa}>{formatDateLabel(ngay)}</Text>

        {loiServer ? <ErrorBox message={loiServer} /> : null}

        {/* Sửa thì cho đổi bữa; thêm thì bữa đã chọn sẵn từ nút + ở trang chủ */}
        {dangSua ? (
          <View style={styles.hangChip}>
            {THU_TU_BUA.map((bua) => (
              <Chip key={bua} label={TEN_BUA[bua]} isSelected={loaiBua === bua} onPress={() => setLoaiBua(bua)} />
            ))}
          </View>
        ) : null}

        {/* Món hay ăn: bấm là điền sẵn; người mới chưa có món nào thì không hiện */}
        {!dangSua && monHayAn.length > 0 ? (
          <View style={styles.khoiMonHayAn}>
            <Text style={styles.nhanNhom}>Món bạn hay ăn</Text>
            <View style={styles.hangChip}>
              {monHayAn.map((mon) => (
                <Chip
                  key={mon.ten_mon}
                  label={`${mon.ten_mon} · ${mon.so_calo.toLocaleString('vi-VN')}`}
                  isSelected={false}
                  onPress={() => dienSan(mon)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <TextField
          label="Tên món"
          value={tenMon}
          onChangeText={setTenMon}
          error={loiNhap.tenMon ?? ''}
          placeholder="Ví dụ: Cơm sườn"
          maxLength={TEN_MON_DAI_NHAT}
        />
        <TextField
          label="Khẩu phần đã ăn (không bắt buộc)"
          value={khauPhan}
          onChangeText={setKhauPhan}
          error=""
          placeholder="Ví dụ: 2 chén, 1 tô nhỏ, 150 g"
          maxLength={KHAU_PHAN_DAI_NHAT}
        />
        <TextField
          label="Calo của phần đã ăn (kcal)"
          value={soCalo}
          onChangeText={setSoCalo}
          error={loiNhap.soCalo ?? ''}
          placeholder="Ví dụ: 450"
          isNumber
        />

        {/* Chi tiết không bắt buộc: bấm để mở hoặc thu gọn */}
        <Pressable style={styles.hangMoChiTiet} onPress={() => setMoChiTiet(!moChiTiet)}>
          <Text style={styles.chuMoChiTiet}>Đạm, tinh bột, béo (không bắt buộc)</Text>
          <Ionicons name={moChiTiet ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
        </Pressable>
        {moChiTiet ? (
          <View>
            <View style={styles.hangBaO}>
              <View style={styles.motO}>
                <TextField label="Đạm (g)" value={dam} onChangeText={setDam} error="" isNumber />
              </View>
              <View style={styles.motO}>
                <TextField label="Tinh bột (g)" value={tinhBot} onChangeText={setTinhBot} error="" isNumber />
              </View>
              <View style={styles.motO}>
                <TextField label="Béo (g)" value={beo} onChangeText={setBeo} error="" isNumber />
              </View>
            </View>
            {loiNhap.chiTiet ? <Text style={styles.chuLoi}>{loiNhap.chiTiet}</Text> : null}
          </View>
        ) : null}

        <View style={styles.khoangNut}>
          <Button title="Lưu" loadingTitle="Đang lưu…" isLoading={dangLuu} onPress={handleLuu} />
        </View>

        {dangSua ? (
          <Pressable style={styles.nutXoa} onPress={xacNhanXoa}>
            <Text style={styles.chuXoa}>Xóa món</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  giuaManHinh: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  tieuDe: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  moTa: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  hangChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  khoiMonHayAn: {
    marginBottom: 4,
  },
  nhanNhom: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  hangMoChiTiet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  chuMoChiTiet: {
    fontSize: 15,
    color: colors.primary,
  },
  hangBaO: {
    flexDirection: 'row',
    gap: 8,
  },
  motO: {
    flex: 1,
  },
  chuLoi: {
    fontSize: 13,
    color: colors.error,
  },
  khoangNut: {
    marginTop: 20,
  },
  nutXoa: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  chuXoa: {
    fontSize: 15,
    color: colors.error,
  },
});
