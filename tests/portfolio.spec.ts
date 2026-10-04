import { expect, test, type Locator, type Page } from "@playwright/test";

type ObservedWindow = Window & { introMounts: number };

async function observeIntroMounts(page: Page) {
  await page.addInitScript(() => {
    const observedWindow = window as unknown as ObservedWindow;
    observedWindow.introMounts = 0;
    const seen = new WeakSet<Element>();
    const recordLoader = (element: Element) => {
      const loaders = element.matches(".loader") ? [element] : [...element.querySelectorAll(".loader")];
      for (const loader of loaders) {
        if (!seen.has(loader)) {
          seen.add(loader);
          observedWindow.introMounts += 1;
        }
      }
    };
    new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) recordLoader(node);
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });
}

async function introMounts(page: Page) {
  return page.evaluate(() => (window as unknown as ObservedWindow).introMounts);
}

async function openPortfolio(page: Page, skipIntro = true) {
  await page.goto("/", { waitUntil: "commit" });
  const intro = page.getByRole("status", { name: "Assembling portfolio" });
  await expect(intro).toBeVisible();
  if (skipIntro) await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(intro).toHaveCount(0, { timeout: 12000 });
  await expect(page.locator(".car-render canvas")).toBeVisible();
}

async function navigateChapter(page: Page, name: string) {
  const mobileMenu = page.getByRole("button", { name: "Open navigation", exact: true });
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name, exact: true }).click();
  await expect(page.locator(".journey-status")).toContainText(name.toUpperCase());
  await expect.poll(() => page.evaluate(id => {
    const target = document.getElementById(id);
    return target ? Math.abs(scrollY - target.offsetTop) : Infinity;
  }, name.toLowerCase())).toBeLessThan(3);
}

async function panelGeometry(panel: Locator) {
  return panel.evaluate(element => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      width: box.width,
      height: box.height,
      z: new DOMMatrixReadOnly(style.transform).m43,
      opacity: Number(style.opacity),
      perspective: parseFloat(getComputedStyle(element.parentElement!).perspective),
      inert: element.parentElement!.inert,
    };
  });
}

async function scrollToChapterOffset(page: Page, chapter: string, viewportOffset: number) {
  await page.evaluate(async ({ chapter, viewportOffset }) => {
    const target = document.getElementById(chapter)!;
    window.scrollTo({ top: target.offsetTop + innerHeight * viewportOffset, behavior: "instant" });
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }, { chapter, viewportOffset });
}

