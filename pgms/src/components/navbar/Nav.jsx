import Sidebar from "../sidebar/Sidebar"

 
const Nav = () => {
  return (
    <>
        <Sidebar> 
        <div className="container">
          <h1 className="text-5xl text-primaryDark font-semibold">Hello (User) welcome to PGMS</h1>
            <nav className="flex flex-wrap items-center justify-between p-5 bg-primary">
                <ul className="flex flex-row space-x-5">
                    <li><a href="#" className="text-white">Home</a></li>
                    <li><a href="/dashboard" className="text-white">Dashboard</a></li>
                    <button onClick={()=>{window.location.href="/dashboard"} }className="px-4 py-2 leading-5 text-white transition-colors duration-150 bg-primaryLight border border-transparent rounded-lg active:bg-primaryDark hover:bg-primaryDark focus:outline-none focus:shadow-outline">Dashboard</button>
                    <button onClick={()=>{window.location.href="/electricity-bill"} }className="px-4 py-2 leading-5 text-white transition-colors duration-150 bg-primaryLight border border-transparent rounded-lg active:bg-primaryDark hover:bg-primaryDark focus:outline-none focus:shadow-outline">Electricity Bill</button>
                    <button onClick={()=>{window.location.href="/rent-due"}} className="px-4 py-2 leading-5 text-white transition-colors duration-150 bg-primaryLight border border-transparent rounded-lg active:bg-primaryDark hover:bg-primaryDark focus:outline-none focus:shadow-outline">Rent Due</button>
                </ul>
              <div className="hidden md:block">
                <div className="flex items-center space-x-1">
                  <img src="https://avatars.githubusercontent.com/u/81866624?v=4" alt="profile" className="w-10 h-10 rounded-full" />
                  <img src="https://img.icons8.com/ios/50/000000/expand-arrow--v1.png" alt="arrow" className="w-5 h-5" />
                  <img src="https://img.icons8.com/ios/50/000000/expand-arrow--v1.png" alt="arrow" className="w-5 h-5" />
                  <img src="https://img.icons8.com/ios/50/000000/expand-arrow--v1.png" alt="arrow" className="w-5 h-5" />
                  <img src="https://img.icons8.com/ios/50/000000/expand-arrow--v1.png" alt="arrow" className="w-5 h-5" />
                  <img src="https://img.icons8.com/ios/50/000000/expand-arrow--v1.png" alt="arrow" className="w-5 h-5" />
                </div>
              </div>
              
              <div className="md:hidden flex items-center">
                <button type="button" id="menuButton" className="text-white">
                  <img src="https://img.icons8.com/ios/50/000000/menu--v1.png" alt="menu" className="w-5 h-5" />
                </button>
              </div>
            </nav>
           </div>
         </Sidebar> 
    </>
  )
}

export default Nav