(() => {
  const article = document.querySelector('#article');
  const progress = document.querySelector('#reading-progress');
  const sections = [...article.querySelectorAll('[data-section]')];
  const links = [...document.querySelectorAll('.contents nav a')];
  const words = article.innerText.trim().split(/\s+/).length;
  document.querySelector('#reading-time').textContent = `${Math.ceil(words / 210)} min read`;
  let scheduled = false;
  function updateReading() {
    const top = article.getBoundingClientRect().top + window.scrollY;
    const length = Math.max(1, article.offsetHeight - window.innerHeight + 110);
    const percentage = Math.min(1, Math.max(0, (window.scrollY - top + 110) / length));
    progress.style.width = `${percentage * 100}%`;
    let active = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 160) active = section.id;
    }
    for (const link of links) {
      if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    scheduled = false;
  }
  function scheduleReading() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateReading);
    }
  }
  window.addEventListener('scroll', scheduleReading, {passive: true});
  window.addEventListener('resize', scheduleReading, {passive: true});
  window.addEventListener('load', updateReading);
  updateReading();

  const schedule = document.querySelector('#schedule-grid');
  const directions = {north:'↑', east:'→', south:'↓', west:'←'};
  function updateDirection(direction) {
    const starts = {north:[3,2], east:[3,3], south:[3,3], west:[2,3]};
    const [sx,sy] = starts[direction];
    const fragment = document.createDocumentFragment();
    for (let y=0;y<9;y++) for (let x=0;x<9;x++) {
      const required = x>=3 && x<=5 && y>=3 && y<=5;
      const preferred = x>=sx && x<sx+4 && y>=sy && y<sy+4;
      const ahead = direction==='east' ? x>=6 && y>=2 && y<=6
        : direction==='west' ? x<=2 && y>=2 && y<=6
        : direction==='north' ? y<=2 && x>=2 && x<=6
        : y>=6 && x>=2 && x<=6;
      const cell = document.createElement('span');
      cell.className = 'schedule-cell';
      cell.dataset.kind = required ? 'required' : preferred ? 'preferred' : ahead ? 'prefetch' : 'inactive';
      cell.setAttribute('aria-hidden','true');
      if (x===4 && y===4) cell.textContent = directions[direction];
      fragment.append(cell);
    }
    schedule.replaceChildren(fragment);
    schedule.setAttribute('aria-label',`The player moves ${direction}; a 3 by 3 required area, a 4 by 4 preferred window, and prefetch tiles farther ${direction}.`);
    document.querySelector('#schedule-heading').textContent = `Moving ${direction}`;
    document.querySelectorAll('[data-direction]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.direction===direction)));
  }
  if (schedule) {
    updateDirection('east');
    document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click',() => updateDirection(button.dataset.direction)));
  }

  const phases = [
    ['Build from the accepted plan.', 'The nearby tile becomes renderable. Its plan, object identities, and generation parameters are stored independently of its meshes.'],
    ['Release the distant geometry.', 'Meshes can leave the render cache. The saved plan and retained edits remain available; leaving an area does not erase its world records.'],
    ['Rebuild the same place.', 'Restore geometry from the stored plan, generation parameters, and retained changes. Revisiting does not require a new model plan for this tile.']
  ];
  document.querySelectorAll('[data-phase][type="button"]').forEach(button => {
    button.addEventListener('click', () => {
      const phase = Number(button.dataset.phase);
      document.querySelector('.lifecycle-scene').dataset.phase = phase;
      document.querySelector('#phase-title').textContent = phases[phase][0];
      document.querySelector('#phase-description').textContent = phases[phase][1];
      document.querySelectorAll('[data-phase][type="button"]').forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });
    });
  });
})();
