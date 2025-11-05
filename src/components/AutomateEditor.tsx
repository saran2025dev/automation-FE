import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { fetchMethods, sendAutomationData, saveScript, updateScript, loadScript } from '../services/automateService';
import { useAutoSave } from '../hooks/useAutoSave';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleCheck, CircleAlert } from 'lucide-react';

export type Action = {
  id: string;
  method: string;
  url?: string;
  selector?: string;
  value?: string | number;
  timeout?: number;
};

const BLANK_ACTION: Omit<Action, 'id'> = {
  method: '',
  url: '',
  selector: '',
  value: '',
  timeout: 30000,
};

const uuid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());
const needsSel = (m: string) => ['fillInput', 'clickElement', 'selectDropdown', 'selectAutocompleteOption', 'clickElementByText'].includes(m);
const needsVal = (m: string) => ['fillInput', 'selectDropdown', 'selectAutocompleteOption', 'clickElementByText'].includes(m);

interface Props { scriptId?: string; }
const AutomateEditor: React.FC<Props> = ({ scriptId }) => {
  const [title, setTitle] = useState('');
  const [actions, setActions] = useState<Action[]>([]);
  const [methods, setMethods] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [scriptInput, setScriptInput] = useState("");
  const [url, setUrl]= useState("");
  
  useEffect(() => {
  setActions((prev) => {
    if (!prev.length) {
      return [{ id: uuid(), method: 'gotoPage', url, timeout: 30000 }];
    }
    const clone = [...prev];
    clone[0] = { ...clone[0], url };
    return clone;
  });
}, [url]);


useEffect(() => {
  fetchMethods().then(setMethods);

  if (scriptId) {
    loadScript(scriptId).then((s) => {
      setTitle(s.title);
      setActions(s.actions && s.actions.length > 0 ? s.actions : [{ id: uuid(), method: 'gotoPage', url: '', timeout: 30000 }]
      );
    });
  } else {
    const draft = localStorage.getItem('draft-script');
    if (draft) {
      const json = JSON.parse(draft);
      setTitle(json.title ?? '');
      if (Array.isArray(json.actions) && json.actions.length > 0) {
        setActions(json.actions);
      } else {
        setActions([{ id: uuid(), method: 'gotoPage', url: '', timeout: 30000 }]);
      }
    } else {
      setActions([{ id: uuid(), method: 'gotoPage', url: '', timeout: 30000 }]);
    }
  }
}, [scriptId]);


  useAutoSave('draft-script', { title, actions });

  const addAction = useCallback((idx?: number) => {
    setDirty(true);
    setActions((prev) => {
      const clone = [...prev];
      const newOne = { id: uuid(), ...BLANK_ACTION };
      if (idx === undefined) clone.push(newOne);
      else clone.splice(idx, 0, newOne);
      return clone;
    });
  }, []);

  const removeAction = useCallback((index: number) => {
    setDirty(true);
    setActions((p) => p.filter((_, i) => i !== index));
  }, []);

  const cloneAction = useCallback((index: number) => {
    setDirty(true);
    setActions((p) => {
      const clone = [...p];
      clone.splice(index + 1, 0, { ...p[index], id: uuid() });
      return clone;
    });
  }, []);

  const updateField = useCallback(<K extends keyof Action>(i: number, k: K, v: Action[K]) => {
    setDirty(true);
    setActions((p) => p.map((a, idx) => (idx === i ? { ...a, [k]: v } : a)));
  }, []);

  const cleaned = useMemo(() =>
    actions.map(({ id, ...rest }) => {
      Object.entries(rest).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) delete (rest as any)[k];
      });
      return rest;
    }),
    [actions]);

  const save = async () => {
    if (!title.trim()) return toast.error("Title is required!",{icon: <CircleAlert/>});
    if (scriptId) {
      await updateScript(scriptId, { title, actions });
      setDirty(false);
      toast.success("Script updated",{icon: <CircleCheck/>})
    } else {
      const { id } = await saveScript({ title, actions });
      toast.success("Script saved",{icon: <CircleCheck/>})
    }
  };

  const run = async () => {
    setSubmitting(true);
    try {
      await sendAutomationData(cleaned);
      toast.success("Run started",{icon: <CircleCheck/>})
    } catch (e: any) {
      toast.error(`Run error: ${e.message}`,{icon: <CircleAlert/>})
    } finally {
      setSubmitting(false);
    }
  };

  const onDragEnd = (res: DropResult) => {
    if (!res.destination) return;
    setActions((list) => {
      const reordered = [...list];
      const [moved] = reordered.splice(res.source.index, 1);
      reordered.splice(res.destination.index, 0, moved);
      return reordered;
    });
    setDirty(true);
  };

  const loadScriptActions = () => {
    try{
      const parsed = JSON.parse(scriptInput);
      console.log(parsed);
      const scriptWithIds = parsed.map((a) => ({
        id: uuid(),
        timeout: 30000,
        ...a,
      }));
      setActions(scriptWithIds);
      setDirty(true);
      toast.success("Actions loaded into editor",{icon: <CircleCheck/>})
    }catch(err){
      toast.error("Invalid action script",{icon: <CircleAlert/>})
    }
  };
  
  const urlChange = (e)=>{
    setUrl(e.target.value);
  }

  return (
    <div className="w-100 d-flex flex-column bg-gradient bg-body-tertiary">
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        closeButton={false}
        hideProgressBar
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
      />

      <header className="py-3 px-4 border-bottom flex-shrink-0">
        <div className="d-flex align-items-end justify-content-between">
          <div style={{ width: '60%' }}>
            <label className="form-label fw-semibold mb-1">Title</label>
            <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            {/* toggle for active inactive */}
            <button className="btn btn-outline-secondary me-2" onClick={save} disabled={!dirty}>💾 Save</button>
            <button className="btn btn-success" onClick={run} disabled={submitting}>{submitting ? 'Running…' : '▶ Run'}</button>
          </div>
        </div>
      </header>

      <div className="px-4 py-3 border-b">
        <label className="form-label fw-semibold">Load Actions from Script</label>
        <textarea
          className="form-control mb-2"
          rows={5}
          placeholder="Paste your action script here..."
          value={scriptInput}
          onChange={(e) => setScriptInput(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition" onClick={loadScriptActions}>
          Load into Editor
        </button>
      </div>
      
      <div className='px-4 py-3'>
        <label className="form-label fw-semibold mb-1">URL</label>
        <input className="form-control" onChange={(e)=>urlChange(e)} />
      </div>

      <main className="flex-grow-1 overflow-auto px-4 py-3">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="actions">
            {(prov) => (
              <div ref={prov.innerRef} {...prov.droppableProps}>
                {actions.map((a, idx) => (
                  <Draggable key={a.id} draggableId={a.id} index={idx}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} className="card mb-3 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center" {...prov.dragHandleProps}>
                          <span>Step {idx + 1}</span>
                          <div>
                            <button className="btn btn-sm btn-light me-1" onClick={() => cloneAction(idx)}>⧉</button>
                            <button className="btn btn-sm btn-light me-1" onClick={() => addAction(idx + 1)}>＋</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => removeAction(idx)}>✕</button>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="mb-2">
                            <label className="form-label">Method</label>
                            <select className="form-select" value={a.method} onChange={(e) => updateField(idx, 'method', e.target.value)}>
                              <option value="">Select</option>
                              {methods.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>

                          {a.method === 'gotoPage' && (
                            <InputField label="URL" value={a.url} onChange={(v) => updateField(idx, 'url', v)} />
                          )}

                          {needsSel(a.method) && (
                            <InputField label="Selector" value={a.selector} onChange={(v) => updateField(idx, 'selector', v)} placeholder="css:, id:, class:, xpath:" />
                          )}

                          {needsVal(a.method) && (
                            <InputField label="Value" value={String(a.value ?? '')} onChange={(v) => updateField(idx, 'value', v)} />
                          )}

                          {a.method === 'explicitWait' && (
                            <InputField type="number" label="Wait (ms)" value={String(a.value ?? '')} onChange={(v) => updateField(idx, 'value', Number(v))} />
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {prov.placeholder}
                <button className="btn btn-primary w-100" onClick={() => addAction()}>＋ Add Step</button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      <pre className="m-0 p-3 bg-dark text-white small" style={{ maxHeight: 200, overflowY: 'auto' }}>{JSON.stringify(cleaned, null, 2)}</pre>
    </div>
  );
};

interface FieldProps { label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string; }
const InputField: React.FC<FieldProps> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="mb-2">
    <label className="form-label">{label}</label>
    <input type={type} className="form-control" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default AutomateEditor;
