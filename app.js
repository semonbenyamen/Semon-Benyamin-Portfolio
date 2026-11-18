function activatePortfolio() {
  const cleanup = startStack();
  const lab = document.querySelector('[data-lab]');
  if (!lab) return cleanup;
  if (lab.dataset.lab === 'scenes') {
    lab.addEventListener('click',event => {
      const choice = event.target.closest('[data-scene]');
      if (!choice) return;
      lab.querySelectorAll('[data-scene]').forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
      lab.querySelectorAll('[data-pane]').forEach(panel => { panel.hidden = panel.dataset.pane !== choice.dataset.scene; });
    });
  } else if (lab.dataset.lab === 'budget') {
    const slider = lab.querySelector('[data-spend]');
    slider.addEventListener('input',() => {
      const spent = Number(slider.value);
      const balance = 1000 - spent;
      lab.querySelector('[data-total]').textContent = spent.toLocaleString('en-US') + ' EGP';
      lab.querySelector('[data-pct]').textContent = (spent / 10) + '% used';
      lab.querySelector('[data-balance]').textContent = Math.abs(balance) + ' EGP ' + (balance < 0 ? 'over budget' : 'remaining');
      lab.querySelector('[data-message]').textContent = spent >= 1000 ? 'Monthly limit reached' : spent >= 800 ? '80% warning threshold reached' : 'Below the warning threshold';
    });
  } else if (lab.dataset.lab === 'lms') {
    const lessons = new Set();
    let enrolled = false;
    const controls = Array.from(lab.querySelectorAll('[data-lesson]'));
    lab.addEventListener('click',event => {
      const button = event.target.closest('button');
      if (!button) return;
      let message;
      if (button.hasAttribute('data-reset')) {
        enrolled = false; lessons.clear(); message = 'Student is not enrolled';
      } else if (button.hasAttribute('data-enroll')) {
        message = enrolled ? 'Already enrolled · no second record created' : 'Student enrolled';
        enrolled = true;
      } else if (button.dataset.lesson && enrolled) {
        const lesson = button.dataset.lesson;
        message = lessons.has(lesson) ? lesson + ' already counted' : lesson + ' completed';
        lessons.add(lesson);
        if (lessons.size === controls.length) message += ' · course complete';
      } else return;
      controls.forEach(control => { control.disabled = !enrolled; });
      lab.querySelector('[data-state]').textContent = message;
      lab.querySelector('[data-progress]').textContent = (lessons.size * 50) + '% complete';
      lab.querySelector('[data-count]').textContent = Number(enrolled) + (enrolled ? ' enrollment' : ' enrollments') + ' · ' + lessons.size + ' of 2 lessons';
    });
  }
  return cleanup;
}
if (!window.portablePortfolio) activatePortfolio();
