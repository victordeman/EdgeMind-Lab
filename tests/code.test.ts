import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

const CODE_DIR = path.join(process.cwd(), "public", "code");

function filesWithExtension(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesWithExtension(full, extension);
    return entry.name.endsWith(extension) ? [full] : [];
  });
}

function available(command: string, args: string[]): boolean {
  return spawnSync(command, args, { stdio: "ignore" }).status === 0;
}

const pythonFiles = filesWithExtension(CODE_DIR, ".py");
const sketches = filesWithExtension(CODE_DIR, ".ino");
const hasPython = available("python3", ["--version"]);
const hasArduinoCli = available("arduino-cli", ["version"]);

if (!hasPython)
  console.warn("python3 not found: Python lab files were not compiled.");
if (!hasArduinoCli) {
  console.warn("arduino-cli not found: Arduino sketches were not compiled.");
}

describe("downloadable lab code", () => {
  it("includes at least one Python file and one sketch", () => {
    expect(pythonFiles.length).toBeGreaterThan(0);
    expect(sketches.length).toBeGreaterThan(0);
  });

  it
    .skipIf(!hasPython)
    .each(pythonFiles.map((file) => [path.relative(CODE_DIR, file), file]))(
    "%s compiles with python -m py_compile",
    (_name, file) => {
      // Write the bytecode to a temp folder so the repository stays clean.
      const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "edgemind-py-"));
      try {
        execFileSync(
          "python3",
          [
            "-c",
            "import py_compile, sys; py_compile.compile(sys.argv[1], cfile=sys.argv[2], doraise=True)",
            file,
            path.join(outDir, "out.pyc"),
          ],
          { stdio: "pipe" },
        );
      } finally {
        fs.rmSync(outDir, { recursive: true, force: true });
      }
    },
  );

  // Decision D3 (board model) is open, so sketches are compiled for the Arduino UNO
  // family only to catch syntax errors. Needs `arduino-cli core install arduino:avr`.
  it
    .skipIf(!hasArduinoCli)
    .each(sketches.map((file) => [path.relative(CODE_DIR, file), file]))(
    "%s compiles with arduino-cli",
    (_name, file) => {
      const work = fs.mkdtempSync(path.join(os.tmpdir(), "edgemind-ino-"));
      try {
        const name = path.basename(file, ".ino");
        const sketchDir = path.join(work, name);
        fs.mkdirSync(sketchDir);
        fs.copyFileSync(file, path.join(sketchDir, `${name}.ino`));
        execFileSync(
          "arduino-cli",
          ["compile", "--fqbn", "arduino:avr:uno", sketchDir],
          {
            stdio: "pipe",
          },
        );
      } finally {
        fs.rmSync(work, { recursive: true, force: true });
      }
    },
  );
});
