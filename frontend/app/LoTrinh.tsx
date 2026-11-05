import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { BanDangODau } from '../src/lo-trinh/BanDangODau';
import { CacMocThang } from '../src/lo-trinh/CacMocThang';
import { KhoangGiuCan } from '../src/lo-trinh/KhoangGiuCan';
import { layLoTrinh } from '../src/lo-trinh/LoTrinhApi';
import type { LoTrinh as LoTrinhDuLieu } from '../src/lo-trinh/LoTrinhApi';
import { UuTien } from '../src/lo-trinh/UuTien';
import { ErrorBox } from '../src/shared/components/ErrorBox';
import { Screen } from '../src/shared/components/Screen';
import { ScreenTitle } from '../src/shared/components/ScreenTitle';
import { colors } from '../src/shared/theme';

export default function LoTrinh() {
  const [loTrinh, setLoTrinh] = useState<LoTrinhDuLieu | null>(null);
  const [loi, setLoi] = useState('');

  // Mỗi lần mở màn (kể cả quay về từ Sửa hồ sơ) thì tải lại
  useFocusEffect(
    useCallback(() => {
      taiLoTrinh();
    }, []),
  );

  async function taiLoTrinh() {
    setLoi('');
    try {
      setLoTrinh(await layLoTrinh());
    } catch (loiTai) {
      setLoi((loiTai as Error).message);
    }
  }

  return (
    <Screen compactBottom>
      <ScreenTitle title="Lộ trình của bạn" onBack={() => router.back()} />

      {loi ? <ErrorBox message={loi} onRetry={taiLoTrinh} /> : null}
      {!loTrinh && !loi ? <ActivityIndicator color={colors.primary} /> : null}

      {loTrinh ? (
        <View>
          <BanDangODau loTrinh={loTrinh} />
          {/* Thẻ "Lộ trình" chỉ có khi giảm / tăng và đã đặt cân mục tiêu */}
          {loTrinh.tien_do !== null ? <CacMocThang loTrinh={loTrinh} /> : null}
          {/* Thẻ "Giữ cân" chỉ có khi giữ cân */}
          {loTrinh.khoang_giu !== null ? <KhoangGiuCan loTrinh={loTrinh} /> : null}
          <UuTien loTrinh={loTrinh} />
        </View>
      ) : null}
    </Screen>
  );
}
