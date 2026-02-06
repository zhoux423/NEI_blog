/**
 * music-post.js — full-track player, snippet player, scroll-synced sections
 */
(function () {
  'use strict';

  var PLAY_ICON = '<svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"/></svg>';
  var PAUSE_ICON = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* ===== Full-Track Player ===== */
    var fullTrack = document.getElementById('fullTrack');
    var fullPlayBtn = document.getElementById('fullPlayBtn');
    var fullProgress = document.getElementById('fullProgress');
    var fullProgressFill = document.getElementById('fullProgressFill');
    var fullTimeCurrent = document.getElementById('fullTimeCurrent');
    var fullTimeDuration = document.getElementById('fullTimeDuration');

    if (!fullTrack || !fullPlayBtn) return;

    fullPlayBtn.addEventListener('click', function () {
      if (fullTrack.paused) {
        fullTrack.play();
      } else {
        fullTrack.pause();
      }
    });

    fullTrack.addEventListener('play', function () {
      fullPlayBtn.innerHTML = PAUSE_ICON;
    });

    fullTrack.addEventListener('pause', function () {
      fullPlayBtn.innerHTML = PLAY_ICON;
    });

    fullTrack.addEventListener('timeupdate', function () {
      if (!fullTrack.duration) return;
      var pct = (fullTrack.currentTime / fullTrack.duration) * 100;
      fullProgressFill.style.width = pct + '%';
      fullTimeCurrent.textContent = formatTime(fullTrack.currentTime);
    });

    fullTrack.addEventListener('loadedmetadata', function () {
      fullTimeDuration.textContent = formatTime(fullTrack.duration);
    });

    if (fullProgress) {
      fullProgress.addEventListener('click', function (e) {
        if (!fullTrack.duration) return;
        var rect = fullProgress.getBoundingClientRect();
        var pct = (e.clientX - rect.left) / rect.width;
        fullTrack.currentTime = pct * fullTrack.duration;
      });
    }

    /* ===== Snippet Player ===== */
    var snippetTrack = document.getElementById('snippetTrack');
    var snippetPlayBtn = document.getElementById('snippetPlayBtn');
    var snippetLabel = document.getElementById('snippetLabel');
    var snippetProgressFill = document.getElementById('snippetProgressFill');
    var snippetTime = document.getElementById('snippetTime');
    var snippetPlayer = document.querySelector('.snippet-player');

    var sections = document.querySelectorAll('.analysis-section');
    var currentSection = null;
    var clipStart = 0;
    var clipEnd = 0;
    var snippetSrc = fullTrack.getAttribute('src');

    function setSnippetSection(section) {
      if (currentSection === section) return;

      var wasPlaying = snippetTrack && !snippetTrack.paused;
      currentSection = section;
      clipStart = parseFloat(section.getAttribute('data-start')) || 0;
      clipEnd = parseFloat(section.getAttribute('data-end')) || 0;
      var label = section.getAttribute('data-label') || '';

      if (snippetLabel) snippetLabel.textContent = label;

      // Set src if needed
      if (snippetTrack && snippetSrc) {
        if (!snippetTrack.src || snippetTrack.src === '' || !snippetTrack.src.includes('dummy.mp3')) {
          snippetTrack.src = snippetSrc;
        }
        snippetTrack.currentTime = clipStart;
      }

      if (snippetProgressFill) snippetProgressFill.style.width = '0%';
      if (snippetTime) snippetTime.textContent = formatTime(clipStart) + ' / ' + formatTime(clipEnd);

      // Highlight active section
      sections.forEach(function (s) { s.classList.remove('active'); });
      section.classList.add('active');
      if (snippetPlayer) snippetPlayer.classList.add('active');

      // If snippet was playing, auto-jump to new section clip
      if (wasPlaying && snippetTrack) {
        snippetTrack.currentTime = clipStart;
        snippetTrack.play();
      }
    }

    if (snippetPlayBtn && snippetTrack) {
      snippetPlayBtn.addEventListener('click', function () {
        if (!snippetTrack.paused) {
          snippetTrack.pause();
        } else {
          if (snippetSrc && (!snippetTrack.src || !snippetTrack.src.includes('dummy.mp3'))) {
            snippetTrack.src = snippetSrc;
          }
          if (currentSection) {
            snippetTrack.currentTime = clipStart;
          }
          snippetTrack.play();
        }
      });

      snippetTrack.addEventListener('play', function () {
        snippetPlayBtn.innerHTML = PAUSE_ICON + ' Pause Snippet';
      });

      snippetTrack.addEventListener('pause', function () {
        snippetPlayBtn.innerHTML = PLAY_ICON + ' Play Snippet';
      });

      snippetTrack.addEventListener('timeupdate', function () {
        if (!clipEnd) return;

        // Enforce clip end boundary
        if (snippetTrack.currentTime >= clipEnd) {
          snippetTrack.pause();
          snippetTrack.currentTime = clipStart;
          if (snippetProgressFill) snippetProgressFill.style.width = '100%';
          return;
        }

        var clipDuration = clipEnd - clipStart;
        var clipProgress = snippetTrack.currentTime - clipStart;
        var pct = clipDuration > 0 ? (clipProgress / clipDuration) * 100 : 0;
        if (snippetProgressFill) snippetProgressFill.style.width = Math.max(0, Math.min(100, pct)) + '%';
        if (snippetTime) snippetTime.textContent = formatTime(snippetTrack.currentTime) + ' / ' + formatTime(clipEnd);
      });
    }

    /* ===== Scroll-Sync via IntersectionObserver ===== */
    if (sections.length === 0) return;

    var observerOptions = {
      root: null,
      rootMargin: '-25% 0px -55% 0px',
      threshold: 0
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setSnippetSection(entry.target);
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Initialize with the first section
    setSnippetSection(sections[0]);
  });
})();
