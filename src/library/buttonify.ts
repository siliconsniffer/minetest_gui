import { error, info } from "tauri-plugin-log-api";

export { };

/**
 * Easy enum for the 3 tabs. Makes it easy to add more.
 */
export enum Tabs {
  environment, controls, settings
}

export function stringifyTab(tab: Tabs): string {
  return Tabs[tab].toString();
}

/**
 * Easy way to register button onclick events.
 * @param buttonID The ID of the button.
 * @param fun What this does when clicked.
 */
export function buttonClickEvent(buttonID: string, fun: () => void): void {
  const button: HTMLElement | null = document.getElementById(buttonID);
  if (button != null) {
    button.addEventListener("click", fun);
  } else {
    error(`Button ${buttonID} is null! Failed to attach button click event.`);
  }
}

export function selectTab(tabID: string): void {
  let tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    let element: HTMLElement = tabcontent[i] as HTMLElement;
    element.style.display = "none";
  }
  let tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  let currentTab = document.getElementById(tabID);
  if (currentTab == null) {
    error(`Tried to select tab ${tabID} which doesn't exist!`);
    return;
  }
  currentTab.className += " active";
  let currentContent: HTMLElement | null = document.getElementById(tabID + "content");
  if (currentContent == null) {
    error(`Tried to select content ${tabID} which doesn't exist!`);
    return;
  }
  currentContent.style.display = "";
}

export function tabify(defaultTab: Tabs): void {
  for (const tab of Object.keys(Tabs)) {
    if (typeof Tabs[tab as unknown as Tabs] !== "string") {
      const id = tab.toString();
      buttonClickEvent(id, () => {
        selectTab(id);
      });
    }
  }

  info(defaultTab.toString());
  selectTab(stringifyTab(defaultTab));
}