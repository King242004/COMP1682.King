// Full-app API regression (integration test).
// PREREQUISITES: backend running on localhost:5000 with a reachable MongoDB
// (npm run dev in another terminal), then:  npm run test:api
// The script registers a throwaway account, exercises every core rule, then
// DELETES the account (right-to-erasure endpoint) so it cleans up after itself.
require("dotenv").config();
const mongoose = require("mongoose");
const OTP = require("../../src/models/OTP");
const Post = require("../../src/models/Post");
const { OTP_PURPOSE, OTP_TTL_MS, hashOTP, normalizeEmail } = require("../../src/utils/otpSecurity");

const BASE = process.env.API_BASE_URL || "http://localhost:5000/api";
let pass = 0, fail = 0;

function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
}

async function api(path, method = "GET", body, token, rawBody) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: rawBody !== undefined ? rawBody : body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    throw new Error(`${method} ${path} failed: ${error.message}`);
  }
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function seedRegistrationOTP(email, code = "123456") {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  const normalized = normalizeEmail(email);
  const purpose = OTP_PURPOSE.REGISTRATION;
  await OTP.deleteMany({ email: normalized, purpose });
  await OTP.create({
    email: normalized,
    purpose,
    codeHash: hashOTP(normalized, purpose, code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  return code;
}

// Smallest valid JPEG, used where an endpoint requires a real image upload
const TINY_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==",
  "base64"
);

// Multipart upload helper — the JSON api() helper cannot send files
async function apiUpload(path, fields, files, token) {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  for (const [field, name] of files) {
    form.append(field, new Blob([TINY_JPEG], { type: "image/jpeg" }), name);
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function apiInvalidImageUpload(path, token) {
  const form = new FormData();
  form.append("images", new Blob(["not an image"], { type: "text/plain" }), "fake.txt");
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

const pad = (n) => String(n).padStart(2, "0");
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const shift = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

(async () => {
  const email = `apitest_${Date.now()}@test.com`;
  const PW1 = "Test123", PW2 = "Test456";

  console.log("- AUTH -");
  const unverified = await api("/auth/register", "POST", { name: "Api Test", email, password: PW1 });
  check("register without OTP 400", unverified.status === 400, `got ${unverified.status}`);
  const registrationCode = await seedRegistrationOTP(email);
  const wrongCode = await api("/auth/register", "POST", { name: "Api Test", email, password: PW1, otp: "000000" });
  check("register with wrong OTP 400", wrongCode.status === 400, `got ${wrongCode.status}`);
  const reg = await api("/auth/register", "POST", { name: "Api Test", email, password: PW1, otp: registrationCode });
  check("register 201", reg.status === 201, `got ${reg.status}`);
  let token = reg.data.token;
  const existingRequest = await api("/auth/register/send-otp", "POST", { email });
  check("registration OTP request hides existing account with generic 200", existingRequest.status === 200);
  const dup = await api("/auth/register", "POST", { name: "Api Test", email, password: PW1, otp: registrationCode });
  check("duplicate email 400", dup.status === 400);
  const badLogin = await api("/auth/login", "POST", { email, password: "Wrong123" });
  check("wrong password 400", badLogin.status === 400);
  const badTok = await api("/meals?date=" + todayKey(), "GET", undefined, "garbage.token.here");
  check("garbage token 401", badTok.status === 401);

  console.log("- ERROR MIDDLEWARE -");
  const badJson = await api("/meals", "POST", undefined, token, "{not json!!");
  check("malformed JSON body 400", badJson.status === 400 && badJson.data?.message, `got ${badJson.status}`);
  const badId = await api("/meals/notanobjectid", "DELETE", undefined, token);
  check("CastError id 400 'Invalid id.'", badId.status === 400 && badId.data?.message === "Invalid id.", JSON.stringify(badId.data));

  console.log("- MEALS (time rules + macro zero) -");
  const mToday = await api("/meals", "POST", { name: "Cơm test", mealType: "lunch", calories: 500, protein: 20, carbs: 60, fat: 15, date: todayKey() }, token);
  check("add meal today 201", mToday.status === 201);
  const mealId = mToday.data.meal._id;
  const mPast = await api("/meals", "POST", { name: "Phở hôm qua", mealType: "breakfast", calories: 400, date: shift(-1) }, token);
  check("back-log past meal 201", mPast.status === 201);
  const mFuture = await api("/meals", "POST", { name: "Tương lai", mealType: "dinner", calories: 300, date: shift(1) }, token);
  check("future meal 400", mFuture.status === 400);
  const upZero = await api(`/meals/${mealId}`, "PUT", { protein: 0, carbs: 0, fat: 0 }, token);
  check("edit macros to 0 saved", upZero.status === 200 && upZero.data.meal.protein === 0 && upZero.data.meal.carbs === 0 && upZero.data.meal.fat === 0);
  const upFuture = await api(`/meals/${mealId}`, "PUT", { date: shift(2) }, token);
  check("move meal to future 400", upFuture.status === 400);
  const byDate = await api(`/meals?date=${todayKey()}`, "GET", undefined, token);
  check("get by date + totals", byDate.status === 200 && byDate.data.totals.calories === 500);
  const hist = await api("/meals/history", "GET", undefined, token);
  check("history has 2 meals", hist.status === 200 && hist.data.meals.length === 2);

  console.log("- EXERCISE -");
  const exOk = await api("/exercise", "POST", { name: "Chạy bộ", met: 8, durationMin: 30, date: todayKey() }, token);
  check("log workout 201 + burn computed", exOk.status === 201 && exOk.data.exercise.caloriesBurned > 0);
  const exFut = await api("/exercise", "POST", { name: "Chạy mai", met: 8, durationMin: 30, date: shift(1) }, token);
  check("future workout 400", exFut.status === 400);
  const exDel = await api(`/exercise/${exOk.data.exercise._id}`, "DELETE", undefined, token);
  check("delete workout 200", exDel.status === 200);

  console.log("- PLAN (markEaten time rule) -");
  const pToday = await api("/plan", "POST", { name: "Món plan hôm nay", mealType: "dinner", calories: 450, date: todayKey() }, token);
  check("add plan meal today 201", pToday.status === 201);
  const pFuture = await api("/plan", "POST", { name: "Món plan mai", mealType: "lunch", calories: 500, date: shift(1) }, token);
  check("add plan meal future 201 (plans CAN be future)", pFuture.status === 201);
  const eatFut = await api(`/plan/${pFuture.data.planMeal._id}/eaten`, "POST", undefined, token);
  check("eat FUTURE plan 400", eatFut.status === 400);
  const eatNow = await api(`/plan/${pToday.data.planMeal._id}/eaten`, "POST", undefined, token);
  check("eat today plan 200 + diary meal created", eatNow.status === 200 && eatNow.data.meal?._id);
  const eatTwice = await api(`/plan/${pToday.data.planMeal._id}/eaten`, "POST", undefined, token);
  check("eat twice 400 (idempotent)", eatTwice.status === 400);
  const grocEmpty = await api("/plan/grocery", "POST", { startDate: shift(10), endDate: shift(12), language: "vi" }, token);
  check("grocery with empty range 400", grocEmpty.status === 400);

  console.log("- WEIGHT + AUTO GOAL SYNC -");
  await api("/profile", "PUT", { gender: "male", age: 25, weight: 70, height: 175, activityLevel: "moderate", goal: "lose_weight" }, token);
  const wFut = await api("/weight", "POST", { weightKg: 70, date: shift(1) }, token);
  check("future weight 400", wFut.status === 400);
  const wOk = await api("/weight", "POST", { weightKg: 68 }, token);
  check("log weight 201", wOk.status === 201);
  let prof = await api("/profile", "GET", undefined, token);
  check("auto goal follows weight (68kg -> 2063)", prof.data.user.calorieGoal === 2063, `got ${prof.data?.user?.calorieGoal}`);
  await api("/profile", "PUT", { calorieGoal: 1800 }, token);
  await api("/weight", "POST", { weightKg: 66 }, token);
  prof = await api("/profile", "GET", undefined, token);
  check("custom goal survives weight log (1800)", prof.data.user.calorieGoal === 1800, `got ${prof.data?.user?.calorieGoal}`);
  const wList = await api("/weight", "GET", undefined, token);
  check("weight list returns entries", wList.status === 200 && wList.data.logs.length >= 1);

  console.log("- CHANGE PASSWORD -");
  const cpWrong = await api("/user/change-password", "POST", { currentPassword: "Sai123", newPassword: PW2 }, token);
  check("wrong current password 400", cpWrong.status === 400);
  const cpOk = await api("/user/change-password", "POST", { currentPassword: PW1, newPassword: PW2 }, token);
  check("change password 200", cpOk.status === 200);
  const reLogin = await api("/auth/login", "POST", { email, password: PW2 });
  check("login with NEW password 200", reLogin.status === 200);
  token = reLogin.data.token;

  console.log("- OTP (no real email sent) -");
  const otpUnknown = await api("/user/send-otp", "POST", { email: "khongtontai_" + Date.now() + "@test.com" });
  check("send-otp hides unknown email with generic 200", otpUnknown.status === 200);

  console.log("- COMMUNITY (Instagram rule: a post always carries a photo) -");
  // Caption without a photo must be refused — a post is a visual artefact
  const textOnly = await api("/community/posts", "POST", { caption: "Bài test tự động" }, token);
  check("text-only post rejected 400", textOnly.status === 400, `got ${textOnly.status}`);

  const invalidImage = await apiInvalidImageUpload("/community/posts", token);
  check("non-image upload rejected 400", invalidImage.status === 400, `got ${invalidImage.status}`);

  const post = await apiUpload("/community/posts", { caption: "Bài test tự động" }, [["images", "test.jpg"]], token);
  check("create post with photo 201", post.status === 201, `got ${post.status}`);
  // Guard: without this a failure above would crash the run and skip the rest
  const postId = post.data?.post?.id || post.data?.post?._id || null;
  check("created post has id", !!postId);

  if (postId) {
    const explore = await api("/community/posts/explore", "GET", undefined, token);
    check(
      "explore contains own post",
      explore.status === 200 &&
        typeof explore.data.hasMore === "boolean" &&
        explore.data.posts.some((p) => (p.id || p._id) === postId)
    );
    const like = await api(`/community/posts/${postId}/like`, "POST", undefined, token);
    check("like toggles", like.status === 200 && like.data.liked === true);

    // Seed lightweight hosted-image documents directly so pagination can be
    // exercised without uploading 20 files to Cloudinary.
    const ownerId = reLogin.data?.user?.id;
    await Post.insertMany(Array.from({ length: 20 }, (_, index) => ({
      user: ownerId,
      caption: `Pagination test ${index + 1}`,
      image: `https://example.com/mealmate-pagination-${index + 1}.jpg`,
      images: [{ url: `https://example.com/mealmate-pagination-${index + 1}.jpg` }],
    })));
    const profilePage1 = await api(`/community/posts/user/${ownerId}?page=1`, "GET", undefined, token);
    const profilePage2 = await api(`/community/posts/user/${ownerId}?page=2`, "GET", undefined, token);
    const page1Ids = new Set((profilePage1.data?.posts || []).map((p) => p.id));
    check(
      "profile page 1 reports more posts",
      profilePage1.status === 200 && profilePage1.data.posts.length === 20 && profilePage1.data.hasMore === true
    );
    check(
      "profile page 2 has no duplicates",
      profilePage2.status === 200 &&
        profilePage2.data.posts.length >= 1 &&
        profilePage2.data.hasMore === false &&
        profilePage2.data.posts.every((p) => !page1Ids.has(p.id))
    );
  } else {
    check("explore contains own post", false, "skipped, no post id");
    check("like toggles", false, "skipped, no post id");
    check("profile page 1 reports more posts", false, "skipped, no post id");
    check("profile page 2 has no duplicates", false, "skipped, no post id");
  }

  console.log("- AVATAR + PRIVATE COMMUNITY -");
  const avatar1 = await apiUpload("/user/avatar", {}, [["image", "avatar-1.jpg"]], token);
  check("first avatar upload 200", avatar1.status === 200 && !!avatar1.data?.avatar, `got ${avatar1.status}`);
  const avatar2 = await apiUpload("/user/avatar", {}, [["image", "avatar-2.jpg"]], token);
  check("replacement avatar upload 200", avatar2.status === 200 && !!avatar2.data?.avatar, `got ${avatar2.status}`);

  const viewerEmail = `apitest_viewer_${Date.now()}@test.com`;
  const viewerCode = await seedRegistrationOTP(viewerEmail);
  const viewerReg = await api("/auth/register", "POST", { name: "Privacy Viewer", email: viewerEmail, password: PW1, otp: viewerCode });
  check("register privacy viewer 201", viewerReg.status === 201, `got ${viewerReg.status}`);
  const viewerToken = viewerReg.data?.token;

  if (postId && viewerToken) {
    const savePublic = await api(`/community/posts/${postId}/save`, "POST", undefined, viewerToken);
    check("viewer can save public post", savePublic.status === 200 && savePublic.data?.saved === true, `got ${savePublic.status}`);

    const makePrivate = await api("/profile", "PUT", { isPrivate: true }, token);
    check("owner can enable private account", makePrivate.status === 200, `got ${makePrivate.status}`);

    const likePrivate = await api(`/community/posts/${postId}/like`, "POST", undefined, viewerToken);
    check("private post rejects direct like", likePrivate.status === 403, `got ${likePrivate.status}`);
    const savePrivate = await api(`/community/posts/${postId}/save`, "POST", undefined, viewerToken);
    check("private post rejects direct save", savePrivate.status === 403, `got ${savePrivate.status}`);
    const savedPrivate = await api("/community/posts/saved", "GET", undefined, viewerToken);
    check(
      "private owner's post is hidden from saved list",
      savedPrivate.status === 200 && !savedPrivate.data.posts.some((p) => (p.id || p._id) === postId),
      `got ${savedPrivate.status}`
    );
  } else {
    check("viewer can save public post", false, "skipped, missing post or viewer");
    check("owner can enable private account", false, "skipped, missing post or viewer");
    check("private post rejects direct like", false, "skipped, missing post or viewer");
    check("private post rejects direct save", false, "skipped, missing post or viewer");
    check("private owner's post is hidden from saved list", false, "skipped, missing post or viewer");
  }

  if (viewerToken) {
    const deleteViewer = await api("/user/account", "DELETE", { password: PW1 }, viewerToken);
    check("privacy viewer cleanup 200", deleteViewer.status === 200, `got ${deleteViewer.status}`);
  } else {
    check("privacy viewer cleanup 200", false, "skipped, no viewer token");
  }

  console.log("- COACH history (non-AI) -");
  const chist = await api("/coach/history", "GET", undefined, token);
  check("coach history list 200", chist.status === 200 && Array.isArray(chist.data.messages));

  console.log("- DELETE ACCOUNT (right to erasure, also cleans this test up) -");
  const delWrong = await api("/user/account", "DELETE", { password: "Sai123" }, token);
  check("wrong password 400", delWrong.status === 400);
  const delOk = await api("/user/account", "DELETE", { password: PW2 }, token);
  check("delete account 200", delOk.status === 200);
  const ghostLogin = await api("/auth/login", "POST", { email, password: PW2 });
  check("login after delete fails 400", ghostLogin.status === 400);
  // JWT is stateless: the old token stays valid until expiry (documented
  // limitation) — the guarantee that matters is that ALL data is gone.
  const ghostData = await api("/meals/history", "GET", undefined, token);
  check("all meal data erased after delete", ghostData.status === 200 && ghostData.data.meals.length === 0, `got ${ghostData.status}/${ghostData.data?.meals?.length}`);

  console.log(`\n${pass}/${pass + fail} PASS${fail ? ` - ${fail} FAIL` : ""}`);
  await mongoose.disconnect();
  process.exit(fail ? 1 : 0);
})().catch(async (e) => {
  console.error("Test crashed:", e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
