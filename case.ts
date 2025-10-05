// import { kebabCase, capitalCase } from "change-case";
//
// const moodlistName = "Chill Vibes";
// console.log(capitalCase(kebabCase(moodlistName)));

import z from "zod";

const revalidatePathEnums = z.enum(["/moodlists", "/moodlists/user/[userId]"]);
console.log(revalidatePathEnums.parse("/moodlists"));
