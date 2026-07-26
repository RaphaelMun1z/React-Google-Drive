import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("deve exportar o componente corretamente", () => {
    expect(App).toBeTypeOf("function");
  });
});
