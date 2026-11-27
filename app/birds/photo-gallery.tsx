"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";

export type GalleryPhoto = {
  id: string; filename: string; album: string; src: string;
  date: string | null; width?: number; height?: number;
  species: { common: string; scientific: string }[];
};

function Caption({ photo }: { photo: GalleryPhoto }) {
  return <>{photo.species.map(bird => <span className="photo-caption" key={bird.common}>
    <strong>{bird.common}</strong>{bird.scientific && <i>{bird.scientific}</i>}
  </span>)}</>;
}

export function PhotoGallery({ photos, total }: { photos: GalleryPhoto[]; total: number }) {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("name-asc");
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return photos.filter(p => [p.filename, ...p.species.flatMap(b => [b.common, b.scientific])]
      .some(value => value.toLowerCase().includes(term))).sort((a, b) => {
        const byName = a.species[0].common.localeCompare(b.species[0].common, "en");
        if (order.startsWith("date")) {
          if (!!a.date !== !!b.date) return a.date ? -1 : 1;
          const byDate = (a.date ?? "").localeCompare(b.date ?? "");
          if (byDate) return order === "date-desc" ? -byDate : byDate;
        }
        return (order === "name-desc" ? -byName : byName) || a.filename.localeCompare(b.filename, "en") || a.id.localeCompare(b.id);
      });
  }, [photos, query, order]);
  const active = visible[index];
  function step(delta: number) { setIndex(i => Math.max(0, Math.min(visible.length - 1, i + delta))); }

  return <article className="photo-gallery">
    <header className="photo-heading"><div><h1>Birds</h1><p>{total} unique species</p></div><a href="/bird-list">Bird list ↗</a></header>
    <div className="photo-controls">
      <label>Search<input type="search" placeholder="Species or filename" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <label>Order by<select value={order} onChange={e => setOrder(e.target.value)}>
        <option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option>
        <option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option>
      </select></label>
    </div>
    {!visible.length && <p role="status">No photos match your search.</p>}
    <div className="photo-wall">{visible.map((photo, i) => {
      const ratio = Math.min(2.4, Math.max(0.65, (photo.width ?? 3) / (photo.height ?? 2)));
      return <button key={photo.id} type="button" className="photo-tile" style={{"--ratio": ratio} as CSSProperties}
        onClick={() => { setIndex(i); dialog.current?.showModal(); }}>
        <img loading={i < 3 ? "eager" : "lazy"} decoding="async" src={photo.src} alt="" />
        <Caption photo={photo} />
      </button>;
    })}</div>
    <dialog ref={dialog} className="photo-viewer" aria-label="Photograph details"
      onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}
      onKeyDown={e => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); step(e.key === "ArrowLeft" ? -1 : 1); }
      }}>
      {active && <div className="viewer-body">
        <div className="viewer-actions"><button onClick={() => step(-1)} disabled={index === 0}>← Previous</button>
          <button onClick={() => step(1)} disabled={index === visible.length - 1}>Next →</button>
          <button autoFocus onClick={() => dialog.current?.close()}>Close ×</button></div>
        <img src={active.src} alt={active.species.map(b => b.common).join(", ")} />
        <Caption photo={active} /><dl>
          <dt>File</dt><dd><a href={active.src}>{active.filename}</a></dd>
          <dt>Captured</dt><dd>{active.date ?? "Date unavailable"}</dd>
          <dt>Album</dt><dd>{active.album}</dd>
          {active.width && active.height && <><dt>Original dimensions</dt><dd>{active.width} × {active.height} px</dd></>}
        </dl>
      </div>}
    </dialog>
  </article>;
}
