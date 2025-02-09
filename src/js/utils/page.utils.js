import { AppDom } from "./dom.utils.js";

export class AppPage {
  constructor() {
    this.cachePages = new Map(); // initialise une "map" qui fonctionne comme une petite bdd : {key: string value:{html: string, script: string}}
    this.defaultPage = "home";
    this.appDom = new AppDom(document.querySelector("main")); // initialise l'obj pour manipuler le dom
  }

  // Initialise l'application
  async init() {
    location.href = `#${this.defaultPage}`; //change le hash de l'url
    await this.loadPage(this.defaultPage); //charge la page par défaut
    window.addEventListener("hashchange", async (e) => {
      // ajoute un evenement sur la fentre du navigateur. sur changement de hash execute la function  'localhost:5500/index.html#home' => return'home' => loadPage('home')
      const url = new URL(e.newURL); //recupère l'url de l'event
      const hash = url.hash.replace("#", ""); //récupère le hash et le replace de '#home' à 'home'
      if (hash) {
        //Vérifie si un hash est présent
        await this.loadPage(hash); //charge la page renvoyée par traitement du hash
      }
    });
  }

  // Charge une page
  async loadPage(page) {
    //page = string
    // Vérifie si la page est déjà en cache
    if (this.cachePages.has(page)) {
      const cachedPage = this.cachePages.get(page); //charge le contenue mis en cache
      this.appDom.updateContent(cachedPage.html); //met à jour le container
      try {
        if (cachedPage.script) {
          // si un script est associé à cette page
          this.appDom.executeScript(cachedPage.script, page); // crée un balise script pour la page
        }
      } catch (error) {
        console.error(
          "Une erreur est survenue lors de l'exécution du script:",
          error
        );
      }
      return;
    }

    try {
      // Charge la page HTML et le script associé
      const htmlResponse = await axios.get(`src/pages/${page}.html`); //requete fetch pour le html
      const scriptResponse = await axios
        .get(`src/js/pages/${page}.js`)
        .catch(() => null); //requete fetch pour le script

      if (htmlResponse.status === 200) {
        // si la pages est trouvée mise en cache d'un obj avec deux props 'html' et 'script' et pour clé le paramètre fournis à la fonction
        const scriptContent = scriptResponse?.data || null;
        this.cachePages.set(page, {
          html: htmlResponse.data, //prop 'html'
          script: scriptContent, //prop 'script'
        });
        this.appDom.updateContent(htmlResponse.data); // mise à jour du container

        try {
          if (scriptContent) {
            //si un script est trouvé
            this.appDom.executeScript(scriptContent, page); //execute le script
          }
        } catch (error) {
          console.error(
            "Une erreur est survenue lors de l'exécution du script:",
            error
          );
        }
      }
    } catch (error) {
      //si le string fournis nne trouve ni html ni script il renvoie page 404
      console.error(`Erreur lors du chargement de la page '${page}':`, error);
      location.href = "#404";
    }
  }
}
