import ReactDOM from 'react-dom/client'

import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import App from './App'

import anecdotesReducer from './reducers/anecdoteReducer'
import filterReducer from './reducers/filterReducer'
import notificationReducer from './reducers/notificationReducer'

const store = configureStore({
  reducer: {
    anecdotes: anecdotesReducer,
    filter: filterReducer,
    notification: notificationReducer
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)