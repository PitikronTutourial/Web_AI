import React, { useState, useEffect, useCallback } from 'react';
import Axios from 'axios';
import { RiDeleteBin5Fill } from "react-icons/ri";

function Greetword() {
  const [greetData, setGreetData] = useState([]);
  const [newGreet, setNewGreet] = useState({ greeting: '', g_category: '' });

  const fetchData = useCallback(async () => {
    try {
      const response = await Axios.get('http://192.168.15.227:5778/greetword');
      setGreetData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddGreet = async () => {
    console.log(newGreet.greeting)
    console.log(newGreet.g_category)
    try {
      await Axios.post('http://192.168.15.227:5778/greetword', {
        greeting: newGreet.greeting,
        g_category: newGreet.g_category
      });

      fetchData();

      setNewGreet({ greeting: '', g_category: '' });
    } catch (error) {
      console.error('Error adding data:', error);

      if (error.response) {
        console.error('Server response:', error.response.data);
      }
    }
  };

  const handleDeleteGreet = (feelid) => {
    if (!feelid) {
      console.error('Invalid feel_id:', feelid);
      return; // หยุดฟังก์ชันถ้า feel_id ไม่ถูกต้อง
    }
  
    Axios.delete(`http://192.168.15.227:5778/greetword/${feelid}`)
      .then((res) => {
        console.log('Data deleted successfully:', res.data);
        fetchData();
        setGreetData(greetData.filter(item => item.id !== feelid));
      })
      .catch((err) => {
        console.error('Error deleting data:', err);
      });
  };
  
  const getCategoryText = (value) => {
    switch (value) {
      case 0:
        return 'Select Feel';
      case 1:
        return 'neutral';
      case 2:
        return 'happy';
      case 3:
        return 'surprise';
      case 4:
        return 'fear';
      case 5:
        return 'sad';
      case 6:
        return 'disgust';
      case 7:
        return 'angry';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col w-auto h-screen bg-[#E1F7FF]">
      <div className="flex flex-col w-full">
        <div className='flex flex-row w-full h-fit mt-10 mb-2 px-24 justify-evenly items-center'>
          <p className='w-[600px] px-2.5 py-[2px]'>คำทักทาย</p>
          <p className='w-[200px] px-2.5 py-[2px]'>หมวดหมู่</p>
          <p className='w-[60px]'></p>
        </div>
        <form
          className="flex flex-row w-full h-fit px-24 justify-evenly items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (newGreet.greeting.trim()) {
              handleAddGreet();
            }
          }}
        >
          <input
            type="text"
            placeholder="คำทักทาย"
            className="w-[600px] px-2.5 py-[2px] rounded"
            value={newGreet.greeting}
            onChange={(e) => {
              const inputValue = e.target.value;
              setNewGreet({ ...newGreet, greeting: inputValue });
            }}
          />
          <select
            className="w-[200px] px-2.5 py-[2px] rounded"
            name="g_category"
            value={newGreet.g_category}
            onChange={(e) => setNewGreet({ ...newGreet, g_category: e.target.value })}
          >
            <option value="0">Select Feel</option>
            <option value="1">neutral</option>
            <option value="2">happy</option>
            <option value="3">surprise</option>
            <option value="4">fear</option>
            <option value="5">sad</option>
            <option value="6">disgust</option>
            <option value="7">angry</option>
          </select>
          <button
            type="submit"
            className="w-[60px] py-[2px] rounded bg-sky-800 text-white"
            disabled={!newGreet.greeting.trim()}
          >
            Add
          </button>
        </form>
      </div>
      <div className="flex flex-row w-full h-fit px-24 justify-evenly">
        <table className="min-w-[1200px] table-auto text-left">
          <thead>
            <tr>
              <th className="py-4">id</th>
              <th className="py-4">คำทักทาย</th>
              <th className="py-4">ความรู้สึก</th>
            </tr>
          </thead>
          <tbody>
            {greetData.map((item) => (
              <tr key={item.feel_id} className='border-collapse border border-slate-300 h-[32px] bg-white'>
                <td className="pl-[10px]">{item.feel_id}</td>
                <td className="pl-[10px]">{item.greeting}</td>
                <td>{getCategoryText(item.g_category)}</td>
                <td className='flex justify-center'>
                <button
                  onClick={() => handleDeleteGreet(item.feel_id)}
                  className='p-2 bg-red-400 text-[#000] rounded-xl text-[18px]'
                >
                  <RiDeleteBin5Fill />
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Greetword;
