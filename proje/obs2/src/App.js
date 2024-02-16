
import { CiLogin } from "react-icons/ci";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PageLayout from "./layouts/PageLayout";
import HomePage from "./pages/HomePage";
import PersonalPage from "./pages/PersonalPage";
import {BrowserRouter as Router , Routes , Route} from 'react-router-dom'
import LessonList from "./pages/LessonList";
import LessonProgram from "./pages/LessonProgram";
import YoklamaPage from "./pages/YoklamaPage";
import Messages from "./pages/Messages";
function App() {
  return (
    <Router>
<Routes>
<Route exact path='/' element={<Login/>} />
<Route exact path='/:ogrNo' element={<PageLayout><HomePage/></PageLayout>} />
<Route exact path='/:ogrNo/personalinformation' element={<PageLayout><PersonalPage/></PageLayout>} />
<Route exact path='/:ogrNo/derslist' element={<PageLayout><LessonList/></PageLayout>} />
<Route exact path='/:ogrNo/dersprogram' element={<PageLayout><LessonProgram/></PageLayout>} />
<Route exact path='/:ogrNo/yoklama' element={<PageLayout><YoklamaPage/></PageLayout>} />
<Route exact path='/:ogrNo/mesaj' element={<PageLayout><Messages/></PageLayout>} />




</Routes>

</Router>
  );
}

export default App;
