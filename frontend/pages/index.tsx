import { useState, useEffect } from 'react';
import axios from 'axios';

type Row = { block: string; region?: string; notes?: string; street?: string; postal?: string; liftcode?: string; sidebyside?: string; height?: string; keyhole?: string; created_at?: string; updated_at?: string };

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [block, setBlock] = useState('');
  const [region, setRegion] = useState('');
  const [notes, setNotes] = useState('');
  const [liftcode, setLiftcode] = useState('');
  const [sidebyside, setSidebyside] = useState('');
  const [height, setHeight] = useState('');
  const [keyhole, setKeyhole] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  // date filter (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0,10);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // load existing lifts on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get('http://localhost:3001/lifts');
        if (mounted && Array.isArray(res.data)) setRows(res.data);
      } catch (e) {
        console.warn('failed to load lifts', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Helpers to format timestamps in UTC+8
  function toUtc8Date(dateStr?: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    // shift to UTC+8 by adding 8 hours
    const tz8 = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    return tz8;
  }

  function formatUtc8(dateStr?: string) {
    const d = toUtc8Date(dateStr);
    if (!d) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    const mm = pad(d.getUTCMonth() + 1);
    const dd = pad(d.getUTCDate());
    const hh = pad(d.getUTCHours());
    const min = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }

  function dateOnlyUtc8(dateStr?: string) {
    const d = toUtc8Date(dateStr);
    if (!d) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    const mm = pad(d.getUTCMonth() + 1);
    const dd = pad(d.getUTCDate());
    return `${yyyy}-${mm}-${dd}`;
  }

  async function addRow() {
    // try to lookup address
    let street = '';
    let postal = '';
    try {
      const r = await axios.get('http://localhost:3001/lifts/lookup', { params: { block, region } });
      if (r.data) { street = r.data.address || ''; postal = r.data.postal || ''; }
    } catch (e) { console.warn('lookup failed', e); }

    const payload = { block, street, postal, region, notes, liftcode, sidebyside, height, keyhole };

    if (editingId) {
      // update existing
      try {
        const res = await axios.put(`http://localhost:3001/lifts/${editingId}`, payload);
        if (res?.data) {
          setRows(prev => prev.map(r => (r.id === editingId ? res.data : r)));
          setEditingId(null);
        }
      } catch (e) {
        console.error('failed to update lift', e);
        alert('Failed to update on server.');
      }
      return;
    }

    const now = new Date().toISOString();
    const newRow: Row = { block, region, notes, street, postal, liftcode, sidebyside, height, keyhole, created_at: now, updated_at: now };

    // optimistic UI update
    setRows(prev => [...prev, newRow]);

    // persist to backend
    try {
      const res = await axios.post('http://localhost:3001/lifts', payload);

      // replace optimistic row with server-provided row (if returned)
      if (res?.data) {
        setRows(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], ...res.data };
          return copy;
        });
      }
    } catch (e) {
      console.error('failed to save lift', e);
      // keep local copy and notify user
      alert('Failed to save to server; saved locally only.');
    }
  }

  function clearForm() {
    setBlock(''); setRegion(''); setNotes(''); setLiftcode(''); setSidebyside(''); setHeight(''); setKeyhole('');
    setEditingId(null);
  }

  function editRow(row: Row) {
    setEditingId(row.id ?? null);
    setBlock(row.block || '');
    setRegion(row.region || '');
    setNotes(row.notes || '');
    setLiftcode(row.liftcode || '');
    setSidebyside(row.sidebyside || '');
    setHeight(row.height || '');
    setKeyhole(row.keyhole || '');
  }

  async function deleteRow(id?: number) {
    if (!id) return;
    if (!confirm('Delete this row?')) return;
    try {
      await axios.delete(`http://localhost:3001/lifts/${id}`);
      setRows(prev => prev.filter(r => r.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (e) {
      console.error('failed to delete', e);
      alert('Failed to delete on server');
    }
  }

  async function downloadCsv() {
    // send currently filtered rows to backend to generate csv
    try {
      const payloadRows = rows
        .filter(r => dateOnlyUtc8(r.updated_at) === selectedDate)
        .sort((a,b) => (Date.parse(b.updated_at||'')||0) - (Date.parse(a.updated_at||'')||0))
        .map(r => ({ ...r, updated_at: formatUtc8(r.updated_at) }));
      const res = await axios.post('http://localhost:3001/lifts/csv', { rows: payloadRows }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'lifts.csv';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) {
      // fallback: generate client-side
      const payloadRows = rows
        .filter(r => dateOnlyUtc8(r.updated_at) === selectedDate)
        .sort((a,b) => (Date.parse(b.updated_at||'')||0) - (Date.parse(a.updated_at||'')||0))
        .map(r => ({ ...r, updated_at: formatUtc8(r.updated_at) }));
      const csv = [Object.keys(payloadRows[0] || {}).join(','), ...payloadRows.map(r => Object.values(r).map(v => '"'+(v||'')+'"').join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'lifts.csv'; document.body.appendChild(a); a.click(); a.remove();
    }
  }

  const filteredRows = rows
    .filter(r => dateOnlyUtc8(r.updated_at) === selectedDate)
    .sort((a,b) => (Date.parse(b.updated_at||'')||0) - (Date.parse(a.updated_at||'')||0));

  return (
    <div className="container">

      <section className="form">
        <div className="inputs-grid">
          <label className="field inline"><span>Block</span><input value={block} onChange={e => setBlock(e.target.value)} placeholder="e.g. 123" /></label>
          <label className="field inline"><span>Region</span><input value={region} onChange={e => setRegion(e.target.value)} placeholder="Region or floor" /></label>
          <label className="field inline"><span>Lift Code</span><input value={liftcode} onChange={e => setLiftcode(e.target.value)} placeholder="Optional lift code" /></label>
          <label className="field inline"><span>Side-by-side</span><input value={sidebyside} onChange={e => setSidebyside(e.target.value)} placeholder="Yes/No or details" /></label>
          <label className="field inline full"><span>Notes</span><input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" /></label>
          <label className="field inline"><span>Height</span><input value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 2.3m" /></label>
          <label className="field inline"><span>Keyhole</span><input value={keyhole} onChange={e => setKeyhole(e.target.value)} placeholder="Optional keyhole info" /></label>
        </div>

        <div className="actions">
          <button className="btn primary" onClick={addRow}>{editingId ? 'Save' : 'Add'}</button>
          <button className="btn" onClick={clearForm}>Clear</button>
        </div>
      </section>

      <div className="preview-header">
        <div className="date-filter">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Edit</th>
              <th>Block</th>
              <th>Region</th>
              <th>Lift Code</th>
              <th>Side-by-side</th>
              <th>Height</th>
              <th>Keyhole</th>
              <th>Updated At</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, i) => (
              <tr key={i}>
                <td className="row-actions">
                  <button className="btn small" onClick={() => editRow(r)}>Edit</button>
                </td>
                <td>{r.block}</td>
                <td>{r.region}</td>
                <td>{r.liftcode}</td>
                <td>{r.sidebyside}</td>
                <td>{r.height}</td>
                <td>{r.keyhole}</td>
                <td>{r.updated_at}</td>
                <td>{r.notes}</td>
                <td className="row-actions">
                  <button className="btn small danger" onClick={() => deleteRow(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions-bottom">
        <button className="btn" onClick={downloadCsv} disabled={filteredRows.length===0}>Generate CSV</button>
      </div>

      <style jsx>{`
        .container { max-width: 980px; margin: 0 auto; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
        h1 { font-size: 1.2rem; margin-bottom: 12px; }

        .date-filter { margin-bottom: 0px; display: flex; gap: 8px; align-items: center; }
        .date-filter label { font-weight: 600; margin-right: 6px; }
        .date-filter input { padding: 8px 10px; border-radius: 6px; border: 1px solid #ddd; }

        .preview-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 8px; margin-bottom: 8px; }
        @media (max-width: 600px) { .preview-header { flex-direction: column; align-items: flex-start; } }

        .form { background: #fff; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 16px; }
        .inputs-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .field { display: flex; flex-direction: column; font-size: 0.9rem; }
        .field span { margin-bottom: 6px; color: #333; font-weight: 600; }
        .field input { padding: 10px 12px; font-size: 1rem; border: 1px solid #ddd; border-radius: 6px; }
        .field.full { grid-column: 1 / -1; }
        /* inline field: label and input on a single row */
        .field.inline { flex-direction: row; align-items: center; }
        .field.inline span { margin-bottom: 0; margin-right: 8px; width: 88px; flex: 0 0 auto; }
        .field.inline input { flex: 1; min-width: 0; }
        @media (max-width: 380px) { .field.inline span { width: 72px; font-size: 0.9rem; } }

        .actions { display: flex; gap: 8px; margin-top: 10px; }
        .actions-bottom { margin-top: 12px; display: flex; justify-content: center; }
        .actions-bottom .btn { min-width: 160px; }
        .btn { flex: 1; padding: 12px; font-size: 1rem; border-radius: 8px; border: 1px solid #0070f3; background: #fff; color: #0070f3; cursor: pointer; }
        .btn[disabled] { opacity: 0.5; cursor: not-allowed; }
        .btn.primary { background: #0070f3; color: #fff; }
                .btn.small { padding: 6px 8px; font-size: 0.85rem; border-radius: 6px; margin-left: 6px; }
                .btn.danger { border-color: #d00; color: #d00; background: #fff; }

                .table-wrapper { overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                thead th { text-align: left; padding: 8px 6px; background: #f7f7f7; position: sticky; top: 0; }
                tbody td { padding: 8px 6px; border-bottom: 1px solid #f0f0f0; }
                .row-actions { white-space: nowrap; }

                /* Striped rows */
                tbody tr:nth-child(odd) { background: #ffffff; }
                tbody tr:nth-child(even) { background: #f0f4f8; }
                tbody tr:hover { background: #eef6ff; }

                @media (min-width: 700px) {
          .inputs-grid { grid-template-columns: repeat(3, 1fr); }
          .field.full { grid-column: 1 / 4; }
          h1 { font-size: 1.5rem; }
          .btn { max-width: 160px; }
        }

        @media (max-width: 420px) {
          .btn { padding: 14px; font-size: 1.05rem; }
          .field input { padding: 12px; }
        }
      `}</style>
    </div>
  )
}
