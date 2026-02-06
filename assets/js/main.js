/**
 * main.js — mobile nav toggle, active link highlighting, page transitions
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    // --- Mobile hamburger toggle ---
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        links.classList.toggle('open');
      });

      // Close menu when a link is clicked (mobile)
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // --- Active nav link highlighting ---
    var path = window.location.pathname.toLowerCase();
    var navAnchors = document.querySelectorAll('.nav-links a');

    navAnchors.forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;

      // Normalize: resolve relative paths to compare
      var linkPath = new URL(href, window.location.href).pathname.toLowerCase();

      // Exact match or startsWith for category sections
      if (path === linkPath) {
        a.classList.add('active');
      } else if (linkPath.indexOf('/categories/') !== -1 && path.indexOf(linkPath) === 0) {
        a.classList.add('active');
      }
    });

    // --- Smooth page transitions ---
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a');
      if (!anchor) return;

      var href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, hash links, and special protocols
      if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;

      e.preventDefault();
      document.body.classList.add('page-leaving');

      setTimeout(function () {
        window.location.href = href;
      }, 250);
    });
  });
})();
