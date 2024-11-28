import React from 'react';
import { IoIosSearch } from "react-icons/io";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";
import { BiSolidFileExport } from "react-icons/bi";

import Axios from 'axios'
import { useState, useEffect } from 'react'

const Report = () => {

  //const token = localStorage.getItem('token');
  //console.log(token)

  const [report, setReport] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [triangleIcon, setTriangleIcon] = useState(<GoTriangleLeft />);
  const [selectedCount, setSelectedCount] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState({
    all: true,
    studentId: true,
    name: true,
    age: true,
    mood: true,
    datetime: true,
    gender: true,
    img: true,
    fimg: true
  });

  const handleCategoryClick = () => {
    setShowCategoryPopup(!showCategoryPopup);

    // ถ้าปิด Category Popup และ selectedCategories ยังไม่ถูกเลือกทั้งหมด
    if (!showCategoryPopup && !isAllCategoriesSelected()) {
      // ไม่ทำการ reset ค่า selectedCategories
      setTriangleIcon(showCategoryPopup ? <GoTriangleLeft /> : <GoTriangleRight />);
      return;
    }

    // ถ้าปิด Category Popup และ selectedCategories ถูกเลือกทั้งหมด
    if (!showCategoryPopup && isAllCategoriesSelected()) {
      // ไม่ทำการ reset ค่า selectedCategories
      setTriangleIcon(showCategoryPopup ? <GoTriangleLeft /> : <GoTriangleRight />);
      return;
    }

    setTriangleIcon(showCategoryPopup ? <GoTriangleLeft /> : <GoTriangleRight />);
  };

  const isAllCategoriesSelected = () => {
    return Object.values(selectedCategories).every((value) => value === true);
  };

  const handleSelect = (category) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  
    // นับจำนวน checkbox ที่ถูกเลือก (ยกเว้น all)
    const selectedCount = Object.values(selectedCategories).filter((value, key) => key !== 'all' && value).length;
    setSelectedCount(selectedCount);
  };

  const handleSelectAll = () => {
    const allChecked = !selectedCategories.all;
  
    // ให้ทุก checkbox เปลี่ยนสถานะตามค่า allChecked
    setSelectedCategories((prev) => ({
      ...prev,
      all: allChecked,
      studentId: allChecked,
      name: allChecked,
      age: allChecked,
      mood: allChecked,
      datetime: allChecked,
      gender: allChecked,
      img: allChecked,
      fimg: allChecked,
    }));
  };

  useEffect(() => {
    // นับจำนวน checkbox ที่ถูกเลือก (ยกเว้น all)
    if(selectedCategories.all === true){
      const selectedCount = Object.values(selectedCategories).filter((value) => value === true).length-1;
      setSelectedCount(selectedCount);
    }else{
      const selectedCount = Object.values(selectedCategories).filter((value) => value === true).length;
      setSelectedCount(selectedCount);
    }
    
  }, [selectedCategories]);

  useEffect(() => {
    fetchReport();
    console.log(report); // ตรวจสอบค่าทั้งหมดที่ได้จากการ fetch
  }, [searchQuery]);

  const fetchReport = async () => {
    //console.log(searchQuery)
    try {
  
      // ส่งค่าไปยังเซิร์ฟเวอร์
      const res = await Axios.get('http://192.168.15.227:5778/report', {
        params: { search: searchQuery } // ส่งคำค้นหาไปยังเซิร์ฟเวอร์
      });
  
      setReport(res.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReport();
  };

  function calculateAge(dateOfBirth) {
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
  
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
  
      return age;
    }
  
    return null; // หรือค่าที่ต้องการสำหรับข้อมูลที่ไม่สามารถคำนวณอายุได้
  }

  {/* สร้างไฟล์ JSON */}
  const generateJSON = () => {
    const jsonData = [];
    const timestamp = new Date().getTime();
    const fileName = `data_${timestamp}.json`;

    report.forEach((data, index) => {
      const jsonRow = {};
      if (selectedCategories.studentId) jsonRow.studentId = data.s_id || "null";
      if (selectedCategories.name) jsonRow.name = `${data.s_name} ${data.s_sname || "Stranger"}`;
      if (selectedCategories.age) jsonRow.age = calculateAge(data.dateofbirth) || data.age;
      if (selectedCategories.mood) jsonRow.mood = data.mood;
      if (selectedCategories.datetime) jsonRow.datetime = data.date;
      if (selectedCategories.gender) jsonRow.gender = data.gender || "null";
      if (selectedCategories.img) jsonRow.img = data.pic_r;
      if (selectedCategories.fimg) jsonRow.fimg = data.pic_cam;
      jsonData.push(jsonRow);
    });

    const jsonString = JSON.stringify(jsonData, null, 2);
    console.log(jsonString); // เพื่อตรวจสอบ JSON ที่สร้าง

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-auto h-screen bg-[#E1F7FF]">

      {/* Body Header */}
      <div className="flex flex-row w-full h-fit my-10 px-24 justify-start">

        {/* Searchbar */}
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

        {/* Button next to searchbar */}
        <div className="flex ml-6 w-fit items-center justify-evenly relative">
          <button onClick={handleCategoryClick} className="flex h-[36px] px-2 bg-sky-800 text-[#fff] rounded items-center mr-6">Category {triangleIcon}</button>
          <button onClick={generateJSON} className="flex h-[36px] px-2 bg-sky-800 text-[#fff] rounded items-center">Export <BiSolidFileExport /></button>

          {/* Popup */}
          {showCategoryPopup && (
            <div className="category-popup bg-white border rounded p-4 absolute left-40 top-0 shadow-lg min-w-[250px]">
              <ul>
                <li className="flex justify-start py-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.all}
                    onChange={() => handleSelectAll()}
                    className="m-[5.5px] mr-4 h-fit items-center"
                  />
                  <p className='font-bold'>ทั้งหมด</p>
                  <p className='ml-8 text-[12px] font-bold'>{selectedCount} of 8 Selected</p>
                </li>
                <li className="flex justify-start py-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedCategories.studentId}
                    onChange={() => handleSelect('studentId')}
                    className="mr-2"
                  />
                  <p>รหัสนศ.</p>
                </li>
                <li className="flex justify-start py-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedCategories.name}
                    onChange={() => handleSelect('name')}
                    className="mr-2"
                  />
                  <p>ชื่อ-สกุล</p>
                </li>
                <li className="flex justify-start py-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedCategories.age}
                    onChange={() => handleSelect('age')}
                    className="mr-2"
                  />
                  <p>อายุ</p>
                </li>
                <li className="flex justify-start py-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedCategories.mood}
                    onChange={() => handleSelect('mood')}
                    className="mr-2"
                  />
                  <p>อารมณ์</p>
                </li>
                <li className="flex justify-start py-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedCategories.datetime}
                    onChange={() => handleSelect('datetime')}
                    className="mr-2"
                  />
                  <p>วัน/เวลา</p>
                </li>
                <li className="flex justify-start py-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedCategories.gender}
                    onChange={() => handleSelect('gender')}
                    className="mr-2"
                  />
                  <p>เพศ</p>
                </li>
                <li className="flex justify-start py-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedCategories.img}
                    onChange={() => handleSelect('img')}
                    className="mr-2"
                  />
                  <p>รูป</p>
                </li>
                <li className="flex justify-start py-2 ml-6">
                  <input
                    type="checkbox"
                    checked={selectedCategories.fimg}
                    onChange={() => handleSelect('fimg')}
                    className="mr-2"
                  />
                  <p>รูปใหญ่</p>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    

      {/* Body Center (Show data) */}
      <div className="flex flex-row w-full h-fit max-h-[500px] px-24 overflow-y-scroll ">
        <table className='w-full table-auto text-left'>
          <thead>
            <tr>
              <th className='py-4 sticky top-0 bg-[#E1F7FF]'>
                {selectedCategories.studentId && <span>รหัสนศ.</span>}
              </th>
              <th className='py-4 pl-[10px] sticky top-0 bg-[#E1F7FF]'>
                {selectedCategories.name && <span>ชื่อ-สกุล</span>}
              </th>
              <th className='py-4 sticky top-0 bg-[#E1F7FF]'>
                {selectedCategories.age && <span>อายุ</span>}
              </th>
              <th className='py-4 sticky top-0 bg-[#E1F7FF]'>
                {selectedCategories.mood && <span>อารมณ์</span>}
              </th>
              <th className='py-4 sticky top-0 bg-[#E1F7FF]'>
                {selectedCategories.datetime && <span>วันเวลา</span>}
              </th>
              <th className='py-4 sticky top-0 bg-[#E1F7FF]'>
                {selectedCategories.gender && <span>เพศ</span>}
              </th>
              <th className='py-4 sticky top-0 bg-[#E1F7FF]'>
                {selectedCategories.img && <span>รูป</span>}
              </th>
              <th className='py-4 sticky top-0 bg-[#E1F7FF]'>
                {selectedCategories.fimg && <span>รูปใหญ่</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {report.map((data, index) => (
              <tr key={index} className='border-collapse border border-slate-300 h-[32px] bg-white'>
                <td>
                  {selectedCategories.studentId && <span>{data.s_id || "null"}</span>}
                </td>
                <td>
                  {selectedCategories.name && <span>{data.s_name} {data.s_sname || "Stranger"}</span>}
                </td>
                <td>
                  {selectedCategories.age && <span>{calculateAge(data.dateofbirth) || data.age}</span>}
                </td>
                <td>
                  {selectedCategories.mood && <span>{data.mood}</span>}
                </td>
                <td>
                  {selectedCategories.datetime && <span>{data.date}</span>}
                </td>
                <td>
                  {selectedCategories.gender && <span>{data.gender || data.gender}</span>}
                </td>
                <td>
                  {selectedCategories.img && <span><img src={`data:image/jpeg;base64, ${data.pic_r}`} alt="รูป" /></span>}
                </td>
                <td>
                  {selectedCategories.fimg && <span><img src={`data:image/jpeg;base64, ${data.pic_cam}`} alt="รูปใหญ่" className='w-[180px] h-[100px]'/></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Report;
