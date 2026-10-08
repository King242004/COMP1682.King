import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBox } from '../../src/shared/components/ErrorBox';
import { todayKey } from '../../src/shared/dateKey';
import { colors } from '../../src/shared/theme';
import { BongTinNhan } from '../../src/tu-van/BongTinNhan';
import { hoiCoach, layTinNhan, xoaTroChuyen } from '../../src/tu-van/TuVanApi';
import type { TinNhan } from '../../src/tu-van/TuVanApi';

// Câu hỏi tối đa bao nhiêu ký tự (giống backend)
const CAU_HOI_DAI_NHAT = 500;

// Ba câu bấm nhanh: chữ trên nút và câu thật gửi cho coach
const CAU_HOI_NHANH = [
  { nhan: 'Nhận xét hôm nay', cauHoi: 'Nhận xét hôm nay của tôi' },
  { nhan: 'Gợi ý bữa tiếp theo', cauHoi: 'Gợi ý bữa tiếp theo cho tôi' },
  { nhan: 'Nhận xét 7 ngày', cauHoi: 'Nhận xét 7 ngày gần nhất của tôi' },
];

export default function ManCoach() {
  const [danhSachTinNhan, setDanhSachTinNhan] = useState<TinNhan[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [cauHoi, setCauHoi] = useState('');
  // Câu đang chờ coach trả lời; rỗng là không chờ gì
  const [cauDangGui, setCauDangGui] = useState('');
  const [loi, setLoi] = useState('');
  const khungCuon = useRef<ScrollView>(null);

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
    if (cauGui === '' || cauDangGui !== '') {
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
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Tiêu đề và nút xóa trò chuyện */}
        <View style={styles.hangTieuDe}>
          <Text style={styles.tieuDe}>Coach</Text>
          {danhSachTinNhan.length > 0 ? (
            <Pressable style={styles.nutXoa} onPress={xacNhanXoa}>
              <Text style={styles.chuXoa}>Xóa trò chuyện</Text>
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
          {!dangTai && danhSachTinNhan.length === 0 && cauDangGui === '' ? (
            <Text style={styles.gioiThieu}>
              Hỏi coach về ăn uống, dinh dưỡng, nấu ăn healthy và vận động. Coach trả lời dựa trên những gì bạn đã ghi trong MealMate.
            </Text>
          ) : null}
          {danhSachTinNhan.map((tinNhan) => (
            <BongTinNhan key={tinNhan.id} vaiTro={tinNhan.vai_tro} noiDung={tinNhan.noi_dung} />
          ))}
          {/* Đang chờ: hiện ngay câu vừa hỏi và một bong bóng chờ */}
          {cauDangGui !== '' ? (
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

        {/* Ba câu bấm nhanh */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hangCauNhanh} contentContainerStyle={styles.noiDungCauNhanh}>
          {CAU_HOI_NHANH.map((cauNhanh) => (
            <Pressable key={cauNhanh.nhan} style={styles.cauNhanh} onPress={() => guiCauHoi(cauNhanh.cauHoi)}>
              <Text style={styles.chuCauNhanh}>{cauNhanh.nhan}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Ô nhập và nút gửi */}
        <View style={styles.hangNhap}>
          <TextInput
            style={styles.oNhap}
            value={cauHoi}
            onChangeText={setCauHoi}
            placeholder="Hỏi coach về ăn uống…"
            placeholderTextColor={colors.textSecondary}
            maxLength={CAU_HOI_DAI_NHAT}
            multiline
          />
          <Pressable
            style={[styles.nutGui, cauHoi.trim() === '' || cauDangGui !== '' ? styles.nutGuiMo : null]}
            disabled={cauHoi.trim() === '' || cauDangGui !== ''}
            onPress={() => guiCauHoi(cauHoi)}
          >
            <Ionicons name="send" size={18} color={colors.textOnPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hangTieuDe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tieuDe: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  nutXoa: {
    minHeight: 44,
    justifyContent: 'center',
  },
  chuXoa: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  khungTinNhan: {
    flex: 1,
  },
  noiDungTinNhan: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  gioiThieu: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 8,
  },
  khoiLoi: {
    paddingHorizontal: 16,
  },
  hangCauNhanh: {
    flexGrow: 0,
  },
  noiDungCauNhanh: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  cauNhanh: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  chuCauNhanh: {
    fontSize: 14,
    color: colors.text,
  },
  hangNhap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  oNhap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 15,
    color: colors.text,
  },
  nutGui: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutGuiMo: {
    opacity: 0.4,
  },
});
