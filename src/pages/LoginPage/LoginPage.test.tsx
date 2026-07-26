import { describe, expect, it } from "vitest";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("deve exportar o componente corretamente", () => {
    expect(LoginPage).toBeTypeOf("function");
  });
});
