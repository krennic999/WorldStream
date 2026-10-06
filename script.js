const tour = document.querySelector('#tour-video');
const demoLibrary = window.WORLD_MEDIA.demos;
const demoButtons = [...document.querySelectorAll('[data-demo]')];
const demoDescription = document.querySelector('#demo-description');
const demoNote = document.querySelector('#demo-note');
const demoChapters = document.querySelector('.demo-chapters');
const downloadOriginal = document.querySelector('#download-original');
const useLocalMedia = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
const demoSource = demo => useLocalMedia ? demo.local : demo.src;
document.querySelector('#edit-video').src = useLocalMedia ? window.WORLD_MEDIA.edit.local : window.WORLD_MEDIA.edit.src;
document.querySelector('#npc-video').src = useLocalMedia ? window.WORLD_MEDIA.npc.local : window.WORLD_MEDIA.npc.src;
const chapters = [...document.querySelectorAll('.demo-chapters [data-seek]')];
const playbackStatus = document.querySelector('#playback-status');
let requestedSeek = null;
let resumeAfterLoad = false;
let activeDemo = 'complete';
function selectDemo(key, autoplay = false) {
  const demo = demoLibrary[key];
  if (!demo) return;
  activeDemo = key;
  requestedSeek = null;
  resumeAfterLoad = false;
  playbackStatus.textContent = '';
  demoButtons.forEach(button => button.setAttribute('aria-selected', String(button.dataset.demo === key)));
  demoDescription.textContent = demo.description;
  demoNote.textContent = demo.note;
  demoChapters.hidden = !demo.chapters;
  chapters.forEach(button => button.removeAttribute('aria-current'));
  tour.pause();
  tour.src = demoSource(demo);
  tour.poster = demo.poster;
  tour.setAttribute('aria-label', `${demo.title}, ${demo.duration}`);
  downloadOriginal.href = demoSource(demo);
  downloadOriginal.textContent = `Open / download 1080p · ${demo.size} ↗`;
  tour.load();
  if (autoplay) {
    tour.autoplay = true;
    tour.muted = true;
    tour.addEventListener('canplay', () => {
      tour.play().then(() => {
        playbackStatus.textContent = 'Playing muted. Use the player control to turn sound on.';
      }).catch(() => {
        playbackStatus.textContent = 'Trailer selected. Press play to watch.';
      });
    }, { once: true });
  }
}
demoButtons.forEach(button => button.addEventListener('click', () => selectDemo(button.dataset.demo, true)));
selectDemo(activeDemo);
function startChapter() {
  if (requestedSeek === null) return;
  tour.currentTime = requestedSeek;
  requestedSeek = null;
  if (!resumeAfterLoad) return;
  resumeAfterLoad = false;
  tour.play().catch(() => {
    playbackStatus.textContent = 'Chapter selected. Press play to watch.';
  });
}
tour.addEventListener('loadedmetadata', startChapter);
document.querySelectorAll('[data-seek]').forEach(button => {
  button.addEventListener('click', () => {
    if (activeDemo !== 'interaction') selectDemo('interaction');
    playbackStatus.textContent = '';
    requestedSeek = Number(button.dataset.seek);
    resumeAfterLoad = true;
    tour.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    tour.focus({ preventScroll: true });
    if (tour.readyState >= 1) startChapter();
    else tour.load();
  });
});
tour.addEventListener('timeupdate', () => {
  const current = chapters.findLast(button => tour.currentTime >= Number(button.dataset.seek));
  chapters.forEach(button => {
    if (button === current) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
});
tour.addEventListener('error', () => {
  playbackStatus.textContent = 'Unable to load the video. Use the download link below to open the recording.';
});
const videos = [...document.querySelectorAll('video')];
videos.forEach(video => video.addEventListener('play', () => {
  videos.forEach(other => { if (other !== video) other.pause(); });
}));
const observer = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => { if (!isIntersecting) target.pause(); });
}, { threshold: 0 });
videos.forEach(video => observer.observe(video));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.forEach(video => video.pause());
});

const replayPlanning = document.querySelector('#replay-planning');
if (replayPlanning) {
  replayPlanning.addEventListener('click', () => {
    const animation = document.querySelector('#tile-planning-animation');
    const source = animation.getAttribute('src').split('?')[0];
    animation.src = `${source}?replay=${Date.now()}`;
  });
}
