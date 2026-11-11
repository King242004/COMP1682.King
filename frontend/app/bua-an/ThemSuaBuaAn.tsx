import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layMonHayAn, layMotBuaAn, layNhatKyNgay, suaBuaAn, themBuaAn, xoaBuaAn } from '../../src/bua-an/BuaAnApi';
import type { LoaiBua, MonHayAn, NguonSoLieu, NhatKyNgay } from '../../src/bua-an/BuaAnApi';
import { CanhBaoNenHanChe } from '../../src/bua-an/them-sua-bua-an/CanhBaoNenHanChe';
import type { SoNenHanChe } from '../../src/bua-an/them-sua-bua-an/CanhBaoNenHanChe';
import { BaCachThem } from '../../src/bua-an/them-sua-bua-an/BaCachThem';
import { DaiNutLien } from '../../src/bua-an/them-sua-bua-an/DaiNutLien';
import { MonBanHayAn } from '../../src/bua-an/them-sua-bua-an/MonBanHayAn';
import { MoTa } from '../../src/bua-an/them-sua-bua-an/MoTa';
import { NutAi } from '../../src/bua-an/them-sua-bua-an/NutAi';
import { TimMon } from '../../src/bua-an/them-sua-bua-an/TimMon';
import { TEN_BUA, THU_TU_BUA } from '../../src/bua-an/TenBua';
import { ChupAnhNhanMon } from '../../src/quet-mon/ChupAnhNhanMon';
import { QuetMaVach } from '../../src/quet-mon/QuetMaVach';
import type { MonDaChon } from '../../src/quet-mon/MonDaChon';
import { uocTinhTheoTen } from '../../src/quet-mon/QuetMonApi';
import { Button } from '../../src/shared/components/Button';
import { Card } from '../../src/shared/components/Card';
import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { Screen } from '../../src/shared/components/Screen';
import { ScreenTitle } from '../../src/shared/components/ScreenTitle';
import { TextField } from '../../src/shared/components/TextField';
import { formatDateLabel, todayKey } from '../../src/shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, spacing } from '../../src/shared/theme';

// Giới hạn chặn gõ nhầm, giống backend (BuaAnService.ts)
const TEN_MON_DAI_NHAT = 100;
const KHAU_PHAN_DAI_NHAT = 100;
const CALO_LON_NHAT = 10000;
const SO_GAM_LON_NHAT = 2500;

// Hai bước của màn: chọn cách lấy món, rồi xem lại số liệu và lưu
type BuocThem = 'chon' | 'kiem-tra';

// Đổi chữ trong ô gam thành số: trống là null, sai dạng là NaN
function docSoGam(chu: string): number | null {
  if (chu.trim() === '') {
    return null;
  }
  return Number(chu.replace(',', '.'));
}

type OChatNhapProps = {
  ten: string;
  mau: string;
  mauNen: string;
  giaTri: string;
  onDoi: (chu: string) => void;
  isDisabled: boolean;
};

// Một ô đạm, tinh bột hoặc béo: nền nhạt của chất, chấm màu và tên ở trên, ô gõ số gam ở dưới (cùng màu Trang chủ và màn chi tiết món)
function OChatNhap({ ten, mau, mauNen, giaTri, onDoi, isDisabled }: OChatNhapProps) {
  return (
    <View style={[styles.oChat, { backgroundColor: mauNen }, isDisabled ? styles.oKhoa : null]}>
      <View style={styles.hangTenChat}>
        <View style={[styles.chamMau, { backgroundColor: mau }]} />
        <Text style={[styles.tenChat, { color: mau }]}>{ten}</Text>
      </View>
      <View style={styles.hangSoChat}>
        <TextInput
          style={[styles.oSoChat, { color: mau }]}
          value={giaTri}
          onChangeText={onDoi}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={colors.textSecondary}
          editable={!isDisabled}
        />
        <Text style={[styles.donViGam, { color: mau }]}>g</Text>
      </View>
    </View>
  );
}

