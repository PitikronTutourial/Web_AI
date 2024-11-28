import React from 'react';
import { NavLink } from 'react-router-dom'
import { IoIosSearch } from "react-icons/io";
import { TiUserAdd } from "react-icons/ti";
import { FaUserEdit } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";

import Axios from 'axios'
import { useState, useEffect, useCallback } from 'react'

const Student = () => {

    //const token = localStorage.getItem('token');
    //console.log(token)

    const [sList,setsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchS = useCallback(() => {
      Axios.get(`http://192.168.15.227:5778/student`, {
        params: { search: searchQuery } // ส่งคำค้นหาไปยังเซิร์ฟเวอร์
      })
        .then((res) => {
          setsList(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }, [searchQuery]);
  
    useEffect(() => {
      fetchS();
    }, [fetchS]);

    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };

    const handleSearch = (e) => {
      e.preventDefault();
      fetchS();
    };

    const handleDelete = (studentId) => {
      if (window.confirm('คุณต้องการลบข้อมูลนักศึกษานี้หรือไม่?')) {
        Axios.delete(`http://192.168.15.227:5778/student/${studentId}`)
          .then((res) => {
            console.log('Student deleted successfully:', res.data);
            // ทำการ redirect หรือทำอย่างอื่นตามต้องการ
            fetchS();  // เพื่อรีเฟรชข้อมูลหลังจากลบ
          })
          .catch((err) => {
            console.log('Error deleting student:', err);
          });
      }
    }
    
    return (
        <div className="flex flex-col w-auto h-screen bg-[#E1F7FF]">
          <div className="flex flex-row w-full h-fit my-10 px-24 justify-start">
            <form action="">
              <div className="flex flex-row w-full">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-[450px] h-[36px] px-2.5 py-[2px] rounded-l-lg rounded-r-none"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button onClick={handleSearch} className='px-1 bg-sky-800 text-[#fff] rounded-r-lg rounded-l-none text-[20px]'><IoIosSearch /></button>
              </div>
            </form>
            <div className="flex ml-6 items-center">
              <NavLink  to={"/studentadd"} className="p-2 bg-sky-800 text-[#fff] rounded text-[20px]"><TiUserAdd /></NavLink>
            </div>
          </div>
          <div className="flex flex-row w-full h-fit px-24">
            <table className='w-full table-auto text-left'>
              <thead>
                <tr>
                  <th className='py-4 pl-[10px]'>ชื่อ-สกุล</th>
                  <th className='py-4'>รหัสนศ.</th>
                  <th className='py-4'>วันเกิด</th>
                  <th className='py-4'>เพศ</th>
                  <th className='py-4'>รูป</th>
                </tr>
              </thead>
              <tbody>
              {sList.map((student, index) => {
                // Check if the student's name, surname, or id contains the search query
                const nameMatches = student.s_name.toLowerCase().includes(searchQuery.toLowerCase());
                const surnameMatches = student.s_sname.toLowerCase().includes(searchQuery.toLowerCase());
                const idMatches = student.s_id.toString().toLowerCase().includes(searchQuery.toLowerCase());

                // Display the row only if name, surname, or id matches the search query
                if (nameMatches || surnameMatches || idMatches) {
                  return (
                    <tr key={index} className='border-collapse border border-slate-300 h-[32px] bg-white'>
                      <th className='pl-[10px]'>{student.s_name} {student.s_sname}</th>
                      <th>{student.s_id}</th>
                      <th>{student.dateofbirth ? new Date(student.dateofbirth).toLocaleDateString() : ""}</th>
                      <th>{student.gender}</th>
                      <th>{student.pic}</th>
                      <th>
                        <div className="flex items-center justify-around">
                          <NavLink to={`/studentedit/${student.s_id}`} className="p-2 bg-sky-800 text-[#fff] rounded-xl text-[18px]"><FaUserEdit /></NavLink>
                          <button onClick={() => handleDelete(student.s_id)} className='p-2 bg-red-400 text-[#000] rounded-xl text-[18px]'><RiDeleteBin5Fill /></button>
                        </div>
                      </th>
                    </tr>
                  );
                }
                return null; // If no match, return null (no table row)
              })}
              </tbody>
            </table>
          </div>
        </div>
    );
}

export default Student