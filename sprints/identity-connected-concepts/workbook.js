"use strict";
const key="ibds-identity-connected-concepts-v1";
const fields=[...document.querySelectorAll("textarea")];
const state=document.querySelector("#save-state");
let available=true;
try{const saved=JSON.parse(localStorage.getItem(key)||"{}");fields.forEach(f=>{if(typeof saved[f.id]==="string")f.value=saved[f.id];});}catch(e){available=false;state.textContent="Browser saving unavailable. Download your answers regularly.";}
function values(){return Object.fromEntries(fields.map(f=>[f.id,f.value]));}
function printValues(){fields.forEach(f=>{document.querySelector(`[data-answer-for="${f.id}"]`).textContent=f.value||" ";});}
function save(){printValues();try{localStorage.setItem(key,JSON.stringify(values()));state.textContent="Saved on this device only • not submitted";available=true;}catch(e){available=false;state.textContent="Not saved by browser. Download your answers now.";}}
fields.forEach(f=>f.addEventListener("input",save));printValues();
document.querySelector("#export").addEventListener("click",()=>{const lines=["IDENTITY UNDER THE LENS", "IBDS | ibds-26-s02-bundle | Practice responses", "Exported: "+new Date().toISOString(), "This file is not a submission receipt.",""];fields.forEach(f=>lines.push(document.querySelector(`label[for="${f.id}"]`).textContent, f.value||"[No response]", ""));document.querySelector("#export-copy").hidden=false;document.querySelector("#export-text").textContent=lines.join("\n");const url=URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="Identity_Connected_Concepts_My_Answers.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);state.textContent="Download requested. Check your downloads, then submit as directed.";});
document.querySelector("#print").addEventListener("click",()=>{printValues();window.print();});
window.addEventListener("beforeprint",printValues);
document.querySelector("#clear").addEventListener("click",()=>{if(!confirm("Clear this workbook's answers on this device? Download a copy first. This cannot be undone."))return;fields.forEach(f=>f.value="");try{localStorage.removeItem(key);}catch(e){}printValues();document.querySelector("#export-copy").hidden=true;document.querySelector("#export-text").textContent="";state.textContent="Local answers cleared. Downloaded copies are unchanged.";});
