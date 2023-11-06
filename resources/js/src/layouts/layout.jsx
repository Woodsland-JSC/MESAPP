import '../index.css'
import Header from '../layouts/header.jsx'

function Layout({ children }) {
  return (
    <div>
      <div>
        <Header/>
        {children}
      </div>
    </div>
  )
}

export default Layout