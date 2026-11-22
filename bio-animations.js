/*!
 * bio-animations.js — Sadia Mahmood portfolio add-on
 * 1) Subtle revolving DNA double-helix on both side borders of every <section> (fixed size)
 * 2) A tiny Drosophila (fruit fly) wandering in the Contact section
 *
 * Non-invasive: it does not edit your HTML/CSS. Layers sit BEHIND content
 * (z-index:-1 inside an isolated stacking context) and ignore the mouse.
 *
 * Install: add before </body> in index.html:
 *   <script src="bio-animations.js" defer></script>
 * Remove: delete that one line.
 */
(function () {
  "use strict";

  /* ---------- Settings you can tweak ---------- */
  var CONFIG = {
    accent: null, // e.g. '#38bdf8'. null = auto-detect from your theme
    dnaOpacity: 0.16, // 0.08 (very faint) – 0.25 (clearer)
    dnaSpeed: 0.6, // rotation speed
    fly: true, // set false to disable the fruit fly
    flyTargetId: "contact", // section id where the fly lives
  };

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Pick up your existing theme colour ---------- */
  function detectAccent() {
    if (CONFIG.accent) return CONFIG.accent;
    var cs = getComputedStyle(document.documentElement);
    var names = [
      "--accent",
      "--accent-color",
      "--primary",
      "--primary-color",
      "--teal",
      "--cyan",
      "--brand",
      "--highlight",
      "--color-accent",
    ];
    for (var i = 0; i < names.length; i++) {
      var v = cs.getPropertyValue(names[i]).trim();
      if (v) return v;
    }
    // fall back to the colour of the first button/link-like element
    var el = document.querySelector(
      '.btn, .button, a[class*="btn"], nav a.active, nav a',
    );
    if (el) {
      var c = getComputedStyle(el).color;
      if (c && c !== "rgb(0, 0, 0)") return c;
    }
    return "#4fd1c5";
  }

  function toRGB(color) {
    var d = document.createElement("div");
    d.style.color = color;
    document.body.appendChild(d);
    var m = getComputedStyle(d).color.match(/\d+(\.\d+)?/g) || [79, 209, 197];
    document.body.removeChild(d);
    return { r: +m[0], g: +m[1], b: +m[2] };
  }

  /* ---------- Shared style (only affects our own elements) ---------- */
  var style = document.createElement("style");
  style.textContent =
    "section.bio-host{position:relative;isolation:isolate}" +
    ".bio-dna{position:absolute;inset:0;width:100%;height:100%;" +
    "z-index:-1;pointer-events:none;display:block}" +
    ".bio-fly{position:absolute;left:0;top:0;width:46px;height:46px;" +
    "z-index:2;pointer-events:none;will-change:transform}" +
    ".bio-fly .wing{transform-box:fill-box;transform-origin:50% 100%;" +
    "animation:bioWing .07s linear infinite alternate}" +
    ".bio-fly .wing.r{animation-delay:.035s}" +
    "@keyframes bioWing{from{transform:rotate(-18deg) scaleY(1)}" +
    "to{transform:rotate(14deg) scaleY(.72)}}" +
    "@media (prefers-reduced-motion:reduce){.bio-fly .wing{animation:none}}";
  document.head.appendChild(style);

  /* ---------- DNA helix canvases ---------- */
  function initDNA() {
    var rgb = toRGB(detectAccent());
    var sections = document.querySelectorAll("section");
    var instances = [];

    sections.forEach(function (sec, index) {
      sec.classList.add("bio-host");
      var canvas = document.createElement("canvas");
      canvas.className = "bio-dna";
      canvas.setAttribute("aria-hidden", "true");
      sec.insertBefore(canvas, sec.firstChild);

      var inst = {
        sec: sec,
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        w: 0,
        h: 0,
        visible: false,
        // alternate sides per section so it feels varied, not repetitive
        side: index % 2 === 0 ? "right" : "left",
        phase: Math.random() * Math.PI * 2,
      };
      instances.push(inst);
    });

    function resize(inst) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = inst.sec.getBoundingClientRect();
      inst.w = r.width;
      inst.h = r.height;
      inst.canvas.width = Math.max(1, Math.floor(r.width * dpr));
      inst.canvas.height = Math.max(1, Math.floor(r.height * dpr));
      inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Fixed geometry: identical size in every section, hugging both borders
    var HELIX = { amp: 24, pitch: 150, rungs: 10, inset: 44 };

    function drawHelix(inst, cx, amp, t) {
      var ctx = inst.ctx,
        h = inst.h;
      var k = (Math.PI * 2) / HELIX.pitch;
      var base = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",";
      var op = CONFIG.dnaOpacity;
      var y, a, d, x1, x2;

      // base-pair rungs at FIXED heights; they revolve around the vertical axis
      var gap = HELIX.pitch / HELIX.rungs;
      for (y = 0; y <= h; y += gap) {
        a = y * k + t;
        x1 = cx + Math.sin(a) * amp;
        x2 = cx - Math.sin(a) * amp;
        d = (Math.cos(a) + 1) / 2; // 0 = back, 1 = front
        ctx.strokeStyle = base + op * (0.4 + 0.8 * d) + ")";
        ctx.lineWidth = 1.1 + 0.6 * d;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        ctx.fillStyle = base + op * (1 + 1.4 * d) + ")";
        ctx.beginPath();
        ctx.arc(x1, y, 1.8 + 1.4 * d, 0, 6.2832);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y, 1.8 + 1.4 * (1 - d), 0, 6.2832);
        ctx.fill();
      }

      // two backbones, shaded by depth so the revolving looks 3D
      var step = 4;
      for (var s = 0; s < 2; s++) {
        for (y = 0; y < h; y += step) {
          var a0 = y * k + t + s * Math.PI;
          var a1 = (y + step) * k + t + s * Math.PI;
          d = (Math.cos((a0 + a1) / 2) + 1) / 2;
          ctx.strokeStyle = base + op * (0.7 + 1.8 * d) + ")";
          ctx.lineWidth = 1.2 + 1.6 * d;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(cx + Math.sin(a0) * amp, y);
          ctx.lineTo(cx + Math.sin(a1) * amp, y + step);
          ctx.stroke();
        }
      }
    }

    function draw(inst, time) {
      var ctx = inst.ctx;
      ctx.clearRect(0, 0, inst.w, inst.h);
      var t = time * 0.001 * CONFIG.dnaSpeed; // same phase in every section
      var narrow = inst.w < 700;
      var amp = narrow ? 14 : HELIX.amp;
      var inset = narrow ? 22 : HELIX.inset;
      drawHelix(inst, inset, amp, t); // left border
      drawHelix(inst, inst.w - inset, amp, t); // right border
    }

    // only animate sections currently on screen
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          instances.forEach(function (i) {
            if (i.sec === e.target) i.visible = e.isIntersecting;
          });
        });
      },
      { rootMargin: "100px" },
    );

    instances.forEach(function (i) {
      resize(i);
      io.observe(i.sec);
    });

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        instances.forEach(resize);
      }, 150);
    });
    window.addEventListener("load", function () {
      instances.forEach(resize);
    });

    if (reduceMotion) {
      // single static frame
      instances.forEach(function (i) {
        draw(i, 0);
      });
      return;
    }
    function loop(time) {
      instances.forEach(function (i) {
        if (i.visible) draw(i, time);
      });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Fruit fly (Drosophila melanogaster) ---------- */
  var FLY_SVG =
    '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    // wings
    '<g class="wing l"><ellipse cx="22" cy="24" rx="7" ry="16" fill="#cfe9f5" fill-opacity=".55" ' +
    'stroke="#9cc7da" stroke-width=".8" transform="rotate(-28 22 24)"/></g>' +
    '<g class="wing r"><ellipse cx="42" cy="24" rx="7" ry="16" fill="#cfe9f5" fill-opacity=".55" ' +
    'stroke="#9cc7da" stroke-width=".8" transform="rotate(28 42 24)"/></g>' +
    // legs
    '<g stroke="#6b4a24" stroke-width="1.4" stroke-linecap="round" fill="none">' +
    '<path d="M27 36 L18 40 L15 47"/><path d="M37 36 L46 40 L49 47"/>' +
    '<path d="M27 40 L20 48"/><path d="M37 40 L44 48"/></g>' +
    // abdomen with stripes
    '<ellipse cx="32" cy="44" rx="9" ry="13" fill="#d9a441"/>' +
    '<path d="M24 41 Q32 44 40 41 M23.5 46 Q32 49 40.5 46 M25 51 Q32 53.5 39 51" ' +
    'stroke="#3b2a14" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
    // thorax + head
    '<ellipse cx="32" cy="30" rx="8" ry="7" fill="#c48a2c"/>' +
    '<circle cx="32" cy="20" r="7" fill="#c48a2c"/>' +
    // red compound eyes
    '<circle cx="27.3" cy="19" r="3.6" fill="#c0262d"/>' +
    '<circle cx="36.7" cy="19" r="3.6" fill="#c0262d"/>' +
    '<circle cx="26.5" cy="18" r="1" fill="#ff9aa0" fill-opacity=".8"/>' +
    '<circle cx="35.9" cy="18" r="1" fill="#ff9aa0" fill-opacity=".8"/>' +
    "</svg>";

  function initFly() {
    var host =
      document.getElementById(CONFIG.flyTargetId) ||
      document.querySelector("section:last-of-type");
    if (!host) return;
    host.classList.add("bio-host");

    var fly = document.createElement("div");
    fly.className = "bio-fly";
    fly.innerHTML = FLY_SVG;
    host.appendChild(fly);

    var st = {
      x: 60,
      y: 60,
      vx: 1.2,
      vy: 0.6,
      angle: 0,
      tx: 200,
      ty: 120,
      mode: "fly",
      rest: 0,
      visible: false,
    };

    function bounds() {
      return { w: host.clientWidth - 46, h: host.clientHeight - 46 };
    }
    function newTarget() {
      var b = bounds();
      st.tx = 20 + Math.random() * Math.max(10, b.w - 40);
      st.ty = 20 + Math.random() * Math.max(10, b.h - 40);
    }
    newTarget();

    new IntersectionObserver(function (e) {
      st.visible = e[0].isIntersecting;
    }).observe(host);

    var last = performance.now();
    function tick(now) {
      var dt = Math.min(40, now - last) / 16.7;
      last = now;
      if (st.visible) {
        var dx = st.tx - st.x,
          dy = st.ty - st.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (st.mode === "rest") {
          // sits still, wings stop buzzing
          st.rest -= dt;
          fly.style.setProperty("--", "0");
          if (st.rest <= 0) {
            st.mode = "fly";
            fly.querySelectorAll(".wing").forEach(function (w) {
              w.style.animationPlayState = "running";
            });
            newTarget();
          }
        } else {
          // steer toward target with jittery, fly-like wobble
          var speed = 2.1;
          st.vx +=
            (dx / (dist || 1)) * 0.18 * dt + (Math.random() - 0.5) * 0.35;
          st.vy +=
            (dy / (dist || 1)) * 0.18 * dt + (Math.random() - 0.5) * 0.35;
          var v = Math.sqrt(st.vx * st.vx + st.vy * st.vy) || 1;
          st.vx = (st.vx / v) * Math.min(v, speed);
          st.vy = (st.vy / v) * Math.min(v, speed);
          st.x += st.vx * dt;
          st.y += st.vy * dt;
          var target = (Math.atan2(st.vy, st.vx) * 180) / Math.PI + 90;
          var diff = ((target - st.angle + 540) % 360) - 180;
          st.angle += diff * 0.15;

          if (dist < 14) {
            if (Math.random() < 0.35) {
              // sometimes land and rest
              st.mode = "rest";
              st.rest = 90 + Math.random() * 150;
              fly.querySelectorAll(".wing").forEach(function (w) {
                w.style.animationPlayState = "paused";
              });
            } else newTarget();
          }
        }
        var b = bounds();
        st.x = Math.max(0, Math.min(b.w, st.x));
        st.y = Math.max(0, Math.min(b.h, st.y));
        fly.style.transform =
          "translate(" +
          st.x +
          "px," +
          st.y +
          "px) rotate(" +
          st.angle +
          "deg) scale(.85)";
      }
      requestAnimationFrame(tick);
    }

    if (reduceMotion) {
      // static fly, no wandering
      fly.style.transform = "translate(85%,20px) scale(.85)";
      fly.style.left = "0";
      return;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Go ---------- */
  function start() {
    try {
      initDNA();
    } catch (e) {
      console.warn("DNA animation skipped:", e);
    }
    if (CONFIG.fly) {
      try {
        initFly();
      } catch (e) {
        console.warn("Fly animation skipped:", e);
      }
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start);
  else start();
})();