test("the intro plays on load and reload but stays skipped on project return", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await observeIntroMounts(page);
  await openPortfolio(page, false);
  expect(await introMounts(page)).toBe(1);

  await page.getByRole("link", { name: "Explore my work", exact: true }).click();
  await expect(page.locator(".journey-status")).toContainText("PROJECTS");
  await page.locator(".project-card").first().click();
  await expect(page).toHaveURL(/\/projects\/robotics-perception/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Computer Vision");
  await page.getByRole("link", { name: "Back to projects", exact: true }).first().click();
  await expect(page.locator(".journey-status")).toContainText("PROJECTS");
  await expect(page.locator(".project-card").first()).toBeVisible();
  await expect(page.locator(".loader")).toHaveCount(0);
  expect(await introMounts(page)).toBe(1);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("status", { name: "Assembling portfolio" })).toBeVisible();
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.locator(".car-render canvas")).toBeVisible();
  await expect(page.locator(".journey-status")).toContainText("PROJECTS");
  await expect(page.locator(".loader")).toHaveCount(0);
  expect(await introMounts(page)).toBe(1);
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 760 }]) {
  test(`hero text, CTA, and portrait remain readable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openPortfolio(page);
    const heading = page.getByRole("heading", { level: 1 });
    const cta = page.getByRole("link", { name: "Explore my work", exact: true });
    await expect(heading).toBeInViewport();
    await expect(cta).toBeInViewport();
    await expect(page.getByText(/scroll to disassemble/i)).toHaveCount(0);
    const boxes = await page.evaluate(() => {
      const box = (selector: string) => {
        const rect = document.querySelector(selector)!.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
      };
      return {
        heading: box(".hero h1"),
        header: box(".site-header"),
        button: box(".hero-intro .button"),
        label: box(".hero-intro .button > span"),
        copy: box(".hero-intro p"),
      };
    });
    expect(boxes.heading.top).toBeGreaterThanOrEqual(boxes.header.bottom);
    expect(boxes.heading.left).toBeGreaterThanOrEqual(0);
    expect(boxes.heading.right).toBeLessThanOrEqual(viewport.width);
    expect(boxes.button.bottom).toBeLessThan(viewport.height - 30);
    expect(boxes.button.top).toBeGreaterThan(boxes.heading.bottom);
    expect(boxes.label.left).toBeGreaterThanOrEqual(boxes.button.left);
    expect(boxes.label.right).toBeLessThanOrEqual(boxes.button.right);
    expect(boxes.label.top).toBeGreaterThanOrEqual(boxes.button.top);
    expect(boxes.label.bottom).toBeLessThanOrEqual(boxes.button.bottom);
    expect(boxes.label.width).toBeGreaterThan(65);
    const overlapWidth = Math.min(boxes.button.right, boxes.copy.right) - Math.max(boxes.button.left, boxes.copy.left);
    const overlapHeight = Math.min(boxes.button.bottom, boxes.copy.bottom) - Math.max(boxes.button.top, boxes.copy.top);
    expect(overlapWidth <= 0 || overlapHeight <= 0).toBe(true);
    await cta.click({ trial: true });

    await navigateChapter(page, "About");
    const portrait = page.locator(".profile-portrait");
    await expect(portrait).toBeInViewport();
    const portraitBox = await portrait.boundingBox();
    expect(portraitBox!.width).toBeGreaterThanOrEqual(180);
    expect(portraitBox!.height).toBeGreaterThanOrEqual(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("incoming chapters move through perspective, grow toward the screen, and accept project clicks", async ({ page }) => {
  await openPortfolio(page);
  const panel = page.locator("#projects .depth-panel");
  await scrollToChapterOffset(page, "projects", -.65);
  const far = await panelGeometry(panel);
  expect(far.perspective).toBeGreaterThan(0);
  expect(far.z).toBeLessThan(-300);
  expect(far.width).toBeGreaterThan(100);
  expect(far.opacity).toBeGreaterThan(0);

  await scrollToChapterOffset(page, "projects", -.2);
  const near = await panelGeometry(panel);
  expect(near.z).toBeGreaterThan(far.z);
  expect(near.z).toBeLessThan(0);
  expect(near.width).toBeGreaterThan(far.width * 1.2);
  expect(near.height).toBeGreaterThan(far.height * 1.2);
  expect(near.opacity).toBeGreaterThan(far.opacity);

  await navigateChapter(page, "Projects");
  const settled = await panelGeometry(panel);
  expect(Math.abs(settled.z)).toBeLessThan(3);
  expect(settled.width).toBeGreaterThan(near.width);
  expect(settled.inert).toBe(false);
  await page.locator(".project-card").first().click();
  await expect(page).toHaveURL(/\/projects\/robotics-perception/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Computer Vision");
});

test("chapter navigation, vehicle reassembly, and replay stay usable", async ({ page }) => {
  await observeIntroMounts(page);
  await openPortfolio(page);
  await navigateChapter(page, "Experience");
  await expect(page.locator(".part-annotation")).toContainText("ECOCAR INNOVATION CHALLENGE");
  await page.locator(".experience-row").first().click();
  await expect(page).toHaveURL(/\/experience\/ecocar-vehicle-integration/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Vehicle Hardware Integration");
  await page.getByRole("link", { name: "Back to experience", exact: true }).first().click();
  await navigateChapter(page, "Contact");
  await expect(page.getByRole("link", { name: "Start a conversation" })).toHaveAttribute("href", "mailto:prashantbhattarai224@gmail.com");
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(page.locator(".car-stage")).toHaveAttribute("data-progress", "1.000");
  await page.getByRole("button", { name: "Take another spin" }).click();
  await expect(page.getByRole("status", { name: "Assembling portfolio" })).toBeVisible();
  await expect(page.locator(".loader")).toHaveCount(0, { timeout: 12000 });
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await expect(page.locator(".journey-status")).toContainText("HOME");
  expect(await introMounts(page)).toBe(2);
});

test("scrolling beyond reassembly loops without replaying the intro", async ({ page }) => {
  await observeIntroMounts(page);
  await openPortfolio(page);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(page.locator(".car-stage")).toHaveAttribute("data-progress", "1.000");
  // The end-of-journey dwell prevents an ordinary final scroll from restarting.
  await page.waitForTimeout(1700);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.getByRole("link", { name: "Explore my work", exact: true })).toBeInViewport();
  expect(await introMounts(page)).toBe(1);
});

test("mobile reduced motion keeps sections, project links, and manual replay usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPortfolio(page);
  await expect(page.getByRole("button", { name: "Enable animation" })).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");

  await navigateChapter(page, "Projects");
  expect(await page.locator("#projects .depth-panel").evaluate(element => getComputedStyle(element).transform)).toBe("none");
  await page.locator(".project-card").first().click();
  await expect(page).toHaveURL(/\/projects\/robotics-perception/);
  await page.getByRole("link", { name: "Back to projects", exact: true }).first().click();
  await expect(page.locator(".journey-status")).toContainText("PROJECTS");

  for (const id of ["home", "about", "experience", "projects", "skills", "contact"]) {
    await scrollToChapterOffset(page, id, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(1700);
  await page.mouse.wheel(0, 300);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(1000);
  await page.getByRole("button", { name: "Take another spin" }).click();
  await expect(page.getByRole("status", { name: "Assembling portfolio" })).toBeVisible();
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.getByRole("link", { name: "Explore my work", exact: true })).toBeInViewport();
});

test("the resume downloads as a PDF and contact links use actual profile details", async ({ page, request }) => {
  const response = await request.get("/resume_Bhattarai_Prashant.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page.goto("/");
  await expect(page.locator(".contact-links a[href='https://github.com/prashant-bhattarai']")).toHaveCount(1);
  await expect(page.locator(".contact-links a[href*='linkedin']")).toHaveCount(0);
});
