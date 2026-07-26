import { describe, expect, it } from "vitest";
import { TextInputModal } from "./TextInputModal";

describe("TextInputModal", () => {
  it("deve exportar o componente corretamente", () => {
    expect(TextInputModal).toBeTypeOf("function");
  });
});
