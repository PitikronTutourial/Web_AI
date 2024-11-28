import { NavLink} from 'react-router-dom'
import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Validation from '../function/loginValidation'

//Redux
import { useDispatch } from 'react-redux';

const Login = () => {

  const dispatch = useDispatch()
  const re = () => {
    window.location.reload(false);
  } 

  const [values, setValues] = useState({        
    username: '',        
    password: ''    
  })
    
  const navigate = useNavigate();
  const [errors, setErrors] = useState({})
  const [backendError, setBackendError] = useState([])

  const handleInput = (event) => {        
    setValues(prev => ({...prev, [event.target.name]: event.target.value}))    
  }

  const handleSubmit =(event) => {        
    event.preventDefault();        
    const err = Validation(values); setErrors(err);        
    if(err.username === "" && err.password === "") {            
      axios.post('http://192.168.15.227:5778/login', values)
      .then(res => {                
        if(res.data.errors) {                    
          setBackendError(res.data.errors);
          console.log(backendError)
        } else {                    
          setBackendError([]);                    
          if(res.data.token) {   
            alert("Login Success")  
            dispatch({
              type:'LOGIN',
              payload: {
                token: res.data.token,
                username: res.data.payload.professor.username
              }})  
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('username', res.data.payload.professor.username)
            
            navigate('/');   re();
            return                  
          } else {                    
            alert("No record existed");    
            return
          }                
        }                            
      })            
      .catch(err => {
        console.log(err)
        alert(err.response.data)
      });        
    }    
  }

  return (
    <div className='flex flex-col items-center justify-center relative bg-white h-screen'>
        <div className="flex flex-col w-[744px] h-fit rounded-[30px] shadow-lg p-[24px]">
            <div className="flex justify-end m-[12px] ">
                <button><NavLink to="/">SKIP</NavLink></button>
            </div>
            <div className="login">
                <div className="text-[#61DAFB] text-base leading-8 mb-6 font-bold">
                    <h1>Login</h1>
                </div>
                <form action="" onSubmit={handleSubmit} className='flex flex-col'>
                    <div className="flex flex-col mb-[16px]">
                        <label htmlFor="username" className='text-[14px] font-light leading-4'>USERNAME</label>
                        <div className="pb-[16.25px]">
                            <input type="text" name="username" placeholder='Enter username *' onChange={handleInput} style={{color:"black"}} className='flex w-full border-b-[1px] py-[5px] focus:outline-none'/>
                                {errors.username && <span className='text-danger' style={{color:"red", fontSize:"10px"}}> {errors.username}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col mb-[16px]">
                        <label htmlFor="password" className='text-[14px] font-light leading-4'>PASSWORD</label>
                        <div className="pb-[16.25px]">
                            <input type="password" name="password" placeholder='Enter password *' onChange={handleInput} style={{color:"black"}} className='flex w-full border-b-[1px] py-[5px] focus:outline-none'/>
                                {errors.password && <span className='text-danger' style={{color:"red", fontSize:"10px"}}> {errors.password}</span>}
                        </div>
                    </div>
                    <div className="mt-[2em] mb-[.8em] text-center">
                        <button type="submit" id='login-submit' className='bg-[#61DAFB] py-[12px] px-[24px] w-[330px] text-[12px] rounded-3xl opacity-60 hover:opacity-100'>Login</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
}

export default Login