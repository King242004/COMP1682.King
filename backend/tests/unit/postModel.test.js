const Post = require("../../src/models/Post");

describe("Post meal snapshot", () => {
  test("keeps portion context with diary nutrition", async () => {
    const post = new Post({
      user: "507f1f77bcf86cd799439011",
      meal: {
        name: "Cơm gà",
        calories: 650,
        protein: 35,
        carbs: 78,
        fat: 22,
        portionAmount: 1,
        portionUnit: "phần",
        portionText: "1 phần vừa",
        nutritionSource: "ai_estimate",
      },
    });

    await expect(post.validate()).resolves.toBeUndefined();
    expect(post.meal.toObject()).toMatchObject({ portionText: "1 phần vừa", nutritionSource: "ai_estimate" });
  });
});
