import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs";

describe("Breadcrumbs", () => {
  it("deve exportar o componente corretamente", () => {
    expect(Breadcrumbs).toBeTypeOf("function");
  });
});
