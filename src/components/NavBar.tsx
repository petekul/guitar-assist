import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: '🎸 Guitar App' },
    { to: '/tab', label: 'Tab Input' },
    { to: '/library', label: 'My Tabs' },
    { to: '/chords', label: 'Chord Library' },
  ]

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex items-center gap-6">
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={`text-sm font-medium transition-colors ${
            pathname === to
              ? 'text-amber-400'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
