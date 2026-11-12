// Calendar picker for wetboiz.com digests. Published to /assets/calendar.js by digest/site.py.
// Mounts on <div id="cal">; reads /archive/dates.json; days with a digest link to /archive/<date>.html,
// all other days are greyed out. The page's own date comes from <body data-date="YYYY-MM-DD">.
(function () {
  "use strict";
  var mount = document.getElementById("cal");
  if (!mount) return;

  var style = document.createElement("style");
  style.textContent = [
    ".cal{position:relative}",
    ".cal-btn{font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:6px;",
    "padding:5px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:7px}",
    ".cal-btn:hover,.cal-btn[aria-expanded=true]{border-color:var(--muted)}",
    ".cal-btn svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.6}",
    ".cal-pop{position:absolute;top:calc(100% + 6px);left:0;z-index:10;width:272px;max-width:calc(100vw - 32px);",
    "background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:10px 10px 8px;",
    "box-shadow:0 8px 24px rgba(0,0,0,.12)}",
    ".cal-pop[hidden]{display:none}",
    ".cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;color:var(--fg)}",
    ".cal-head span{font-weight:600}",
    ".cal-nav{font:inherit;font-size:1.1rem;line-height:1;width:30px;height:30px;border:none;border-radius:6px;",
    "background:none;color:var(--fg);cursor:pointer}",
    ".cal-nav:hover:not(:disabled){background:var(--line)}",
    ".cal-nav:disabled{opacity:.3;cursor:default}",
    ".cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}",
    ".cal-dow{font-size:.72rem;color:var(--muted);padding:2px 0 4px}",
    ".cal-day{display:block;padding:6px 0;border-radius:6px;font-size:.85rem;color:var(--muted);opacity:.45}",
    "a.cal-day{color:var(--accent);opacity:1;text-decoration:none;font-weight:600}",
    "a.cal-day:hover{background:var(--line)}",
    ".cal-day.cal-here{background:var(--accent);color:var(--bg)}",
    ".cal-foot{margin-top:6px;font-size:.72rem;color:var(--muted);text-align:center}"
  ].join("");
  document.head.appendChild(style);

  var here = document.body.getAttribute("data-date") || "";
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
                "October", "November", "December"];

  function parse(d) { return new Date(d + "T12:00:00"); }
  function iso(y, m, d) { return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }
  function label(d) {
    return parse(d).toLocaleDateString(undefined, {weekday: "short", year: "numeric", month: "short", day: "numeric"});
  }

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "cal-btn";
  btn.setAttribute("aria-haspopup", "dialog");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/>' +
                  '<path d="M3 10h18M8 3v4M16 3v4"/></svg><span></span>';
  btn.querySelector("span").textContent = here ? label(here) : "Past digests";
  var pop = document.createElement("div");
  pop.className = "cal-pop";
  pop.hidden = true;
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", "Choose a digest by date");
  mount.appendChild(btn);
  mount.appendChild(pop);

  var dates = new Set(), first = null, last = null, view = null;

  function render() {
    var y = view.getFullYear(), m = view.getMonth();
    var startDow = new Date(y, m, 1).getDay();             // Sunday = 0
    var days = new Date(y, m + 1, 0).getDate();
    var html = '<div class="cal-head"><button type="button" class="cal-nav" data-step="-1" aria-label="Previous month">‹</button>' +
               "<span>" + MONTHS[m] + " " + y + "</span>" +
               '<button type="button" class="cal-nav" data-step="1" aria-label="Next month">›</button></div>' +
               '<div class="cal-grid">';
    ["S", "M", "T", "W", "T", "F", "S"].forEach(function (d) { html += '<div class="cal-dow">' + d + "</div>"; });
    for (var i = 0; i < startDow; i++) html += "<div></div>";
    for (var d = 1; d <= days; d++) {
      var key = iso(y, m, d);
      if (dates.has(key)) {
        html += '<a class="cal-day' + (key === here ? " cal-here" : "") + '" href="/archive/' + key + '.html"' +
                (key === here ? ' aria-current="date"' : "") + ' title="' + label(key) + '">' + d + "</a>";
      } else {
        html += '<span class="cal-day" aria-disabled="true">' + d + "</span>";
      }
    }
    html += '</div><div class="cal-foot">' + dates.size + " digests</div>";
    pop.innerHTML = html;
    var prev = pop.querySelector('[data-step="-1"]'), next = pop.querySelector('[data-step="1"]');
    prev.disabled = !first || (y === first.getFullYear() && m <= first.getMonth()) || y < first.getFullYear();
    next.disabled = !last || (y === last.getFullYear() && m >= last.getMonth()) || y > last.getFullYear();
  }

  pop.addEventListener("click", function (e) {
    var step = e.target.getAttribute && e.target.getAttribute("data-step");
    if (step && !e.target.disabled) {
      view = new Date(view.getFullYear(), view.getMonth() + Number(step), 1);
      render();
    }
  });
  function close() { pop.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", function () {
    if (!view) return;
    pop.hidden = !pop.hidden;
    btn.setAttribute("aria-expanded", String(!pop.hidden));
  });
  document.addEventListener("click", function (e) { if (!mount.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); btn.focus(); } });

  fetch("/archive/dates.json", {cache: "no-cache"})
    .then(function (r) { return r.json(); })
    .then(function (list) {
      list.forEach(function (d) { dates.add(d); });
      var sorted = list.slice().sort();
      if (sorted.length) { first = parse(sorted[0]); last = parse(sorted[sorted.length - 1]); }
      var start = here ? parse(here) : (last || new Date());
      view = new Date(start.getFullYear(), start.getMonth(), 1);
      render();
    })
    .catch(function () { btn.disabled = true; });
})();
