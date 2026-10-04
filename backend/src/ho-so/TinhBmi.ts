// Các ngưỡng BMI, lấy từ bảng quy_dinh
export type NguongBmi = {
  thieuCan: number;
  thuaCan: number;
  beoPhiDo1: number;
  beoPhiDo2: number;
};

// BMI = cân nặng (kg) chia bình phương chiều cao (m), làm tròn 1 số lẻ
export function tinhBmi(canNangKg: number, chieuCaoCm: number): number {
  const chieuCaoMet = chieuCaoCm / 100;
  const bmi = canNangKg / (chieuCaoMet * chieuCaoMet);
  return Math.round(bmi * 10) / 10;
}

// Gọi tên mức BMI theo chuẩn cho người châu Á
export function phanLoaiBmi(bmi: number, nguong: NguongBmi): string {
  if (bmi < nguong.thieuCan) {
    return 'Thiếu cân';
  }
  if (bmi < nguong.thuaCan) {
    return 'Bình thường';
  }
  if (bmi < nguong.beoPhiDo1) {
    return 'Thừa cân';
  }
  if (bmi < nguong.beoPhiDo2) {
    return 'Béo phì độ I';
  }
  return 'Béo phì độ II';
}
