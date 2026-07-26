import { describe, expect, it } from "vitest";
import { ShareModal } from "./ShareModal";

describe("ShareModal", () => {
  it("deve exportar o componente corretamente", () => {
    expect(ShareModal).toBeTypeOf("function");
  });
});
