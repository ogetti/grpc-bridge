import React, { useMemo, useCallback } from 'react';
import Tree from 'rc-tree';
// rc-tree typings: use type-only imports from internal declarations
import type { DataNode, EventDataNode } from 'rc-tree/lib/interface';
import 'rc-tree/assets/index.css';
import { Checkbox } from './ui/Checkbox';
import { useProtoFiles } from '../state/protoFiles';

interface NodeInternal {
  name: string;
  path: string;
  children?: NodeInternal[];
  file?: boolean;
}

function buildTree(files: string[]): NodeInternal {
  const root: NodeInternal = { name: '', path: '', children: [] };
  for (const file of files) {
    const parts = file.split('/').filter(Boolean);
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      if (!cur.children) cur.children = [];
      let next = cur.children.find(c => c.name === part);
      if (!next) {
        next = {
          name: part,
          path: (cur.path ? cur.path + '/' : '') + part,
          children: isFile ? undefined : [],
          file: isFile,
        };
        cur.children.push(next);
      }
      cur = next;
    }
  }
  return root;
}

interface Props {
  height?: number;
}

export const ProtoFileTree: React.FC<Props> = ({ height = 160 }) => {
  const files = useProtoFiles(s => s.files);
  const selected = useProtoFiles(s => s.selected);
  const expanded = useProtoFiles(s => s.expanded);
  const toggle = useProtoFiles(s => s.toggle);
  const toggleFolder = useProtoFiles(s => s.toggleFolder);
  const selectFolder = useProtoFiles(s => s.selectFolder);

  const tree = useMemo(() => buildTree(files), [files]);

  const collectFiles = (node: NodeInternal): string[] => {
    if (node.file) return [node.path];
    return (node.children || []).flatMap(collectFiles);
  };

  const mapNode = useCallback(
    (n: NodeInternal): DataNode | null => {
      if (n.path === '') return null; // skip artificial root
      const isFolder = !n.file;
      const filesUnder = isFolder ? collectFiles(n) : [];
      const allSelected = isFolder ? filesUnder.every(f => selected[f]) : false;
      const partiallySelected =
        isFolder && !allSelected && filesUnder.some(f => selected[f]);
      const title = (
        <div className="flex items-center gap-1 text-[11px]">
          {isFolder ? (
            <>
              <Checkbox
                checked={
                  allSelected
                    ? true
                    : partiallySelected
                      ? ('indeterminate' as any)
                      : false
                }
                onCheckedChange={() => selectFolder(n.path, filesUnder)}
                onClick={e => e.stopPropagation()}
              />
              <span
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  selectFolder(n.path, filesUnder);
                }}
              >
                {n.name || '(root)'}
              </span>
            </>
          ) : (
            <>
              <Checkbox
                checked={!!selected[n.path]}
                onCheckedChange={() => toggle(n.path)}
                onClick={e => e.stopPropagation()}
              />
              <span
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  toggle(n.path);
                }}
              >
                {n.name}
              </span>
            </>
          )}
        </div>
      );
      return {
        key: n.path,
        title,
        isLeaf: !!n.file,
        children:
          isFolder && n.children
            ? (n.children
                .sort((a, b) => {
                  if (!!a.file === !!b.file)
                    return a.name.localeCompare(b.name);
                  return a.file ? 1 : -1;
                })
                .map(c => mapNode(c)!)
                .filter(Boolean) as DataNode[])
            : undefined,
      };
    },
    [selected, toggle, selectFolder]
  );

  const data: DataNode[] = useMemo(() => {
    if (!tree.children) return [];
    return tree.children
      .sort((a, b) => {
        if (!!a.file === !!b.file) return a.name.localeCompare(b.name);
        return a.file ? 1 : -1;
      })
      .map(c => mapNode(c)!)
      .filter(Boolean) as DataNode[];
  }, [tree, mapNode]);

  const expandedKeys = useMemo(
    () => Object.keys(expanded).filter(k => expanded[k] && k !== ''),
    [expanded]
  );

  const onExpand = (
    keys: React.Key[],
    _info: { node: EventDataNode<DataNode> }
  ) => {
    const current = new Set(expandedKeys);
    const incoming = new Set(keys.map(String));
    current.forEach(k => {
      if (!incoming.has(k)) toggleFolder(k);
    });
    incoming.forEach(k => {
      if (!current.has(k)) toggleFolder(k);
    });
  };
  return (
    <div
      className="border border-neutral-700 rounded p-1 overflow-auto bg-neutral-900"
      style={{ maxHeight: height }}
    >
      {files.length === 0 && (
        <em className="opacity-70 text-[11px]">No proto files (scan root)</em>
      )}
      <Tree
        treeData={data}
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        selectable={false}
        showIcon={false}
        showLine={false}
        virtual={false}
        className="proto-tree [&_.rc-tree-treenode]:py-0.5 [&_.rc-tree-switcher]:w-3 [&_.rc-tree-indent-unit]:w-3 text-neutral-200"
      />
    </div>
  );
};
