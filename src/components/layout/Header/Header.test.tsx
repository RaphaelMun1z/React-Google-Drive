import { describe, expect, it } from "vitest";
import { Header } from "./Header";

describe("Header", () => {
  it("deve exportar o componente corretamente", () => {
    expect(Header).toBeTypeOf("function");
  });
});
