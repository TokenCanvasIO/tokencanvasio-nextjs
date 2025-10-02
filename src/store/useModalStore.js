import { create } from 'zustand';

export const useModalStore = create((set) => ({
  modalType: null, // e.g., 'confirmDelete', 'shareOptions'
  isOpen: false,
  openModal: (type) => set({ modalType: type, isOpen: true }),
  closeModal: () => set({ modalType: null, isOpen: false }),
}));