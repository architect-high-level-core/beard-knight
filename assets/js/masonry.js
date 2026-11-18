(function () {
  var grid = document.querySelector(".grid");
  if (!grid) return;

  var ro, t = 0, pending = false;

  function colCount(w) {
    if (w >= 900) return 3;
    if (w >= 300) return 2;
    return 1;
  }
  function startOffsets(n) {
    if (n === 3) return [0, 44, 92];
    if (n === 2) return [0, 56];
    return [0];
  }
  function fractions(n) {
    if (n === 3) return [1.12, 0.94, 0.94];
    if (n === 2) return [1.06, 0.94];
    return [1];
  }
  function gapX(w) { return w >= 900 ? 28 : 20; }
  function gapY(w) { return w >= 900 ? 36 : 28; }

  function layout() {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(":scope > .card"));
    if (!cards.length) return;
    var w = grid.clientWidth;
    if (!w) return;
    var n = colCount(w), gx = gapX(w), gy = gapY(w);
    var fr = fractions(n), sum = 0, i, c, card, x, y, h, b, k, min, nudge;
    for (i = 0; i < n; i++) sum += fr[i];
    var inner = w - gx * (n - 1);
    var widths = [], xs = [], acc = 0;
    for (i = 0; i < n; i++) {
      widths[i] = Math.floor(inner * (fr[i] / sum));
      xs[i] = acc;
      acc += widths[i] + gx;
    }
    /* give leftover pixels to the last column so we fill the row */
    widths[n - 1] += w - (xs[n - 1] + widths[n - 1]);

    var bottoms = startOffsets(n).slice();
    var tops = [];
    grid.classList.add("is-masonry");

    for (i = 0; i < cards.length; i++) {
      card = cards[i];
      min = 0;
      for (c = 1; c < n; c++) if (bottoms[c] < bottoms[min]) min = c;
      y = bottoms[min];
      /* keep tops from lining up across columns */
      nudge = 0;
      for (k = 0; k < tops.length; k++) {
        if (tops[k].c !== min && Math.abs(tops[k].y - y) < 28) {
          if (28 - Math.abs(tops[k].y - y) > nudge) nudge = 28 - Math.abs(tops[k].y - y);
        }
      }
      y += nudge;
      card.style.width = widths[min] + "px";
      card.style.left = xs[min] + "px";
      card.style.top = y + "px";
      h = card.offsetHeight;
      bottoms[min] = y + h + gy;
      tops.push({ c: min, y: y });
    }
    grid.style.height = Math.max.apply(null, bottoms) - gy + "px";
    document.body.classList.add("masonry-ready");
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; layout(); });
  }

  window.BKMasonry = schedule;
  schedule();

  Array.prototype.forEach.call(grid.querySelectorAll("img"), function (img) {
    if (!img.complete) img.addEventListener("load", schedule);
  });
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(schedule, 120);
  });
  var lastW = 0;
  if (typeof ResizeObserver === "function") {
    ro = new ResizeObserver(function () {
      var w = grid.clientWidth;
      if (w !== lastW) { lastW = w; schedule(); }
    });
    ro.observe(grid);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule).catch(function () {});
  }
})();
