import { describe, expect, it } from "vitest";
import { RegisterPage } from "./RegisterPage";

describe("RegisterPage", () => {
  it("deve exportar o componente corretamente", () => {
    expect(RegisterPage).toBeTypeOf("function");
  });
});
