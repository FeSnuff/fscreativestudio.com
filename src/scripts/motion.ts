import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, Flip);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function nav() {
  const header = document.querySelector<HTMLElement>('[data-nav]');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const btn = header.querySelector<HTMLButtonElement>('[data-menu-btn]');
  const menu = header.querySelector<HTMLElement>('[data-menu]');
  btn?.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    header.classList.toggle('is-open', open);
    if (menu) menu.hidden = !open;
    document.documentElement.style.overflow = open ? 'hidden' : '';
  });
}

function smoothScroll() {
  if (reduce) return;
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Splits a heading into words wrapped in masks so they can rise in. */
function splitWords(el: HTMLElement) {
  const words = (el.textContent || '').trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent!.trim());
  el.innerHTML = words
    .map((w) => `<span aria-hidden="true" style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em"><span data-w style="display:inline-block">${w}</span></span>`)
    .join(' ');
  return el.querySelectorAll<HTMLElement>('[data-w]');
}

function heroIntro() {
  const h1 = document.querySelector<HTMLElement>('[data-hero-h1]');
  if (!h1 || reduce) return gsap.timeline();
  const words = splitWords(h1);
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(words, { yPercent: 110, duration: 1.1, stagger: 0.035 })
    .from('[data-hero-sub], [data-hero-cta], [data-hero-note]', { opacity: 0, y: 16, duration: 0.9, stagger: 0.08 }, '-=0.75');
  return tl;
}

