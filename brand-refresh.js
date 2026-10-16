/* Site-wide visual brand refresh. Keeps app logic, routes, and checkout identifiers unchanged. */
(() => {
  const LOGO_SRC = "/assets/mypnetlab-login-logo.webp";
  const refreshText = (value) => value
    .replace(/\bCONFIG by MyPnetLab\b/g, "MyPnetLab")
    .replace(/\bCONFIG\b/g, "MyPnetLab")
    .replace(/\bConfig (?=Expert\b|Pro\b|Essential\b)/g, "MyPnetLab ");

  const ensureBrandLogo = (anchor) => {
    if (!anchor || !anchor.matches("a.config-brand")) return;
    const current = anchor.querySelector(":scope > img.config-brand-logo");
    if (current && current.getAttribute("src") === LOGO_SRC) return;

    const image = document.createElement("img");
    image.className = "config-brand-logo";
    image.src = LOGO_SRC;
    image.alt = "";
    image.width = 720;
    image.height = 229;
    image.decoding = "async";
    image.setAttribute("aria-hidden", "true");
    anchor.replaceChildren(image);
    if (!anchor.hasAttribute("aria-label")) anchor.setAttribute("aria-label", "MyPnetLab — Home");
  };

  const refreshElement = (element) => {
    if (!(element instanceof Element)) return;
    for (const attr of ["aria-label", "alt", "title", "placeholder"]) {
      const value = element.getAttribute(attr);
      if (value) element.setAttribute(attr, refreshText(value));
    }
    if (element.tagName === "IMG" && element.closest(".config-brand")) {
      element.setAttribute("alt", element.classList.contains("config-brand-logo") ? "" : "MyPnetLab");
    }
    if (element.matches("a.config-brand")) ensureBrandLogo(element);
    else if (element.matches(".config-brand-fallback, img.config-brand-logo")) {
      ensureBrandLogo(element.closest("a.config-brand"));
    }
  };

  const refreshSubtree = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const next = refreshText(node.nodeValue || "");
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) return;
    if (node.nodeType === Node.ELEMENT_NODE) refreshElement(node);
    for (const child of node.childNodes) refreshSubtree(child);
  };

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "characterData") refreshSubtree(record.target);
      else for (const node of record.addedNodes) refreshSubtree(node);
    }
    const currentTitle = document.title;
    const nextTitle = refreshText(currentTitle);
    if (nextTitle !== currentTitle) document.title = nextTitle;
  });

  refreshSubtree(document.documentElement);
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  const initialTitle = document.title;
  const brandedTitle = refreshText(initialTitle);
  if (brandedTitle !== initialTitle) document.title = brandedTitle;
})();
