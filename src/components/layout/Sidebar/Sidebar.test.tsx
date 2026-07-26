import { describe, expect, it } from "vitest";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("deve exportar o componente corretamente", () => {
    expect(Sidebar).toBeTypeOf("function");
  });
});
