import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom';
import Home from './page/Home';
import Login from './page/Login';
import Profile from './page/Profile';
import Greetword from './page/Greetword';
import Student from './page/Student';
import StudentAdd from './page/StudentAdd';
import StudentEdit from './page/StudentEdit';
import Report from './page/Report';


import { Provider } from "react-redux"
import { createStore } from "redux"
import rootReducer from './reducer/combineReduxer';

const store = createStore(rootReducer)

const router = createBrowserRouter(createRoutesFromElements(
    <Route element = {<App/>}>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/profile' element={<Profile/>}/>
      <Route path='/greetword' element={<Greetword/>}/>
      <Route path='/student' element={<Student/>}/>
      <Route path='/studentadd' element={<StudentAdd/>}/>
      <Route path='/studentedit/:studentId' element={<StudentEdit />} />
      <Route path='/report' element ={<Report/>}/>
    </Route>
  ))

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <Provider store = { store } >
        <RouterProvider router = { router }/>
    </Provider>
  );

reportWebVitals();
