/* @ds-bundle: {"format":4,"namespace":"Patina","components":[]} */
/* Patina — preview behaviours. Vanilla, no dependencies; every preview gets this script.
   It wires the markup in components/<Comp>/preview.html through ARIA and data attributes:
   - [role=checkbox], [role=switch]      click toggles aria-checked
   - .pt-toggle (outside a group)         click toggles aria-pressed
   - .pt-toggle-group > .pt-toggle        single choice via data-state (multiple with data-multiple on the group)
   - [role=tablist] > [role=tab]          click selects
   - [data-pt-toggle="#id"]               shows/hides #id, keeps aria-expanded in sync; popups close on outside click and Escape
   - [data-pt-close]                      closes the nearest [data-pt-popup]
   - [role=option] inside [data-pt-select] picks the value, updates the trigger, closes the list
   - .pt-menu-item                        arrow keys move the highlight; Enter/click closes the menu
   - [data-pt-current] containers         click on a link marks it aria-current="page"
   - [data-pt-selectable] containers      click on a row marks it selected */
(function () {
  "use strict";
  var doc = document;

  function closest(el, sel) { return el && el.closest ? el.closest(sel) : null; }
  function triggersFor(popup) {
    if (!popup.id) return [];
    return Array.prototype.slice.call(doc.querySelectorAll('[data-pt-toggle="#' + popup.id + '"]'));
  }
  function setOpen(popup, open) {
    if (!popup) return;
    popup.hidden = !open;
    triggersFor(popup).forEach(function (t) {
      t.setAttribute("aria-expanded", open ? "true" : "false");
      if (t.hasAttribute("data-popup-flag")) { if (open) t.setAttribute("data-popup-open", ""); else t.removeAttribute("data-popup-open"); }
    });
  }
  function closeAll(except) {
    Array.prototype.forEach.call(doc.querySelectorAll("[data-pt-popup]:not([hidden])"), function (p) {
      if (p !== except && !(except && p.contains(except))) setOpen(p, false);
    });
  }
  function highlight(menu, item) {
    Array.prototype.forEach.call(menu.querySelectorAll(".pt-menu-item"), function (i) { i.removeAttribute("data-highlighted"); });
    if (item) { item.setAttribute("data-highlighted", ""); item.focus({ preventScroll: true }); }
  }

  doc.addEventListener("click", function (e) {
    var t = e.target;

    var link = closest(t, 'a[href="#"]');
    if (link) e.preventDefault();

    var toggleBtn = closest(t, "[data-pt-toggle]");
    if (toggleBtn) {
      var target = doc.querySelector(toggleBtn.getAttribute("data-pt-toggle"));
      if (target) {
        var open = target.hidden;
        if (open && target.hasAttribute("data-pt-popup")) closeAll(target);
        setOpen(target, open);
        if (open) { var first = target.querySelector('[aria-selected="true"], .pt-menu-item, input, button'); if (first && first.classList.contains("pt-menu-item")) highlight(target, first); }
      }
      return;
    }

    var closer = closest(t, "[data-pt-close]");
    if (closer) { setOpen(closest(closer, "[data-pt-popup]"), false); return; }

    var check = closest(t, '[role="checkbox"], [role="switch"]');
    if (check && !check.disabled) {
      check.setAttribute("aria-checked", check.getAttribute("aria-checked") === "true" ? "false" : "true");
      return;
    }

    var tog = closest(t, ".pt-toggle");
    if (tog && !tog.disabled) {
      var group = closest(tog, ".pt-toggle-group");
      if (group) {
        if (group.hasAttribute("data-multiple")) {
          tog.setAttribute("data-state", tog.getAttribute("data-state") === "on" ? "off" : "on");
        } else {
          Array.prototype.forEach.call(group.querySelectorAll(".pt-toggle"), function (b) { b.setAttribute("data-state", b === tog ? "on" : "off"); });
        }
      } else {
        tog.setAttribute("aria-pressed", tog.getAttribute("aria-pressed") === "true" ? "false" : "true");
      }
      return;
    }

    var tab = closest(t, '[role="tab"]');
    if (tab) {
      var list = closest(tab, '[role="tablist"]');
      Array.prototype.forEach.call(list.querySelectorAll('[role="tab"]'), function (b) {
        b.setAttribute("aria-selected", b === tab ? "true" : "false");
        var panel = b.getAttribute("aria-controls") && doc.getElementById(b.getAttribute("aria-controls"));
        if (panel) panel.hidden = b !== tab;
      });
      return;
    }

    var opt = closest(t, '[data-pt-select] [role="option"]');
    if (opt) {
      var sel = closest(opt, "[data-pt-select]");
      Array.prototype.forEach.call(sel.querySelectorAll('[role="option"]'), function (o) { o.setAttribute("aria-selected", o === opt ? "true" : "false"); });
      var trig = sel.querySelector(".pt-select");
      if (trig) { trig.removeAttribute("data-placeholder"); var v = trig.querySelector("[data-pt-value]"); if (v) v.textContent = opt.getAttribute("data-label") || opt.textContent.trim(); }
      setOpen(closest(opt, "[data-pt-popup]"), false);
      if (trig) trig.focus();
      return;
    }

    var item = closest(t, ".pt-menu-item");
    if (item) { var menu = closest(item, "[data-pt-popup]"); if (menu) setOpen(menu, false); return; }

    var cur = closest(t, "[data-pt-current] a, [data-pt-current] .pt-page");
    if (cur && !cur.classList.contains("pt-page--ellipsis")) {
      closeAll(null);
      var box = closest(cur, "[data-pt-current]");
      var pages = Array.prototype.slice.call(box.querySelectorAll("a:not(.pt-page--prev):not(.pt-page--next)"));
      var now = pages.filter(function (a) { return a.getAttribute("aria-current") === "page"; })[0];
      var next = cur;
      if (cur.classList.contains("pt-page--prev") || cur.classList.contains("pt-page--next")) {
        var i = pages.indexOf(now) + (cur.classList.contains("pt-page--next") ? 1 : -1);
        next = pages[Math.max(0, Math.min(pages.length - 1, i))];
      }
      pages.forEach(function (a) { if (a === next) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
      Array.prototype.forEach.call(box.querySelectorAll(".pt-page--prev, .pt-page--next"), function (a) {
        var edge = a.classList.contains("pt-page--prev") ? pages[0] : pages[pages.length - 1];
        a.setAttribute("aria-disabled", next === edge ? "true" : "false");
      });
      return;
    }

    var row = closest(t, "[data-pt-selectable] tbody tr, [data-pt-selectable] .pt-row");
    if (row) {
      var holder = closest(row, "[data-pt-selectable]");
      Array.prototype.forEach.call(holder.querySelectorAll("tbody tr, .pt-row"), function (r) {
        if (r.tagName === "TR") { if (r === row) r.setAttribute("data-state", "selected"); else r.removeAttribute("data-state"); }
        else r.setAttribute("aria-selected", r === row ? "true" : "false");
      });
      return;
    }

    if (!closest(t, "[data-pt-popup]")) closeAll(null);
  });

  doc.addEventListener("mouseover", function (e) {
    var item = closest(e.target, ".pt-menu-item");
    if (item) { var menu = closest(item, ".pt-menu"); if (menu) highlight(menu, item); }
  });

  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var open = doc.querySelectorAll("[data-pt-popup]:not([hidden])");
      if (open.length) { var last = open[open.length - 1]; setOpen(last, false); var tr = triggersFor(last)[0]; if (tr) tr.focus(); }
      return;
    }
    var menu = closest(doc.activeElement, ".pt-menu");
    if (menu && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      var items = Array.prototype.slice.call(menu.querySelectorAll(".pt-menu-item"));
      var at = items.indexOf(menu.querySelector(".pt-menu-item[data-highlighted]"));
      highlight(menu, items[(at + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]);
    } else if (menu && (e.key === "Enter" || e.key === " ")) {
      var h = menu.querySelector(".pt-menu-item[data-highlighted]");
      if (h) { e.preventDefault(); h.click(); }
    }
  });

  window.Patina = window.Patina || {};
  window.Patina.setOpen = setOpen;
})();
