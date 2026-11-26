"use client";

import { useEffect, useState } from "react";

type Review = { title: string; description: string; edits: Record<string, { common: string; scientific: string; hidden?: boolean; source?: string }> };
const editor = "http://127.0.0.1:4179";

type Bird = { entry?: string; id: string; filename?: string; common: string; scientific: string; confidence?: number };

export function BirdTable({ birds, initial }: { birds: Bird[]; initial: Review }) {
  const [review, setReview] = useState(initial);
  const [version, setVersion] = useState("");
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (window.location.origin === "http://127.0.0.1:4178") {
      fetch(editor).then(r => r.json()).then(data => {
        setVersion(data.version);
        setReview(data.review);
      }).catch(() => {});
    }
  }, []);
  async function save(action: "draft" | "finalize") {
    setBusy(true);
    try {
      const r = await fetch(editor + "/" + action, {method: "POST",
        headers: {"Content-Type": "application/json"}, body: JSON.stringify({version, review})});
      const data = await r.json();
      if (!r.ok) throw new Error(data);
      setVersion(data.version);
      setStatus(action === "draft" ? "Draft saved locally." : "Finalized in the local site files.");
      if (action === "finalize") setEditing(false);
    } catch (error) { setStatus(String(error)); } finally { setBusy(false); }
  }
  function change(id: string, common: string, scientific: string) {
    setReview({...review, edits: {...review.edits, [id]: {...review.edits[id], common, scientific}}});
    setStatus("Unsaved edits");
  }
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("common-asc");
  const [minimum, setMinimum] = useState("");
  const [field, direction] = order.split("-");
  const reviewed = birds.map(original => {
    const key = original.entry ?? original.id + "/" + original.common;
    const edit = review.edits[key];
    return {...original, ...edit, key, original, confidence: edit && (edit.source || edit.common !== original.common) ? undefined : original.confidence};
  });
  const species = new Set(reviewed
    .filter(bird => !bird.hidden && (bird.scientific || bird.common === bird.original.common))
    .map(bird => bird.common.replace(/ *\(tentative\)$/i, "").trim().toLowerCase()));
  const rows = reviewed.filter(bird => {
    const names = [bird.common, bird.scientific, bird.filename, bird.original.common].join(" ").toLowerCase();
    return (editing || !bird.hidden) && names.includes(query.trim().toLowerCase()) &&
      (!minimum || (bird.confidence ?? -1) * 100 >= Number(minimum));
  }).sort((a, b) => {
    if (field === "confidence" && (a.confidence == null) !== (b.confidence == null)) {
      return a.confidence == null ? 1 : -1;
    }
    const by = field === "confidence"
      ? (a.confidence ?? -1) - (b.confidence ?? -1)
      : field === "scientific" ? a.scientific.localeCompare(b.scientific) : a.common.localeCompare(b.common);
    return (direction === "asc" ? by : -by) || a.id.localeCompare(b.id);
  });
  if (!birds.length) return <p>No bird photographs have been cataloged yet.</p>;
  return <section className="bird-gallery">
    <header className="page-header"><h1>{review.title}</h1><p><strong>{species.size} unique species</strong></p><p>{review.description}</p></header>
    {version && <p><button onClick={() => setEditing(!editing)}>{editing ? "Preview edits" : "Edit locally"}</button></p>}
    {editing && <fieldset disabled={busy}>
      <legend>Local gallery review</legend>
      <label>Page title <input value={review.title} onChange={e => {setReview({...review, title:e.target.value}); setStatus("Unsaved edits");}} /></label>
      <label>Page description <textarea value={review.description} onChange={e => {setReview({...review, description:e.target.value}); setStatus("Unsaved edits");}} /></label>
      <button onClick={() => save("draft")}>Save draft</button>
      <button onClick={() => save("finalize")}>Finalize locally</button>
    </fieldset>}
    <p role="status">{status}</p>
    <div className="bird-controls">
      <label>Search by bird or file name <input type="search" value={query}
        onChange={event => setQuery(event.target.value)} /></label>
      <label>Minimum confidence (%) <input type="number" min="0" max="100" step="any"
        value={minimum} onChange={event => setMinimum(event.target.value)} /></label>
      <label>Sort by <select value={order} onChange={event => setOrder(event.target.value)}>
        <option value="common-asc">Common name A–Z</option>
        <option value="common-desc">Common name Z–A</option>
        <option value="scientific-asc">Scientific name A–Z</option>
        <option value="scientific-desc">Scientific name Z–A</option>
        <option value="confidence-desc">Highest confidence</option>
        <option value="confidence-asc">Lowest confidence</option>
      </select></label>
    </div>
    <p aria-live="polite">{rows.length} matching {rows.length === 1 ? "entry" : "entries"}</p>
    <table><thead><tr><th>Photo</th><th>File name</th><th>Suggested identification</th><th aria-sort={field !== "confidence" ? "none" : direction === "asc" ? "ascending" : "descending"}>
      <button onClick={() => setOrder(order === "confidence-desc" ? "confidence-asc" : "confidence-desc")}>
        BirdTrace confidence {field !== "confidence" ? "↕" : direction === "asc" ? "↑" : "↓"}
      </button>
    </th></tr></thead>
      <tbody>{rows.map(bird => <tr key={bird.key}>
        <td><a href={`/bird-photos/${bird.id}.jpg`}>
          <img width="100" loading="lazy" src={`/bird-photos/${bird.id}-thumb.jpg`}
            alt={`Enlarge photograph of suspected ${bird.common}`} />
        </a></td>
        <td><a href={`/bird-photos/${bird.id}.jpg`}>{bird.filename || "Open photograph"}</a>
        </td>
        <td>{editing ? <>
          <input aria-label="Bird name" value={bird.common} onChange={e => change(bird.key, e.target.value, "")} />
          <input aria-label="Scientific name" value={bird.scientific} onChange={e => change(bird.key, bird.common, e.target.value)} />
          <small>Suggested: {bird.original.common}</small>
          <label><input type="checkbox" checked={!!bird.hidden} onChange={e => {
            setReview({...review, edits: {...review.edits, [bird.key]: {
              common: bird.common, scientific: bird.scientific, hidden: e.target.checked
            }}});
            setStatus("Unsaved edits");
          }} /> Hide row</label>
          {review.edits[bird.key] && <button onClick={() => {
            const edits = {...review.edits}; delete edits[bird.key];
            setReview({...review, edits}); setStatus("Unsaved edits");
          }}>Restore suggestion</button>}
        </> : <>{bird.common}<br/><i>{bird.scientific}</i></>}</td>
        <td>{bird.confidence == null ? (bird.source || "Edited") : (100 * bird.confidence).toFixed(1) + "%"}</td>
      </tr>)}</tbody>
    </table>
  </section>;
}
