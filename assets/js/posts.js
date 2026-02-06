/**
 * posts.js — reads /posts/posts.json and renders post lists.
 *
 * Usage (on any page):
 *   <div id="post-list" data-category="music" data-limit="5"></div>
 *
 *   data-category  (optional) filter by category slug
 *   data-limit     (optional) max posts to show, default all
 */

(function () {
  'use strict';

  /**
   * Derive the site root path relative to the current page.
   * Works by inspecting the <script> src for posts.js:
   *   "assets/js/posts.js"    → root is ""   (page is at root)
   *   "../assets/js/posts.js" → root is "../" (page is one level deep)
   */
  function rootRelative() {
    var script = document.querySelector('script[src$="posts.js"]');
    if (!script) return '';
    var src = script.getAttribute('src');
    // Strip the known suffix to get the prefix path to root
    return src.replace('assets/js/posts.js', '');
  }

  var ROOT = rootRelative();

  function jsonURL() {
    return ROOT + 'posts/posts.json';
  }

  function postURL(slug) {
    return ROOT + 'posts/' + slug + '.html';
  }

  function formatDate(str) {
    var d = new Date(str + 'T00:00:00'); // avoid timezone shift
    var months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderCard(post) {
    var card = document.createElement('article');
    card.className = 'post-card';

    var link = document.createElement('a');
    link.className = 'post-card-link';
    link.href = postURL(post.slug);

    link.innerHTML =
      '<div class="post-card-meta">' +
        '<span class="post-card-category">' + escapeHTML(post.category) + '</span>' +
        '<time datetime="' + post.date + '">' + formatDate(post.date) + '</time>' +
      '</div>' +
      '<h2>' + escapeHTML(post.title) + '</h2>' +
      '<p>' + escapeHTML(post.snippet) + '</p>';

    card.appendChild(link);
    return card;
  }

  function render(container, posts) {
    var category = (container.getAttribute('data-category') || '').toLowerCase();
    var limit = parseInt(container.getAttribute('data-limit'), 10) || 0;

    // Sort newest first
    posts.sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });

    // Filter by category if set
    if (category) {
      posts = posts.filter(function (p) {
        return p.category.toLowerCase() === category;
      });
    }

    // Limit
    if (limit > 0) {
      posts = posts.slice(0, limit);
    }

    container.innerHTML = '';

    if (posts.length === 0) {
      container.innerHTML = '<div class="empty-state">No posts yet.</div>';
      return;
    }

    var list = document.createElement('div');
    list.className = 'post-list';
    posts.forEach(function (post) {
      list.appendChild(renderCard(post));
    });
    container.appendChild(list);
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    var containers = document.querySelectorAll('[id="post-list"]');
    if (!containers.length) return;

    // Show loading state
    containers.forEach(function (c) {
      c.innerHTML = '<div class="loading">Loading posts...</div>';
    });

    fetch(jsonURL())
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load posts.json (' + res.status + ')');
        return res.json();
      })
      .then(function (data) {
        var posts = data.posts || data;
        containers.forEach(function (c) {
          render(c, posts.slice());
        });
      })
      .catch(function (err) {
        console.error('posts.js:', err);
        containers.forEach(function (c) {
          c.innerHTML = '<div class="empty-state">Could not load posts.</div>';
        });
      });
  });
})();
