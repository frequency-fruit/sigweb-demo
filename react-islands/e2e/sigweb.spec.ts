import { expect, test } from "@playwright/test";

test.describe("SigWeb Demo Simulation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sigweb.html");
    // Wait for the demo component to be visible
    await expect(page.locator("text=SigWeb Compatibility Demo")).toBeVisible();
  });

  test("should show all components as installed in simulation mode", async ({ page }) => {
    // Enable simulation
    await page.getByRole("button", { name: /Simulation OFF/ }).click();
    await expect(page.getByRole("button", { name: /Simulation ON/ })).toBeVisible();

    // Check status indicators
    await expect(page.getByText("Extension: Installed")).toBeVisible();
    await expect(page.getByText("App/NMH: Installed")).toBeVisible();
    await expect(page.getByText("SigWeb: Installed")).toBeVisible();

    // Wait for the active method to change to simulation
    const activeMethod = page
      .locator("div")
      .filter({ hasText: /^Active Method$/ })
      .locator(" + div");
    await expect(activeMethod).toHaveText(/simulation/i);
  });

  test("should allow starting and stopping signature capture", async ({ page }) => {
    // Enable simulation
    await page.getByRole("button", { name: /Simulation OFF/ }).click();
    await expect(page.getByRole("button", { name: /Simulation ON/ })).toBeVisible();

    // Ensure we are in simulation mode before proceeding
    const activeMethod = page
      .locator("div")
      .filter({ hasText: /^Active Method$/ })
      .locator(" + div");
    await expect(activeMethod).toHaveText(/simulation/i);

    // Start signing
    await page
      .locator(".wics-card")
      .filter({ hasText: "SigWeb Compatibility Demo" })
      .getByRole("button", { name: "Sign", exact: true })
      .click();
    await expect(page.getByRole("button", { name: "Done" })).toBeVisible();

    // Stop signing
    await page.getByRole("button", { name: "Done" }).click();
    await expect(
      page
        .locator(".wics-card")
        .filter({ hasText: "SigWeb Compatibility Demo" })
        .getByRole("button", { name: "Sign", exact: true }),
    ).toBeVisible();

    // Check for simulated data in textarea
    const textarea = page.locator("textarea").first();
    await expect(textarea).toHaveValue(/SIMULATED_SIG_STRING/);
  });

  test("should clear signature", async ({ page }) => {
    // Enable simulation
    await page.getByRole("button", { name: /Simulation OFF/ }).click();
    await expect(page.getByRole("button", { name: /Simulation ON/ })).toBeVisible();

    // Ensure we are in simulation mode
    const activeMethod = page
      .locator("div")
      .filter({ hasText: /^Active Method$/ })
      .locator(" + div");
    await expect(activeMethod).toHaveText(/simulation/i);

    // Capture signature
    await page
      .locator(".wics-card")
      .filter({ hasText: "SigWeb Compatibility Demo" })
      .getByRole("button", { name: "Sign", exact: true })
      .click();
    await expect(page.getByRole("button", { name: "Done" })).toBeVisible();
    await page.getByRole("button", { name: "Done" }).click();
    await expect(
      page
        .locator(".wics-card")
        .filter({ hasText: "SigWeb Compatibility Demo" })
        .getByRole("button", { name: "Sign", exact: true }),
    ).toBeVisible();

    // Verify signature data textareas appear
    const textareas = page.locator("textarea");
    await expect(textareas.first()).toHaveValue(/SIMULATED_SIG_STRING/);

    // Clear signature
    // Using specific container to avoid matching Clear buttons in other components
    await page
      .locator(".wics-card")
      .filter({ hasText: "SigWeb Compatibility Demo" })
      .getByRole("button", { name: "Clear", exact: true })
      .click();

    // After clear, the results area (containing textareas) should be removed from DOM
    await expect(textareas.first()).not.toBeVisible();
  });

  test("should render legacy signature component with correct props", async ({ page }) => {
    // Wait for the specific heading to be sure the section is rendered
    await expect(page.getByRole("heading", { name: "Legacy Signature Component" })).toBeVisible({
      timeout: 10000,
    });

    const signeeInput = page.locator('input[id="offenderSignee"]');
    await expect(signeeInput).toBeVisible({ timeout: 10000 });
    await expect(signeeInput).toHaveValue("Offender Signature");

    const signButton = page.locator('input[id="offenderSignButton"]');
    await expect(signButton).toBeVisible();
    await expect(signButton).toHaveValue("Sign");

    const clearButton = page.locator('input[id="offenderClearButton"]');
    await expect(clearButton).toBeVisible();
    await expect(clearButton).toHaveValue("Clear");

    const addButton = page.locator('input[id="offenderAddButton"]');
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveValue("Add Signature");
  });

  test("should render legacy signature and date component and populate date on sign", async ({
    page,
  }) => {
    // Enable simulation
    await page.getByRole("button", { name: /Simulation OFF/ }).click();
    await expect(page.getByRole("button", { name: /Simulation ON/ })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Legacy Signature and Date Component" }),
    ).toBeVisible({ timeout: 10000 });

    const signatureCaption = page.locator("td", { hasText: "Witness Signature" }).first();
    await expect(signatureCaption).toBeVisible();

    const dateCaption = page.getByText("Date Signed");
    await expect(dateCaption).toBeVisible();

    const dateInput = page.locator('input[name="witnessPrintedDate"]');
    await expect(dateInput).toBeVisible();
    await expect(dateInput).toHaveValue("");

    // Click Sign
    const signButton = page.locator('input[id="witnessSignButton"]');
    await signButton.click();

    // The date input should now have a value
    await expect(dateInput).not.toHaveValue("");
    const dateValue = await dateInput.inputValue();
    console.log("Populated Date:", dateValue);

    // It should contain something like a date and time
    expect(dateValue.length).toBeGreaterThan(5);

    // Also check the ID for PrintedTime which legacy JS uses
    const printedTimeInput = page.locator('input[id="witnessPrintedTime"]');
    await expect(printedTimeInput).toBeVisible();
    await expect(printedTimeInput).toHaveValue(dateValue);
  });

  test("should update hidden fields in legacy signature components", async ({ page }) => {
    // Enable simulation
    await page.getByRole("button", { name: /Simulation OFF/ }).click();
    await expect(page.getByRole("button", { name: /Simulation ON/ })).toBeVisible();

    // Check Offender (LegacySignature)
    const offenderSigned = page.locator('input[id="offenderSigned"]');
    await expect(offenderSigned).toHaveValue("");
    await page.locator('input[id="offenderSignButton"]').click();
    await expect(offenderSigned).toHaveValue("Y");

    // Check Witness (LegacySignatureAndDate)
    const witnessSigned = page.locator('input[id="witnessSigned"]');
    await expect(witnessSigned).toHaveValue("");
    await page.locator('input[id="witnessSignButton"]').click();
    await expect(witnessSigned).toHaveValue("Y");

    // Clear Offender
    await page.locator('input[id="offenderClearButton"]').click();
    await expect(offenderSigned).toHaveValue("");
  });
});
