import { create } from 'zustand';

export interface HeaderPreset { id: string; name: string; headers: { key: string; value: string }[] }

interface PresetState {
  presets: HeaderPreset[];
  add: (name: string, headers: { key: string; value: string }[]) => void;
  remove: (id: string) => void;
  apply: (id: string) => { headers: { key: string; value: string }[] } | undefined;
  rename: (id: string, name: string) => void;
}

const load = (): HeaderPreset[] => { try { return JSON.parse(localStorage.getItem('grpc_header_presets')||'[]'); } catch { return []; } };
const save = (p: HeaderPreset[]) => { try { localStorage.setItem('grpc_header_presets', JSON.stringify(p)); } catch {} };

export const useHeaderPresets = create<PresetState>((set,get) => ({
  presets: load(),
  add: (name, headers) => {
    const preset: HeaderPreset = { id: crypto.randomUUID(), name, headers };
    const presets = [preset, ...get().presets];
    save(presets);
    set({ presets });
  },
  remove: (id) => { const presets = get().presets.filter(p => p.id !== id); save(presets); set({ presets }); },
  rename: (id, name) => { const presets = get().presets.map(p => p.id===id?{...p,name}:p); save(presets); set({ presets }); },
  apply: (id) => get().presets.find(p => p.id === id)
}));