export function renderProgress() {
  const skills = [
    ["Speaking", 0],
    ["Listening", 0],
    ["Pronunciation", 0],
    ["Vocabulary", 0],
    ["Grammar", 0]
  ];

  return `
    <section class="stack-lg">
      <div class="page-intro">
        <p class="eyebrow">REAL SKILLS</p>
        <h2>Прогресс без XP</h2>
        <p class="muted">В следующих фазах показатели будут рассчитываться по реальным учебным данным.</p>
      </div>

      <div class="skill-list">
        ${skills.map(([name, value]) => `
          <div class="skill-row">
            <div class="skill-meta">
              <span>${name}</span>
              <span>Not practiced</span>
            </div>
            <div class="progress-track" aria-label="${name}: ${value}%">
              <span style="width:${value}%"></span>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}
