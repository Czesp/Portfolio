import { expect, test, type Page } from "@playwright/test";
import { mkdir, readFile, truncate, writeFile } from "node:fs/promises";
import path from "node:path";
import { experiences, leadership, projects } from "../src/data/portfolio";

const tetrahedron = `solid tetrahedron
facet normal 0 0 -1
outer loop
vertex 0 0 0
vertex 0 1 0
vertex 1 0 0
endloop
endfacet
facet normal 0 -1 0
outer loop
vertex 0 0 0
vertex 1 0 0
vertex 0 0 1
endloop
endfacet
facet normal -1 0 0
outer loop
vertex 0 0 0
vertex 0 0 1
vertex 0 1 0
endloop
endfacet
facet normal 1 1 1
outer loop
vertex 1 0 0
vertex 0 1 0
vertex 0 0 1
endloop
endfacet
endsolid tetrahedron`;

async function openLocalPreview(page: Page) {
  await page.goto(`/projects/${projects[0].slug}`);
  await page.getByText("Preview a local file", { exact: false }).click();
  await expect(page.getByText("This is a preview only", { exact: false })).toBeVisible();
  return page.locator('input[type="file"]');
}

test.describe("Engineering detail pages", () => {
  for (const [kind, entries] of [["projects", projects], ["experience", [...experiences, ...leadership]]] as const) {
    for (const entry of entries) {
      test(`${kind}/${entry.slug} renders its actual resume content`, async ({ page }) => {
        const runtimeErrors: string[] = [];
        page.on("pageerror", (error) => runtimeErrors.push(error.message));
        const response = await page.goto(`/${kind}/${entry.slug}`);
        expect(response?.status()).toBe(200);
        await expect(page.getByRole("heading", { level: 1 })).toContainText(entry.title);
        const illustration = page.locator("figure[data-detail-visual]");
        await expect(illustration).toHaveAttribute("data-detail-visual", entry.slug);
        await expect(illustration.getByRole("img")).toBeVisible();
        await expect(illustration.locator("title")).not.toBeEmpty();
        await expect(illustration.locator("figcaption")).toContainText(entry.category);
        await expect(page.getByText(entry.details[0], { exact: true })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Technical documentation" })).toBeVisible();
        await expect(page.getByRole("link", { name: `Back to ${kind}`, exact: true }).first()).toHaveAttribute("href", `/#${kind}`);
        expect(runtimeErrors).toEqual([]);
      });
    }
  }

  test("unknown project and experience slugs return 404", async ({ request }) => {
    for (const kind of ["projects", "experience"]) {
      const response = await request.get(`/${kind}/this-entry-does-not-exist`);
      expect(response.status()).toBe(404);
    }
  });

  test("local image and PDF previews render and can be removed", async ({ page }) => {
    const input = await openLocalPreview(page);
    await input.setInputFiles({
      name: "inspection.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jAUkAAAAASUVORK5CYII=", "base64"),
    });
    const previewImage = page.getByRole("img", { name: "inspection.png", exact: true });
    await expect(previewImage).toBeVisible();
    await expect.poll(() => previewImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const imageUrl = await previewImage.getAttribute("src");
    await page.getByRole("button", { name: "Remove local preview of inspection.png" }).click();
    await expect(previewImage).toHaveCount(0);
    expect(await page.evaluate(async (url) => {
      try { await fetch(url!); return false; } catch { return true; }
    }, imageUrl)).toBe(true);

    await input.setInputFiles({ name: "resume-preview.pdf", mimeType: "application/pdf", buffer: await readFile(path.resolve("public/resume_Bhattarai_Prashant.pdf")) });
    const pdf = page.locator('iframe[title="PDF: resume-preview.pdf"]');
    await expect(pdf).toBeVisible();
    await expect(pdf).toHaveAttribute("src", /^blob:/);
    await expect(page.getByRole("link", { name: "Open PDF", exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Remove local preview of resume-preview.pdf" }).click();
    await expect(pdf).toHaveCount(0);
  });

  test("PowerPoint and CAD local files offer downloads without claiming browser rendering", async ({ page }) => {
    const input = await openLocalPreview(page);
    await input.setInputFiles({ name: "design-review.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", buffer: Buffer.from("PowerPoint placeholder for download control test") });
    await expect(page.getByRole("heading", { name: "Inside the presentation" })).toBeVisible();
    await expect(page.getByText("Download this presentation to view its slides", { exact: false })).toBeVisible();
    const presentation = page.getByRole("link", { name: "Open presentation", exact: true });
    await expect(presentation).toHaveAttribute("download", "design-review.pptx");
    await expect(presentation).toHaveAttribute("href", /^blob:/);

    await input.setInputFiles({ name: "sensor-mount.step", mimeType: "application/octet-stream", buffer: Buffer.from("ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;") });
    await expect(page.getByRole("heading", { name: "Explore the engineering file" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open CAD file", exact: true })).toHaveAttribute("download", "sensor-mount.step");
    await expect(page.getByRole("heading", { name: "Inside the presentation" })).toHaveCount(0);
  });

  test("unsupported extensions and files over 50 MB are rejected", async ({ page }, testInfo) => {
    const input = await openLocalPreview(page);
    await input.setInputFiles({ name: "unsupported.txt", mimeType: "text/plain", buffer: Buffer.from("Unsupported file") });
    await expect(page.getByRole("alert").filter({ hasText: "Choose an image" })).toHaveText("Choose an image, PDF, PowerPoint, STL, or supported CAD file.");
    const oversized = testInfo.outputPath("oversized.pdf");
    await mkdir(path.dirname(oversized), { recursive: true });
    await writeFile(oversized, "");
    await truncate(oversized, 50 * 1024 * 1024 + 1);
    await input.setInputFiles(oversized);
    await expect(page.getByRole("alert").filter({ hasText: "Choose a file" })).toHaveText("Choose a file smaller than 50 MB.");
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("valid STL loads in 3D and malformed STL receives a usable fallback", async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    const input = await openLocalPreview(page);
    await input.setInputFiles({ name: "tetrahedron.stl", mimeType: "model/stl", buffer: Buffer.from(tetrahedron) });
    await expect(page.locator("canvas")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText("LOADING GEOMETRY…", { exact: true })).toHaveCount(0, { timeout: 30000 });
    await expect(page.getByText("This model could not be displayed in the browser.", { exact: true })).toHaveCount(0);
    await expect(page.getByText("STL INSPECTION VIEW", { exact: true })).toBeVisible();
    expect(runtimeErrors).toEqual([]);

    await input.setInputFiles({ name: "broken.stl", mimeType: "model/stl", buffer: Buffer.from("solid broken\nendsolid broken") });
    await expect(page.getByText("This model could not be displayed in the browser.", { exact: true })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole("link", { name: "Download the STL to inspect it in a CAD app" })).toHaveAttribute("href", /^blob:/);
    expect(runtimeErrors).toEqual([]);
  });
});
