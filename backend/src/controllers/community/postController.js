const cloudinary = require("../../config/cloudinary");
const Notification = require("../../models/Notification");
const Post = require("../../models/Post");
const {
  addNotification,
  postHiddenFrom,
  shapePost,
  uploadToCloudinary,
} = require("./helpers");

exports.createPost = async (req, res) => {
  const { caption, dishName, mealName, calories, protein, carbs, fat } = req.body;
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({ message: "A post needs at least one photo." });
  }
  if (caption && caption.length > 500) {
    return res.status(400).json({ message: "Caption must be 500 characters or fewer." });
  }

  const normalizedDishName = String(dishName || mealName || "").trim();
  if (normalizedDishName.length > 100) {
    return res.status(400).json({ message: "Dish name must be 100 characters or fewer." });
  }

  const images = [];
  try {
    for (const file of files.slice(0, 10)) {
      images.push(await uploadToCloudinary(file.buffer));
    }
  } catch {
    await Promise.allSettled(images.map((image) => cloudinary.uploader.destroy(image.publicId)));
    return res.status(500).json({ message: "Image upload failed. Please try again." });
  }

  const meal = mealName
    ? {
        name: mealName.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      }
    : undefined;

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

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate("user", "name avatar isPrivate");
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.user?.isPrivate && post.user._id.toString() !== req.user.id) {
    return res.status(403).json({ message: "This post is private." });
  }
  res.json({ post: shapePost(post, req.user.id) });
};

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

exports.updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found." });
  if (post.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized to edit this post." });
  }

  if (typeof req.body.caption === "string") {
    if (req.body.caption.length > 500) {
      return res.status(400).json({ message: "Caption must be 500 characters or fewer." });
    }
    post.caption = req.body.caption.trim();
  }

  const removeDish = req.body.removeDish === true || req.body.removeDish === "true";
  const removeMeal = req.body.removeMeal === true || req.body.removeMeal === "true";
  if (removeDish) {
    post.dishName = undefined;
    post.meal = undefined;
  } else {
    if (typeof req.body.dishName === "string") {
      const normalizedDishName = req.body.dishName.trim();
      if (normalizedDishName.length > 100) {
        return res.status(400).json({ message: "Dish name must be 100 characters or fewer." });
      }
      post.dishName = normalizedDishName || undefined;
    }

    if (typeof req.body.mealName === "string" && req.body.mealName.trim()) {
      const mealName = req.body.mealName.trim();
      if (mealName.length > 100) {
        return res.status(400).json({ message: "Dish name must be 100 characters or fewer." });
      }
      post.meal = {
        name: mealName,
        calories: Number(req.body.calories) || 0,
        protein: Number(req.body.protein) || 0,
        carbs: Number(req.body.carbs) || 0,
        fat: Number(req.body.fat) || 0,
      };
      post.dishName = post.dishName || mealName;
    } else if (removeMeal) {
      post.meal = undefined;
    }
  }

  const files = req.files || [];
  if (req.body.keepUrls !== undefined || files.length > 0) {
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
