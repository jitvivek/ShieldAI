import { useChildStore } from '@/store/childStore';

export function useChildren() {
  const store = useChildStore();
  return store;
}
