import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { todayKey } from '../../src/shared/dateKey';
import { colors, fontSizes, pressedOpacity, radius, shadows, spacing } from '../../src/shared/theme';
import { BongTinNhan } from '../../src/tu-van/BongTinNhan';
import { hoiCoach, layTinNhan, xoaTroChuyen } from '../../src/tu-van/TuVanApi';
import type { TinNhan } from '../../src/tu-van/TuVanApi';

type CauHoiNhanh = {
  nhan: string;
  moTa: string;
  bieuTuong: ComponentProps<typeof Ionicons>['name'];
  mau: string;
  mauNen: string;
  cauHoi: string;
};

// Câu hỏi tối đa bao nhiêu ký tự (giống backend)
const CAU_HOI_DAI_NHAT = 500;

// Ba câu bấm nhanh: chữ trên nút, dòng nhỏ, biểu tượng và màu của thẻ, câu thật gửi cho coach
const CAU_HOI_NHANH: CauHoiNhanh[] = [
  {
    nhan: 'Nhận xét hôm nay',
    moTa: 'Calo, đạm, tinh bột, béo so với mục tiêu',
    bieuTuong: 'calendar-outline',
    mau: colors.primary,
    mauNen: colors.primaryLight,
    cauHoi: 'Nhận xét hôm nay của tôi',
  },
  {
    nhan: 'Gợi ý bữa tiếp theo',
    moTa: 'Một món ăn ngoài, một món tự nấu',
    bieuTuong: 'restaurant-outline',
    mau: colors.breakfast,
    mauNen: colors.breakfastLight,
    cauHoi: 'Gợi ý bữa tiếp theo cho tôi',
  },
  {
    nhan: 'Nhận xét 7 ngày',
    moTa: 'Calo, món hay ăn và cân nặng 7 ngày qua',
    bieuTuong: 'bar-chart-outline',
    mau: colors.snack,
    mauNen: colors.snackLight,
    cauHoi: 'Nhận xét 7 ngày gần nhất của tôi',
  },
];

