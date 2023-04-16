import React, { useState, useEffect } from "react";
import "./App.css"
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {setuser} from './data/userSlice'
function Transfer(){
    const user = useSelector((state)=>state.user.user)
    const dispatch = useDispatch()
    const [pockets, setPockets] = useState([]);
    const [allmoney, setAllMoney] = useState(0)
    const [cash, setCash] = useState(0)
    const [selectOp1, setSelectOp1] = useState("Main")
    const [target,setTarget] = useState("")
    const handleOp1 = (event)=>{
        let value = JSON.parse(event.target.value)
        setSelectOp1(value)
    }
    const handleCash = (event)=>{
        setCash(parseFloat(event.target.value))
    }
    //calculate all money
    useEffect(()=>{
        const total = pockets.reduce((acc, value)=>{return acc+value.cur_money},user?user.main_pocket:0)
        setAllMoney(total.toFixed(2))
    },[user,pockets])
    //Generate user if  not have yet  (user:admin, pass:1234)
  useEffect(()=>{
    console.log(localStorage.getItem('userId'))
    async function genUser(){
      if(localStorage.getItem('userId')){
        const response2 = await fetch('http://18.208.223.38:8085/users/'+localStorage.getItem('userId'));
        const result = await response2.json();
        dispatch(setuser(result))
        setPockets(result.pockets)
        console.log(user)
      }else{
        try {
          const send = {
            username: "admin",
            password: '1234'
          }
          const response = await fetch('http://18.208.223.38:8085/create_user', {
            method: "POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(send)
          });
          const json = await response.json();
          console.log(json)
          const response2 = await fetch('http://18.208.223.38:8085/users/'+json.id);
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
  },[])
    const transfer = async() => {
        if(selectOp1 == "Main"){
            const response = await fetch('http://18.208.223.38:8085/transfer/'+user._id+"/"+cash+"?target="+target, {
              method: "PUT"
            });
            const result = await response.json();
            console.log(result)
            dispatch(setuser(result))
            setPockets(result.pockets)
        }else{
            const response = await fetch('http://18.208.223.38:8085/transfer/'+user._id+"/"+cash+"?target="+target+"&pocketid="+selectOp1._id, {
              method: "PUT"
            });
            const result = await response.json();
            console.log(result)
            dispatch(setuser(result))
            setPockets(result.pockets)
            let sel = result.pockets.find((pocket)=>{return pocket._id == selectOp1._id})
            setSelectOp1(sel)
        }
    }
    return(
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
   
     
        <div className="transfercard" style={{margin:"auto", marginTop:"100px"}}>
            <div style={{display:"flex",flex:1 ,width:"100%", justifyContent:"space-between"}}>
                
                <div style={{flex:3,"flex-direction":"column",display:"flex"}}>
                    <p style={{fontWeight:"bold"}}>{user?.username}</p>
                    <p >{user?.bank_number}</p>
                    <p >Money: {(selectOp1=="Main"?user?.main_pocket:selectOp1?.cur_money)}</p>
                    <select className="dropdown" value={JSON.stringify(selectOp1)}  onChange={handleOp1}>
                        <option key="Main" value={JSON.stringify("Main")}>Main</option>
                        <option disabled>────────────────────</option>
                        {pockets.map((pocket, index)=>(
                            <option key={pocket._id} value={JSON.stringify(pocket)}>{pocket.name}</option>
                        )     
                        )}
                    </select>
                    
                </div>
                <h1 style={{flex:1, textAlign:"center", "align-self":"flex-end", marginBottom:"1.3%"}}>-></h1>
                <div style={{flex:3,"flex-direction":"column",display:"flex", "justify-content":"flex-end"}}>
                    <input type="text" style={{height:"30%"}} value={target} onChange={(event)=>{setTarget(event.target.value)}}></input>
                </div>
                
            </div>
            <div style={{width:"100%",flex:1 ,display:"flex",justifyContent:"center", paddingTop:"10%"}}>
                <input type="number" min={1} style={{height:"100%", flex:1}} value={cash} onChange={handleCash}></input>
                <button style={{height:"100%", flex:.8, marginLeft:"5%", marginRight:"5%"}} onClick={transfer} >Confirm</button>
                <button style={{height:"100%", flex:.5}} onClick={()=>{setCash(0)}}>Clear</button>
            </div>

            
        </div>
        
        

        {/* Footer */}
        <footer>
            <p>Bank of React &copy; 2023</p>
        </footer>
        </div>
    )
}

export default Transfer