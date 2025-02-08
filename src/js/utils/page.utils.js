import { AppDom } from "./dom.utils.js";

export class AppPage {
  constructor() {
    this.cachePages = new Map();
    this.defaultPage = "home";
    this.appDom = new AppDom(document.querySelector("main"));
  }

  // initialise l'app
  async init() {
    location.href = `#${this.defaultPage}`;
    await this.loadPage(this.defaultPage);
    window.addEventListener("hashchange", async (e) => {
      const url = new URL(e.newURL);
      const hash = url.hash.replace("#", "");
      if (hash) {
        await this.loadPage(hash);
      }
    });
  }

  // charge une page
  async loadPage(page) {
    // vérifie si la page est déjà en cache
    if (this.cachePages.has(page)) {
      const cachedPage = this.cachePages.get(page);
      this.appDom.updateContent(cachedPage.html);
      try {
        if (cachedPage.script) {
          this.appDom.executeScript(cachedPage.script, page);
        }
      } catch (error) {
        console.error(
          "Une erreur est survenue lors de l'exécution du script:",
          error
        );
      }
      return;
    }

    // charge la page HTML et le script associé
    const htmlResponse = await axios
      .get(`src/pages/${page}.html`)
      .catch(() => null);
    const scriptResponse = await axios
      .get(`src/js/pages/${page}.js`)
      .catch(() => null);

    if (!htmlResponse) {
      location.href = "#404";
      return;
    }

    if (htmlResponse.status === 200) {
      const scriptContent = scriptResponse?.data || null;
      this.cachePages.set(page, {
        html: htmlResponse.data,
        script: scriptContent,
      });
      this.appDom.updateContent(htmlResponse.data);
      try {
        if (scriptContent) {
          this.appDom.executeScript(scriptContent, page);
        }
      } catch (error) {
        console.error(
          "Une erreur est survenue lors de l'exécution du script:",
          error
        );
      }
    }
  }
}
