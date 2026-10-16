/* Site-wide visual brand refresh. Keeps app logic, routes, and checkout identifiers unchanged. */
(() => {
  const refreshText = (value) => value
    .replace(/\bCONFIG by MyPnetLab\b/g, "MyPnetLab")
    .replace(/\bCONFIG\b/g, "MyPnetLab")
    .replace(/\bConfig (?=Expert\b|Pro\b|Essential\b)/g, "MyPnetLab ");

  const refreshElement = (element) => {
    if (!(element instanceof Element)) return;
    for (const attr of ["aria-label", "alt", "title", "placeholder"]) {
      const value = element.getAttribute(attr);
      if (value) element.setAttribute(attr, refreshText(value));
    }
    if (element.tagName === "IMG" && element.closest(".config-brand")) {
      element.setAttribute("alt", "MyPnetLab");
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
