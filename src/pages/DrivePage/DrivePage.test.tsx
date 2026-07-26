import { describe, expect, it } from "vitest";
import { DrivePage } from "./DrivePage";

describe("DrivePage", () => {
  it("deve exportar o componente corretamente", () => {
    expect(DrivePage).toBeTypeOf("function");
  });
});
