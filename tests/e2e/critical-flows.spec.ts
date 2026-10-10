import { test, expect } from "@playwright/test";

test.describe("Flujo Crítico 1: Cliente busca local, explora interior 3D y pulsa WhatsApp", () => {
  test("debe permitir navegar el catálogo, ver local 3D y verificar redirección /r/[slug]", async ({
    page,
  }) => {
    // 1. Acceder a la página principal
    await page.goto("/");
    await expect(page).toHaveTitle(/LocalVista/i);

    // 2. Navegar al catálogo de locales mediante el enlace visible en el navbar
    const catalogLink = page.locator('a[href="/locales"]').first();
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();

    await expect(page).toHaveURL(/\/locales/);
    await expect(page.locator("h1")).toContainText(/Locales Comerciales Disponibles/i);

    // 3. Seleccionar local emblemático de Miraflores
    const localLink = page.locator('a[href*="/locales/local-puerta-a-calle-av-larco-miraflores"]').first();
    await expect(localLink).toBeVisible();
    await localLink.click();

    // 4. Verificar ficha de detalle y visor 3D
    await expect(page).toHaveURL(/\/locales\/local-puerta-a-calle-av-larco-miraflores/);
    await expect(page.locator("h1")).toContainText(/Av. Larco/i);

    // El visor 3D o su contenedor inmersivo debe estar en el DOM
    const viewerContainer = page.locator("#tour3d, .relative").first();
    await expect(viewerContainer).toBeVisible();

    // 5. El botón de contacto WhatsApp debe apuntar a la ruta segura /r/[slug]
    const whatsappBtn = page.locator('a[href*="/r/local-puerta-a-calle-av-larco-miraflores"]').first();
    await expect(whatsappBtn).toBeVisible();

    // Verificar que en el HTML no figure el número telefónico directamente (Principio de Privacidad)
    const pageHtml = await page.content();
    expect(pageHtml).not.toContain("wa.me/51");
  });
});

test.describe("Flujo Crítico 2: Propietario se registra y accede al panel", () => {
  test("debe permitir el registro de un nuevo propietario y acceso al panel", async ({
    page,
  }) => {
    const uniqueEmail = `testowner_${Date.now()}@inmobiliaria.pe`;

    // 1. Ir a la página de registro
    await page.goto("/registro");
    await expect(page.locator("h1")).toContainText(/Registrar Propietario/i);

    // 2. Completar formulario con teléfono en formato E.164 válido (+51987654321)
    await page.fill('input[name="nombre"]', "Juan Pérez Dueño");
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="telefono_whatsapp"]', "+51987654321");
    await page.fill('input[name="nombre_negocio"]', "Inmobiliaria JP");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "Password123!");

    // 3. Enviar registro
    await page.click('button[type="submit"]');

    // 4. Redirección al panel
    await page.waitForURL(/\/panel/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/panel/);
  });
});

test.describe("Flujo Crítico 3: Administrador supervisa moderación y auditoría", () => {
  test("debe permitir el acceso al panel admin, cola de moderación y auditoría", async ({
    page,
  }) => {
    // 1. Iniciar sesión como administrador
    await page.goto("/ingresar");
    await page.fill('input[name="email"]', "admin@localvista.pe");
    await page.fill('input[name="password"]', "AdminLocalVista2026!");
    await page.click('button[type="submit"]');

    // 2. Verificar redirección a /admin
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("body")).toContainText(/Control de Moderación/i);

    // 3. Visitar cola de locales
    await page.click('a[href="/admin/locales"]');
    await expect(page).toHaveURL(/\/admin\/locales/);
    await expect(page.locator("body")).toContainText(/Cola de Moderación/i);

    // 4. Visitar bitácora de auditoría
    await page.click('a[href="/admin/auditoria"]');
    await expect(page).toHaveURL(/\/admin\/auditoria/);
    await expect(page.locator("body")).toContainText(/Bitácora de Auditoría/i);
  });
});
