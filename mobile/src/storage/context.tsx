import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../domain/types';
import { KitchenSession, LocalKitchenRepository } from './repository';

interface ContextValue {
  state: AppState | null;
  error: string | null;
  busy: boolean;
  execute: (transform: (s: AppState) => AppState) => Promise<boolean>;
  retry: () => void;
  dismissError: () => void;
}
const Context = createContext<ContextValue | null>(null);
export function KitchenProvider({ children }: PropsWithChildren) {
  const [session] = useState(
    () => new KitchenSession(new LocalKitchenRepository(AsyncStorage)),
  );
  const [state, setState] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const retry = () => {
    setError(null);
    session
      .load()
      .then(setState)
      .catch((e) => setError(String(e.message)));
  };
  useEffect(() => {
    let active = true;
    session
      .load()
      .then((s) => {
        if (active) setState(s);
      })
      .catch((e) => {
        if (active) setError(String(e.message));
      });
    return () => {
      active = false;
    };
  }, [session]);
  const execute = async (transform: (s: AppState) => AppState) => {
    setPending((n) => n + 1);
    try {
      setState(await session.update(transform));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败，请重试。');
      return false;
    } finally {
      setPending((n) => n - 1);
    }
  };
  return (
    <Context.Provider
      value={{
        state,
        execute,
        error,
        busy: pending > 0,
        retry,
        dismissError: () => setError(null),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useKitchen() {
  const c = useContext(Context);
  if (!c) throw new Error('KitchenProvider missing');
  return c;
}
