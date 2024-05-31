// import { app, shell, tauri } from "@tauri-apps/api";
// import { invokeTauriCommand } from "@tauri-apps/api/helpers/tauri";
// import { Command } from "@tauri-apps/api/shell";
// import { invoke } from "@tauri-apps/api/tauri";
import { info, attachConsole } from "tauri-plugin-log-api";
// import { emit, listen } from '@tauri-apps/api/event';
import { printf, safeGetElementByID, tabify, Tabs } from "./library/buttonify";

// const random = Math.random;
const detach = await attachConsole();

// Deploy the tabs.
tabify(Tabs.environment);

// The main loop which runs every 0.05 seconds.
function onStep(): void {

}

window.addEventListener("resize", () => {
  info("resized!");

  let div = safeGetElementByID("environmentcontent");

  printf("offsetHeight", div.offsetHeight);

});

// let test = document.getElementById("environmentcontent");

// if (test != null) {
//   info(test.namespaceURI || "");
//   test.addEventListener("windowResize", () => {
//     info("hi");
//   });
// } else {
//   error("it's null >:(");
// }



// Internal timer runs main at 20 FPS.
setInterval(onStep, 50);
detach();