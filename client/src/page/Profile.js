import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'

import Axios from 'axios'
import { useState, useEffect } from 'react'

const Profile = () => {

    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const re = () => {
        window.location.reload(false);
    } 

    const logout = () => {
        dispatch({
            type: "LOGOUT",
            payload: null,
        });
        localStorage.removeItem('token');
        navigate("/login");   re();
    };

    const [profileList, setProfileList] = useState([]);
    const username = localStorage.getItem('username')

    const fetchProfile = () => {
        if (username) {
            Axios.get(`http://192.168.15.227:5778/professor?username=${username}`)
                .then((res) => {
                    const foundProfessor = res.data.find((professor) => professor.username === username);
                    if (foundProfessor) {
                        setProfileList(foundProfessor);
                    } else {
                        console.log(`No data found for username: ${username}`);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    useEffect(() => {
        fetchProfile();
    });
  
  return (
      <div className='flex flex-col relative w-full h-screen bg-[#E1F7FF] justify-around'>
          <div className="flex flex-col justify-center items-center">
              <div className="flex flex-col justify-between items-center bg-white px-6 min-w-60 rounded-lg">
                  {token && <>
                    <p className='pt-6 pb-3'>Name : {profileList?.p_name} {profileList?.p_sname}</p>
                    <p className='pb-3'>ID : {profileList?.p_id}</p>
                    <p className='pb-3'>Username : {profileList?.username}</p>
                    <p className='pb-3'>Password : {profileList?.password}</p>
                      <button onClick={logout} className='bg-[#61DAFB] py-[12px] px-[24px] mb-6 text-[12px] rounded-3xl opacity-60 hover:opacity-100'>Log Out</button>
                  </>}
                  {!token && <>
                      <h1>Welcome to SabaiDee Bó</h1>
                      <a href="login"><button>Login</button></a>
                  </>}
              </div>
          </div>
      </div>
  );
}

export default Profile