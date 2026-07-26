import { describe, expect, it } from "vitest";
import { UploadModal } from "./UploadModal";

describe("UploadModal", () => {
  it("deve exportar o componente corretamente", () => {
    expect(UploadModal).toBeTypeOf("function");
  });
});
