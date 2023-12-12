import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'


import Home from './pages/Home'
import Hikes from './pages/Hikes'
import HikeDetails from './pages/HikeDetails'



export default function App() {
  return (
    <div>
      <BrowserRouter >
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/Hikes' element={<Hikes />}></Route>
          <Route path='/Hikes/:id' element={<HikeDetails />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
