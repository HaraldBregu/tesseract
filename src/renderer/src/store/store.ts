import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import rootReducer, { RootState } from './rootReducers'
import rootSaga from './rootSaga'

// Crea il middleware saga
const sagaMiddleware = createSagaMiddleware()

// Configura lo store Redux
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware)
})

// Esegui la root saga
sagaMiddleware.run(rootSaga)

// Esporta i tipi
export type { RootState }
export type AppDispatch = typeof store.dispatch

export default store
