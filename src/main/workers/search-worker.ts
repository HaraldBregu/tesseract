import { parentPort } from "worker_threads";

if (!parentPort) {
  throw new Error("Worker must be run via worker_threads!");
}

const buildRegex = (needle: string, caseSensitive: boolean, wholeWords: boolean): RegExp => {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flags = caseSensitive ? 'g' : 'gi';
  const source = wholeWords ? `\\b${escaped}\\b` : escaped;
  return new RegExp(source, flags);
};

parentPort.on("message", (payload: WorkerRequest) => {
  const { chunks, searchTerm, caseSensitive, wholeWords } = payload;

  const out: WorkerResponse = { matches: [] };

  if (!searchTerm || !chunks?.length) {
    parentPort!.postMessage(out);
    return;
  }

  const re = buildRegex(searchTerm, caseSensitive, wholeWords);

  for (const chunk of chunks) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(chunk.text)) !== null) {
      out.matches.push({ chunkId: chunk.id, index: m.index, length: m[0].length });
      if (m.index === re.lastIndex) re.lastIndex++; // zero-length safety
    }
  }

  parentPort!.postMessage(out);
});
