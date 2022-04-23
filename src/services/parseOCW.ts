import { Structure } from "./githubTypes";

export function buildStructure(indents: number[], names: string[]) {
    if (names.length === 2) {
      return {
        "title": names[0],
        "children": [{"title": names[1], "children": new Array<Structure>()}],
      } as Structure;
    }
    /* 
    Addition
    * Multiplication
    * Subtraction
    * Division
    * * Exponentiation
    Highest level indents are multiplication, subtraction, division, but NOT addition of exponenetiation
    */
    const minIndent = Math.min(...indents);
    var highestLevelIndents: number[] = [];
    for (let i = 0; i < indents.length; i++) {
      if (indents[i] === minIndent + 1) {
        highestLevelIndents.push(i); 
      }
    }
  
    const structures: Structure[] = [];
    let childIndexes: number[] = [];
    let childCounter = 0;
    for (let i = 1; i < indents.length; i++) {
      if (highestLevelIndents.includes(i)) {
        if (i !== 1) {
          // no children yet
          structures.push(buildStructure(childIndexes.map(index => indents[index]), childIndexes.map(index => names[index])))
          childCounter += 1;
          childIndexes = [];
        }
        childIndexes.push(i);
      }
      else if (i == indents.length - 1){
        childIndexes.push(i);
        structures.push(buildStructure(childIndexes.map(index => indents[index]), childIndexes.map(index => names[index])))
      }
      else {
        childIndexes.push(i);
      }
    }
    const clonedArray = Object.assign([], structures);
    let structure: Structure = {
      "title": names[0],
      "children": clonedArray,
    };
    return structure;
}
  
export function parseStructure(structure: string[]) {
    // count number of * in lines
    const indent: number[] = structure.map(line => line.split("*").length - 1);
    const names: string[] = structure.map(line => line.slice(line.lastIndexOf("*") + 1).trim());
    return buildStructure(indent, names);
}
  
type MetaData = "tags" | "thumbnail" | "description";
export function parseData(metadata: string[]) {
    const keys = metadata.map(line => line.slice(0, line.indexOf(":"))) as MetaData[];
    const values = metadata.map(line => line.slice(line.indexOf(":") + 2).replace(/\"/g, "")) as string[];
    let result: {
        tags: string[];
        thumbnail: string;
        description: string;
    } = {"tags": [], "thumbnail": "", "description": ""};
    keys.forEach((key, idx) => {
        if (key == "tags") {
            result["tags"] = values[idx].split(",");
        }
        else {
            result[key] = values[idx];
        }
    });
    return result;
}
  
export function parseOCW(text: string) {
    const lines = text.split("\n").map(line => line.trim());
    const nonEmptyLines = lines.filter(line => line.length > 0);
    const structureStrings = [lines[0], ...nonEmptyLines.filter(line => line.includes("*"))];
    const metadataStrings = nonEmptyLines.filter(line => !structureStrings.includes(line));
    const structure = parseStructure(structureStrings);
    const data = parseData(metadataStrings);
    return {data, structure};
}