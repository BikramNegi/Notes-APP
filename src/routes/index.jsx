import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";

const router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="notes/:id" element={<div>Notes</div>} />
          <Route path="notes/:id/edit" element={<div>Edit</div>} />
          <Route path="notes/create" element={<div>Create</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default router;
