import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { layMonHayAn, layMotBuaAn, layNhatKyNgay, suaBuaAn, themBuaAn, xoaBuaAn } from '../../src/bua-an/BuaAnApi';
import type { LoaiBua, MonHayAn, NguonSoLieu, NhatKyNgay } from '../../src/bua-an/BuaAnApi';
import { CanhBaoNenHanChe } from '../../src/bua-an/them-sua-bua-an/CanhBaoNenHanChe';
import type { SoNenHanChe } from '../../src/bua-an/them-sua-bua-an/CanhBaoNenHanChe';
import { MoTa } from '../../src/bua-an/them-sua-bua-an/MoTa';
import { TEN_BUA, THU_TU_BUA } from '../../src/bua-an/TenBua';
import { ChupAnhNhanMon } from '../../src/quet-mon/ChupAnhNhanMon';
import { QuetMaVach } from '../../src/quet-mon/QuetMaVach';
import type { MonDaChon } from '../../src/quet-mon/MonDaChon';
import { uocTinhTheoTen } from '../../src/quet-mon/QuetMonApi';
import { Button } from '../../src/shared/components/Button';
import { Chip } from '../../src/shared/components/Chip';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { docKhoiLuong, vietGioiHan, vietKhoiLuong } from '../../src/don-vi/DoiDonVi';
import { useDonVi } from '../../src/don-vi/DonViContext';
import { TextField } from '../../src/shared/components/TextField';
import { formatDateLabel, todayKey } from '../../src/shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../src/shared/theme';
import { TimMon } from '../../src/tra-mon/TimMon';
import type { CachThem } from '../../src/trang-chu/NutThemMon';

// Giới hạn chặn gõ nhầm, giống backend (BuaAnService.ts) và màn mã vạch (QuetMaVach.tsx)
const TEN_MON_DAI_NHAT = 100;
const KHAU_PHAN_DAI_NHAT = 100;
const CALO_LON_NHAT = 10000;
const SO_GAM_LON_NHAT = 5000;

// Hai thẻ của màn bút: viết một câu cho AI, hoặc tự nhập số
type TheNhap = 'mo-ta' | 'nhap-so';

// Lượng đã ăn ghi bằng chữ (khẩu phần) hay bằng số gam
type DonViLuong = 'khau-phan' | 'gram';

// Đổi chữ trong ô gam thành số: trống là null, sai dạng là NaN
function docSoGam(chu: string): number | null {
  if (chu.trim() === '') {
    return null;
  }
  return Number(chu.replace(',', '.'));
}

type DongChatProps = {
  ten: string;
  mau: string;
  giaTri: string;
  onDoi: (chu: string) => void;
  isDisabled: boolean;
};

// Một dòng đạm, tinh bột hoặc béo: chấm màu và tên bên trái (cùng màu Trang chủ), ô số gam bên phải
function DongChat({ ten, mau, giaTri, onDoi, isDisabled }: DongChatProps) {
  return (
    <View style={styles.dongChat}>
      <View style={[styles.chamMau, { backgroundColor: mau }]} />
      <Text style={styles.tenChat}>{ten}</Text>
      <TextInput
        style={[styles.oSoGam, isDisabled ? styles.oKhoa : null]}
        value={giaTri}
        onChangeText={onDoi}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textSecondary}
        editable={!isDisabled}
      />
      <Text style={styles.donViGam}>g</Text>
    </View>
  );
}

