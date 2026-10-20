import { configureStore } from '@reduxjs/toolkit'
import fleetReducer from '../features/fleet/fleetSlice'
import managementReducer from '../features/management/managementSlice'

export const store = configureStore({ reducer: { fleet: fleetReducer, management: managementReducer } })
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
