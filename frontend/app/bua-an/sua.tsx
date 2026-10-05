import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { layMonHayAn, layMotBuaAn, layNhatKyNgay, suaBuaAn, themBuaAn, xoaBuaAn } from '../../src/bua-an/BuaAnApi';
import type { LoaiBua, MonHayAn, NguonSoLieu, NhatKyNgay } from '../../src/bua-an/BuaAnApi';
import type { SoNenHanChe } from '../../src/bua-an/sua/CanhBaoNenHanChe';
import { ChonCachThem } from '../../src/bua-an/sua/ChonCachThem';
import { TheKetQuaMon } from '../../src/bua-an/sua/TheKetQuaMon';
import { TEN_BUA, THU_TU_BUA } from '../../src/bua-an/TenBua';
import { ChupAnhNhanMon } from '../../src/quet-mon/ChupAnhNhanMon';
import type { AnhVuaChup } from '../../src/quet-mon/ChupAnhNhanMon';
import { QuetMaVach } from '../../src/quet-mon/QuetMaVach';
import type { MonDaChon } from '../../src/quet-mon/MonDaChon';
import { uocTinhTheoTen } from '../../src/quet-mon/QuetMonApi';
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

// Nén ảnh còn 50% chất lượng trước khi gửi cho AI, để gửi nhanh và không quá giới hạn của server
const CHAT_LUONG_ANH = 0.5;

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
  const [nguonSoLieu, setNguonSoLieu] = useState<NguonSoLieu>('nhap_tay');

  // Muối, đường, béo no: chỉ AI hoặc mã vạch điền, người dùng không gõ
  const [muoi, setMuoi] = useState<number | null>(null);
  const [duong, setDuong] = useState<number | null>(null);
  const [beoNo, setBeoNo] = useState<number | null>(null);

  // Đã có món (hoặc đang sửa) thì hiện thẻ kết quả thay cho các cách thêm; moO là đang mở các ô nhập
  const [daCoMon, setDaCoMon] = useState(dangSua);
  const [moO, setMoO] = useState(false);

  // Nhật ký của ngày này để biết cả ngày đã ăn bao nhiêu; khi sửa thì nhớ số cũ của món để trừ ra
  const [nhatKy, setNhatKy] = useState<NhatKyNgay | null>(null);
  const [monCu, setMonCu] = useState<SoNenHanChe | null>(null);

  // Ảnh vừa chụp (mở màn nhận món), màn quét mã vạch, và trạng thái đang nhờ AI ước tính
  const [anhVuaChup, setAnhVuaChup] = useState<AnhVuaChup | null>(null);
  const [dangMoQuetMa, setDangMoQuetMa] = useState(false);
  const [dangUocTinh, setDangUocTinh] = useState(false);

  // Dữ liệu tải từ server và trạng thái màn hình
  const [monHayAn, setMonHayAn] = useState<MonHayAn[]>([]);
  const [dangTai, setDangTai] = useState(dangSua);
  const [loiNhap, setLoiNhap] = useState<Record<string, string>>({});
  const [loiServer, setLoiServer] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  // Mở màn: sửa thì tải món cũ để điền sẵn, thêm thì tải danh sách món hay ăn; cả hai đều tải nhật ký của ngày
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
        setMonCu({ muoi_g: buaAn.muoi_g, duong_g: buaAn.duong_g, beo_no_g: buaAn.beo_no_g });
        setNhatKy(await layNhatKyNgay(buaAn.ngay));
      } else {
        setMonHayAn(await layMonHayAn());
        setNhatKy(await layNhatKyNgay(ngay));
      }
      setDangTai(false);
    } catch (loi) {
      setLoiServer((loi as Error).message);
    }
  }

  // Điền các ô từ một món có sẵn (món cũ đang sửa, món hay ăn, món chọn từ ảnh / mã vạch, kết quả AI) rồi hiện thẻ kết quả
  function dienSan(mon: MonHayAn | MonDaChon) {
    setTenMon(mon.ten_mon);
    setKhauPhan(mon.khau_phan);
    setSoCalo(String(mon.so_calo));
    setDam(mon.dam_g === null ? '' : String(mon.dam_g));
    setTinhBot(mon.tinh_bot_g === null ? '' : String(mon.tinh_bot_g));
    setBeo(mon.beo_g === null ? '' : String(mon.beo_g));
    setMuoi(mon.muoi_g);
    setDuong(mon.duong_g);
    setBeoNo(mon.beo_no_g);
    setNguonSoLieu(mon.nguon_so_lieu);
    setDaCoMon(true);
    setMoO(false);
  }

  // Chọn "Gõ tên": hiện thẻ kết quả trống và mở ngay các ô nhập
  function chonGoTen() {
    setDaCoMon(true);
    setMoO(true);
  }

  // Người dùng tự sửa calo thì số liệu thành của họ
  function doiSoCalo(chu: string) {
    setSoCalo(chu);
    setNguonSoLieu('nhap_tay');
  }

  // Mở camera của máy để chụp món; chụp xong thì mở màn nhận món
  async function chupAnh() {
    const quyen = await ImagePicker.requestCameraPermissionsAsync();
    if (!quyen.granted) {
      setLoiServer('Cần quyền camera để chụp món');
      return;
    }
    const ketQuaChup = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: CHAT_LUONG_ANH, base64: true });
    if (ketQuaChup.canceled) {
      return;
    }
    const anh = ketQuaChup.assets[0];
    if (!anh.base64) {
      setLoiServer('Không đọc được ảnh, hãy chụp lại');
      return;
    }
    setAnhVuaChup({ uri: anh.uri, base64: anh.base64, mimeType: anh.mimeType ?? 'image/jpeg' });
  }

  // Nhờ AI ước tính theo tên món và khẩu phần đã gõ
  async function uocTinhBangAi() {
    const loiMoi: Record<string, string> = {};
    if (tenMon.trim() === '') {
      loiMoi.tenMon = 'Hãy nhập tên món';
    }
    if (khauPhan.trim() === '') {
      loiMoi.khauPhan = 'Hãy nhập khẩu phần để AI ước tính, ví dụ: 1 tô lớn';
    }
    setLoiNhap(loiMoi);
    if (Object.keys(loiMoi).length > 0) {
      return;
    }

    setLoiServer('');
    setDangUocTinh(true);
    try {
      const ketQua = await uocTinhTheoTen(tenMon.trim(), khauPhan.trim());
      if (ketQua.la_mon_an && ketQua.kha_nang.length > 0) {
        dienSan({ ...ketQua.kha_nang[0], nguon_so_lieu: 'ai' });
      } else {
        setLoiServer('AI không nhận ra món này, hãy nhập tay');
      }
    } catch (loi) {
      setLoiServer((loi as Error).message);
    }
    setDangUocTinh(false);
  }

  // Số đang có trong các ô, dùng cho thẻ kết quả và khi lưu
  const soCaloSo = Number(soCalo);
  const damSo = docSoGam(dam);
  const tinhBotSo = docSoGam(tinhBot);
  const beoSo = docSoGam(beo);

  // Kiểm các ô, đúng thì gửi lên server
  async function handleLuu() {
    // Bước 1. Kiểm từng ô, gom lỗi theo tên ô; có lỗi thì mở các ô nhập để người dùng thấy
    const loiMoi: Record<string, string> = {};
    if (tenMon.trim() === '') {
      loiMoi.tenMon = 'Hãy nhập tên món';
    }
    if (soCalo.trim() === '' || !Number.isInteger(soCaloSo) || soCaloSo < 0 || soCaloSo > CALO_LON_NHAT) {
      loiMoi.soCalo = `Calo là số nguyên từ 0 đến ${CALO_LON_NHAT.toLocaleString('vi-VN')}`;
    }
    for (const soGam of [damSo, tinhBotSo, beoSo]) {
      if (soGam !== null && (Number.isNaN(soGam) || soGam < 0)) {
        loiMoi.chiTiet = 'Đạm, tinh bột, béo phải là số không âm';
      }
    }
    setLoiNhap(loiMoi);
    if (Object.keys(loiMoi).length > 0) {
      setMoO(true);
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
      muoi_g: muoi,
      duong_g: duong,
      beo_no_g: beoNo,
      nguon_so_lieu: nguonSoLieu,
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
        <Text style={styles.tieuDe}>{dangSua ? 'Sửa món' : `Thêm vào ${TEN_BUA[loaiBua].toLowerCase()}`}</Text>
        <Text style={styles.moTa}>{formatDateLabel(ngay)}</Text>

        {loiServer ? <ErrorBox message={loiServer} /> : null}

        {/* Chọn bữa; trang chủ đã chọn sẵn, người dùng đổi được */}
        <View style={styles.hangChip}>
          {THU_TU_BUA.map((bua) => (
            <Chip key={bua} label={TEN_BUA[bua]} isSelected={loaiBua === bua} onPress={() => setLoaiBua(bua)} />
          ))}
        </View>

        {/* Bước 1. Chưa có món: chọn cách thêm hoặc bấm món hay ăn */}
        {!daCoMon ? (
          <ChonCachThem
            monHayAn={monHayAn}
            onChupAnh={chupAnh}
            onQuetMaVach={() => setDangMoQuetMa(true)}
            onGoTen={chonGoTen}
            onChonMonHayAn={dienSan}
          />
        ) : null}

        {/* Bước 2. Đã có món: thẻ kết quả, các ô nhập khi bấm "Sửa số liệu", nút lưu */}
        {daCoMon ? (
          <View>
            <TheKetQuaMon
              tenMon={tenMon}
              khauPhan={khauPhan}
              soCalo={soCalo.trim() === '' ? null : soCaloSo}
              dam={damSo}
              tinhBot={tinhBotSo}
              beo={beoSo}
              nguonSoLieu={nguonSoLieu}
              monNay={{ muoi_g: muoi, duong_g: duong, beo_no_g: beoNo }}
              monCu={monCu}
              nhatKy={nhatKy}
            />

            {!moO ? (
              <Button title="Sửa số liệu" loadingTitle="" isLoading={false} onPress={() => setMoO(true)} isSecondary />
            ) : null}

            {moO ? (
              <View>
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
                  error={loiNhap.khauPhan ?? ''}
                  placeholder="Ví dụ: 2 chén, 1 tô nhỏ, 150 g"
                  maxLength={KHAU_PHAN_DAI_NHAT}
                />
                {/* Không biết calo: nhờ AI ước tính theo tên và khẩu phần */}
                <View style={styles.khoiUocTinh}>
                  <Button
                    title="Ước tính bằng AI"
                    loadingTitle="AI đang ước tính…"
                    isLoading={dangUocTinh}
                    onPress={uocTinhBangAi}
                    isSecondary
                  />
                </View>
                <TextField
                  label="Calo của phần đã ăn (kcal)"
                  value={soCalo}
                  onChangeText={doiSoCalo}
                  error={loiNhap.soCalo ?? ''}
                  placeholder="Ví dụ: 450"
                  isNumber
                />
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
              <Button
                title={`Lưu vào ${TEN_BUA[loaiBua].toLowerCase()}`}
                loadingTitle="Đang lưu…"
                isLoading={dangLuu}
                onPress={handleLuu}
              />
            </View>

            {dangSua ? (
              <Pressable style={styles.nutXoa} onPress={xacNhanXoa}>
                <Text style={styles.chuXoa}>Xóa món</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {/* Màn nhận món từ ảnh và màn quét mã vạch; chọn xong thì điền vào thẻ kết quả */}
      <ChupAnhNhanMon anh={anhVuaChup} onChon={dienSan} onDong={() => setAnhVuaChup(null)} />
      <QuetMaVach dangMo={dangMoQuetMa} onChon={dienSan} onDong={() => setDangMoQuetMa(false)} />
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
    fontSize: 24,
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
    marginBottom: 16,
  },
  khoiUocTinh: {
    marginBottom: 12,
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
    marginTop: 16,
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
