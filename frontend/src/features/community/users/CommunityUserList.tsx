// ═══ FILE NÀY LÀM GÌ ═══
// Danh sách tài khoản dùng chung cho màn Khám phá và danh sách theo dõi.
//
// Ai gọi tới: DiscoverScreen, UserListScreen, UserProfileScreen
// Nhận vào:   danh sách người và trạng thái theo dõi
// Trả ra:     danh sách dòng người dùng, mỗi dòng giao cho UserRow
// Khi lỗi:    danh sách rỗng thì hiện thẻ trạng thái

// Nhận dữ liệu cùng trạng thái follow từ màn cha, rồi giao từng dòng cho UserRow.
import type { ReactElement } from "react";
import { FlatList } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/ui/theme";
import { UserRow } from "./UserRow";
import type { DiscoverUser } from "../communityApi";

export function CommunityUserList({
  users,
  header,
  empty,
  isFollowing,
  onToggleFollow,
  keepKeyboard,
}: {
  users: DiscoverUser[];
  header: ReactElement;
  empty: ReactElement;
  isFollowing: (user: DiscoverUser) => boolean;
  onToggleFollow: (user: DiscoverUser) => void;
  keepKeyboard?: boolean;
}) {
  const router = useRouter();

  return (
    <FlatList
      data={users}
      keyExtractor={(user) => user.id}
      contentContainerStyle={{
        paddingHorizontal: theme.space.lg,
        paddingTop: 60,
        paddingBottom: 40,
        gap: theme.space.sm,
      }}
      alwaysBounceVertical
      keyboardShouldPersistTaps={keepKeyboard ? "handled" : undefined}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      renderItem={({ item }) => (
        <UserRow
          user={item}
          following={isFollowing(item)}
          onPress={() => router.push({ pathname: "/community/user-profile", params: { id: item.id } })}
          onToggleFollow={() => onToggleFollow(item)}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
