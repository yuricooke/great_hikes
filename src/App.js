import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'


import Home from './pages/Home'
import Hikes from './pages/Hikes'
import HikeDetails from './pages/HikeDetails'
import Community from './pages/Community'
import OurSelection from './pages/OurSelection'



export default function App() {
  return (
    <div>
      <BrowserRouter >
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/Hikes' element={<Hikes />}></Route>
          <Route path='/Hikes/:id' element={<HikeDetails />}></Route>
          <Route path='/community' element={<Community />}></Route>
          <Route path='/our-selection' element={<OurSelection />}></Route>
          <Route path='/our_selection' element={<Navigate to='/our-selection' replace />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
