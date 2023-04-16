import {createSlice} from "@reduxjs/toolkit"
export const userSlice = createSlice({
    name: 'userinfo',
    initialState:{
        user:null
    },
    reducers:{
        setuser: (state, action) => {
            state.user = action.payload
        }
    }

})
export const {setuser} = userSlice.actions
export default userSlice.reducer