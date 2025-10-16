import React from 'react';
import { Routes, Route} from "react-router-dom";
import ClientRoutes from './ClientDashboard/ClientRoutes';
const App = () => {
  return (
   <>
    <Routes>
      <Route path='/*' element={<ClientRoutes />}/>
      </Routes>
   </>
  )
}

export default App