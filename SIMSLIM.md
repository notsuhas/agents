# Set up automatic simulator slimming

[Simslim](https://github.com/MobAI-App/simslim) reduces Apple simulator background services. Install it separately through Homebrew; Backbone does not install it or start its watcher. This guide is the shared setup recipe for agents configuring a new Mac.

You need macOS, Homebrew, Python 3, and Xcode with a simulator runtime installed. Run setup as the signed-in user, without `sudo`. Android emulators are outside Simslim's scope.

## Install and enable

```sh
brew install mobai-app/tap/simslim
simslim --version
xcrun simctl list devices available
```

The profile below preserves store, web, connectivity, iCloud, health, photo and personal-data services. Other categories are slimmed, including Siri, search and widgets. Use a stock simulator when testing those features, or adjust the profile first.

Run this block to write the profile and login service. It replaces this guide's existing profile and service configuration on the machine.

```sh
python3 - <<'PY'
import json
import pathlib
import plistlib
import shutil

home = pathlib.Path.home()
binary = shutil.which('simslim')
if binary is None:
    raise SystemExit('Install simslim with Homebrew first.')
config = home / '.config/simslim'
config.mkdir(parents=True, exist_ok=True)
profile = config / 'development.json'
profile.write_text(json.dumps({
    'name': 'development',
    'description': 'Preserve account, web, connectivity, health, photo and personal-data services.',
    'except': ['store', 'web', 'connectivity', 'health', 'icloud', 'photos', 'pim'],
    'keep': [],
}, indent=2) + '\n')
logs = home / 'Library/Logs/simslim'
logs.mkdir(parents=True, exist_ok=True)
agents = home / 'Library/LaunchAgents'
agents.mkdir(parents=True, exist_ok=True)
service = {
    'Label': 'dev.notsuhas.simslim',
    'ProgramArguments': [binary, 'watch', '--profile', str(profile), '--interval', '3s'],
    'RunAtLoad': True,
    'KeepAlive': True,
    'ThrottleInterval': 10,
    'StandardOutPath': str(logs / 'watch.log'),
    'StandardErrorPath': str(logs / 'watch-error.log'),
    'EnvironmentVariables': {
        'HOME': str(home),
        'PATH': str(pathlib.Path(binary).parent) + ':/usr/bin:/bin:/usr/sbin:/sbin',
    },
}
with (agents / 'dev.notsuhas.simslim.plist').open('wb') as file:
    plistlib.dump(service, file)
PY

plutil -lint "$HOME/Library/LaunchAgents/dev.notsuhas.simslim.plist"
if launchctl list dev.notsuhas.simslim >/dev/null 2>&1; then
  launchctl bootout "gui/$(id -u)/dev.notsuhas.simslim"
fi
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/dev.notsuhas.simslim.plist"
```

The watcher starts immediately and at login. It slims booted simulators without rebooting them, and checks every three seconds for newly booted devices in the default and Xcode testing device sets. Custom device sets need an explicit `--set` argument.

Existing device overrides persist where supported by the runtime. A newly created or erased simulator boots stock before the watcher slims it; this is not a modified simulator runtime. The watcher runs while this user is logged in.

## Verify setup

```sh
launchctl list dev.notsuhas.simslim
simslim list
tail -n 20 "$HOME/Library/Logs/simslim/watch-error.log"
```

Copy a booted device's UDID from `simslim list`, then run:

```sh
SIM_UDID='paste-device-udid-here'
simslim verify "$SIM_UDID" --profile "$HOME/.config/simslim/development.json"
simslim doctor "$SIM_UDID" --requires push,storekit,universal-links
simslim measure "$SIM_UDID"
```

Wait for the watch log to report `slimmed` before verifying. If overrides drift, run `simslim on "$SIM_UDID" --profile "$HOME/.config/simslim/development.json" --no-reboot`, then verify again. Doctor checks service configuration; it does not replace an app's end-to-end feature tests. Open and exercise the app you develop before treating setup as complete.

If the service fails, inspect both log files in `~/Library/Logs/simslim`. Confirm `xcrun simctl list` works and the CLI path in the plist still exists. After changing the profile or reinstalling the CLI, reload the service with the `bootout` and `bootstrap` commands above.

## Restore stock behavior

Stop the watcher before restoring a device, or it will slim the device again. `off` reboots the selected simulator; finish any active test first.

```sh
launchctl bootout "gui/$(id -u)/dev.notsuhas.simslim"
rm "$HOME/Library/LaunchAgents/dev.notsuhas.simslim.plist"
simslim off "$SIM_UDID"
```

Repeat `off` for each device you want restored. Removing the login service alone does not clear existing simulator overrides.

## Update ownership

Use `brew upgrade mobai-app/tap/simslim` to update the CLI. This repository shares the recipe, not the installed binary, local profile or login service. After an upgrade, verify the profile and required features again. The recipe was verified with Simslim 0.12.2 on an iOS 27 simulator.
