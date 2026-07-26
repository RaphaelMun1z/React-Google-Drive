import { describe, expect, it } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  it("deve exportar o componente corretamente", () => {
    expect(ProtectedRoute).toBeTypeOf("function");
  });
});
