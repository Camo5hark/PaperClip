# PaperClip

## What is it?

PaperClip is a simple script that checks PaperMC for updates and automatically downloads them to your server. PaperClip will download and verify new PaperMC builds directly from the PaperMC website. It is a single JavaScript file that can be run with NodeJS, which is secure, easy to install, and is preinstalled on many systems. PaperClip uses no libraries and has no dependencies for maximum security and simplicity, and is extremely simple to implement.

## How to use

To begin using PaperClip, make sure NodeJS is installed on your system. Tutorials and installation tools for NodeJS can be found on their website: https://nodejs.org/en/

Next, download the latest PaperClip release from this GitHub page to your Minecraft server's root directory. Then, in your server's start script, simply add the line `node PaperClip.js` before the line that starts the server. For example:

**ServerStart.sh**
```
node PaperClip.js
java -Xms4G -Xmx8G -jar server.jar nogui
```

## Arguments

Arguments are not required, but they allow you to configure PaperClip.

**Example:** `node PaperClip.js mcVersion=1.16.5 serverJAR=./path/to/server.jar`

**mcVersion** - The version of Minecraft that PaperClip should search for new PaperMC builds of. Can be any version from `1.8` to `1.18.1`. `1.18.1` is the default.

**serverJAR** - The path to the server JAR file. `./server.jar` is the default.

