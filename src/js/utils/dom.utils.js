export class AppDom {
  constructor(appElement) {
    this.contentElement = appElement;
  }
  // vider le conteneur
  clearContent() {
    this.contentElement.innerHTML = "";
  }
  // mettre à jour le conteneur avec du HTML
  updateContent(html) {
    if (typeof html === "string") this.contentElement.innerHTML = html;
  }
  // exécuter le script d'une page
  executeScript(scriptContent, page) {
    document
      .querySelectorAll(`[data-script="${page}"]`)
      .forEach((el) => el.remove()); // suppresion des scripts exitant
    const scriptElement = document.createElement("script");
    scriptElement.textContent = scriptContent;
    scriptElement.setAttribute("data-script", page);
    document.body.appendChild(scriptElement); //création et ajout au body

    if (typeof initModule === "function") {
      initModule(); // initialisation du script lié à la page
    }
  }
}
