import { createContext, useReducer, useContext } from 'react'

// Decide come cambia lo stato della notifica in base all'azione ricevuta.
// state è l'oggetto notifica attuale (o null se non c'è nessuna notifica).
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      // action.payload è { message, type }: sostituisce lo stato con la nuova notifica
      return action.payload
    case 'CLEAR_NOTIFICATION':
      // nessuna notifica da mostrare
      return null
    default:
      // azione non riconosciuta: stato invariato
      return state
  }
}

// Il "contenitore" che rende lo stato della notifica disponibile a tutta l'app,
// senza doverlo passare come prop componente per componente.
const NotificationContext = createContext()

// Avvolge l'app (vedi main.jsx) e fornisce lo stato + le funzioni per modificarlo
// a tutti i componenti discendenti, tramite NotificationContext.
const NotificationProvider = ({ children }) => {
  // notification: stato corrente (gestito dal reducer sopra)
  // dispatch: funzione per "lanciare" un'azione al reducer
  const [notification, dispatch] = useReducer(notificationReducer, null)

  // Funzione di comodo: i componenti chiamano setNotification(...) invece di
  // conoscere la forma esatta dell'azione da dispatchare.
  const setNotification = (message, messageType = 'error') => {
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: { message, type: messageType },
    })
    // la notifica scompare da sola dopo 5 secondi
    setTimeout(() => {
      dispatch({ type: 'CLEAR_NOTIFICATION' })
    }, 5000)
  }

  // Funzione di comodo per azzerare la notifica manualmente (es. su azione utente)
  const clearNotification = () => {
    dispatch({ type: 'CLEAR_NOTIFICATION' })
  }

  // Tutto ciò che è dentro NotificationContext.Provider può accedere a
  // notification, setNotification e clearNotification tramite il context.
  return (
    <NotificationContext.Provider
      value={{ notification, setNotification, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Hook di comodo: evita di scrivere useContext(NotificationContext) a mano
// in ogni componente che vuole leggere notification o chiamare setNotification/clearNotification.
const useNotification = () => {
  const context = useContext(NotificationContext)
  // createContext() senza argomenti ha undefined come valore di default:
  // context è undefined solo se questo hook viene chiamato da un componente
  // che non è discendente di un NotificationProvider (es. dimenticato in main.jsx).
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    )
  }
  return context
}

export { NotificationContext, NotificationProvider, useNotification }
