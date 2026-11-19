import { test } from "node:test";
import { strictEqual } from "node:assert";
import { WORKSPACE_DEMO_MODE } from "./workspace-demo";

test("current demo version allows direct workspace access without login", () => {
  strictEqual(WORKSPACE_DEMO_MODE, true);
});