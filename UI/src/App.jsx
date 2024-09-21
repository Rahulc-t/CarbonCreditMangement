import { useState } from 'react'
import Navbar from './components/Navbar'
import UserLayout from './layouts/UserLayout'
import{createBrowserRouter,createRoutesFromElements,RouterProvider,Route} from "react-router-dom"
function App() {
  const router=createBrowserRouter(createRoutesFromElements( 
    <>
<Route path="/" element={<UserLayout/>}>

</Route>
</>))
  return (
    <>
     <RouterProvider router={router}/>
    
    </>
  )
}

export default App


