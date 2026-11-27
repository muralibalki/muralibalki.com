"use client";

import { speciesKey, type Bird } from "./species";
import { useEffect, useState } from "react";

type Review = { title: string; description: string; edits: Record<string, { common: string; scientific: string; hidden?: boolean; unsure?: boolean; merlinRequested?: boolean; source?: string }> };
const editor = "http://127.0.0.1:4179";

function photoUrl(bird: Bird, thumbnail = false) {
  const suffix = thumbnail ? "-thumb" : "";
  return bird.archive ? `/all-bird-photos/${bird.id}${suffix}.webp` : `/bird-photos/${bird.id}${suffix}.jpg`;
}

export function BirdTable({ birds, initial, sightingNames, collection = false }: { birds: Bird[]; initial: Review; sightingNames: string[]; collection?: boolean }) {
  const [review, setReview] = useState(initial);
  const [version, setVersion] = useState("");
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!collection && window.location.origin === "http://127.0.0.1:4178") {
      fetch(editor).then(r => r.json()).then(data => {
        setVersion(data.version);
        setReview(data.review);
      }).catch(() => {});
    }
  }, [collection]);
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
    .filter(bird => !bird.hidden && !bird.unsure && (bird.scientific || bird.common === bird.original.common))
    .map(bird => speciesKey(bird.common)));
  const unpictured = sightingNames.filter(name => !species.has(speciesKey(name)));
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
  const unsureCount = reviewed.filter(bird => bird.unsure && !bird.hidden).length;
  const mainRows = rows.filter(bird => !bird.unsure);
  const unsureRows = rows.filter(bird => bird.unsure);
  function renderTable(items: typeof rows, uncertain: boolean) {
    return <table className={uncertain ? "unsure-birds" : undefined}><thead><tr><th>Photo</th><th>File name</th><th>Suggested identification</th><th aria-sort={field !== "confidence" ? "none" : direction === "asc" ? "ascending" : "descending"}>
      <button onClick={() => setOrder(order === "confidence-desc" ? "confidence-asc" : "confidence-desc")}>
        BirdTrace confidence {field !== "confidence" ? "↕" : direction === "asc" ? "↑" : "↓"}
      </button>
    </th></tr></thead>
      <tbody>{items.map(bird => <tr key={bird.key}>
        <td><a href={photoUrl(bird)}>
          <img width="100" loading="lazy" src={photoUrl(bird, true)}
            alt={`Enlarge photograph of suspected ${bird.common}`} />
        </a></td>
        <td><a href={photoUrl(bird)}>{bird.filename || "Open photograph"}</a>
        </td>
        <td>{bird.merlinRequested && <small>Merlin review requested</small>}{editing ? <>
          <input aria-label="Bird name" value={bird.common} onChange={e => change(bird.key, e.target.value, "")} />
          <input aria-label="Scientific name" value={bird.scientific} onChange={e => change(bird.key, bird.common, e.target.value)} />
          <small>Suggested: {bird.original.common}</small>
          <label><input type="checkbox" checked={!!bird.hidden} onChange={e => {
            setReview({...review, edits: {...review.edits, [bird.key]: {
              ...review.edits[bird.key], common: bird.common, scientific: bird.scientific, hidden: e.target.checked
            }}});
            setStatus("Unsaved edits");
          }} /> Hide row</label>
          {review.edits[bird.key] && <button onClick={() => {
            const edits = {...review.edits}; delete edits[bird.key];
            setReview({...review, edits}); setStatus("Unsaved edits");
          }}>Restore suggestion</button>}
        </> : <>{bird.common}<br/><i>{bird.scientific}</i></>}</td>
        <td>{bird.confidence == null ? (bird.source || (bird.confirmed ? "User confirmed" : "Edited")) : (100 * bird.confidence).toFixed(1) + "%"}</td>
      </tr>)}</tbody>
    </table>;
  }
  if (!birds.length) return <p>No bird photographs have been cataloged yet.</p>;
  return <section className="bird-gallery">
    <header className="page-header"><h1>{review.title}</h1><p className="bird-species-count"><strong>{species.size + unpictured.length} unique species</strong></p>{unsureCount > 0 && <p><a href="#unsure">Unsure identifications ({unsureCount}) ↓</a></p>}{unpictured.length > 0 && <p>{species.size} photographed · Seen without a linked photo: {unpictured.join(", ")}</p>}</header>
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
    {renderTable(mainRows, false)}
    {unsureCount > 0 && <section id="unsure"><h2>Unsure identifications</h2>
      <p>These sightings are excluded from the species total.</p>
      {unsureRows.length ? renderTable(unsureRows, true) : <p>No unsure identifications match your filters. <button onClick={() => { setQuery(""); setMinimum(""); }}>Clear filters</button></p>}
    </section>}
    <p className="bird-methods">{review.description} Species suggestions by <a href="https://huggingface.co/warden123/BirdTrace-FastViT-MA36-10K">BirdTrace FastViT-MA36-10K</a> (CC BY-NC 4.0), with regional ranking by <a href="https://birdnet.cornell.edu/">BirdNET</a>.</p>
  </section>;
}
