import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';

function App() {
  const [pockets, setPockets] = useState([]);

  const handleAddPocket = () => {
    const newPocket = { id: Date.now(), title: 'New Pocket', cash: 0 };
    setPockets([...pockets, newPocket]);
  };

  const handleUpdatePocket = (id, updatedPocket) => {
    const updatedPockets = pockets.map((pocket) => (pocket.id === id ? updatedPocket : pocket));
    setPockets(updatedPockets);
  };

  const handleDeletePocket = (id) => {
    const updatedPockets = pockets.filter((pocket) => pocket.id !== id);
    setPockets(updatedPockets);
  };
  return (
    <div>
      {/* Navigation Bar */}
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Accounts</a></li>
          <li><a href="#">Transactions</a></li>
          <li><a href="#">Manage Pockets Money</a></li>
          <li><a href="#">Account Money: $1,000.00</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main>
        <h1>Welcome to Pockets Bank</h1>
      </main>

      {/* Pockets Content */}
      <div className='main2'>
        <h1>Pockets</h1>
        <button className="btn btn-success" onClick={handleAddPocket}>Add Pocket</button>
      </div>
      <div style={{display:"flex", flexFlow:"wrap", paddingBottom:"100px", paddingLeft:"50px"}}>
        {pockets.map((pocket) => (
          <Pocket key={pocket.id} pocket={pocket} onUpdate={handleUpdatePocket} onDelete={handleDeletePocket} />
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
    const [title, setTitle] = useState(pocket.title);
    const [cash, setCash] = useState(pocket.cash);

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleSave = () => {
      const updatedPocket = { ...pocket, title, cash };
      onUpdate(pocket.id, updatedPocket);
      setIsEditing(false);
    };

    const handleDelete = () => {
      onDelete(pocket.id);
    };

    return (
      <div className="pocket">
        {isEditing ? (
          <>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input value={cash} onChange={(e) => setCash(e.target.value)} />
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <h2>Pocket : {title}</h2>
            <p>Money : {cash}</p>
            <button className="btn btn-primary" onClick={handleEdit}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>
        )}
      </div>
    );
  }
}

export default App;