export default function ThemSuaBuaAn() {
  // Có id là sửa món đã có; không có id là thêm món mới, với ngày, bữa và cách thêm đã chọn ở trang chủ
  // monSan: món mở từ Khám phá, gửi sang dạng JSON để điền sẵn thẻ Nhập số
  const thamSo = useLocalSearchParams<{ id?: string; ngay?: string; loaiBua?: LoaiBua; cach?: CachThem; monSan?: string }>();
  const buaAnId = thamSo.id;
  const dangSua = buaAnId !== undefined;

  // Chỉ vào từ nút bút mới có 2 thẻ Mô tả / Nhập số, mở đầu ở Mô tả; sửa món, ảnh, mã vạch chỉ có Nhập số
  const coHaiThe = thamSo.cach === 'go-ten';
  const [theDangMo, setTheDangMo] = useState<TheNhap>(coHaiThe ? 'mo-ta' : 'nhap-so');

  // Ngày và bữa của món
  const [ngay, setNgay] = useState(thamSo.ngay ?? todayKey());
  const [loaiBua, setLoaiBua] = useState<LoaiBua>(thamSo.loaiBua ?? 'sang');

  // Các ô nhập của thẻ Nhập số
  const [tenMon, setTenMon] = useState('');
  // Câu cảnh báo dị ứng đi theo món chọn từ ảnh, mã vạch, thẻ Mô tả hoặc nút AI; rỗng là không có
  const [canhBaoDiUng, setCanhBaoDiUng] = useState('');
  const [donViLuong, setDonViLuong] = useState<DonViLuong>('khau-phan');
  const [khauPhan, setKhauPhan] = useState('');
  const [soGam, setSoGam] = useState('');
  // Ô lượng theo số: Mét gõ gam, Anh-Mỹ gõ oz
  const { donVi, heSo } = useDonVi();
  const laAnhMy = donVi === 'anh_my' && heSo !== null;
  const [soCalo, setSoCalo] = useState('');
  const [dam, setDam] = useState('');
  const [tinhBot, setTinhBot] = useState('');
  const [beo, setBeo] = useState('');
  const [nguonSoLieu, setNguonSoLieu] = useState<NguonSoLieu>('nhap_tay');

  // Muối, đường, béo no: chỉ AI hoặc mã vạch điền, người dùng không gõ
  const [muoi, setMuoi] = useState<number | null>(null);
  const [duong, setDuong] = useState<number | null>(null);
  const [beoNo, setBeoNo] = useState<number | null>(null);

  // Nhật ký của ngày này để biết cả ngày đã ăn bao nhiêu; khi sửa thì nhớ số cũ của món để trừ ra
  const [nhatKy, setNhatKy] = useState<NhatKyNgay | null>(null);
  const [monCu, setMonCu] = useState<SoNenHanChe | null>(null);

  // Màn chụp và màn quét mã vạch (mở sẵn theo cách đã chọn ở trang chủ), màn tìm mở từ kính lúp, và trạng thái đang nhờ AI ở từng thẻ
  const [dangMoChupAnh, setDangMoChupAnh] = useState(thamSo.cach === 'chup-anh');
  const [dangMoQuetMa, setDangMoQuetMa] = useState(thamSo.cach === 'ma-vach');
  const [dangMoTimMon, setDangMoTimMon] = useState(false);
  const [dangUocTinh, setDangUocTinh] = useState(false);
  const [dangUocTinhMoTa, setDangUocTinhMoTa] = useState(false);

  // Dữ liệu tải từ server và trạng thái màn hình
  const [monHayAn, setMonHayAn] = useState<MonHayAn[]>([]);
  const [dangTai, setDangTai] = useState(dangSua);
  const [loiNhap, setLoiNhap] = useState<Record<string, string>>({});
  const [loiServer, setLoiServer] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [dangXoa, setDangXoa] = useState(false);

  // Đang chờ AI, đang lưu hoặc đang xóa thì khóa cả form để không ai sửa giữa chừng
  const dangChay = dangUocTinh || dangUocTinhMoTa || dangLuu || dangXoa;

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
        // Mở từ Khám phá thì điền sẵn món đó để người dùng xem lại rồi mới lưu
        if (thamSo.monSan) {
          dienSan(JSON.parse(thamSo.monSan) as MonDaChon);
        }
        setMonHayAn(await layMonHayAn());
        setNhatKy(await layNhatKyNgay(ngay));
      }
      setDangTai(false);
    } catch (loi) {
      setLoiServer((loi as Error).message);
    }
  }

  // Điền các ô của thẻ Nhập số từ một món có sẵn (món cũ đang sửa, món hay ăn, món từ ảnh / mã vạch / thẻ Mô tả)
  function dienSan(mon: MonHayAn | MonDaChon) {
    setTenMon(mon.ten_mon);
    setDonViLuong('khau-phan');
    setKhauPhan(mon.khau_phan);
    setSoCalo(String(mon.so_calo));
    setDam(mon.dam_g === null ? '' : String(mon.dam_g));
    setTinhBot(mon.tinh_bot_g === null ? '' : String(mon.tinh_bot_g));
    setBeo(mon.beo_g === null ? '' : String(mon.beo_g));
    setMuoi(mon.muoi_g);
    setDuong(mon.duong_g);
    setBeoNo(mon.beo_no_g);
    setNguonSoLieu(mon.nguon_so_lieu);
  }

  // Chọn được món ở màn chụp: tắt màn chụp rồi điền vào thẻ Nhập số, kèm câu cảnh báo dị ứng
  function chonTuManChup(mon: MonDaChon) {
    setDangMoChupAnh(false);
    dienSan(mon);
    setCanhBaoDiUng(mon.canh_bao_di_ung);
  }

  // Chọn được món ở màn quét mã: tắt màn quét rồi điền vào thẻ Nhập số, kèm câu cảnh báo dị ứng
  function chonTuManQuetMa(mon: MonDaChon) {
    setDangMoQuetMa(false);
    dienSan(mon);
    setCanhBaoDiUng(mon.canh_bao_di_ung);
  }

  // Chọn được món ở màn tìm (kính lúp): tắt màn tìm rồi điền vào thẻ Nhập số
  function chonTuManTimMon(mon: MonDaChon) {
    setDangMoTimMon(false);
    dienSan(mon);
    setCanhBaoDiUng(mon.canh_bao_di_ung);
  }

  // Thẻ Mô tả trả về món (món hay ăn hoặc kết quả AI): điền vào thẻ Nhập số rồi chuyển sang đó để xem lại; món hay ăn không có câu cảnh báo
  function chonTuTheMoTa(mon: MonHayAn | MonDaChon) {
    dienSan(mon);
    if ('canh_bao_di_ung' in mon) {
      setCanhBaoDiUng(mon.canh_bao_di_ung);
    } else {
      setCanhBaoDiUng('');
    }
    setTheDangMo('nhap-so');
  }

  // Người dùng tự sửa tên món thì câu cảnh báo cũ không còn đúng nữa
  function doiTenMon(chu: string) {
    setTenMon(chu);
    setCanhBaoDiUng('');
  }

  // Người dùng tự sửa calo thì số liệu thành của họ
  function doiSoCalo(chu: string) {
    setSoCalo(chu);
    setNguonSoLieu('nhap_tay');
  }

  // Số đang có trong các ô, dùng khi nhờ AI và khi lưu
  const soCaloSo = Number(soCalo);
  const damSo = docSoGam(dam);
  const tinhBotSo = docSoGam(tinhBot);
  const beoSo = docSoGam(beo);
  // Ô lượng đổi ra gam: trống là null, gõ sai là NaN
  let soGamSo: number | null = null;
  if (soGam.trim() !== '') {
    soGamSo = docKhoiLuong(soGam, donVi, heSo) ?? NaN;
  }

  // Ô lượng có số mà không nằm trong 1–5.000 g thì sai; Mét phải là số nguyên, Anh-Mỹ được 1 số lẻ
  const soGamSai = soGamSo !== null && !((laAnhMy || Number.isInteger(soGamSo)) && soGamSo >= 1 && soGamSo <= SO_GAM_LON_NHAT);
  const loiSoGam = `Số ${laAnhMy ? 'oz' : 'gam'} ${vietGioiHan(1, SO_GAM_LON_NHAT, 'khoi_luong', donVi, heSo)}`;

  // Lượng đã ăn ghi thành chữ để lưu và gửi AI: chế độ Gram ghi kiểu "350 g" (Anh-Mỹ: "12,3 oz")
  let khauPhanDeLuu = khauPhan.trim();
  if (donViLuong === 'gram') {
    khauPhanDeLuu = soGamSo === null ? '' : vietKhoiLuong(soGamSo, donVi, heSo);
  }

  // Nhờ AI ước tính theo tên món và lượng đã ăn; AI chỉ điền ô còn trống, ô người dùng đã gõ giữ nguyên
  async function uocTinhBangAi() {
    const loiMoi: Record<string, string> = {};
    if (tenMon.trim() === '') {
      loiMoi.tenMon = 'Hãy nhập tên món';
    }
    if (donViLuong === 'khau-phan' && khauPhan.trim() === '') {
      loiMoi.luong = 'Hãy nhập khẩu phần để AI ước tính, ví dụ: 1 tô lớn';
    }
    if (donViLuong === 'gram' && (soGamSo === null || soGamSai)) {
      loiMoi.luong = loiSoGam;
    }
    if (soCalo.trim() !== '' && (!Number.isInteger(soCaloSo) || soCaloSo < 0 || soCaloSo > CALO_LON_NHAT)) {
      loiMoi.soCalo = `Calo là số nguyên từ 0 đến ${CALO_LON_NHAT.toLocaleString('vi-VN')}`;
    }
    setLoiNhap(loiMoi);
    if (Object.keys(loiMoi).length > 0) {
      return;
    }

    // Ô calo có số thì gửi kèm để AI ước tính các chất khớp với số đó
    let soCaloDaBiet: number | null = null;
    if (soCalo.trim() !== '') {
      soCaloDaBiet = soCaloSo;
    }

    setLoiServer('');
    setDangUocTinh(true);
    try {
      const ketQua = await uocTinhTheoTen(tenMon.trim(), khauPhanDeLuu, soCaloDaBiet);
      if (ketQua.la_mon_an && ketQua.kha_nang.length > 0) {
        const monCuaAi = ketQua.kha_nang[0];
        if (soCalo.trim() === '') {
          setSoCalo(String(monCuaAi.so_calo));
        }
        if (dam.trim() === '') {
          setDam(String(monCuaAi.dam_g));
        }
        if (tinhBot.trim() === '') {
          setTinhBot(String(monCuaAi.tinh_bot_g));
        }
        if (beo.trim() === '') {
          setBeo(String(monCuaAi.beo_g));
        }
        if (muoi === null) {
          setMuoi(monCuaAi.muoi_g);
        }
        if (duong === null) {
          setDuong(monCuaAi.duong_g);
        }
        if (beoNo === null) {
          setBeoNo(monCuaAi.beo_no_g);
        }
        setNguonSoLieu('ai');
        setCanhBaoDiUng(monCuaAi.canh_bao_di_ung);
      } else {
        setLoiServer('AI không nhận ra món này, hãy nhập tay');
      }
    } catch (loi) {
      setLoiServer((loi as Error).message);
    }
    setDangUocTinh(false);
  }

  // Kiểm các ô, đúng thì gửi lên server
  async function handleLuu() {
    // Bước 1. Kiểm từng ô, gom lỗi theo tên ô
    const loiMoi: Record<string, string> = {};
    if (tenMon.trim() === '') {
      loiMoi.tenMon = 'Hãy nhập tên món';
    }
    if (donViLuong === 'gram' && soGamSai) {
      loiMoi.luong = loiSoGam;
    }
    if (soCalo.trim() === '') {
      loiMoi.soCalo = 'Nhập calo, hoặc bấm AI ước tính';
    } else if (!Number.isInteger(soCaloSo) || soCaloSo < 0 || soCaloSo > CALO_LON_NHAT) {
      loiMoi.soCalo = `Calo là số nguyên từ 0 đến ${CALO_LON_NHAT.toLocaleString('vi-VN')}`;
    }
    for (const soGamCuaChat of [damSo, tinhBotSo, beoSo]) {
      if (soGamCuaChat !== null && (Number.isNaN(soGamCuaChat) || soGamCuaChat < 0)) {
        loiMoi.chiTiet = 'Đạm, tinh bột, béo phải là số không âm';
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
      khau_phan: khauPhanDeLuu,
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
          setLoiServer('');
          setDangXoa(true);
          try {
            await xoaBuaAn(buaAnId);
            router.back();
          } catch (loi) {
            setLoiServer((loi as Error).message);
            setDangXoa(false);
          }
        },
      },
    ]);
  }

  // Đang tải món cũ, hoặc tải lỗi
  if (dangTai) {
    return (
      <Screen>
        {loiServer ? <ErrorBox message={loiServer} onRetry={taiDuLieu} /> : <ActivityIndicator color={colors.primary} />}
      </Screen>
    );
  }

  // Vào từ nút Chụp ảnh: cả trang là màn chụp; bấm ‹ khi chưa chọn món thì về trang chủ
  if (dangMoChupAnh) {
    return <ChupAnhNhanMon onChon={chonTuManChup} onDong={() => router.back()} />;
  }

  // Vào từ nút Mã vạch: cả trang là màn quét mã; bấm ‹ khi chưa chọn món thì về trang chủ
  if (dangMoQuetMa) {
    return <QuetMaVach onChon={chonTuManQuetMa} onDong={() => router.back()} />;
  }

  // Bấm kính lúp ở ô Tên món: cả trang là màn tìm; bấm ‹ thì về lại thẻ Nhập số, các ô vẫn giữ chữ
  if (dangMoTimMon) {
    return <TimMon tuKhoaBanDau={tenMon} onChon={chonTuManTimMon} onDong={() => setDangMoTimMon(false)} />;
  }

  return (
    <Screen>
      <ScreenTitle
        title={dangSua ? 'Sửa món' : `Thêm vào ${TEN_BUA[loaiBua].toLowerCase()}`}
        subtitle={formatDateLabel(ngay)}
        onBack={() => router.back()}
      />

      {loiServer ? <ErrorBox message={loiServer} /> : null}

      {/* Chọn bữa; trang chủ đã chọn sẵn, người dùng đổi được */}
      <View style={styles.hangChip}>
        {THU_TU_BUA.map((bua) => (
          <Chip key={bua} label={TEN_BUA[bua]} isSelected={loaiBua === bua} isDisabled={dangChay} onPress={() => setLoaiBua(bua)} />
        ))}
      </View>

      {/* Hai thẻ Mô tả / Nhập số, chỉ khi vào từ nút bút */}
      {coHaiThe ? (
        <View style={styles.hangChip}>
          <Chip label="Mô tả" isSelected={theDangMo === 'mo-ta'} isDisabled={dangChay} onPress={() => setTheDangMo('mo-ta')} />
          <Chip label="Nhập số" isSelected={theDangMo === 'nhap-so'} isDisabled={dangChay} onPress={() => setTheDangMo('nhap-so')} />
        </View>
      ) : null}

      {/* Thẻ Mô tả: món hay ăn và ô viết câu cho AI */}
      {theDangMo === 'mo-ta' ? <MoTa monHayAn={monHayAn} onChon={chonTuTheMoTa} onDangChay={setDangUocTinhMoTa} /> : null}

      {/* Thẻ Nhập số: nguồn số liệu, tên, lượng, calo kèm nút AI, ba chất, muối / đường / béo no, Lưu, Xóa */}
      {theDangMo === 'nhap-so' ? (
        <View>
          {/* Nói rõ số liệu từ đâu ra khi không phải tự nhập */}
          {nguonSoLieu === 'ai' ? (
            <Text style={styles.chuPhu}>Kết quả do AI ước tính, không chính xác 100%. Bạn kiểm tra và sửa lại nếu cần.</Text>
          ) : null}
          {nguonSoLieu === 'ma_vach' ? <Text style={styles.chuPhu}>Số liệu theo nhãn sản phẩm (Open Food Facts).</Text> : null}
          {nguonSoLieu === 'vien_dinh_duong' ? <Text style={styles.chuPhu}>Số liệu theo suất Viện Dinh dưỡng đã cân.</Text> : null}
          {nguonSoLieu === 'thuc_pham' ? <Text style={styles.chuPhu}>Số liệu theo kho thực phẩm Viện Dinh dưỡng, tính theo số gam.</Text> : null}

          {/* Tên món, kính lúp bên phải mở màn tìm trong kho món và kho thực phẩm của Viện */}
          <TextField
            label="Tên món"
            value={tenMon}
            onChangeText={doiTenMon}
            error={loiNhap.tenMon ?? ''}
            placeholder="Gõ tên, hoặc bấm kính lúp để tìm"
            maxLength={TEN_MON_DAI_NHAT}
            isDisabled={dangChay}
            iconName="search-outline"
            onPressIcon={() => setDangMoTimMon(true)}
          />
          {/* Câu cảnh báo dị ứng của món vừa chọn (AI, mã vạch) */}
          {canhBaoDiUng !== '' ? <Text style={styles.chuCanhBaoDiUng}>{canhBaoDiUng}</Text> : null}

          {/* Lượng đã ăn: chọn ghi bằng chữ (khẩu phần) hay bằng số gam */}
          <Text style={styles.nhanO}>Lượng đã ăn</Text>
          <View style={styles.hangChipNho}>
            <Chip label="Khẩu phần" isSelected={donViLuong === 'khau-phan'} isDisabled={dangChay} onPress={() => setDonViLuong('khau-phan')} />
            <Chip label={laAnhMy ? 'Ounce' : 'Gram'} isSelected={donViLuong === 'gram'} isDisabled={dangChay} onPress={() => setDonViLuong('gram')} />
          </View>
          {donViLuong === 'khau-phan' ? (
            <TextField
              label="Khẩu phần"
              value={khauPhan}
              onChangeText={setKhauPhan}
              error={loiNhap.luong ?? ''}
              placeholder="Ví dụ: 2 chén, 1 tô nhỏ"
              maxLength={KHAU_PHAN_DAI_NHAT}
              isDisabled={dangChay}
            />
          ) : (
            <TextField
              label={laAnhMy ? 'Số oz (oz)' : 'Số gam (g)'}
              value={soGam}
              onChangeText={setSoGam}
              error={loiNhap.luong ?? ''}
              placeholder={laAnhMy ? 'Ví dụ: 12,3' : 'Ví dụ: 350'}
              isNumber
              isDisabled={dangChay}
            />
          )}

          {/* Ô calo và nút AI cùng hàng: AI chỉ điền ô còn trống */}
          <View style={styles.hangCalo}>
            <View style={styles.oCalo}>
              <TextField
                label="Calo (kcal)"
                value={soCalo}
                onChangeText={doiSoCalo}
                error={loiNhap.soCalo ?? ''}
                placeholder="Chưa biết thì bấm AI"
                isNumber
                isDisabled={dangChay}
              />
            </View>
            <View style={styles.nutAi}>
              <Button
                title="AI ước tính"
                loadingTitle="Đang ước tính…"
                isLoading={dangUocTinh}
                isDisabled={dangLuu || dangXoa}
                onPress={uocTinhBangAi}
                isSecondary
              />
            </View>
          </View>
          <Text style={styles.chuPhu}>AI chỉ điền ô còn trống. Muốn AI đoán lại thì xóa số ô đó.</Text>

          {/* Đạm, tinh bột, béo xếp dọc, không bắt buộc */}
          <View style={styles.khoiChat}>
            <DongChat ten="Đạm" mau={colors.protein} giaTri={dam} onDoi={setDam} isDisabled={dangChay} />
            <DongChat ten="Tinh bột" mau={colors.carbs} giaTri={tinhBot} onDoi={setTinhBot} isDisabled={dangChay} />
            <DongChat ten="Béo" mau={colors.fat} giaTri={beo} onDoi={setBeo} isDisabled={dangChay} />
          </View>
          {loiNhap.chiTiet ? <Text style={styles.chuLoi}>{loiNhap.chiTiet}</Text> : null}

          {/* Muối, đường, béo no của món và cảnh báo khi cả ngày vượt giới hạn */}
          <CanhBaoNenHanChe monNay={{ muoi_g: muoi, duong_g: duong, beo_no_g: beoNo }} monCu={monCu} nhatKy={nhatKy} />

          <View style={styles.khoangNut}>
            <Button
              title={`Lưu vào ${TEN_BUA[loaiBua].toLowerCase()}`}
              loadingTitle="Đang lưu…"
              isLoading={dangLuu}
              isDisabled={dangUocTinh || dangXoa}
              onPress={handleLuu}
            />
          </View>

          {dangSua ? (
            <Pressable
              style={({ pressed }) => [styles.nutXoa, dangChay ? styles.nutKhoa : null, pressed ? styles.nutDangBam : null]}
              disabled={dangChay}
              onPress={xacNhanXoa}
            >
              <Text style={styles.chuXoa}>{dangXoa ? 'Đang xóa…' : 'Xóa món'}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hangChip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
    marginBottom: spacing.large,
  },
  chuCanhBaoDiUng: {
    fontSize: fontSizes.secondary,
    color: colors.warningText,
    marginTop: 4,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  nhanO: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  hangChipNho: {
    flexDirection: 'row',
    gap: spacing.small,
    marginBottom: spacing.small,
  },
  hangCalo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.small,
  },
  oCalo: {
    flex: 1,
  },
  nutAi: {
    marginTop: spacing.xlarge,
  },
  khoiChat: {
    gap: spacing.small,
    marginBottom: spacing.medium,
  },
  dongChat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  chamMau: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tenChat: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  oSoGam: {
    width: 88,
    height: 44,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.medium,
    fontSize: fontSizes.body,
    color: colors.text,
    textAlign: 'right',
  },
  oKhoa: {
    opacity: 0.5,
  },
  donViGam: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginBottom: spacing.medium,
  },
  khoangNut: {
    marginTop: spacing.large,
  },
  nutXoa: {
    marginTop: spacing.large,
    alignItems: 'center',
    paddingVertical: spacing.medium,
  },
  nutKhoa: {
    opacity: 0.5,
  },
  nutDangBam: {
    opacity: pressedOpacity,
  },
  chuXoa: {
    fontSize: fontSizes.body,
    color: colors.error,
  },
});
