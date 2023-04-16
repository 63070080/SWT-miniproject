import logo from './logo.svg';
import './App.css';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { setuser } from './data/userSlice'
import { Link } from 'react-router-dom';
function App() {
  const user = useSelector((state) => state.user.user)
  const dispatch = useDispatch()
  const [pockets, setPockets] = useState([]);
  const [allmoney, setAllMoney] = useState(0)
  const [nameAdd, setNameAdd] = useState("")
  const handleAddNameChange = (event) => {
    setNameAdd(event.target.value)
  }
  const handleAddPocket = async () => {
    // const newPocket = { _id: Date.now(), name: 'New Pocket', cur_money: 0 };
    // setPockets([...pockets, newPocket]);
    const send = {
      name: nameAdd.trim().length == 0 ? "New Pocket" : nameAdd,
      max_money: 100000000
    }
    const response = await fetch('http://18.208.223.38:8085/pockets/' + user._id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(send)
    });
    const json = await response.json();
    dispatch(setuser(json))
    setPockets(json.pockets)
  };

  const handleUpdatePocket = async (id, updatedPocket) => {
    // const updatedPockets = pockets.map((pocket) => (pocket._id === id ? updatedPocket : pocket));
    // setPockets(updatedPockets);
    const send = {
      id: updatedPocket._id,
      name: updatedPocket.name,
      max_money: updatedPocket.max_money,
      cur_money: updatedPocket.cur_money
    }
    const response = await fetch('http://18.208.223.38:8085/pockets/' + user._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(send)
    });
    const json = await response.json();
    dispatch(setuser(json))
    setPockets(json.pockets)
  };

  const handleDeletePocket = async (id) => {
    // const updatedPockets = pockets.filter((pocket) => pocket._id !== id);
    // setPockets(updatedPockets);
    const send = {
      pocket1: id
    }
    const response = await fetch('http://18.208.223.38:8085/pockets/' + user._id, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(send)
    });
    const json = await response.json();
    dispatch(setuser(json))
    setPockets(json.pockets)
  };
  //Generate user if  not have yet  (user:admin, pass:1234)
  useEffect(() => {
    console.log(localStorage.getItem('userId'))
    async function genUser() {
      if (localStorage.getItem('userId')) {
        const response2 = await fetch('http://18.208.223.38:8085/users/' + localStorage.getItem('userId'));
        const result = await response2.json();
        dispatch(setuser(result))
        setPockets(result.pockets)
        console.log(user)
      } else {
        try {
          const send = {
            username: "admin",
            password: '1234'
          }
          const response = await fetch('http://18.208.223.38:8085/create_user', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(send)
          });
          const json = await response.json();
          console.log(json)
          const response2 = await fetch('http://18.208.223.38:8085/users/' + json.id);
          const result = await response2.json();
          localStorage.setItem('userId', json.id);
          dispatch(setuser(result))
          setPockets(result.pockets)
          console.log(result)
        } catch (error) {
          console.error(error);
        }
      }
    }
    genUser()
  }, [])
  //calculate all money
  useEffect(() => {
    const total = pockets.reduce((acc, value) => { return acc + value.cur_money }, user ? user.main_pocket : 0)
    setAllMoney(total.toFixed(2))
  }, [user, pockets])
  return (
      <div>
      {/* Navigation Bar */}
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/transfer">Transfer</Link></li>
          <li><Link to="/pocket-transfer">Manage Pockets Money</Link></li>
          <li>Account Money: ${allmoney}</li>
        </ul>
        {user?.username || "None"}
      </nav>

      {/* Main Content */}
      <main>
        <h1>Welcome to Pockets Bank</h1>
      </main>

      {/* Pockets Content */}
      <div className='main2' style={{ paddingTop: "50px" }}><h1>Main Money: {user?.main_pocket}</h1></div>
      <div className='main3'><h1>Pockets</h1></div>
      <div className='main2'>
        <input type='text' value={nameAdd} onChange={handleAddNameChange}></input>
        <button className="btn btn-success" onClick={handleAddPocket}>Add Pocket</button>
      </div>
      <div style={{ display: "flex", flexFlow: "wrap", paddingBottom: "100px", paddingLeft: "50px" }}>
        {pockets.map((pocket) => (
          <Pocket key={pocket._id} pocket={pocket} onUpdate={handleUpdatePocket} onDelete={handleDeletePocket} />
        ))}
      </div>

      {/* Footer */}
      <footer>
        <p>Bank of React &copy; 2023</p>
      </footer>
    </div>
  );


  function Pocket({ pocket, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(pocket.name);
    const [cur_money, setCur_money] = useState(pocket.cur_money);

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleSave = () => {
      const updatedPocket = { ...pocket, name, cur_money };
      onUpdate(pocket._id, updatedPocket);
      setIsEditing(false);
    };

    const handleDelete = () => {
      onDelete(pocket._id);
    };

    return (
      <div className="pocket">
        {isEditing ? (
          <>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <input value={cur_money} onChange={(e) => setCur_money(e.target.value)} />
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <h2>Pocket : {name}</h2>
            <p>Money : {cur_money}</p>
            <button className="btn btn-primary" onClick={handleEdit}>Add Money</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>
        )}
      </div>
    );
  }
}

export default App;
