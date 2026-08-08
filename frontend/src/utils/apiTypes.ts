// ═══ FILE NÀY LÀM GÌ ═══
// Đổi mã bản ghi của MongoDB từ _id sang id cho hợp cách gọi trong app.
//
// Ai gọi tới: mealsApi, planApi, exerciseApi, weightApi
// Nhận vào:   một object JSON backend trả về, có trường _id
// Trả ra:     đúng object đó nhưng _id đã đổi tên thành id
// Khi lỗi:    không có nhánh lỗi, sai kiểu thì TypeScript báo lúc build
//
// Vì sao cần: trước đây mỗi file api tự viết một hàm đổi tên, và hàm đó phải
// liệt kê BẰNG TAY từng trường của bản ghi. Thêm một trường tùy chọn vào model
// mà quên thêm vào hàm đó thì TypeScript KHÔNG báo, vì trường tùy chọn thiếu
// vẫn hợp kiểu. Backend gửi lên đủ nhưng app mất trường đó, im lặng.
// Dùng hàm chung này thì không còn danh sách trường nào để quên.

// Kiểu của bản ghi sau khi đổi tên. Bỏ _id đi, thêm id vào.
export type WithId<T> = Omit<T, "_id"> & { id: string };

// Tách _id ra khỏi object rồi ghép phần còn lại vào sau id.
// Toán tử ba chấm chép mọi trường còn lại, nên không phải liệt kê trường nào.
export function withId<T extends { _id: string }>(raw: T): WithId<T> {
  const { _id, ...rest } = raw;
  return { id: _id, ...rest } as WithId<T>;
}
