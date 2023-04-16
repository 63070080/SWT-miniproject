import React, { useState, useEffect } from "react";
import "./App.css"
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setuser } from './data/userSlice'
function PocketTransfer() {
    const user = useSelector((state) => state.user.user)
    const dispatch = useDispatch()
    const [pockets, setPockets] = useState([]);
    const [pockets2, setPockets2] = useState([])
    const [selectOp1, setSelectOp1] = useState("Main")
    const [selectOp2, setSelectOp2] = useState("")
    const [cash, setCash] = useState(0)
    const [allmoney, setAllMoney] = useState(0)
    const handleOp1 = (event) => {
        let value = JSON.parse(event.target.value)
        setSelectOp1(value)
    }
    const handleOp2 = (event) => {
        let value = JSON.parse(event.target.value)
        setSelectOp2(value)
    }
    const handleCash = (event) => {
        setCash(parseFloat(event.target.value))
    }
    const transfer = async () => {
        if (selectOp1 == "Main") {
            const send = {
                pocket1: selectOp2._id,
                money: cash
            }
            const response = await fetch('http://18.208.223.38:8085/m2p/' + user._id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(send)
            });
            const result = await response.json();
            console.log(result)
            dispatch(setuser(result))
            setPockets(result.pockets)
            setPockets2(result.pockets)
        } else if (selectOp2 == "Main") {
            const send = {
                pocket1: selectOp1._id,
                money: cash
            }
            const response = await fetch('http://18.208.223.38:8085/p2m/' + user._id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(send)
            });
            const result = await response.json();
            console.log(result)
            dispatch(setuser(result))
            setPockets(result.pockets)
            setPockets2(result.pockets)
            setSelectOp1("Main")
        } else {
            const send = {
                pocket1: selectOp1._id,
                money: cash,
                pocket2: selectOp2._id
            }
            const response = await fetch('http://18.208.223.38:8085/p2p/' + user._id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(send)
            });
            const result = await response.json();
            console.log(result)
            dispatch(setuser(result))
            setPockets(result.pockets)
            setPockets2(result.pockets)
            setSelectOp1(result.pockets.find((pocket => pocket._id == selectOp1._id)))
        }

    }
    //calculate all money
    useEffect(() => {
        const total = pockets.reduce((acc, value) => { return acc + value.cur_money }, user ? user.main_pocket : 0)
        setAllMoney(total.toFixed(2))
    }, [user, pockets])
    //Generate user if  not have yet  (user:admin, pass:1234)
    useEffect(() => {
        console.log(localStorage.getItem('userId'))
        async function genUser() {
            if (localStorage.getItem('userId')) {
                const response2 = await fetch('http://18.208.223.38:8085/users/' + localStorage.getItem('userId'));
                const result = await response2.json();
                dispatch(setuser(result))
                setPockets(result.pockets)
                setPockets2(result.pockets)
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
                    setPockets2(result.pockets)
                    console.log(result)
                } catch (error) {
                    console.error(error);
                }
            }
        }
        genUser()
    }, [])
    useEffect(() => {
        if (selectOp1 == "Main") {
            setPockets2(pockets)
            setSelectOp2(pockets[0])
        } else {
            let newpockets = pockets.filter((pocket) => pocket._id != selectOp1._id)
            setPockets2(newpockets)
            setSelectOp2(newpockets[0])
        }
    }, [selectOp1, user, pockets])
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
   
     
        <div className="transfercard" style={{margin:"auto", marginTop:"100px"}}>
            <div style={{display:"flex",flex:1 ,width:"100%", justifyContent:"space-between"}}>
                
                <div style={{flex:3,"flex-direction":"column",display:"flex"}}>
                    <select className="dropdown" value={JSON.stringify(selectOp1)} onChange={handleOp1}>
                        <option key="Main" value={JSON.stringify("Main")}>Main</option>
                        <option disabled>────────────────────</option>
                        {pockets.map((pocket, index)=>(
                            <option key={pocket._id} value={JSON.stringify(pocket)}>{pocket.name}</option>
                        )     
                        )}
                    </select>
                    <p style={{fontWeight:"bold"}}>{selectOp1=="Main"?selectOp1:selectOp1?.name}</p>
                    <p>Current Money: {(selectOp1=="Main"?user?.main_pocket:selectOp1?.cur_money)}</p>
                    <p>After Transfer: <span style={{color:"red"}}>{(selectOp1=="Main"?user?.main_pocket:selectOp1?.cur_money)-cash}</span></p>
                </div>
                <h1 style={{flex:1, textAlign:"center", marginTop:0}}>-></h1>
                <div style={{flex:3,"flex-direction":"column",display:"flex"}}>
                    <select className="dropdown" value={JSON.stringify(selectOp2)} onChange={handleOp2}>
                        {selectOp1 == "Main"?<></>:<>
                            <option key="Main" value={JSON.stringify("Main")}>Main</option>
                            <option disabled>────────────────────</option>
                        </>}
                        {pockets2.map((pocket, index)=>(
                            <option key={pocket._id} value={JSON.stringify(pocket)}>{pocket.name}</option>
                        )     
                        )}
                    </select>
                    <p style={{fontWeight:"bold"}}>{selectOp2=="Main"?selectOp2:selectOp2?.name}</p>
                    <p>Current Money: {(selectOp2=="Main"?user?.main_pocket:selectOp2?.cur_money)}</p>
                    <p>After Transfer: <span style={{color:"green"}}>{(selectOp2=="Main"?user?.main_pocket:selectOp2?.cur_money)+cash}</span></p>
                </div>
                
            </div>
            <div style={{width:"100%",flex:1 ,display:"flex",justifyContent:"center", paddingTop:"10%"}}>
                <input type="number" min={1} style={{height:"100%", flex:1}} value={cash} onChange={handleCash}></input>
                <button style={{height:"100%", flex:.8, marginLeft:"5%", marginRight:"5%"}} onClick={transfer}>Confirm</button>
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

export default PocketTransfer