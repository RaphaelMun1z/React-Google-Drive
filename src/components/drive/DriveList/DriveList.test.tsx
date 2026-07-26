import { describe, expect, it } from "vitest";
import { DriveList } from "./DriveList";

describe("DriveList", () => {
  it("deve exportar o componente corretamente", () => {
    expect(DriveList).toBeTypeOf("function");
  });
});
