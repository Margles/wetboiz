// Render LaTeX ($...$, $$...$$, \(...\)) in paper titles, summaries, and reasons with KaTeX (loaded in the page head).
(function () {
  if (typeof renderMathInElement !== "function") return;  // CDN unavailable: leave the raw LaTeX
  document.querySelectorAll(".papers").forEach(function (el) {
    renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: false },  // keep everything inline in titles
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false,
      errorColor: "inherit",
      strict: "ignore"
    });
  });
})();
