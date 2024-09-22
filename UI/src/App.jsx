import { useState } from 'react'
import Navbar from './components/Navbar'
import UserLayout from './layouts/UserLayout'
import{createBrowserRouter,createRoutesFromElements,RouterProvider,Route} from "react-router-dom"
import LoginPage from './pages/LoginPage'
import AuthLayout from './layouts/AuthLayout'
import Homepage from './pages/Homepage'
import ProjectNFTPage from './pages/ProjectNFTPage'
import CarbRequestPage from './pages/CarbRequestPage'
import SubmitDonation from './pages/SubmitDonation'
import ViewAndDonate from './pages/ViewAndDonate'
import ProjectSubmition from './pages/ProjectSubmition'
import AdminDashboard from './pages/AdminDashboard'
import MintRequests from './pages/MintRequests'
function App() {
  const router=createBrowserRouter(createRoutesFromElements( 
    <>
<Route path="/" element ={<AuthLayout/>}>
<Route path="/" element={<LoginPage/>}/>

</Route>
<Route path="/" element={<UserLayout/>}>
  <Route path="/homepage" element={<Homepage/>}/>
  <Route path='/list-project' element={<ProjectNFTPage/>}/>
  <Route path="/submit-carbon-token" element={<CarbRequestPage/>}/>
  <Route path="/list-donation" element={<SubmitDonation/>}/>
  <Route path="/view-donation" element={<ViewAndDonate/>}/>
  <Route path="/request-certificates" element={<ProjectSubmition/>}/>



</Route>
<Route path='/admin-dashboard' element={<AdminDashboard/>} />
<Route path='/mint-requests' element={<MintRequests/>}/>
</>))
  return (
    <>
     <RouterProvider router={router}/>
    
    </>
  )
}

export default App


