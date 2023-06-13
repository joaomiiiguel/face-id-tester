import { configureStore } from '@reduxjs/toolkit'
import logginUser from './userSlice'

export default configureStore({
  reducer: {
    user: logginUser,
  }
})