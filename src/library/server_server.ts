import { Child, Command } from "@tauri-apps/api/shell";
import { clearPlayers, environmentTextAppend, selectTab, Settings, Tabs } from ".";
// import { info } from "tauri-plugin-log-api";

const bash: string = "bash";

const bashTrigger: string = "-c";

let args: string = "";

let command: Command | null = null;

let process: Child | null = null;

let restarting: boolean = false;
let restartWatchTimer: number = 0;

/**
 * Catch-all whenever the server settings are updated.
 */
export function updateServerRuntimeSettings(): void {

  // Check if running system-wide.

  const exeDir = Settings.getExe();
  let exeCommand = "";
  if (exeDir === "") {
    exeCommand = "minetestserver";
  } else {
    exeCommand = exeDir;
  }

  // Now rebuild the args.

  args = `${exeCommand} --gameid ${Settings.getGame()} --terminal-silent --worldname ${Settings.getWorld()} --port ${Settings.getPort()}`;
  // info(args);
}

/**
 * Checks if the minetest.conf has a name = god in it.
 */
async function checkGodMode(): Promise<void> {
  const confDir = Settings.getConf();
  let path = "";
  if (confDir === "") {
    path = "$HOME/.minetest/minetest.conf";
  } else {
    path = confDir;
  }
  const testing = new Command(bash, [bashTrigger, `if [ -f ${path} ]; then echo true; else echo false; fi`]);
  const exists = (await testing.execute()).stdout.trim();
  if (exists === "false") {
    // Blindly make the file with bash.
    // info("generating blank minetest.conf");
    const execution = new Command(bash, [bashTrigger, `echo "" > ${path}`]);
    await execution.execute();
  }
  // Why yes, I am file editing with nothing but bash.
  const extract = new Command(bash, [bashTrigger, `cat ${path}`]);
  let fileContents: string = (await extract.execute()).stdout.replace(/^\s*$(?:\r\n?|\n)/gm, "").trim();
  for (const line of fileContents.split("\n")) {
    // If the server admin messes with this, that's their problem.
    if (line.replace(/\s/g, '').substring(0, 5) === "name=") {
      // if we already have it we can stop here.
      // info("found god mode, skipping.");
      return;
    }
  }
  // info("god mode not found");
  fileContents += "\nname = god";
  const writeCommand = new Command(bash, [bashTrigger, `echo "${fileContents}" > ${path}`]);
  await writeCommand.execute();
}

/**
 * An easy way to start up the server through a function.
 * @returns A promise, of nothing. Yay!
 */
export async function startServer(): Promise<void> {
  // info("starting");

  await checkGodMode();

  // If it's already running, this can cause problems.


  if (command !== null || process !== null) {
    alert("Minetest server is already running!");
    return;
  }

  command = new Command(bash, [bashTrigger, args]);

  // printf(bash, bashTrigger, args);

  command.stdout.addListener("data", (...args: any[]) => {
    for (const thing of args) {
      if (typeof thing === "string") {
        environmentTextAppend(thing.trim());
      }
    }
  });
  command.stderr.addListener("data", (...args: any[]) => {
    for (const thing of args) {
      if (typeof thing === "string") {
        environmentTextAppend(thing);
      }
    }
  });

  command.addListener("close", () => {
    // info("SERVER HAS CLOSED.");
    command = null;
    process = null;
    clearPlayers();
  });

  command.addListener("error", () => {
    // info("SERVER HAS CRASHED.");
    alert("Server crashed.");
    command = null;
    process = null;
    clearPlayers();
  });

  process = await command.spawn();

  // info(process.pid.toString());

  // Auto move to environment tab.
  selectTab(Tabs[Tabs.environment]);
  Settings.setTab(Tabs.environment);
}

/**
 * Get the PID of the minetestserver.
 * @returns The PID of the minetestserver.
 */
export function getPID(): number {
  if (process == null) {
    return -1;
  }
  return process.pid;
}

/**
 * Get if the server is currently running.
 * @returns If the server is running.
 */
export function isRunning(): boolean {
  return (command != null || process != null);
}

/**
 * Send a message to the server.
 * @param message A message.
 */
export function messageServer(message: string): void {
  if (process != null) {
    process.write(message);
  }
}

/**
 * Begin the restart procedure.
 */
export function triggerRestartWatch(): void {
  // Auto move to environment tab.
  selectTab(Tabs[Tabs.environment]);
  Settings.setTab(Tabs.environment);
  restarting = true;
}

/**
 * Makes the restart button work.
 * 
 * Checking this boolean every 0.05 seconds might be
 * quite taxing if you're running this on a pentium 2.
 * 
 * @param delta Time between last step.
 * @returns nothing :D
 */
export async function restartWatch(delta: number): Promise<void> {
  if (!restarting) {
    return;
  }

  restartWatchTimer += delta;

  if (restartWatchTimer < 1) {
    return;
  }

  restartWatchTimer = 0;

  if (command != null || process != null) {
    return;
  }

  await startServer();

  restarting = false;

}

/**
 * Make your distro run killall minetestserver.
 */
export async function killAllServers(): Promise<void> {
  const killCommand = new Command(bash, [bashTrigger, "killall minetestserver"]);
  // If this outputs anything then no servers are running.
  killCommand.stderr.addListener("data", () => {
    alert("No zombie servers running!");
  });
  await killCommand.execute();
}

// export function spamTest(): void {
//   if (isRunning()) {
//     messageServer("hi" + Math.random());
//   }
// }

export function serverPayload(): void {

}