function heroSystem(intro: gsap.core.Timeline) {
  const root = document.querySelector<HTMLElement>('[data-hero-system]');
  if (!root) return;
  const toast = root.querySelector('[data-hs-toast]');
  const thread = root.querySelector('[data-hs-thread]');
  if (reduce) return;

  gsap.set([toast, thread], { autoAlpha: 0, y: 14 });
  intro
    .from(root.querySelector('[data-hs-window]'), { y: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.25)
    .from(root.querySelectorAll('[data-hs-card]'), { y: 10, autoAlpha: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, 0.7);

  const card = root.querySelector<HTMLElement>('[data-hs-card="ridgeway"]');
  const target = root.querySelector<HTMLElement>('[data-hs-col="2"] [data-hs-list]');
  if (!card || !target) return;

  intro.add(() => {
    gsap.to(card, { boxShadow: '0 0 0 2px #1ad4d9, 0 8px 20px -6px rgb(6 5 45 / .35)', duration: 0.35 });
  }, '+=0.5');
  intro.add(() => {
    const state = Flip.getState(card);
    target.prepend(card);
    const dot = card.querySelector('[data-hs-dot]');
    dot?.classList.remove('bg-signal'); dot?.classList.add('bg-mint');
    Flip.from(state, { duration: 0.9, ease: 'power3.inOut', onComplete: () => {
      gsap.to(card, { boxShadow: '0 1px 2px rgb(6 5 45 / .08)', duration: 0.6, delay: 0.6 });
    } });
  }, '+=0.45');
  intro.to(toast, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' }, '+=0.9');
  intro.to(thread, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' }, '+=0.5');

  // gentle depth while scrolling past the hero
  gsap.to(toast, { yPercent: -40, ease: 'none', scrollTrigger: { trigger: root, start: 'top 30%', end: 'bottom top', scrub: true } });
  gsap.to(thread, { yPercent: 30, ease: 'none', scrollTrigger: { trigger: root, start: 'top 30%', end: 'bottom top', scrub: true } });
}

function connectScene() {
  const sec = document.querySelector<HTMLElement>('[data-connect]');
  if (!sec || reduce) return;
  const pieces = gsap.utils.toArray<HTMLElement>('[data-piece]', sec);
  const steps = gsap.utils.toArray<HTMLElement>('[data-connect-step]', sec);
  const frame = sec.querySelector('[data-connect-frame]');
  const panel = sec.querySelector('[data-connect-panel]');
  const glow = sec.querySelector('[data-connect-glow]');
  const label = sec.querySelector('[data-connect-label]');
  const scatter = [
    { x: -120, y: -90, rotation: -14 }, { x: 110, y: -120, rotation: 10 }, { x: 150, y: 10, rotation: 16 },
    { x: -150, y: 60, rotation: 9 }, { x: 40, y: 140, rotation: -11 }, { x: 170, y: 120, rotation: -7 },
  ];

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sec.querySelector('[data-connect-pin]'), start: 'top top', end: '+=140%', scrub: 0.8, pin: true },
    });
    tl.set(steps, { opacity: 0.3 })
      .fromTo(pieces, { x: (i) => scatter[i].x, y: (i) => scatter[i].y, rotation: (i) => scatter[i].rotation, scale: 0.92 },
        { x: 0, y: 0, rotation: 0, scale: 1, ease: 'power2.inOut', stagger: 0.04, duration: 1 }, 0)
      .fromTo(frame, { backgroundColor: 'rgba(6,5,45,0)' }, { backgroundColor: 'rgba(6,5,45,1)', duration: 0.5 }, 0.35)
      .fromTo(panel, { backgroundColor: 'rgba(6,5,45,0)' }, { backgroundColor: 'rgba(6,5,45,1)', duration: 0.5 }, 0.35)
      .fromTo(pieces, { backgroundColor: '#ffffff', color: '#14123a', boxShadow: '0 18px 40px -16px rgba(6,5,45,.35)' },
        { backgroundColor: 'rgba(255,255,255,0.06)', color: '#ffffff', boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.5, stagger: 0.03 }, 0.4)
      .fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.7)
      .to(glow, { opacity: 1, duration: 0.4 }, 0.85)
      .to(steps[0], { opacity: 1, duration: 0.1 }, 0)
      .to(steps[1], { opacity: 1, duration: 0.1 }, 0.45)
      .to(steps[2], { opacity: 1, duration: 0.1 }, 0.9);
  });
  mm.add('(max-width: 1023px)', () => {
    gsap.from(pieces, { y: 24, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 60%' } });
    gsap.set(glow, { opacity: 1 });
  });
}

function solutionPreview() {
  const rows = document.querySelectorAll<HTMLElement>('[data-sol-row]');
  const mocks = document.querySelectorAll<HTMLElement>('[data-sol-mock]');
  if (!rows.length || !mocks.length) return;
  const show = (i: number) => { rows.forEach((r, j) => r.classList.toggle('is-active', i === j)); mocks.forEach((m, j) => {
    const on = i === j;
    m.classList.toggle('opacity-0', !on); m.classList.toggle('translate-y-3', !on);
    m.classList.toggle('pointer-events-none', !on); m.classList.toggle('opacity-100', on);
  }); };
  rows.forEach((r, i) => {
    r.addEventListener('mouseenter', () => show(i));
    r.addEventListener('focusin', () => show(i));
    ScrollTrigger.create({ trigger: r, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && show(i) });
  });
}

function humanChat() {
  const bubbles = document.querySelectorAll('[data-human-chat] [data-bubble]');
  if (!bubbles.length || reduce) return;
  gsap.from(bubbles, { y: 14, autoAlpha: 0, scale: 0.96, transformOrigin: 'left bottom', duration: 0.6, stagger: 0.7, ease: 'back.out(1.7)',
    scrollTrigger: { trigger: '[data-human-chat]', start: 'top 70%' } });
}

function networkScroll() {
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('[data-net]').forEach((net) => {
    const section = net.parentElement!;
    const far = net.querySelector('[data-net-far]');
    const near = net.querySelector('[data-net-near]');
    const flow = net.querySelectorAll('[data-net-flow]');
    const st = { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.6 };
    // the page header usually starts at the top, so also react a little while it enters
    const tl = gsap.timeline({ scrollTrigger: { ...st, start: 'top bottom' } });
    tl.fromTo(far, { y: 40, x: 0 }, { y: -60, x: -30, ease: 'none' }, 0)
      .fromTo(near, { y: 80, x: 0, rotation: 0, transformOrigin: '50% 50%' }, { y: -140, x: 50, rotation: 2, ease: 'none' }, 0)
      .fromTo(flow, { strokeDashoffset: 0 }, { strokeDashoffset: -400, ease: 'none' }, 0);
    // a slow idle drift so it never looks frozen
    gsap.to(flow, { strokeDashoffset: '-=200', duration: 12, ease: 'none', repeat: -1 });
  });
}

function processLine() {
  const line = document.querySelector('[data-process-line]');
  if (!line) return;
  if (reduce) { gsap.set(line, { scaleX: 1 }); return; }
  gsap.to(line, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '[data-process]', start: 'top 75%', end: 'bottom 60%', scrub: true } });
}

function reveals() {
  if (reduce) return;
  gsap.set('[data-reveal]', { opacity: 0, y: 18 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }),
  });
}

export function initMotion() {
  nav();
  smoothScroll();
  const intro = heroIntro();
  heroSystem(intro);
  connectScene();
  solutionPreview();
  processLine();
  humanChat();

  reveals();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
