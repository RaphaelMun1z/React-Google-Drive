import { describe, expect, it } from "vitest";
import { FileIcon } from "./FileIcon";

describe("FileIcon", () => {
  it("deve exportar o componente corretamente", () => {
    expect(FileIcon).toBeTypeOf("function");
  });
});
