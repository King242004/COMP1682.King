// ═══ FILE NÀY LÀM GÌ ═══
// Cấu hình Expo ESLint cho toàn bộ code frontend và bỏ qua thư mục build dist.
// npm run lint đọc file này; lỗi rule được trả thẳng về terminal.
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
