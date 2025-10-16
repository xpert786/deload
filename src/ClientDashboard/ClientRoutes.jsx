import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './Pages/Register';
import ClientRegister from './Pages/ClientRegister';
import ClientDetail from './Pages/ClientDetail';
import WelcomeBack from './Pages/WelcomeBack';
import ClientLayout from './Components/ClientLayout';

export default function ClientRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClientLayout />}>
       
      </Route>
      <Route path='register' element={<Register />} />
        <Route path='/clientregister' element={<ClientRegister />} />
        <Route path='/clientdetail' element={<ClientDetail />} />
        <Route path='/welcomeback' element={<WelcomeBack />} />
    </Routes>
  );
}
