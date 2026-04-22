
function Projects() {
  return (
    <section id="projects">
      <div className="section-title">My work</div>
      <h2>Projects</h2>

      <div className="projects-grid">
        <div className="project-card">
          <h3>Portfolio Site</h3>
          <p>
            This very page — a clean personal portfolio built first in HTML,
            then rebuilt as a React app.
          </p>
          <a href="#">View on GitHub →</a>
        </div>

        <div className="project-card">
          <h3>Weather App</h3>
          <p>
            A simple app that fetches live weather data using a public API
            and displays it cleanly.
          </p>
          <a href="#">View on GitHub →</a>
        </div>

        <div className="project-card">
          <h3>Todo List</h3>
          <p>
            A full-stack todo app with a Node.js backend, PostgreSQL database,
            and React frontend.
          </p>
          <a href="#">View on GitHub →</a>
        </div>
      </div>
    </section>
  );
}

export default Projects;