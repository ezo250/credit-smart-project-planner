import { describe, expect, it } from "vitest";
import { readFileAsDataUrl } from "@/lib/file-upload";

describe("readFileAsDataUrl", () => {
  it("turns a file into a data URL ready for Mongo persistence", async () => {
    const file = new File(["hello"], "avatar.png", { type: "image/png" });
    const result = await readFileAsDataUrl(file);

    expect(result).toContain("data:image/png;base64,");
  });
});
