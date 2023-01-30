var mqtt = require('mqtt');
const { Client } = require('ssh2');
const conn = new Client();
let fila = [];
var UsuariosIDs = {
    0: "Anderson",
    1: "Jorge",
    2: "Alexsandra",
    3: "Pâmela",
    4: "Edson",
    6: "Anderson",
    7: "Adriana",
    8: "Lucas",
    10: "Mariana",
    11: "Vitória",
};

var Saudacoes = {
    0: "Beleza?",
    1: "Olá!",
    2: "Tudo bem?",
    3: "Como vai?",
    4: "Saudações!",
    5: "Tudo bem?",
    6: "Oi!",
    7: "E aí?",
    8: "Tudo bem?",
    9: "Alô!",
};

function getSaudacao() {
    const rand = (Math.floor(Math.random() * 10));
    return Saudacoes[rand]===undefined ? "" : Saudacoes[rand];
}

function getValue(key) {
    return UsuariosIDs[key]===undefined ? "" : UsuariosIDs[key];
}

var client = mqtt.connect('mqtt://10.0.68.101:1883');
client.on("zigbee2mqtt/Cubo", function () {
    console.log("connected");
})

var topic_list=["zigbee2mqtt/heimdall","zigbee2mqtt/Cubo"];
client.subscribe(topic_list);

client.on('message',function(topic, message, packet){
    let m = JSON.parse(message);
    tratarTopicoMensagem(topic, m);
});

function sshMandarVoz(mensagemVoz){
    const conn = new Client();
    conn.on('ready', () => {
      console.log('Client :: ready');
      //conn.exec(`speak-ng -v mb/mb-br1 -s 124 -a 200 'Teste!'`, (err, stream) => {
      conn.exec(`sleep 1.8 && espeak -k -20 -vpt-br '${mensagemVoz}'`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          stream.close();
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
          conn.end();
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
          conn.end();
        });
      });
    }).connect({
      host: '10.0.68.101',
      port: 22,
      username: 'pi',
      //password: process.env.SSH_PASSWORD
      password: '283687283687'
    });
}

function sshMandarVoz2(mensagemVoz){
    const conn = new Client();
    conn.on('ready', function(err) {
        conn.exec(`sleep 1.8 && espeak -k -20 -vpt-br '${mensagemVoz}'`, (err, stream) => {
            if (err) return done(err);
            var result;
            stream.on('close', function(code, signal) {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end();
            }).on('data', function(data) {
                let resultObject = JSON.parse(data);
                console.log(resultObject);
            });
        });
    }).connect({
        host: '10.0.68.101',
        port: 22,
        username: 'pi',
        //password: process.env.SSH_PASSWORD
        password: '283687283687'
    });
}

function tratarTopicoMensagem(topico, mensagem){
	console.log("Tópico: "+ topico);
    console.log("Mensagem: "+ JSON.stringify(mensagem));
    
    fila.push({"data":new Date(), "mensagem": mensagem});
    if (fila.length > 1){
        let acaoIgual = fila[fila.length - 1].mensagem.action === fila[fila.length - 2].mensagem.action
        let deltaTempo = fila[fila.length - 1].data - fila[fila.length - 2].data
        if (acaoIgual && deltaTempo < 4000){
            fila=[];
            console.log("Ignorando duplicidade...");
            return;
        }
    }

    if ( topico==="zigbee2mqtt/Cubo" ){
        if ( mensagem.action === "shake"){
            console.log("shake");
            sshMandarVoz("Ei!");
        }
    }
    if ( topico==="zigbee2mqtt/heimdall" ){
        if ( mensagem.action === "manual_unlock"){
        }
        if ( mensagem.action === "auto_lock"){
        }
        if ( mensagem.action === "unlock"){
            let usuario = "";
            let mensagemUnlok = "Porta destrancada.";
            usuario = getValue(mensagem.action_user);
            sshMandarVoz(mensagemUnlok + " " + getSaudacao() + " " + usuario + ". " + getSaudacaoFinal());
            console.log(mensagemUnlok + " " + getSaudacao() + " " + usuario + ". " + getSaudacaoFinal());
        }
    }
}

function getSaudacaoFinal(){
    const hora = new Date().getHours();
    if (hora >= 0 && hora < 12) {
      return "Bom dia!";
    } else if (hora >= 12 && hora < 18) {
      return "Boa tarde!";
    } else {
      return "Boa noite!";
    }
}