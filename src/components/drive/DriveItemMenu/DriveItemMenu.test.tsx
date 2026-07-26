import { describe, expect, it } from "vitest";
import { DriveItemMenu } from "./DriveItemMenu";

describe("DriveItemMenu", () => {
  it("deve exportar o componente corretamente", () => {
    expect(DriveItemMenu).toBeTypeOf("function");
  });
});
