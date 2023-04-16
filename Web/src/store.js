import { configureStore } from "@reduxjs/toolkit";
import reducer from './data/userSlice'
export default configureStore({
    reducer:{
        user: reducer
    }
})