import { describe, expect, it } from "vitest";
import { DriveToolbar } from "./DriveToolbar";

describe("DriveToolbar", () => {
  it("deve exportar o componente corretamente", () => {
    expect(DriveToolbar).toBeTypeOf("function");
  });
});
