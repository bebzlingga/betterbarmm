"use client";

import { BracketsCurlyIcon, ListBulletsIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { saveRecord } from "./actions";

type Value = unknown;
type Data = Record<string, Value>;
type Kind = "text" | "number" | "boolean" | "list" | "json";

/** How a field is edited, read off its current value. */
function kindOf(value: Value): Kind {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (value === null || typeof value === "string") return "text";
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) return "list";
  return "json";
}

const blank: Record<Kind, Value> = { text: "", number: 0, boolean: false, list: [], json: {} };

export function RecordForm({
  workspace,
  collection,
  recordKey,
  defaultKey,
  initial,
}: {
  workspace: string;
  collection: string;
  /** null for a new record. */
  recordKey: string | null;
  /** A new record's key, filled in for the editor to keep or change. */
  defaultKey?: string;
  initial: Data;
}) {
  const [state, action, pending] = useActionState(saveRecord.bind(null, workspace, collection, recordKey), {
    error: null,
  });
  const [data, setData] = useState<Data>(initial);
  const [raw, setRaw] = useState<string | null>(null);
  // JSON fields whose text does not parse yet; saving waits until they do.
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  // Bumped when raw JSON is applied, so every field re-reads its value.
  const [version, setVersion] = useState(0);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<Kind>("text");

  const set = (name: string, value: Value) => setData((d) => ({ ...d, [name]: value }));
  const invalid = invalidFields;
  let rawError: string | null = null;
  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) rawError = "Must be a JSON object.";
    } catch (e) {
      rawError = (e as Error).message;
    }
  }
  const payload = raw ?? JSON.stringify(data);

  return (
    <form action={action} className="panel overflow-hidden">
      <input type="hidden" name="data" value={payload} />

      <div className="panel-head bg-[var(--surface-2)]">
        {recordKey === null ? (
          <label className="block">
            <span className="field-label">Key</span>
            <input name="key" required defaultValue={defaultKey} className="field field-mono w-72" placeholder="unique id" />
          </label>
        ) : (
          <p className="flex min-w-0 items-center gap-2 text-[13px] text-[var(--ink-3)]">
            Key <code className="field-mono truncate rounded-md bg-[var(--surface)] px-2 py-0.5 text-[var(--ink-2)] shadow-[var(--shadow-sm)]">{recordKey}</code>
          </p>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (raw === null) setRaw(JSON.stringify(data, null, 2));
            else if (!rawError) {
              setData(JSON.parse(raw));
              setInvalidFields([]);
              setVersion((v) => v + 1);
              setRaw(null);
            }
          }}
          disabled={raw !== null && Boolean(rawError)}
        >
          {raw === null ? <BracketsCurlyIcon size={14} aria-hidden="true" /> : <ListBulletsIcon size={14} aria-hidden="true" />}
          {raw === null ? "Edit as JSON" : "Back to fields"}
        </button>
      </div>

      {raw !== null ? (
        <div className="p-4">
          <textarea
            rows={30}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="field field-mono"
            spellCheck={false}
          />
          {rawError ? <p className="mt-1 text-sm text-[var(--accent)]">{rawError}</p> : null}
        </div>
      ) : (
        <div className="divide-y divide-[var(--rule)]">
          {Object.entries(data).map(([name, value]) => (
            <Field
              key={`${name}-${version}`}
              name={name}
              value={value}
              onChange={(v) => set(name, v)}
              onValidity={(ok) =>
                setInvalidFields((list) => (ok ? list.filter((n) => n !== name) : [...new Set([...list, name])]))
              }
              onRemove={() => {
                setData(({ [name]: _gone, ...rest }) => rest);
                setInvalidFields((list) => list.filter((n) => n !== name));
              }}
            />
          ))}
          <div className="flex flex-wrap items-end gap-3 bg-[var(--surface-2)] p-4">
            <label className="block">
              <span className="field-label">New field</span>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className="field w-56" placeholder="name" />
            </label>
            <select value={newKind} onChange={(e) => setNewKind(e.target.value as Kind)} className="field w-auto">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Yes / no</option>
              <option value="list">List of text</option>
              <option value="json">JSON</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!newName.trim() || newName.trim() in data}
              aria-label="Add field"
              onClick={() => {
                set(newName.trim(), blank[newKind]);
                setNewName("");
              }}
            >
              <PlusIcon size={14} weight="bold" aria-hidden="true" /> Add field
            </button>
          </div>
        </div>
      )}

      {/* Stays in reach however long the record is. */}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--rule)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-4 py-3 backdrop-blur">
        <div className="text-sm text-[var(--accent)]" role="alert">
          {state.error ?? (invalid.length ? `Fix the JSON in: ${invalid.join(", ")}` : null)}
        </div>
        <button type="submit" disabled={pending || invalid.length > 0 || Boolean(rawError)} className="btn btn-primary">
          {pending ? "Saving…" : "Save record"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  value,
  onChange,
  onValidity,
  onRemove,
}: {
  name: string;
  value: Value;
  onChange: (value: Value) => void;
  onValidity: (ok: boolean) => void;
  onRemove: () => void;
}) {
  // The field's kind is fixed when it first renders, so typing "12" into a
  // text field does not turn it into a number field mid-edit.
  const [kind] = useState(() => kindOf(value));
  const [jsonText, setJsonText] = useState(() => JSON.stringify(value, null, 2));
  const [jsonOk, setJsonOk] = useState(true);
  let input: React.ReactNode;

  if (kind === "boolean") {
    input = (
      <input type="checkbox" checked={value as boolean} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
    );
  } else if (kind === "number") {
    input = (
      <input
        type="number"
        step="any"
        value={value as number}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="field w-56"
      />
    );
  } else if (kind === "text") {
    const text = (value as string | null) ?? "";
    input =
      text.length > 80 || text.includes("\n") ? (
        <textarea
          rows={Math.min(12, Math.max(3, Math.ceil(text.length / 110)))}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
      ) : (
        <input
          value={text}
          placeholder={value === null ? "(empty)" : undefined}
          // An empty field that started as null stays null.
          onChange={(e) => onChange(e.target.value === "" && value === null ? null : e.target.value)}
          className="field"
        />
      );
  } else if (kind === "list") {
    input = (
      <textarea
        rows={Math.min(10, Math.max(2, (value as string[]).length + 1))}
        value={(value as string[]).join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").filter((line, i, all) => line || i < all.length - 1))}
        className="field"
      />
    );
  } else {
    input = (
      <textarea
        rows={Math.min(16, jsonText.split("\n").length + 1)}
        value={jsonText}
        spellCheck={false}
        onChange={(e) => {
          setJsonText(e.target.value);
          let ok = true;
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            ok = false;
          }
          setJsonOk(ok);
          onValidity(ok);
        }}
        className={`field field-mono ${jsonOk ? "" : "border-[var(--accent)]"}`}
      />
    );
  }

  return (
    <div className="group grid gap-2 px-4 py-3.5 md:grid-cols-[13rem_minmax(0,1fr)_auto] md:items-start">
      <div className="pt-1.5">
        <p className="field-mono break-all text-[12.5px] font-medium text-[var(--ink)]">{name}</p>
        <p className="mt-0.5 text-[11px] text-[var(--ink-mute)]">{kind === "list" ? "list · one per line" : kind}</p>
      </div>
      <div>{input}</div>
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-ghost btn-sm !px-2 text-[var(--ink-mute)] opacity-60 group-hover:opacity-100"
        aria-label={`Remove ${name}`}
        title="Remove field"
      >
        <XIcon size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
