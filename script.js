// Sadia Mahmood — portfolio interactions
// Includes responsive navigation, scroll effects, education status styling,
// project placeholder notices, and the contact email helper.

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = document.querySelectorAll(".nav-link");
const progress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");

// Mobile navigation (guarded so the script remains safe if an element is absent).
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
    menuToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  });

  navItems.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      menuToggle.innerHTML =
        '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });
  });
}

// Mark the ongoing MPhil entry so CSS can distinguish it from completed study.
document.querySelectorAll(".timeline-item").forEach((item) => {
  const dateLabel = item.querySelector(".timeline-date");
  if (dateLabel && dateLabel.textContent.trim().toLowerCase() === "ongoing") {
    item.classList.add("is-current");
    dateLabel.classList.add("is-current");
    dateLabel.setAttribute("aria-label", "Currently ongoing qualification");
  }
});

// Scroll progress and back-to-top control.
function updateOnScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

  if (progress) progress.style.width = `${percent}%`;
  if (backToTop) backToTop.classList.toggle("show", window.scrollY > 450);
}

window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Reveal elements as they enter the viewport; show them immediately if unsupported.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// Highlight the navigation item for the section currently in view.
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navItems.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`,
            );
          });
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" },
  );

  document.querySelectorAll("main section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });
}

// Expand and collapse the sample Project 01 proposal outline.
document.querySelectorAll(".project-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const detailsId = button.getAttribute("aria-controls");
    const details = detailsId ? document.getElementById(detailsId) : null;
    if (!details) return;
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isExpanded));
    details.hidden = isExpanded;
    button.innerHTML = isExpanded
      ? 'View project outline <i class="fa-solid fa-arrow-down"></i>'
      : 'Hide project outline <i class="fa-solid fa-arrow-down"></i>';
  });
});

// Remaining project placeholder buttons provide an honest editing reminder.
document
  .querySelectorAll(".project-button:not(.project-toggle)")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.dataset.project || "This project";
      window.alert(
        `${title} is an editable placeholder. Replace it with genuine work or clearly label it as a proposal.`,
      );
    });
  });

// Prepare an email in the visitor's default email application.
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(
      formData.get("subject") || "Portfolio website enquiry",
    ).trim();
    const message = String(formData.get("message") || "").trim();

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:sadiamahmood241@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const formNote = document.getElementById("formNote");
    if (formNote) {
      formNote.textContent =
        "Your email application should open with the message prepared.";
    }
    window.location.href = mailto;
  });
}

// Keep the footer year current.
const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Expand/collapse the optional professional-approach paragraph in About Me.
const aboutMoreToggle = document.getElementById("aboutMoreToggle");
const aboutMoreContent = document.getElementById("aboutMoreContent");

if (aboutMoreToggle && aboutMoreContent) {
  aboutMoreToggle.addEventListener("click", () => {
    const isExpanded = aboutMoreToggle.getAttribute("aria-expanded") === "true";
    aboutMoreToggle.setAttribute("aria-expanded", String(!isExpanded));
    aboutMoreContent.hidden = isExpanded;
  });
}

// ================================================
// Interactive 3D DNA double-helix canvas animation
// Adapted from the animation code supplied by Sadia.
// ================================================
(() => {
  const canvas = document.getElementById("dnaCanvas");
  const wrapper = document.getElementById("dnaCanvasWrap");
  if (!canvas || !wrapper) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const config = {
    speed: 0.52,
    glow: 0.9,
    pairs: 22,
    turns: 2.35,
    tilt: -0.22,
  };
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    drag: false,
    lastX: 0,
    angle: 0,
  };
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let width = 0,
    height = 0,
    phase = 0,
    lastTime = 0,
    frame = 0;
  let visible = true;
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
    r: 0.8 + Math.random() * 2.2,
    speed: 0.000025 + Math.random() * 0.000045,
    phase: Math.random() * Math.PI * 2,
    teal: i % 3 === 0,
  }));

  function resize() {
    const rect = wrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const resizeObserver =
    "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(wrapper);
  else window.addEventListener("resize", resize);
  resize();

  function color(t, depth = 1, alpha = 1) {
    const mix = Math.max(0, Math.min(1, t * 0.65 + 0.22));
    const r = Math.round(0 + mix * 34),
      g = Math.round(205 + mix * 24),
      b = Math.round(255 - mix * 95);
    const shade = 0.42 + 0.58 * depth;
    return `rgba(${Math.round(r * shade)},${Math.round(g * shade)},${Math.round(b * shade)},${alpha})`;
  }
  function project(x, y, z) {
    const zTilt = config.tilt + pointer.x * 0.12,
      xTilt = pointer.y * 0.18;
    const xr = x * Math.cos(zTilt) - y * Math.sin(zTilt);
    const yr = x * Math.sin(zTilt) + y * Math.cos(zTilt);
    const yp = yr * Math.cos(xTilt) - z * Math.sin(xTilt);
    const zp = yr * Math.sin(xTilt) + z * Math.cos(xTilt);
    const scale = 610 / (610 + zp);
    return {
      sx: width * 0.5 + xr * scale,
      sy: height * 0.5 + yp * scale,
      z: zp,
      scale,
    };
  }
  function capsule(a, b, r1, r2, t, depth, backbone = true) {
    const dx = b.sx - a.sx,
      dy = b.sy - a.sy,
      len = Math.hypot(dx, dy);
    if (len < 0.35) return;
    const nx = -dy / len,
      ny = dx / len;
    ctx.save();
    if (depth > 0.48) {
      ctx.shadowColor = t > 0.5 ? "rgba(46,229,157,.55)" : "rgba(0,210,255,.6)";
      ctx.shadowBlur = (backbone ? 15 : 9) * depth * config.glow;
    }
    const grad = ctx.createLinearGradient(
      a.sx + nx * r1,
      a.sy + ny * r1,
      a.sx - nx * r1,
      a.sy - ny * r1,
    );
    const alpha = backbone ? 0.48 + 0.48 * depth : 0.38 + 0.52 * depth;
    grad.addColorStop(0, color(t, depth * 0.72, alpha));
    grad.addColorStop(0.28, `rgba(220,252,255,${0.25 + 0.5 * depth})`);
    grad.addColorStop(0.55, color(t, Math.min(1.2, depth * 1.15), alpha));
    grad.addColorStop(1, color(t, depth * 0.72, alpha));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(a.sx + nx * r1, a.sy + ny * r1);
    ctx.lineTo(b.sx + nx * r2, b.sy + ny * r2);
    ctx.arc(b.sx, b.sy, r2, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
    ctx.lineTo(a.sx - nx * r1, a.sy - ny * r1);
    ctx.arc(a.sx, a.sy, r1, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
    ctx.closePath();
    ctx.fill();
    if (depth > 0.45) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(235,255,255,${0.2 + 0.4 * depth})`;
      ctx.lineWidth = Math.max(0.7, r1 * 0.22);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(a.sx + nx * r1 * 0.4, a.sy + ny * r1 * 0.4);
      ctx.lineTo(b.sx + nx * r2 * 0.4, b.sy + ny * r2 * 0.4);
      ctx.stroke();
    }
    ctx.restore();
  }
  function node(p, r, t, depth) {
    ctx.save();
    if (depth > 0.5) {
      ctx.shadowColor = t > 0.5 ? "#2ee59d" : "#00d2ff";
      ctx.shadowBlur = 10 * config.glow;
    }
    const grad = ctx.createRadialGradient(
      p.sx - r * 0.3,
      p.sy - r * 0.3,
      r * 0.1,
      p.sx,
      p.sy,
      r,
    );
    grad.addColorStop(0, `rgba(245,255,255,${0.7 + 0.25 * depth})`);
    grad.addColorStop(0.45, color(t, depth, 0.95));
    grad.addColorStop(1, color(t, depth * 0.5, 0.48));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawParticles(time) {
    particles.forEach((p) => {
      p.y -= p.speed * (reducedMotion ? 0 : 1);
      if (p.y < -0.04) p.y = 1.04;
      const x = (p.x + Math.sin(time * 0.0007 + p.phase) * 0.009) * width,
        y = p.y * height;
      ctx.save();
      ctx.fillStyle = p.teal ? "rgba(46,229,157,.48)" : "rgba(0,210,255,.48)";
      ctx.shadowColor = p.teal ? "#2ee59d" : "#00d2ff";
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(x, y, p.r * (0.55 + p.z * 0.55), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  function render(time) {
    if (!visible) {
      frame = 0;
      return;
    }
    if (!lastTime) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    pointer.x += (pointer.targetX - pointer.x) * 0.06;
    pointer.y += (pointer.targetY - pointer.y) * 0.06;
    if (!reducedMotion) phase += dt * config.speed;
    const angle = phase + pointer.angle;
    ctx.clearRect(0, 0, width, height);
    drawParticles(time);
    const helixH = Math.min(height * 0.82, 470),
      radius = Math.min(width * 0.19, 76),
      steps = config.pairs * 3;
    const A = [],
      B = [],
      items = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps,
        y = (t - 0.5) * helixH,
        theta = t * Math.PI * 2 * config.turns + angle;
      A.push({
        ...project(Math.cos(theta) * radius, y, Math.sin(theta) * radius),
        t,
      });
      B.push({
        ...project(
          Math.cos(theta + Math.PI) * radius,
          y,
          Math.sin(theta + Math.PI) * radius,
        ),
        t,
      });
    }
    for (let i = 0; i < steps; i++) {
      items.push({
        kind: "back",
        z: (A[i].z + A[i + 1].z) / 2,
        a: A[i],
        b: A[i + 1],
        t: A[i].t,
        strand: 0,
      });
      items.push({
        kind: "back",
        z: (B[i].z + B[i + 1].z) / 2,
        a: B[i],
        b: B[i + 1],
        t: B[i].t,
        strand: 1,
      });
    }
    for (let bp = 1; bp < config.pairs; bp++) {
      const idx = Math.round((bp / config.pairs) * steps),
        a = A[idx],
        b = B[idx];
      const gap = 0.045,
        mid = {
          sx: (a.sx + b.sx) / 2,
          sy: (a.sy + b.sy) / 2,
          z: (a.z + b.z) / 2,
          scale: (a.scale + b.scale) / 2,
        };
      const left = {
        sx: a.sx + (b.sx - a.sx) * (0.5 - gap),
        sy: a.sy + (b.sy - a.sy) * (0.5 - gap),
        z: mid.z,
        scale: mid.scale,
      };
      const right = {
        sx: b.sx + (a.sx - b.sx) * (0.5 - gap),
        sy: b.sy + (a.sy - b.sy) * (0.5 - gap),
        z: mid.z,
        scale: mid.scale,
      };
      items.push({
        kind: "rung",
        z: (a.z + mid.z) / 2,
        a,
        b: left,
        t: a.t,
        shift: 0,
      });
      items.push({
        kind: "rung",
        z: (b.z + mid.z) / 2,
        a: b,
        b: right,
        t: b.t,
        shift: 0.25,
      });
      items.push({ kind: "node", z: mid.z - 1, p: mid, left, right, t: a.t });
    }
    items.sort((a, b) => b.z - a.z);
    const maxZ = radius * 1.15;
    items.forEach((it) => {
      const depth = Math.max(0.08, Math.min(1, (maxZ - it.z) / (2 * maxZ)));
      if (it.kind === "back") {
        const thick = 6.2 + 4.4 * depth;
        capsule(
          it.a,
          it.b,
          thick * it.a.scale,
          thick * it.b.scale,
          (Math.sin(it.t * Math.PI * 2 + it.strand * 1.4) + 1) * 0.5,
          depth,
          true,
        );
      } else if (it.kind === "rung") {
        const mix = ((Math.cos(it.t * Math.PI * 3) + 1) * 0.5 + it.shift) % 1;
        capsule(
          it.a,
          it.b,
          (3.4 + 2.1 * depth) * it.a.scale,
          (2.3 + 1.5 * depth) * it.b.scale,
          mix,
          depth * 0.92,
          false,
        );
      } else {
        const r = (2.5 + 1.6 * depth) * it.p.scale,
          mix = (Math.sin(it.t * Math.PI * 2.5) + 1) * 0.5;
        node(it.left, r, mix, depth);
        node(it.right, r, (mix + 0.3) % 1, depth);
      }
    });
    frame = requestAnimationFrame(render);
  }
  function start() {
    if (!frame) {
      lastTime = 0;
      frame = requestAnimationFrame(render);
    }
  }
  function stop() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0.05 },
  );
  observer.observe(wrapper);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (visible) start();
  });
  wrapper.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    if (pointer.drag) {
      pointer.angle += (e.clientX - pointer.lastX) * 0.008;
      pointer.lastX = e.clientX;
    }
  });
  wrapper.addEventListener("pointerdown", (e) => {
    pointer.drag = true;
    pointer.lastX = e.clientX;
    if (wrapper.setPointerCapture) wrapper.setPointerCapture(e.pointerId);
  });
  wrapper.addEventListener("pointerup", () => {
    pointer.drag = false;
  });
  wrapper.addEventListener("pointercancel", () => {
    pointer.drag = false;
  });
  wrapper.addEventListener("pointerleave", () => {
    if (!pointer.drag) {
      pointer.targetX = 0;
      pointer.targetY = 0;
    }
  });
  start();
})();
