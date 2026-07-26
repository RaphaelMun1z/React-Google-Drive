import { describe, expect, it } from "vitest";
import { SharedPage } from "./SharedPage";

describe("SharedPage", () => {
  it("deve exportar o componente corretamente", () => {
    expect(SharedPage).toBeTypeOf("function");
  });
});
