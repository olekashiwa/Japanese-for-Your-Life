export interface TextState {
  currentText: string;
  setCurrentText: (text: string) => void;
}

export const useTextStore = () => ({
  currentText: '',
  setCurrentText: (text: string) => console.log('set text:', text),
});
