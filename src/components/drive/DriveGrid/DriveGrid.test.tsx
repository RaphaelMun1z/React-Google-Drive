import { describe, expect, it } from "vitest";
import { DriveGrid } from "./DriveGrid";

describe("DriveGrid", () => {
  it("deve exportar o componente corretamente", () => {
    expect(DriveGrid).toBeTypeOf("function");
  });
});
