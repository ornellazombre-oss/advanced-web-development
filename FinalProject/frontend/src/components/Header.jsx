import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  function goToSection(id) {
    navigate('/')
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <nav>
      <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        Alex Morgan
      </Link>
      <ul>
        <li>
          <button onClick={() => goToSection('about')} style={navBtnStyle}>About</button>
        </li>
        <li>
          <button onClick={() => goToSection('skills')} style={navBtnStyle}>Skills</button>
        </li>
        <li>
          <button onClick={() => goToSection('projects')} style={navBtnStyle}>Projects</button>
        </li>
        <li>
          <button onClick={() => goToSection('contact')} style={navBtnStyle}>Contact</button>
        </li>
        <li>
          <Link to="/form" style={{ whiteSpace: 'nowrap' }}>Contact Form</Link>
        </li>
        <li><Link to="/submissions">Submissions</Link></li>
      </ul>
    </nav>
  )
}

const navBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '15px',
  color: '#555',
  padding: 0,
  fontFamily: 'inherit',
}

export default Header