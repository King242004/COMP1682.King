// ═══ FILE NÀY LÀM GÌ ═══
// Lo MỘT bài đăng Community: tạo, xem, sửa, xóa, bấm tim, bấm lưu.
//
// Ai gọi tới: communityRoutes, tức màn Tạo bài, Sửa bài, Chi tiết bài
// Nhận vào:   ảnh, lời chú thích, và tên món nếu là bài món ăn
// Trả ra:     bài đã lưu, đã dọn gọn cho app
// Khi lỗi:    bài không có ảnh nào thì từ chối. Sửa hoặc xóa bài của người khác
//             thì bị chặn vì có kiểm chủ sở hữu.
//
// Bài có hai loại, phân biệt bằng trường dishName: bài thường, và bài món ăn.
// Bài món ăn mới có nút "Xem cách làm" và "Thêm vào nhật ký".
//
const cloudinary = require("../../config/cloudinary");
const Notification = require("../../models/Notification");
const Post = require("../../models/Post");
const { addNotification, postHiddenFrom, shapePost, uploadToCloudinary } = require("./communityHelpers");
const { INPUT_LIMITS, LEGACY_LIMITS } = require("../../config/inputLimits");
const { NUTRITION_SOURCES: SOURCE_LIST } = require("../../config/mealEnums");

// Bọc thành Set để tra nhanh. Danh sách gốc nằm ở config/mealEnums.
const NUTRITION_SOURCES = new Set(SOURCE_LIST);

// Gói phần dinh dưỡng của bài món ăn thành một object.
// Không có tên món thì trả rỗng, tức bài này là bài thường.
function mealSnapshot(body) {
  const name = String(body.mealName || "").trim();
  if (!name) return undefined;
  // Ép về số không âm. App có thể gửi lên chuỗi rỗng hoặc số âm.
  const nonNegative = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  };
  const amount = Number(body.portionAmount);
  const source = String(body.nutritionSource || "");
  return {
    name,
    calories: nonNegative(body.calories),
    protein: nonNegative(body.protein),
    carbs: nonNegative(body.carbs),
    fat: nonNegative(body.fat),
    portionAmount: body.portionAmount !== undefined && Number.isFinite(amount) && amount >= 0 ? amount : null,
    portionUnit: String(body.portionUnit || "").trim().slice(0, INPUT_LIMITS.PORTION_UNIT),
    portionText: String(body.portionText || "").trim().slice(0, LEGACY_LIMITS.PORTION_TEXT),
    nutritionSource: NUTRITION_SOURCES.has(source) ? source : undefined,
  };
}

// Bài có thể là bài thường, hoặc bài món ăn. Bài món ăn có thể chỉ có tên món
// mà không có dinh dưỡng, nên tên món tách riêng khỏi phần dinh dưỡng.
exports.createPost = async (req, res) => {
  const { caption, dishName, mealName } = req.body;
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({ message: "A post needs at least one photo." });
  }
  if (caption !== undefined && caption !== null && typeof caption !== "string") {
    return res.status(400).json({ message: "Caption must be text." });
  }
  // Bài MỚI dùng giới hạn hiện hành. Đường sửa bài ở dưới nới rộng hơn,
  // vì bài tạo trước đợt hạ giới hạn vẫn phải sửa và lưu lại được.
  if (caption && caption.length > INPUT_LIMITS.POST_CAPTION) {
    return res.status(400).json({ message: `Caption must be ${INPUT_LIMITS.POST_CAPTION} characters or fewer.` });
  }

  const normalizedDishName = String(dishName || mealName || "").trim();
  if (normalizedDishName.length > LEGACY_LIMITS.MEAL_NAME) {
    return res.status(400).json({ message: `Dish name must be ${LEGACY_LIMITS.MEAL_NAME} characters or fewer.` });
  }

  // Tải từng ảnh lên Cloudinary. Hỏng giữa chừng thì dọn sạch ảnh đã lên.
  const images = [];
  try {
    for (const file of files.slice(0, 10)) {
      images.push(await uploadToCloudinary(file.buffer));
    }
  } catch {
    // Dọn sạch các ảnh đã đẩy lên trước khi báo lỗi, tránh để lại ảnh mồ côi.
    await Promise.allSettled(images.map((image) => cloudinary.uploader.destroy(image.publicId)));
    return res.status(500).json({ message: "Image upload failed. Please try again." });
  }

  const meal = mealSnapshot(req.body);

  const post = await Post.create({
    user: req.user.id,
    caption: caption ? caption.trim() : "",
    image: images[0]?.url || null,
    imagePublicId: images[0]?.publicId || null,
    images,
    dishName: normalizedDishName || undefined,
    meal,
    likes: [],
  });

  await post.populate("user", "name avatar");
  res.status(201).json({ message: "Posted.", post: shapePost(post, req.user.id) });
};

