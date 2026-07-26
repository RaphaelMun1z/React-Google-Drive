import { describe, expect, it } from "vitest";
import { NotFoundPage } from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("deve exportar o componente corretamente", () => {
    expect(NotFoundPage).toBeTypeOf("function");
  });
});
