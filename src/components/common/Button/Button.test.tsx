import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("deve exportar o componente corretamente", () => {
    expect(Button).toBeTypeOf("function");
  });
});