// Mở chi tiết một bài. Bài của tài khoản riêng tư thì chỉ chủ bài xem được.
exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate("user", "name avatar isPrivate");
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.user?.isPrivate && post.user._id.toString() !== req.user.id) {
    return res.status(403).json({ message: "This post is private." });
  }
  res.json({ post: shapePost(post, req.user.id) });
};

// Cách xử lý ảnh: app gửi lên keepUrls là danh sách ảnh cũ muốn giữ,
// cộng thêm các file ảnh mới. Ảnh cũ nào không nằm trong keepUrls sẽ bị xóa khỏi kho.
exports.updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized to edit this post." });
  }

  // Dùng TRẦN LỊCH SỬ chứ không dùng giới hạn hiện hành, vì bài đăng tạo trước
  // đợt hạ giới hạn có thể đang dài hơn số mới. Chặn theo số mới ở đây sẽ khiến
  // người dùng không sửa nổi bài của chính mình, kể cả khi họ không đụng chú thích.
  if (typeof req.body.caption === "string") {
    if (req.body.caption.length > LEGACY_LIMITS.POST_CAPTION) {
      return res.status(400).json({ message: `Caption must be ${LEGACY_LIMITS.POST_CAPTION} characters or fewer.` });
    }
    post.caption = req.body.caption.trim();
  }

  // So cả kiểu boolean và kiểu chữ, vì gửi bằng file thì mọi thứ đều thành chữ.
  const removeDish = req.body.removeDish === true || req.body.removeDish === "true";
  const removeMeal = req.body.removeMeal === true || req.body.removeMeal === "true";
  if (removeDish) {
    post.dishName = undefined;
    post.meal = undefined;
  } else {
    if (typeof req.body.dishName === "string") {
      const normalizedDishName = req.body.dishName.trim();
      if (normalizedDishName.length > LEGACY_LIMITS.MEAL_NAME) {
        return res.status(400).json({ message: `Dish name must be ${LEGACY_LIMITS.MEAL_NAME} characters or fewer.` });
      }
      post.dishName = normalizedDishName || undefined;
    }

    if (typeof req.body.mealName === "string" && req.body.mealName.trim()) {
      const mealName = req.body.mealName.trim();
      if (mealName.length > LEGACY_LIMITS.MEAL_NAME) {
        return res.status(400).json({ message: `Dish name must be ${LEGACY_LIMITS.MEAL_NAME} characters or fewer.` });
      }
      post.meal = mealSnapshot(req.body);
      post.dishName = post.dishName || mealName;
    } else if (removeMeal) {
      post.meal = undefined;
    }
  }

  const files = req.files || [];
  if (req.body.keepUrls !== undefined || files.length > 0) {
    // Bài đời cũ chỉ có một ảnh ở trường image, bài mới có mảng images.
    // Gộp cả hai kiểu về một danh sách để xử lý chung.
    const currentImages = (post.images || []).length
      ? post.images
      : post.image
      ? [{ url: post.image, publicId: post.imagePublicId }]
      : [];

    let keepUrls = req.body.keepUrls;
    if (typeof keepUrls === "string") {
      try {
        keepUrls = JSON.parse(keepUrls);
      } catch {
        keepUrls = null;
      }
    }
    // Không gửi keepUrls nghĩa là không đụng tới ảnh cũ, giữ nguyên tất cả.
    if (keepUrls === undefined) keepUrls = currentImages.map((image) => image.url);
    if (!Array.isArray(keepUrls)) {
      return res.status(400).json({ message: "keepUrls must be an array of image URLs." });
    }

    const keptImages = keepUrls
      .map((url) => currentImages.find((image) => image.url === url))
      .filter(Boolean);

    if (keptImages.length + files.length === 0) {
      return res.status(400).json({ message: "A post needs at least one photo." });
    }
    if (keptImages.length + files.length > 10) {
      return res.status(400).json({ message: "A post can carry at most 10 photos." });
    }

    // Ảnh mới thêm trong lần sửa này. Giữ riêng để hỏng thì dọn lại đúng chúng.
    const addedImages = [];
    try {
      for (const file of files) {
        addedImages.push(await uploadToCloudinary(file.buffer));
      }
    } catch {
      await Promise.allSettled(
        addedImages.map((image) => cloudinary.uploader.destroy(image.publicId))
      );
      return res.status(500).json({ message: "Image upload failed. Please try again." });
    }

    // Xóa khỏi kho những ảnh cũ người dùng đã bỏ ra.
    const keptIds = new Set(keptImages.map((image) => image.publicId).filter(Boolean));
    const droppedImages = currentImages.filter(
      (image) => image.publicId && !keptIds.has(image.publicId)
    );
    await Promise.allSettled(
      droppedImages.map((image) => cloudinary.uploader.destroy(image.publicId))
    );

    post.images = [...keptImages, ...addedImages];
    post.image = post.images[0]?.url || null;
    post.imagePublicId = post.images[0]?.publicId || null;
  }

  const hasImage = !!post.image || (post.images || []).length > 0;
  if (!post.caption && !hasImage && !post.dishName && !(post.meal && post.meal.name)) {
    return res.status(400).json({ message: "A post needs a caption, photo, or meal." });
  }

  await post.save();
  await post.populate("user", "name avatar");
  res.json({ message: "Post updated.", post: shapePost(post, req.user.id) });
};

