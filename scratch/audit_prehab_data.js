const fs = require("fs");
const prehabData = require("../js/prehab_data.js");
const spec = fs.readFileSync("./00_SYSTEM/SOURCES/DINO-005B/EXERCISE_DATABASE_SPECIFICATION.md", "utf8");

const rows = [];
prehabData.PREHAB_EXERCISES.forEach((ex, idx) => {
  const id = ex.exerciseId;
  const specSectionIdx = spec.indexOf(`\`${id}\``);
  let specName = "NOT FOUND";
  let specVietName = "NOT FOUND";
  let specEquipment = "NOT FOUND";
  if (specSectionIdx !== -1) {
    const sectionChunk = spec.slice(specSectionIdx, specSectionIdx + 800);
    const m = sectionChunk.match(/- \*\*English Name:\*\* (.*)/);
    if (m) specName = m[1].trim();
    const mViet = sectionChunk.match(/- \*\*Vietnamese Display Name:\*\* (.*)/);
    if (mViet) specVietName = mViet[1].trim();
    const mEq = sectionChunk.match(/- \*\*Equipment:\*\* (.*)/);
    if (mEq) specEquipment = mEq[1].trim();
  }

  const isMatch = (ex.nameEn.toLowerCase() === specName.toLowerCase());
  rows.push({
    index: idx + 1,
    id,
    phase: ex.phase,
    runtimeName: ex.nameEn,
    specName,
    match: isMatch ? "MATCH" : "MISMATCH",
    cuesCount: ex.formCues?.length || 0,
    hasModeA: !!ex.preWorkout,
    hasModeB: !!ex.offDay,
    runtimeEquipment: ex.equipment.join(", "),
    specEquipment
  });
});

console.log("Index | ID | Phase | Runtime Name | Spec Name | Match");
console.log("---|---|---|---|---|---");
rows.forEach(r => {
  console.log(`${r.index} | ${r.id} | ${r.phase} | ${r.runtimeName} | ${r.specName} | ${r.match}`);
});

const mismatches = rows.filter(r => r.match !== "MATCH");
console.log("\nTotal mismatches:", mismatches.length);
if (mismatches.length > 0) {
  console.log("Mismatches detail:", JSON.stringify(mismatches, null, 2));
}
