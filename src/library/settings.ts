import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
// import { info } from "tauri-plugin-log-api";
import { Tabs, updateServerRuntimeSettings } from ".";

const settingFileName: string = "settings.conf";
const dirInfo = { dir: BaseDirectory.AppData };

export const tickTimeInMS = 50;
export const tickTimeInSeconds = 0.05;

class Settingly {
  tab: Tabs = Tabs.environment;
  port: string = "300000";
  game: string = "minetest";
  world: string = "world";
  exe: string = "";
  conf: string = "";
}

const settings: Settingly = await loadSettings();

/**
 * Raw object used as a weird dispatcher.
 * 
 * This thing sacrifices disk performance to make sure it saves everything
 * every time you do something.
 * 
 * Which will be really noticeable if you're using a windows xp machine.
 */
export const Settings = {
  getTab(): Tabs {
    return settings.tab;
  },
  setTab(tab: Tabs): void {
    settings.tab = tab;
    saveSettings();
  },

  getPort(): string {
    return settings.port;
  },
  setPort(port: string): void {
    settings.port = port;
    saveSettings();
    updateServerRuntimeSettings();
  },


  getGame(): string {
    return settings.game;
  },
  setGame(game: string): void {
    settings.game = game;
    saveSettings();
    updateServerRuntimeSettings();
  },

  getWorld(): string {
    return settings.world;
  },
  setWorld(world: string): void {
    settings.world = world;
    saveSettings();
    updateServerRuntimeSettings();
  },

  getExe(): string {
    return settings.exe;
  },
  setExe(exe: string): void {
    settings.exe = exe;
    saveSettings();
    updateServerRuntimeSettings();
  },

  getConf(): string {
    return settings.conf;
  },
  setConf(conf: string): void {
    settings.conf = conf;
    saveSettings();
    updateServerRuntimeSettings();
  }
};

/**
 * Half baked attempt at reflection on a JSON object.
 * @param input The raw JSON object.
 * @returns If this thing is a Settingly object.
 */
function checkReflect(input: Object): boolean {
  for (const [key, value] of Object.entries(new Settingly())) {
    const valueType: string = typeof value;
    const has = input.hasOwnProperty(key);
    const typeMatch = typeof input[key as keyof Object] === valueType;
    if (!has || !typeMatch) {
      return false;
    }
  }
  return true;
}

/**
 * Load the settings from the file if it exists.
 * @returns The Settingly object.
 */
export async function loadSettings(): Promise<Settingly> {
  try {
    if (await exists(settingFileName, dirInfo)) {
      const text: string = await readTextFile(settingFileName, dirInfo);
      const thing: Object = JSON.parse(text);
      if (checkReflect(thing)) {
        return thing as Settingly;
      } else {
        // info("Looks like you might have modified the save file and if you didn't, uh oh.");
        return new Settingly();
      }
    } else {
      // info("failed completely");
      return new Settingly();
    }
  } catch (e: any) {
    // info(e);
    return new Settingly();
  }
}

/**
 * Save the settings file.
 */
export async function saveSettings(): Promise<void> {
  // info("saved");
  await writeTextFile(settingFileName, JSON.stringify(settings), dirInfo);
}