// Phải xóa thông báo liên quan, nếu không màn Thông báo sẽ còn dòng
// trỏ tới một bài không còn tồn tại. Đặt sau update để luồng CRUD đọc là
// tạo → đọc → sửa → xóa.
exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized to delete this post." });
  }

  const publicIds = new Set(
    [...(post.images || []).map((image) => image.publicId), post.imagePublicId].filter(Boolean)
  );
  await Promise.allSettled([...publicIds].map((id) => cloudinary.uploader.destroy(id)));
  await Notification.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ message: "Post deleted." });
};

// Nút tim. Bấm lần nữa là bỏ tim.
// Bỏ tim thì gỡ luôn thông báo, để chủ bài không thấy thông báo về một lượt tim
// đã bị rút lại.
exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (await postHiddenFrom(post, req.user.id)) {
    return res.status(403).json({ message: "This post is private." });
  }

  const index = post.likes.findIndex((id) => id.toString() === req.user.id);
  const liked = index < 0;
  if (index >= 0) post.likes.splice(index, 1);
  else post.likes.push(req.user.id);
  await post.save();

  if (liked) {
    await addNotification({
      user: post.user,
      actor: req.user.id,
      type: "like",
      post: post._id,
    });
  } else {
    await Notification.deleteOne({
      user: post.user,
      actor: req.user.id,
      type: "like",
      post: post._id,
    });
  }

  res.json({ liked, likeCount: post.likes.length });
};

// Nút lưu bài. Bấm lần nữa là bỏ lưu.
// Lưu bài không tạo thông báo, khác với bấm tim.
exports.toggleSave = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (await postHiddenFrom(post, req.user.id)) {
    return res.status(403).json({ message: "This post is private." });
  }

  if (!post.saves) post.saves = [];
  const index = post.saves.findIndex((id) => id.toString() === req.user.id);
  if (index >= 0) post.saves.splice(index, 1);
  else post.saves.push(req.user.id);
  await post.save();

  res.json({ saved: index < 0 });
};
