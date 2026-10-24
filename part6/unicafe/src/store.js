import { create } from 'zustand'

const useStatisticsStore = create(set => ({
  good: 0,
  neutral: 0,
  bad: 0,
  actions: {
    incrementGood: () => set(state => ({ good: state.good + 1 })),
    incrementNeutral: () => set(state => ({ neutral: state.neutral + 1 })),
    incrementBad: () => set(state => ({ bad: state.bad + 1 })),
    reset: () => set({ good: 0, neutral: 0, bad: 0 })
  }
}))

// the hook functions that are used elsewhere in app
export const useGood = () => useStatisticsStore(state => state.good)
export const useNeutral = () => useStatisticsStore(state => state.neutral)
export const useBad = () => useStatisticsStore(state => state.bad)
export const useStatisticsControls = () => useStatisticsStore(state => state.actions)