export default function Coach() {
  const [danhSachTinNhan, setDanhSachTinNhan] = useState<TinNhan[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [cauHoi, setCauHoi] = useState('');
  // Câu đang chờ coach trả lời; rỗng là không chờ gì
  const [cauDangGui, setCauDangGui] = useState('');
  const [loi, setLoi] = useState('');
  const khungCuon = useRef<ScrollViewInstance>(null);
  // Chiều cao vùng tai thỏ để đệm phía trên; phần đáy để thanh tab tự chừa
  const insets = useSafeAreaInsets();

  // Đang chờ coach thì khóa thùng rác, câu nhanh, ô nhập và nút gửi
  const dangCho = cauDangGui !== '';
  // Chưa có tin nhắn và không chờ gì: hiện phần giới thiệu với 3 thẻ câu hỏi
  const laManTrong = !dangTai && danhSachTinNhan.length === 0 && !dangCho;

  // Màn khác (ví dụ Tiến độ) mở sang kèm câu hỏi thì điền sẵn vào ô nhập, người dùng tự bấm gửi
  const thamSo = useLocalSearchParams<{ cauHoi?: string }>();
  useEffect(() => {
    if (thamSo.cauHoi) {
      setCauHoi(thamSo.cauHoi);
    }
  }, [thamSo.cauHoi]);

  // Mở màn là tải các tin nhắn cũ
  useEffect(() => {
    taiTinNhan();
  }, []);

  async function taiTinNhan() {
    setLoi('');
    try {
      setDanhSachTinNhan(await layTinNhan());
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
    setDangTai(false);
  }

  // Gửi một câu hỏi (gõ tay hoặc bấm câu nhanh); lỗi thì trả câu hỏi về ô nhập để gửi lại
  async function guiCauHoi(noiDung: string) {
    const cauGui = noiDung.trim();
    if (cauGui === '' || dangCho) {
      return;
    }
    setLoi('');
    setCauHoi('');
    setCauDangGui(cauGui);
    try {
      const tinNhanMoi = await hoiCoach(cauGui, todayKey());
      setDanhSachTinNhan([...danhSachTinNhan, ...tinNhanMoi]);
    } catch (loiGui) {
      setLoi((loiGui as Error).message);
      setCauHoi(cauGui);
    }
    setCauDangGui('');
  }

  // Hỏi lại trước khi xóa cả cuộc trò chuyện
  function xacNhanXoa() {
    Alert.alert('Xóa cuộc trò chuyện?', 'Toàn bộ tin nhắn với coach sẽ bị xóa.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await xoaTroChuyen();
            setDanhSachTinNhan([]);
          } catch (loiXoa) {
            setLoi((loiXoa as Error).message);
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.khungTrang, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Thanh tiêu đề nền trắng chữ xanh; thùng rác xóa trò chuyện ở góc phải (chỉ khi có tin nhắn) */}
        <View style={styles.thanhTieuDe}>
          <Text style={styles.tieuDe}>Coach</Text>
          {danhSachTinNhan.length > 0 ? (
            <Pressable
              style={({ pressed }) => [styles.nutXoa, dangCho ? styles.mo : null, pressed ? styles.dangBam : null]}
              disabled={dangCho}
              onPress={xacNhanXoa}
            >
              <Ionicons name="trash-outline" size={22} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Các tin nhắn; có tin mới thì tự cuộn xuống cuối */}
        <ScrollView
          ref={khungCuon}
          style={styles.khungTinNhan}
          contentContainerStyle={styles.noiDungTinNhan}
          onContentSizeChange={() => khungCuon.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {dangTai ? <ActivityIndicator color={colors.primary} /> : null}

          {/* Chưa có tin nhắn: giới thiệu coach và 3 thẻ câu hỏi bấm là gửi */}
          {laManTrong ? (
            <View>
              <View style={styles.khoiGioiThieu}>
                <View style={styles.vongCoach}>
                  <Ionicons name="chatbubble-ellipses-outline" size={30} color={colors.primary} />
                </View>
                <Text style={styles.tieuDeGioiThieu}>Coach dinh dưỡng của bạn</Text>
                <Text style={styles.gioiThieu}>
                  Hỏi coach về ăn uống, dinh dưỡng, nấu ăn healthy và vận động. Coach trả lời dựa trên những gì bạn đã ghi trong MealMate.
                </Text>
              </View>
              {CAU_HOI_NHANH.map((cauNhanh) => (
                <Pressable
                  key={cauNhanh.nhan}
                  style={({ pressed }) => [styles.theCauHoi, pressed ? styles.dangBam : null]}
                  onPress={() => guiCauHoi(cauNhanh.cauHoi)}
                >
                  <View style={[styles.oBieuTuong, { backgroundColor: cauNhanh.mauNen }]}>
                    <Ionicons name={cauNhanh.bieuTuong} size={22} color={cauNhanh.mau} />
                  </View>
                  <View style={styles.cotChu}>
                    <Text style={styles.tenCauHoi}>{cauNhanh.nhan}</Text>
                    <Text style={styles.moTaCauHoi}>{cauNhanh.moTa}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {danhSachTinNhan.map((tinNhan) => (
            <BongTinNhan key={tinNhan.id} vaiTro={tinNhan.vai_tro} noiDung={tinNhan.noi_dung} />
          ))}
          {/* Đang chờ: hiện ngay câu vừa hỏi và một bong bóng chờ */}
          {dangCho ? (
            <View>
              <BongTinNhan vaiTro="nguoi_dung" noiDung={cauDangGui} />
              <BongTinNhan vaiTro="coach" noiDung="Coach đang trả lời…" />
            </View>
          ) : null}
        </ScrollView>

        {loi ? (
          <View style={styles.khoiLoi}>
            <ErrorBox message={loi} />
          </View>
        ) : null}

        {/* Màn chưa có tin nhắn: lời dặn ngay trên ô nhập */}
        {laManTrong ? <Text style={styles.loiDan}>Coach không thay bác sĩ hay chuyên gia dinh dưỡng.</Text> : null}

        {/* Đã có tin nhắn: ba câu nhanh thành hàng chip nhỏ */}
        {!dangTai && !laManTrong ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hangCauNhanh} contentContainerStyle={styles.noiDungCauNhanh}>
            {CAU_HOI_NHANH.map((cauNhanh) => (
              <Pressable
                key={cauNhanh.nhan}
                style={({ pressed }) => [styles.cauNhanh, dangCho ? styles.mo : null, pressed ? styles.dangBam : null]}
                disabled={dangCho}
                onPress={() => guiCauHoi(cauNhanh.cauHoi)}
              >
                <Text style={styles.chuCauNhanh}>{cauNhanh.nhan}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {/* Ô nhập và nút gửi; đang chờ coach thì khóa cả hai */}
        <View style={styles.hangNhap}>
          <TextInput
            style={[styles.oNhap, dangCho ? styles.mo : null]}
            value={cauHoi}
            onChangeText={setCauHoi}
            placeholder={dangCho ? 'Đang đợi Coach trả lời…' : 'Hỏi coach về ăn uống…'}
            placeholderTextColor={colors.textSecondary}
            maxLength={CAU_HOI_DAI_NHAT}
            editable={!dangCho}
            multiline
          />
          <Pressable
            style={({ pressed }) => [styles.nutGui, cauHoi.trim() === '' || dangCho ? styles.mo : null, pressed ? styles.dangBam : null]}
            disabled={cauHoi.trim() === '' || dangCho}
            onPress={() => guiCauHoi(cauHoi)}
          >
            <Ionicons name="send" size={18} color={colors.textOnPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Vùng giờ và pin trắng liền với thanh tiêu đề
  khungTrang: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  thanhTieuDe: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tieuDe: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.primary,
  },
  nutXoa: {
    position: 'absolute',
    right: spacing.small,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  khungTinNhan: {
    flex: 1,
  },
  noiDungTinNhan: {
    paddingHorizontal: spacing.large,
    paddingTop: spacing.large,
    paddingBottom: spacing.small,
  },
  khoiGioiThieu: {
    alignItems: 'center',
    marginTop: spacing.large,
    marginBottom: spacing.xlarge,
  },
  vongCoach: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tieuDeGioiThieu: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.medium,
  },
  gioiThieu: {
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  theCauHoi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: spacing.large,
    marginBottom: spacing.medium,
    ...shadows.card,
  },
  oBieuTuong: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cotChu: {
    flex: 1,
  },
  tenCauHoi: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  moTaCauHoi: {
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
    marginTop: 2,
  },
  khoiLoi: {
    paddingHorizontal: spacing.large,
  },
  loiDan: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.small,
  },
  hangCauNhanh: {
    flexGrow: 0,
  },
  noiDungCauNhanh: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    gap: spacing.small,
  },
  cauNhanh: {
    minHeight: 44,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  chuCauNhanh: {
    fontSize: fontSizes.secondary,
    color: colors.text,
  },
  hangNhap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.small,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  oNhap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.large,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  nutGui: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mo: {
    opacity: 0.4,
  },
  dangBam: {
    opacity: pressedOpacity,
  },
});
