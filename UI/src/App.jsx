import { useState } from 'react'
import Navbar from './components/Navbar'
import UserLayout from './layouts/UserLayout'
import{createBrowserRouter,createRoutesFromElements,RouterProvider,Route} from "react-router-dom"
import LoginPage from './pages/LoginPage'
import AuthLayout from './layouts/AuthLayout'
import Homepage from './pages/Homepage'
function App() {
  const router=createBrowserRouter(createRoutesFromElements( 
    <>
<Route path="/" element ={<AuthLayout/>}>
<Route path="/" element={<LoginPage/>}/>

</Route>
<Route path="/" element={<UserLayout/>}>
  <Route path="/homepage" element={<Homepage/>}/>
</Route>
</>))
  return (
    <>
     <RouterProvider router={router}/>
    
    </>
  )
}

export default App


