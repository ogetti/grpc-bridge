import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Label } from './ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { invoke } from '@tauri-apps/api/core';
import { useRequestStore } from '../state/request';
import { useServicesStore } from '../state/services';
import { useHistoryStore } from '../state/history';
import { useHeaderPresets } from '../state/presets';
import { useProtoFiles } from '../state/protoFiles';
import { ProtoFileTree } from './ProtoFileTree';
import { LanguageSwitcher } from './LanguageSwitcher';
import toast from 'react-hot-toast';

export const UnaryRequestPanel: React.FC = () => {
  const { t } = useTranslation();
  const {
    busy,
    setBusy,
    indexing,
    rootPath,
    setRootPath,
    rootId,
    setRootId,
    knownRoots,
    addKnownRoot,
    setKnownRoots,
    projectPath,
    setProjectPath,
    protoFilesInput,
    setProtoFilesInput,
    target,
    setTarget,
    service,
    setService,
    method,
    setMethod,
    payload,
    setPayload,
    headers,
    addHeader,
    updateHeader,
    removeHeader,
    lastSentPayload,
    setLastSentPayload,
    authToken,
    setAuthToken,
    autoAuth,
    setAutoAuth,
    lastResponse,
  } = useRequestStore();

  const protoFiles = useProtoFiles(s => s.files);
  const selectedFiles = useProtoFiles(s => s.selected);
  const toggleFile = useProtoFiles(s => s.toggle);
  const selectAllFiles = useProtoFiles(s => s.selectAll);
  const clearFiles = useProtoFiles(s => s.clear);
  const onlyFile = useProtoFiles(s => s.only);

  const services = useServicesStore(s => s.services);
  const byService = useServicesStore(s => s.byService);
  const history = useHistoryStore(s => s.calls);
  const pushHistory = useHistoryStore(s => s.push);
  const presets = useHeaderPresets(s => s.presets);
  const addPreset = useHeaderPresets(s => s.add);
  const applyPreset = useHeaderPresets(s => s.apply);
  const removePreset = useHeaderPresets(s => s.remove);

  const [payloadError, setPayloadError] = React.useState<string | null>(null);
  const [showDiff, setShowDiff] = React.useState(false);

  const validatePayload = (v: string) => {
    try {
      JSON.parse(v);
      setPayloadError(null);
    } catch (e: any) {
      setPayloadError(e.message);
    }
  };

  const formatPayload = () => {
    try {
      const obj = JSON.parse(payload);
      setPayload(JSON.stringify(obj, null, 2));
      setPayloadError(null);
    } catch {
      /* ignore */
    }
  };

  const registerRoot = async () => {
    if (!rootPath) {
      toast.error(t('errors.pathEmpty'));
      return;
    }
    try {
      const id = await invoke<string>('register_proto_root', {
        path: rootPath,
      });
      await invoke('scan_proto_root', { root_id: id });
      setRootId(id);
      addKnownRoot({ id, path: rootPath });
      toast.success(t('common.rootRegistered'));
    } catch (e: any) {
      toast.error(e.toString());
    }
  };

  const run = async () => {
    if (busy) return;
    if (!rootPath) {
      toast.error(t('errors.protoRootRequired'));
      return;
    }
    if (!service || !method) {
      toast.error(t('errors.serviceMethodRequired'));
      return;
    }
    setBusy(true);
    const chosenFiles = Object.entries(selectedFiles)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (chosenFiles.length === 0) {
      toast.error(t('errors.selectProtoFile'));
      setBusy(false);
      return;
    }
    let effectiveHeaders = [...headers];
    if (
      autoAuth &&
      authToken &&
      !effectiveHeaders.some(h => h.key.toLowerCase() === 'authorization')
    ) {
      effectiveHeaders = [
        ...effectiveHeaders,
        {
          id: crypto.randomUUID(),
          key: 'Authorization',
          value: `Bearer ${authToken}`,
        },
      ];
    }
    const headerList = effectiveHeaders
      .filter(h => h.key)
      .map(h => `${h.key}: ${h.value}`);
    try {
      pushHistory({
        target,
        service,
        method,
        payload,
        headers: effectiveHeaders.map(h => ({ key: h.key, value: h.value })),
      });
      setLastSentPayload(payload);
      await invoke('run_grpc_call', {
        params: {
          target,
          service,
          method,
          payload,
          proto_files: chosenFiles,
          root_id: rootId ?? null,
          headers: headerList,
        },
      });
    } catch (e: any) {
      toast.error(e.toString());
      setBusy(false);
    }
  };

  const rescan = async () => {
    if (!rootId) {
      toast.error(t('errors.noRoot'));
      return;
    }
    await invoke('scan_proto_root', { root_id: rootId });
  };

  const fillSkeleton = async () => {
    if (!service || !method) return;
    try {
      const skel = await invoke<string>('get_method_skeleton', {
        fq_service: service,
        method,
      });
      setPayload(skel);
    } catch (e: any) {
      toast.error(t('errors.skeletonFailed'));
    }
  };

  const saveHeadersPreset = () => {
    const name = prompt('Preset name?');
    if (!name) return;
    addPreset(
      name,
      headers.filter(h => h.key).map(h => ({ key: h.key, value: h.value }))
    );
  };

  const renamePreset = (id: string) => {
    const pName = prompt('New preset name?');
    if (!pName) return;
    useHeaderPresets.getState().rename(id, pName);
  };

  const loadPreset = (id: string) => {
    const p = applyPreset(id);
    if (!p) return;
    // replace headers by clearing then inserting
    // (extend store minimally by using removeHeader on each existing)
    headers.slice().forEach(h => removeHeader(h.id));
    p.headers.forEach(h => {
      addHeader();
    });
    // fill keys/values (need latest headers after adds)
    setTimeout(() => {
      const current = useRequestStore.getState().headers;
      p.headers.forEach((h, idx) => {
        const row = current[idx];
        if (row) {
          useRequestStore.getState().updateHeader(row.id, 'key', h.key);
          useRequestStore.getState().updateHeader(row.id, 'value', h.value);
        }
      });
    }, 0);
  };

  const renderDiff = () => {
    if (!lastSentPayload) return <em>{t('grpc.noPreviousPayload')}</em>;
    try {
      const before = JSON.stringify(JSON.parse(lastSentPayload), null, 2).split(
        '\n'
      );
      const after = JSON.stringify(JSON.parse(payload), null, 2).split('\n');
      // simple line diff
      const max = Math.max(before.length, after.length);
      const rows: React.ReactNode[] = [];
      for (let i = 0; i < max; i++) {
        const b = before[i];
        const a = after[i];
        if (b === a)
          rows.push(
            <div key={i} style={{ opacity: 0.5 }}>
              {a}
            </div>
          );
        else
          rows.push(
            <div key={i} style={{ background: '#331', color: '#fdd' }}>
              <div>{b || ''}</div>
              <div style={{ background: '#133', color: '#cfd' }}>{a || ''}</div>
            </div>
          );
      }
      return (
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {rows}
        </div>
      );
    } catch {
      return <em>{t('errors.diffParseError')}</em>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
      <Card className="lg:col-span-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {t('grpc.configuration')}
            </CardTitle>
            <LanguageSwitcher />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="root-path" className="text-xs">
              {t('protoFiles.protoRootPath')}
            </Label>
            <Input
              id="root-path"
              value={rootPath}
              onChange={e => setRootPath(e.target.value)}
              placeholder={t('protoFiles.pathPlaceholder')}
            />
          </div>
          <div className="mt-1 flex gap-2 items-center">
            <Button onClick={registerRoot} disabled={!rootPath || indexing}>
              {indexing ? t('common.loading') : t('protoFiles.scanDirectory')}
            </Button>
            <Button
              variant="secondary"
              onClick={rescan}
              disabled={!rootId || indexing}
            >
              {t('common.refresh')}
            </Button>
            {rootId && !indexing && (
              <span className="text-[11px] opacity-70">id: {rootId}</span>
            )}
          </div>
          {knownRoots.length > 0 && (
            <div className="mt-2">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">
                  {t('protoFiles.knownRoots')}
                </Label>
                <Select
                  value={rootId || ''}
                  onValueChange={async sel => {
                    if (!sel) return;
                    setRootId(sel);
                    const chosen = knownRoots.find(r => r.id === sel);
                    if (chosen) setRootPath(chosen.path);
                    await invoke('scan_proto_root', { root_id: sel });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('protoFiles.selectRoot')} />
                  </SelectTrigger>
                  <SelectContent>
                    {knownRoots.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {rootId && (
                <div className="mt-1 flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!rootId) return;
                      if (!confirm(t('protoFiles.confirmRemove'))) return;
                      try {
                        await invoke('remove_proto_root', { root_id: rootId });
                        setRootId(undefined);
                      } catch (e: any) {
                        toast.error(t('errors.removeFailed'));
                      }
                    }}
                  >
                    {t('protoFiles.removeRoot')}
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="project-path" className="text-xs">
              {t('protoFiles.projectPath')}
            </Label>
            <Input
              id="project-path"
              value={projectPath}
              onChange={e => setProjectPath(e.target.value)}
              placeholder={t('common.optional')}
            />
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center">
              <strong className="text-xs uppercase tracking-wide">
                {t('protoFiles.title')}
              </strong>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  onClick={selectAllFiles}
                  disabled={!protoFiles.length}
                >
                  {t('common.selectAll')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearFiles}
                  disabled={!protoFiles.length}
                >
                  {t('common.selectNone')}
                </Button>
              </div>
            </div>
            <ProtoFileTree height={180} />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t('grpc.request')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="target" className="text-xs">
              {t('grpc.target')}
            </Label>
            <Input
              id="target"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder={t('grpc.targetPlaceholder')}
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">{t('grpc.service')}</Label>
              <Select
                value={service}
                onValueChange={val => {
                  setService(val);
                  setMethod('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('grpc.selectService')} />
                </SelectTrigger>
                <SelectContent>
                  {services
                    .filter(s => selectedFiles[s.file])
                    .map(s => (
                      <SelectItem key={s.fq_service} value={s.fq_service}>
                        {s.fq_service}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">{t('grpc.method')}</Label>
              <Select
                value={method}
                onValueChange={setMethod}
                disabled={!service}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('grpc.selectMethod')} />
                </SelectTrigger>
                <SelectContent>
                  {service &&
                    byService[service]?.methods
                      .filter(m => !m.streaming)
                      .map(m => (
                        <SelectItem key={m.name} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="secondary"
              disabled={!service || !method}
              onClick={fillSkeleton}
            >
              {t('grpc.skeleton')}
            </Button>
          </div>
          <div className="space-y-1">
            <Label htmlFor="payload" className="text-xs">
              {t('grpc.requestPayload')}
            </Label>
            <Textarea
              id="payload"
              className={`min-h-[120px] ${payloadError ? 'border-red-500' : ''}`}
              value={payload}
              onChange={e => {
                setPayload(e.target.value);
                validatePayload(e.target.value);
              }}
              placeholder={t('grpc.payloadPlaceholder')}
            />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Button variant="secondary" type="button" onClick={formatPayload}>
              {t('common.format')}
            </Button>
            {payloadError && (
              <span className="text-red-500 text-xs">{payloadError}</span>
            )}
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowDiff(s => !s)}
              disabled={!lastSentPayload}
            >
              {showDiff ? t('common.hideDiff') : t('common.showDiff')}
            </Button>
          </div>
          {showDiff && <div className="mt-2">{renderDiff()}</div>}
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t('grpc.headers')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {presets.length > 0 && (
              <select
                onChange={e => {
                  if (e.target.value) {
                    removePreset(e.target.value);
                    e.target.selectedIndex = 0;
                  }
                }}
                defaultValue=""
              >
                <option value="">{t('grpc.deletePreset')}</option>
                {presets.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <Button variant="secondary" type="button" onClick={addHeader}>
              {t('grpc.addHeader')}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={saveHeadersPreset}
              disabled={!headers.length}
            >
              {t('grpc.savePreset')}
            </Button>
            <select
              onChange={e => e.target.value && loadPreset(e.target.value)}
              defaultValue=""
            >
              <option value="">{t('grpc.loadPreset')}</option>
              {presets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {presets.length > 0 && (
              <select
                onChange={e => {
                  if (e.target.value) {
                    renamePreset(e.target.value);
                    e.target.selectedIndex = 0;
                  }
                }}
                defaultValue=""
              >
                <option value="">{t('grpc.renamePreset')}</option>
                {presets.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {headers.map(h => (
            <div key={h.id} className="flex gap-2 mt-1">
              <Input
                className="flex-1"
                value={h.key}
                placeholder={t('grpc.headerKey')}
                onChange={e => updateHeader(h.id, 'key', e.target.value)}
              />
              <Input
                className="flex-1"
                value={h.value}
                placeholder={t('grpc.headerValue')}
                onChange={e => updateHeader(h.id, 'value', e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeHeader(h.id)}
              >
                ×
              </Button>
            </div>
          ))}

          <div className="space-y-2 border-t border-neutral-700 pt-4">
            <div className="space-y-1">
              <Label htmlFor="auth-token" className="text-xs">
                {t('grpc.authToken')}
              </Label>
              <Input
                id="auth-token"
                type="text"
                value={authToken}
                onChange={e => setAuthToken(e.target.value)}
                placeholder={t('grpc.authTokenPlaceholder')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-auth"
                checked={autoAuth}
                onCheckedChange={setAutoAuth}
              />
              <Label htmlFor="auto-auth" className="text-xs">
                {t('grpc.autoAuth')}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              {t('grpc.executeRequest')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              disabled={busy}
              onClick={run}
              className="w-full h-10 text-base"
            >
              {busy ? t('common.loading') : t('grpc.sendRequest')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{t('grpc.response')}</CardTitle>
            {lastResponse && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    try {
                      const text = JSON.stringify(lastResponse.data, null, 2);
                      await navigator.clipboard.writeText(text);
                      toast.success(t('response.copySuccess'));
                    } catch (e) {
                      try {
                        const text = JSON.stringify(lastResponse.data, null, 2);
                        const ta = document.createElement('textarea');
                        ta.value = text;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                        toast.success(t('response.copySuccess'));
                      } catch (err) {
                        toast.error(t('response.copyFail'));
                      }
                    }
                  }}
                  title={t('response.copy')}
                >
                  {t('response.copy')}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {lastResponse ? (
              <pre className="bg-neutral-950 text-neutral-100 p-3 max-h-[300px] overflow-auto rounded border">
                {JSON.stringify(lastResponse.data, null, 2)}
              </pre>
            ) : (
              <em className="text-neutral-400">{t('grpc.noResponse')}</em>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{t('history.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap mb-4">
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm(t('history.confirmClear')))
                    useHistoryStore.getState().clear();
                }}
              >
                {t('history.clear')}
              </Button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {history.length === 0 && (
                <em className="text-neutral-400">{t('history.noCalls')}</em>
              )}
              {history.slice(0, 15).map(h => {
                const kind = ((): string | undefined => {
                  if (!lastResponse) return undefined;
                  const d: any = lastResponse.data;
                  if (d && d.kind) return d.kind;
                  return undefined;
                })();
                const kindColors = {
                  unknown_service: 'bg-orange-600',
                  unknown_method: 'bg-orange-600',
                  dial_failure: 'bg-red-600',
                  timeout: 'bg-yellow-600',
                  permission_denied: 'bg-red-600',
                  unauthenticated: 'bg-red-600',
                  unavailable: 'bg-red-600',
                };
                return (
                  <div
                    key={h.id}
                    className="flex gap-2 text-xs border-b border-neutral-700 pb-2 items-center"
                  >
                    <span
                      className={`w-8 text-center font-semibold text-xs px-1 py-0.5 rounded ${h.ok === undefined ? 'text-neutral-400' : h.ok ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {h.ok === undefined ? '…' : h.ok ? 'OK' : 'ERR'}
                    </span>
                    <span className="flex-1 truncate">
                      {h.service}.{h.method}
                    </span>
                    <span className="text-neutral-400">
                      {new Date(h.at).toLocaleTimeString()}
                    </span>
                    {h.tookMs !== undefined && (
                      <span className="text-neutral-400">{h.tookMs}ms</span>
                    )}
                    {kind && (
                      <span
                        className={`text-white px-2 py-0.5 rounded text-[10px] ${kindColors[kind as keyof typeof kindColors] || 'bg-neutral-600'}`}
                      >
                        {kind}
                      </span>
                    )}
                    <span title="headers" className="text-neutral-400">
                      {h.headers.length}h
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setService(h.service);
                        setMethod(h.method);
                        setTarget(h.target);
                        setPayload(h.payload);
                      }}
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => useHistoryStore.getState().remove(h.id)}
                      title={t('history.deleteEntry')}
                    >
                      ✕
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
