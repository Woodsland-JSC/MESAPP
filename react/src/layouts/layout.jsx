import '../index.css'
import Header from '../layouts/header.jsx'

function layout({ children }) {
  return (
    <div>
      <div>
        <Header/>
        {children}
      </div>
    </div>
  )
}

export default layout