const vscode = require('vscode');
const cp = require('child_process')
const os = require('os');

const { info } = require('console');

function platform() {
    var p = os.platform
    if (p == 'darwin') {
        return 'osx'
    } else if (p == 'win32') {
        return 'win'
    }
}

function gualang() {
    var p = platform()
    if (p == 'osx') {
        return './gualang.mac'
    } else if (p == 'win') {
        return 'gualang.exe'
    }
}

function slicedSTDOUT(stdout) {
    var i = stdout.indexOf('gua:')
    stdout = stdout.slice(i+4)
    return stdout
}

function check(command) {
    var cmd = `${command} check ${platform()}`
    console.log('cmd', cmd)

    cp.exec(cmd, (err, stdout, stderr) => {
        stdout = slicedSTDOUT(stdout)

        var infos = stdout.split(' ')
        var title = infos[0]
        var local = infos[1]
        var remote = infos[2]
        if (title == 'outdated') {
            var s = `Gualang 有新版本 ${remote}, 本地版本为 ${local}, 按下 Ctrl+Shift+U 以更新`
            vscode.window.showInformationMessage(s);
        }
    });
}

function update(command) {
    vscode.window.showInformationMessage('Gualang 更新中');

    var cmd = `${command} update ${platform()}`
    console.log('cmd', cmd)

    cp.exec(cmd, (err, stdout, stderr) => {
        stdout = slicedSTDOUT(stdout)

        var infos = stdout.split(' ')
        var title = infos[0]
        var local = infos[1]
        var s = `Gualang 已经更新到最新版本 ${local}`
        vscode.window.showInformationMessage(s);
    });
}

async function openDoc() {
    let p = platform()
    let path = ''
    if (p == 'osx') {
        path = '/Applications/gualang/code-portable-data/user-data/gualang/doc'
    } else if (p == 'win') {
        path = 'C:\\gualang_ide\\portable-data\\data\\user-data\\gualang\\doc'
    }
    let uri = vscode.Uri.file(path);
    await vscode.commands.executeCommand('vscode.openFolder', uri, true);
}

function activate(context) {
    const root = context.extensionPath
    const chcp = platform() == 'win' ? 'chcp 65001 &&' : ''
    const command = `${chcp} cd ${root}/gua && ${gualang()} updater.gua`

    check(command)

    let disposable = vscode.commands.registerCommand('extension.gualangUpdate', function () {
        update(command)
    });

    let disposable2 = vscode.commands.registerCommand('extension.gualangOpenDoc', function () {
        openDoc()
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
