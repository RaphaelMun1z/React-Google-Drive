import { describe, expect, it } from "vitest";
import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal", () => {
  it("deve exportar o componente corretamente", () => {
    expect(ConfirmModal).toBeTypeOf("function");
  });
});
