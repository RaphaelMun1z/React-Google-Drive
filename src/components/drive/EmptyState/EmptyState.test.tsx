import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("deve exportar o componente corretamente", () => {
    expect(EmptyState).toBeTypeOf("function");
  });
});
