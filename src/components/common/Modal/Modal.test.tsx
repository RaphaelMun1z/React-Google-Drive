import { describe, expect, it } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("deve exportar o componente corretamente", () => {
    expect(Modal).toBeTypeOf("function");
  });
});
