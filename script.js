const tour = document.querySelector('#tour-video');
tour.src = window.WORLD_MEDIA.tour;
document.querySelector('#download-original').href = window.WORLD_MEDIA.tour;
document.querySelector('#edit-video').src = window.WORLD_MEDIA.edit;
document.querySelector('#npc-video').src = window.WORLD_MEDIA.npc;
const chapters = [...document.querySelectorAll('.demo-chapters [data-seek]')];
const playbackStatus = document.querySelector('#playback-status');
let requestedSeek = null;
let resumeAfterLoad = false;
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
