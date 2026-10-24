import { createContext, useReducer, useContext } from 'react'
import blogService from './services/blogs'

// Decide come cambia lo stato dell'utente in base all'azione ricevuta.
// state è l'utente loggato attuale (o null se nessuno è loggato).
const userReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      // action.payload è l'utente loggato: sostituisce lo stato con l'utente
      return action.payload
    case 'LOGOUT':
      // nessun utente loggato: stato nullo
      return null
    default:
      // azione non riconosciuta: stato invariato
      return state
  }
}

// Il "contenitore" che rende lo stato dell'utente disponibile a tutta l'app,
// senza doverlo passare come prop componente per componente.
const UserContext = createContext()

// Avvolge l'app (vedi main.jsx) e fornisce lo stato + le funzioni per modificarlo
// a tutti i componenti discendenti, tramite UserContext.
const UserProvider = ({ children }) => {
  // user: stato corrente (gestito dal reducer sopra)
  // dispatch: funzione per "lanciare" un'azione al reducer
  const [user, dispatch] = useReducer(userReducer, null)

  // Funzione di comodo: i componenti chiamano loginUser(...) invece di
  // conoscere la forma esatta dell'azione da dispatchare.
  const loginUser = (user) => {
    dispatch({
      type: 'LOGIN',
      payload: user,
    })
  }

  const logoutUser = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    dispatch({ type: 'LOGOUT' })
  }

  // Tutto ciò che è dentro UserContext.Provider può accedere a
  // user, loginUser e logoutUser tramite il context.
  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  )
}

// Hook di comodo: evita di scrivere useContext(UserContext) a mano
// in ogni componente che vuole leggere user o chiamare loginUser/logoutUser.
const useUser = () => {
  const context = useContext(UserContext)
  // createContext() senza argomenti ha undefined come valore di default:
  // context è undefined solo se questo hook viene chiamato da un componente
  // che non è discendente di un UserProvider (es. dimenticato in main.jsx).
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export { UserContext, UserProvider, useUser }
