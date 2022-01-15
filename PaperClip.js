const startTime = Date.now();

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

async function checkSHA256(file, sha256) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const input = fs.createReadStream(file);
        input.on('data', chunk => hash.update(chunk));
        input.on('end', () => resolve(sha256 === hash.digest('hex')));
    });
}

(async () => {
    console.info('PaperClip v1.0');

    const cfg = new Map();
    cfg.set('mcVersion', '1.18.1');
    cfg.set('serverJAR', './server.jar');

    process.argv.forEach(arg => {
        const pair = arg.split('=', 2);

        if (pair.length < 2) return;

        cfg.set(pair[0], pair[1]);
    });

    const cfgMCVersion = cfg.get('mcVersion');
    const cfgServerJAR = cfg.get('serverJAR');

    console.info('-----');
    console.info('CONFIGURATION');
    console.info(`MC Version: ${cfgMCVersion}`);
    console.info(`Server JAR: ${cfgServerJAR}`);
    console.info('-----');
    console.info('Retrieving Paper build info');

    const cfgMCVersionSplit = cfgMCVersion.split('.');
    const mcVersionGroup = cfgMCVersionSplit.length == 3 ? `${cfgMCVersionSplit[0]}.${cfgMCVersionSplit[1]}` : cfgMCVersion;
    const latestBuild = JSON.parse(await new Promise((resolve, reject) => {
        https.get(`https://papermc.io/api/v2/projects/paper/version_group/${mcVersionGroup}/builds`, res => {
            let body = '';

            res.on('error', err => reject(err));
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body));
        });
    })).builds.filter(build => build.version == cfgMCVersion).at(-1);

    console.info(`Latest Paper build for MC ${cfgMCVersion} is ${latestBuild.build}`);
    console.info(`Comparing SHA256 of Paper ${latestBuild.version} build ${latestBuild.build} and ${cfgServerJAR}`);

    if (await checkSHA256(cfgServerJAR, latestBuild.downloads.application.sha256)) {
        console.info('The latest version is already downloaded');
    } else {
        console.info('New build detected');
        console.info('-----');
        console.info(`VERSION ${latestBuild.version} BUILD ${latestBuild.build} CHANGES`);

        latestBuild.changes.forEach(change => console.info('- ' + change.summary));

        console.info('-----');

        const cfgServerJARTMP = cfgServerJAR + '.tmp';

        console.info(`Backing up last build to ${cfgServerJARTMP}`);

        fs.copyFileSync(cfgServerJAR, cfgServerJARTMP);

        console.info(`Downloading latest build to ${cfgServerJAR}`);

        const serverJAROut = fs.createWriteStream(cfgServerJAR);

        await new Promise((resolve, reject) => https.get(`https://papermc.io/api/v2/projects/paper/versions/${latestBuild.version}/builds/${latestBuild.build}/downloads/${latestBuild.downloads.application.name}`, res => {
            res.pipe(serverJAROut);
            res.on('error', err => reject(err));
            res.on('end', () => resolve());
        }));

        console.info('Verifying download');

        if (await checkSHA256(cfgServerJAR, latestBuild.downloads.application.sha256)) {
            console.info('Verification successful');
        } else {
            console.info('Verification unsuccessful - reverting to last build');

            fs.copyFileSync(cfgServerJARTMP, cfgServerJAR);
        }

        console.info('Deleting last build backup');

        fs.unlinkSync(cfgServerJARTMP);
    }

    console.info(`Done (${(Date.now() - startTime) / 1000}s)`);
})();