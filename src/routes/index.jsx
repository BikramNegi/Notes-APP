import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import { NotesProvider } from "../context";
import NoteEditor from "../pages/NoteEditor";

const router = () => {
  return (
    <NotesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            {/* <Route path="notes/:id" element={<div>Notes</div>} /> */}
            <Route path="note/edit/:id" element={<NoteEditor />} />
            <Route path="note/create" element={<NoteEditor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotesProvider>
  );
};

export default router;
