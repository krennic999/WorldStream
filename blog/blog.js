(() => {
  const article = document.querySelector('#article');
  const progress = document.querySelector('#reading-progress');
  const sections = [...article.querySelectorAll('[data-section]')];
  const links = [...document.querySelectorAll('.contents nav a')];
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
  const scheduleCases = {
    east: {
      label:'Moving east', glyph:'→', player:[2,5], required:[[1,4,3,6]], preferred:[[1,3,4,6]],
      candidate:[[5,3,9,6]], admitted:[[5,3,5,6]], candidateCount:20,
      description:'Straight travel produces a four-tile-high candidate corridor. The nearest candidate column is admitted first.'
    },
    northeast: {
      label:'Moving northeast', glyph:'↗', player:[2,7], required:[[1,6,3,8]], preferred:[[1,5,4,8]],
      candidate:[[5,1,8,1],[4,2,8,2],[3,3,8,3],[2,4,8,4],[5,5,7,5],[5,6,6,6],[5,7,5,7]],
      admitted:[[3,4,3,4],[4,4,4,4],[5,4,5,4],[5,5,5,5]], candidateCount:28,
      description:'On the square tile lattice, north and east boundaries cross simultaneously. The first-ETA front is L-shaped; distance, camera alignment, and stable coordinates select these four planning-only tiles.'
    },
    turn: {
      label:'East to north', glyph:'↑', player:[5,8], required:[[4,7,6,9]], preferred:[[3,6,6,9]],
      candidate:[[3,0,6,5]], admitted:[[3,5,6,5]], candidateCount:24,
      description:'After eastward travel turns north, the scheduler discards the old eastward emphasis and recomputes a northward corridor from the same focus.'
    }
  };
  const inside = (x,y,[x0,y0,x1,y1]) => x>=x0 && x<=x1 && y>=y0 && y<=y1;
  const insideAny = (x,y,rectangles) => rectangles.some(rect => inside(x,y,rect));
  function updateDirection(direction) {
    const view = scheduleCases[direction];
    const fragment = document.createDocumentFragment();
    for (let y=0;y<10;y++) for (let x=0;x<10;x++) {
      const required = insideAny(x,y,view.required);
      const preferred = insideAny(x,y,view.preferred);
      const ahead = insideAny(x,y,view.candidate);
      const admitted = insideAny(x,y,view.admitted);
      const cell = document.createElement('span');
      cell.className = 'schedule-cell';
      cell.dataset.kind = required ? 'required' : preferred ? 'preferred' : ahead ? 'prefetch' : 'inactive';
      if (admitted) cell.dataset.admitted = 'true';
      cell.setAttribute('aria-hidden','true');
      if (x===view.player[0] && y===view.player[1]) cell.textContent = view.glyph;
      fragment.append(cell);
    }
    schedule.replaceChildren(fragment);
    schedule.setAttribute('aria-label',`${view.label}; the diagram shows 9 required tiles, 16 preferred tiles, ${view.candidateCount} directional prefetch candidates, and 4 outlined planning-only admissions.`);
    document.querySelector('#schedule-heading').textContent = view.label;
    document.querySelector('#prefetch-count').textContent = `Prefetch candidates · ${view.candidateCount} tiles`;
    document.querySelector('#schedule-description').textContent = view.description;
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
