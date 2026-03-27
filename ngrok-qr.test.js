const axios = require("axios");
const qrcode = require("qrcode-terminal");
const { getPublicUrl, printQr, parseArgs, buildNgrokTarget } = require("./ngrok-qr");

jest.mock("axios");
jest.mock("qrcode-terminal");

describe("parseArgs", () => {
  test("defaults to port 3000 with no args", () => {
    expect(parseArgs(["node", "ngrok-qr.js"])).toEqual({ port: "3000", secure: false });
  });

  test("parses a custom port", () => {
    expect(parseArgs(["node", "ngrok-qr.js", "8080"])).toEqual({ port: "8080", secure: false });
  });

  test("parses --https flag", () => {
    expect(parseArgs(["node", "ngrok-qr.js", "--https"])).toEqual({ port: "3000", secure: true });
  });

  test("parses port and --https together", () => {
    expect(parseArgs(["node", "ngrok-qr.js", "8080", "--https"])).toEqual({ port: "8080", secure: true });
  });

  test("parses --https before port", () => {
    expect(parseArgs(["node", "ngrok-qr.js", "--https", "8080"])).toEqual({ port: "8080", secure: true });
  });
});

describe("buildNgrokTarget", () => {
  test("returns just the port for HTTP", () => {
    expect(buildNgrokTarget("3000", false)).toBe("3000");
  });

  test("returns full https URL for HTTPS", () => {
    expect(buildNgrokTarget("3000", true)).toBe("https://localhost:3000");
  });

  test("uses the correct port in HTTPS target", () => {
    expect(buildNgrokTarget("8080", true)).toBe("https://localhost:8080");
  });
});

describe("getPublicUrl", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns the https tunnel URL when available", async () => {
    axios.get.mockResolvedValue({
      data: {
        tunnels: [
          { proto: "http", public_url: "http://abc123.ngrok.io" },
          { proto: "https", public_url: "https://abc123.ngrok.io" },
        ],
      },
    });

    const url = await getPublicUrl(1, 0);
    expect(url).toBe("https://abc123.ngrok.io");
  });

  test("falls back to first tunnel if no https tunnel exists", async () => {
    axios.get.mockResolvedValue({
      data: {
        tunnels: [{ proto: "http", public_url: "http://abc123.ngrok.io" }],
      },
    });

    const url = await getPublicUrl(1, 0);
    expect(url).toBe("http://abc123.ngrok.io");
  });

  test("retries when the API is not yet ready", async () => {
    axios.get
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValue({
        data: {
          tunnels: [{ proto: "https", public_url: "https://abc123.ngrok.io" }],
        },
      });

    const url = await getPublicUrl(5, 0);
    expect(url).toBe("https://abc123.ngrok.io");
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  test("retries when tunnels array is empty", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { tunnels: [] } })
      .mockResolvedValue({
        data: {
          tunnels: [{ proto: "https", public_url: "https://abc123.ngrok.io" }],
        },
      });

    const url = await getPublicUrl(5, 0);
    expect(url).toBe("https://abc123.ngrok.io");
  });

  test("throws after exhausting all retries", async () => {
    axios.get.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(getPublicUrl(3, 0)).rejects.toThrow(
      "Timed out waiting for ngrok to start."
    );
    expect(axios.get).toHaveBeenCalledTimes(3);
  });
});

describe("printQr", () => {
  beforeEach(() => jest.clearAllMocks());

  test("calls qrcode.generate with the URL", async () => {
    qrcode.generate.mockImplementation((url, opts, cb) => cb("█▄▄█"));

    await printQr("https://abc123.ngrok.io");

    expect(qrcode.generate).toHaveBeenCalledWith(
      "https://abc123.ngrok.io",
      { small: true },
      expect.any(Function)
    );
  });

  test("resolves with the generated QR string", async () => {
    qrcode.generate.mockImplementation((url, opts, cb) => cb("█▄▄█"));

    const result = await printQr("https://abc123.ngrok.io");
    expect(result).toBe("█▄▄█");
  });
});
