import { create } from "zustand";
import { ISignalsData } from "../validation/controller";

type ISendingEvent = {
  value: boolean;
  event: string;
};

type SignalsDataStore = {
  sendingEvent?: ISendingEvent | null;
  signalsData?: ISignalsData | null;
  setSignalsData: (data: ISignalsData) => void;
  setSendingEvent: (value: ISendingEvent | null) => void;
};

export const useSignalsDataStore = create<SignalsDataStore>()((setState) => ({
  setSignalsData(data) {
    setState((state) => ({
      ...state,
      signalsData: data,
      sendingEvent: undefined,
    }));
  },
  setSendingEvent(value) {
    setState((state) => ({
      ...state,
      sendingEvent: value,
    }));
  },
}));
