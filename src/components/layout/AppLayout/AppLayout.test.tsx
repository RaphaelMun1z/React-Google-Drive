import { describe, expect, it } from "vitest";
import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  it("deve exportar o componente corretamente", () => {
    expect(AppLayout).toBeTypeOf("function");
  });
});
