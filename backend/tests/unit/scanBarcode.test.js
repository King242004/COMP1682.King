const { scanBarcode } = require("../../src/controllers/scanController");

function response() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

afterEach(() => jest.restoreAllMocks());

test("barcode lookup uses the native fetch response", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      status: 1,
      product: {
        product_name: "Test food",
        serving_size: "50g",
        serving_quantity: 50,
        nutriments: { "energy-kcal_100g": 200, proteins_100g: 10 },
      },
    }),
  });
  const res = response();

  await scanBarcode({ body: { barcode: "12345678" } }, res);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    product: expect.objectContaining({ name: "Test food", calories: 100, protein: 5 }),
  }));
});