export default function ThemSuaBuaAn() {
  // Có id là sửa món đã có; không có id là thêm món mới, với ngày và bữa đã chọn ở trang chủ
  // monSan: món mở từ Khám phá, gửi sang dạng JSON để điền sẵn form
  const thamSo = useLocalSearchParams<{ id?: string; ngay?: string; loaiBua?: LoaiBua; monSan?: string }>();
  const buaAnId = thamSo.id;
  const dangSua = buaAnId !== undefined;

  // Sửa món hoặc mở từ Khám phá thì đã có món, vào thẳng bước xem lại; thêm mới thì bắt đầu ở bước chọn
  const [buoc, setBuoc] = useState<BuocThem>(dangSua || thamSo.monSan ? 'kiem-tra' : 'chon');

  // Ngày và bữa của món
  const [ngay, setNgay] = useState(thamSo.ngay ?? todayKey());
  const [loaiBua, setLoaiBua] = useState<LoaiBua>(thamSo.loaiBua ?? 'sang');

  // Các ô nhập của thẻ Nhập số
  const [tenMon, setTenMon] = useState('');
  // Câu cảnh báo dị ứng đi theo món chọn từ ảnh, mã vạch, thẻ Mô tả, nút AI, thẻ Tìm món hoặc Khám phá; rỗng là không có
  const [canhBaoDiUng, setCanhBaoDiUng] = useState('');
  const [khauPhan, setKhauPhan] = useState('');
  // Chiều cao thanh home của iPhone, để thanh nút Lưu ở đáy không bị che
  const insets = useSafeAreaInsets();
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

  // Màn chụp và màn quét mã vạch (mở từ 2 thẻ ở bước chọn), và trạng thái đang nhờ AI ở từng chỗ
  const [dangMoChupAnh, setDangMoChupAnh] = useState(false);
  const [dangMoQuetMa, setDangMoQuetMa] = useState(false);
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
        // Mở từ Khám phá thì điền sẵn món đó (kèm câu cảnh báo dị ứng) để người dùng xem lại rồi mới lưu
        if (thamSo.monSan) {
          const monSan = JSON.parse(thamSo.monSan) as MonDaChon;
          dienSan(monSan);
          setCanhBaoDiUng(monSan.canh_bao_di_ung);
        }
        setMonHayAn(await layMonHayAn());
        setNhatKy(await layNhatKyNgay(ngay));
      }
      setDangTai(false);
    } catch (loi) {
      setLoiServer((loi as Error).message);
    }
  }

  // Điền các ô của form từ một món có sẵn (món cũ đang sửa, món hay ăn, món từ ảnh / mã vạch / tìm món / AI)
  function dienSan(mon: MonHayAn | MonDaChon) {
    setTenMon(mon.ten_mon);
    setKhauPhan(mon.khau_phan);
    setSoCalo(String(mon.so_calo));
    setDam(mon.dam_g === null ? '' : String(mon.dam_g).replace('.', ','));
    setTinhBot(mon.tinh_bot_g === null ? '' : String(mon.tinh_bot_g).replace('.', ','));
    setBeo(mon.beo_g === null ? '' : String(mon.beo_g).replace('.', ','));
    setMuoi(mon.muoi_g);
    setDuong(mon.duong_g);
    setBeoNo(mon.beo_no_g);
    setNguonSoLieu(mon.nguon_so_lieu);
  }

  // Có món từ một trong các cách ở bước chọn: tắt màn chụp / quét nếu đang mở, điền form rồi sang bước xem lại; món hay ăn không có câu cảnh báo
  function chonMon(mon: MonHayAn | MonDaChon) {
    setDangMoChupAnh(false);
    setDangMoQuetMa(false);
    dienSan(mon);
    if ('canh_bao_di_ung' in mon) {
      setCanhBaoDiUng(mon.canh_bao_di_ung);
    } else {
      setCanhBaoDiUng('');
    }
    setLoiNhap({});
    setLoiServer('');
    setBuoc('kiem-tra');
  }

  // Xóa hết các ô của form về trống, như chưa chọn món nào
  function xoaForm() {
    setTenMon('');
    setKhauPhan('');
    setSoCalo('');
    setDam('');
    setTinhBot('');
    setBeo('');
    setMuoi(null);
    setDuong(null);
    setBeoNo(null);
    setNguonSoLieu('nhap_tay');
    setCanhBaoDiUng('');
    setLoiNhap({});
    setLoiServer('');
  }

  // Bấm thẻ "Nhập tay": form trống rồi sang bước xem lại
  function tuNhapTay() {
    xoaForm();
    setBuoc('kiem-tra');
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

  // Nhờ AI ước tính theo tên món và lượng đã ăn; AI chỉ điền ô còn trống, ô người dùng đã gõ giữ nguyên
  async function uocTinhBangAi() {
    const loiMoi: Record<string, string> = {};
    if (tenMon.trim() === '') {
      loiMoi.tenMon = 'Hãy nhập tên món';
    }
    if (khauPhan.trim() === '') {
      loiMoi.luong = 'Hãy nhập khẩu phần để AI ước tính, ví dụ: 1 tô lớn';
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
      const ketQua = await uocTinhTheoTen(tenMon.trim(), khauPhan.trim(), soCaloDaBiet);
      if (ketQua.la_mon_an && ketQua.kha_nang.length > 0) {
        const monCuaAi = ketQua.kha_nang[0];
        if (soCalo.trim() === '') {
          setSoCalo(String(monCuaAi.so_calo));
        }
        if (dam.trim() === '') {
          setDam(String(monCuaAi.dam_g).replace('.', ','));
        }
        if (tinhBot.trim() === '') {
          setTinhBot(String(monCuaAi.tinh_bot_g).replace('.', ','));
        }
        if (beo.trim() === '') {
          setBeo(String(monCuaAi.beo_g).replace('.', ','));
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
    if (soCalo.trim() === '') {
      loiMoi.soCalo = 'Nhập calo, hoặc bấm AI ước tính';
    } else if (!Number.isInteger(soCaloSo) || soCaloSo < 0 || soCaloSo > CALO_LON_NHAT) {
      loiMoi.soCalo = `Calo là số nguyên từ 0 đến ${CALO_LON_NHAT.toLocaleString('vi-VN')}`;
    }
    for (const soGamCuaChat of [damSo, tinhBotSo, beoSo]) {
      if (soGamCuaChat !== null && (Number.isNaN(soGamCuaChat) || soGamCuaChat < 0 || soGamCuaChat > SO_GAM_LON_NHAT)) {
        loiMoi.chiTiet = `Đạm, tinh bột, béo phải từ 0 đến ${SO_GAM_LON_NHAT.toLocaleString('vi-VN')} g`;
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

  // Bấm ‹: đang xem lại món thêm mới thì về bước chọn (bỏ lỗi của bước xem lại); sửa món, mở từ Khám phá, hoặc đang ở bước chọn thì về màn trước
  function quayLai() {
    if (buoc === 'kiem-tra' && !dangSua && !thamSo.monSan) {
      setLoiServer('');
      setBuoc('chon');
      return;
    }
    router.back();
  }

  // Đang tải món cũ, hoặc tải lỗi
  if (dangTai) {
    return (
      <Screen>
        {loiServer ? <ErrorBox message={loiServer} onRetry={taiDuLieu} /> : <ActivityIndicator color={colors.primary} />}
      </Screen>
    );
  }

  return (
    <View style={styles.khung}>
      {/* Bấm thẻ Chụp ảnh / Quét mã vạch: màn đó hiện cả trang; bấm ‹ khi chưa chọn món thì về bước chọn */}
      {dangMoChupAnh ? <ChupAnhNhanMon onChon={chonMon} onDong={() => setDangMoChupAnh(false)} /> : null}
      {dangMoQuetMa ? <QuetMaVach onChon={chonMon} onDong={() => setDangMoQuetMa(false)} /> : null}

      {/* Màn thêm món; lúc đang chụp / quét thì chỉ ẩn đi chứ không bỏ, để quay lại vẫn còn chữ đang gõ */}
      <View style={dangMoChupAnh || dangMoQuetMa ? styles.an : styles.khung}>
        <Screen compactBottom={buoc === 'kiem-tra'} avoidKeyboard>
          {/* Tiêu đề; món không thuộc hôm nay (ghi bù, sửa món ngày cũ) thì có thêm dòng ngày để khỏi ghi nhầm ngày */}
          <ScreenTitle
            title={dangSua ? 'Sửa món' : 'Thêm vào bữa ăn của bạn'}
            subtitle={ngay !== todayKey() ? formatDateLabel(ngay) : undefined}
            onBack={quayLai}
          />

          {loiServer ? <ErrorBox message={loiServer} /> : null}

          {/* Chọn bữa; trang chủ đã chọn sẵn, người dùng đổi được */}
          <View style={styles.khoiDai}>
            <DaiNutLien
              luaChon={THU_TU_BUA.map((bua) => ({ giaTri: bua, nhan: TEN_BUA[bua] }))}
              giaTriDangChon={loaiBua}
              isDisabled={dangChay}
              onChon={(giaTri) => setLoaiBua(giaTri as LoaiBua)}
            />
          </View>

          {/* Bước chọn: chụp ảnh, mã vạch, viết câu cho AI, tìm món của Viện, món hay ăn, hoặc tự nhập tay; sang bước xem lại thì chỉ ẩn đi để quay lại vẫn còn chữ đang tìm */}
          {!dangSua && !thamSo.monSan ? (
            <View style={buoc === 'chon' ? null : styles.an}>
              <BaCachThem
                isDisabled={dangChay}
                onChupAnh={() => setDangMoChupAnh(true)}
                onQuetMa={() => setDangMoQuetMa(true)}
                onNhapTay={tuNhapTay}
              />
              <MoTa isDisabled={dangChay} onChon={chonMon} onDangChay={setDangUocTinhMoTa} />
              <TimMon isDisabled={dangChay} onChon={chonMon} />
              <MonBanHayAn monHayAn={monHayAn} isDisabled={dangChay} onChon={chonMon} />
            </View>
          ) : null}

          {/* Bước xem lại: cảnh báo dị ứng, nguồn số liệu, thẻ tên / lượng / calo / ba chất, thẻ "Nên hạn chế", Xóa món */}
          {buoc === 'kiem-tra' ? (
            <View>
              {/* Câu cảnh báo dị ứng của món vừa chọn (AI, mã vạch, Tìm món, Khám phá), đặt trên cùng cho dễ thấy */}
              {canhBaoDiUng !== '' ? (
                <View style={styles.khungDiUng}>
                  <Text style={styles.chuDiUng}>{canhBaoDiUng}</Text>
                </View>
              ) : null}

              {/* Nói rõ số liệu từ đâu ra khi không phải tự nhập */}
              {nguonSoLieu === 'ai' ? (
                <Text style={styles.chuNguon}>Kết quả do AI ước tính, không chính xác 100%. Bạn kiểm tra và sửa lại nếu cần.</Text>
              ) : null}
              {nguonSoLieu === 'ma_vach' ? <Text style={styles.chuNguon}>Số liệu theo nhãn sản phẩm (Open Food Facts).</Text> : null}
              {nguonSoLieu === 'vien_dinh_duong' ? <Text style={styles.chuNguon}>Số liệu theo suất Viện Dinh dưỡng đã cân.</Text> : null}
              {nguonSoLieu === 'thuc_pham' ? <Text style={styles.chuNguon}>Số liệu theo kho thực phẩm Viện Dinh dưỡng, tính theo số gam.</Text> : null}

              {/* Thẻ thông tin chính: tên, lượng, calo, ba chất */}
              <Card>
                {/* Tên món */}
                <Text style={styles.tieuDeMuc}>Tên món</Text>
                <TextField
                  label=""
                  value={tenMon}
                  onChangeText={doiTenMon}
                  error={loiNhap.tenMon ?? ''}
                  placeholder="Ví dụ: Phở bò tái chín"
                  maxLength={TEN_MON_DAI_NHAT}
                  isDisabled={dangChay}
                />

                {/* Lượng đã ăn: một ô chữ, ghi khẩu phần hay số gam đều được */}
                <Text style={styles.tieuDeMuc}>Lượng đã ăn</Text>
                <TextField
                  label=""
                  value={khauPhan}
                  onChangeText={setKhauPhan}
                  error={loiNhap.luong ?? ''}
                  placeholder="Ví dụ: 2 chén, 1 tô nhỏ, 150 g"
                  maxLength={KHAU_PHAN_DAI_NHAT}
                  isDisabled={dangChay}
                />

                {/* Calo, ngăn với phần trên bằng đường kẻ: ô số và nút AI cùng hàng; AI chỉ điền ô còn trống */}
                <View style={styles.phanMoi}>
                  <Text style={styles.tieuDeMuc}>Calo (kcal)</Text>
                  <View style={styles.hangCalo}>
                    <View style={styles.oCalo}>
                      <TextField
                        label=""
                        value={soCalo}
                        onChangeText={doiSoCalo}
                        error={loiNhap.soCalo ?? ''}
                        placeholder="Ví dụ: 450"
                        isNumber
                        isDisabled={dangChay}
                      />
                    </View>
                    <NutAi isLoading={dangUocTinh} isDisabled={dangLuu || dangXoa} onPress={uocTinhBangAi} />
                  </View>
                  <Text style={styles.chuPhu}>AI chỉ điền ô còn trống. Muốn AI đoán lại thì xóa số ô đó.</Text>
                </View>

                {/* Chỉ số macro (đạm, tinh bột, béo), ngăn với phần trên bằng đường kẻ: 3 ô cạnh nhau, không bắt buộc */}
                <View style={styles.phanMoi}>
                  <Text style={styles.tieuDeMuc}>Chỉ số macro</Text>
                  <View style={styles.hangChat}>
                    <OChatNhap ten="Đạm" mau={colors.protein} mauNen={colors.proteinLight} giaTri={dam} onDoi={setDam} isDisabled={dangChay} />
                    <OChatNhap ten="Tinh bột" mau={colors.carbs} mauNen={colors.carbsLight} giaTri={tinhBot} onDoi={setTinhBot} isDisabled={dangChay} />
                    <OChatNhap ten="Béo" mau={colors.fat} mauNen={colors.fatLight} giaTri={beo} onDoi={setBeo} isDisabled={dangChay} />
                  </View>
                  {loiNhap.chiTiet ? <Text style={styles.chuLoi}>{loiNhap.chiTiet}</Text> : null}
                </View>
              </Card>

              {/* Muối, đường, béo no của món và cảnh báo khi cả ngày vượt giới hạn */}
              <CanhBaoNenHanChe monNay={{ muoi_g: muoi, duong_g: duong, beo_no_g: beoNo }} monCu={monCu} nhatKy={nhatKy} />

              {/* Sửa món thì có thêm nút xóa ở cuối */}
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

        {/* Bước xem lại: nút Lưu ghim ở đáy màn */}
        {buoc === 'kiem-tra' ? (
          <View style={[styles.thanhDuoi, { paddingBottom: insets.bottom + spacing.small }]}>
            <Button
              title={`Lưu vào ${TEN_BUA[loaiBua].toLowerCase()}`}
              loadingTitle="Đang lưu…"
              isLoading={dangLuu}
              isDisabled={dangUocTinh || dangXoa}
              onPress={handleLuu}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    flex: 1,
    backgroundColor: colors.background,
  },
  khoiDai: {
    marginBottom: spacing.large,
  },
  an: {
    display: 'none',
  },
  khungDiUng: {
    padding: spacing.medium,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.warningBackground,
    marginBottom: spacing.medium,
  },
  chuDiUng: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
    color: colors.warningText,
  },
  chuNguon: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  chuPhu: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  tieuDeMuc: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
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
  phanMoi: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.medium,
  },
  hangChat: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  oChat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.input,
    paddingVertical: spacing.small,
    paddingHorizontal: 4,
  },
  oKhoa: {
    opacity: 0.5,
  },
  hangTenChat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chamMau: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tenChat: {
    fontSize: fontSizes.secondary,
    fontWeight: '600',
  },
  hangSoChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oSoChat: {
    minWidth: 28,
    minHeight: 44,
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    textAlign: 'right',
  },
  donViGam: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    marginLeft: 2,
  },
  chuLoi: {
    fontSize: fontSizes.secondary,
    color: colors.error,
    marginTop: spacing.small,
  },
  nutXoa: {
    marginTop: spacing.small,
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
  thanhDuoi: {
    paddingHorizontal: spacing.large,
    paddingTop: spacing.small,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});
