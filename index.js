var mqtt = require('mqtt');
const { Client } = require('ssh2');
const conn = new Client();

var UsuariosIDs = {
    0: "Anderson",
    1: "Jorge",
    2: "Alexsandra",
    3: "Pâmela",
    4: "Edson",
    6: "Anderson",
    7: "Adriana",
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

var topic_s="zigbee2mqtt/Cubo";
var topic_list=["zigbee2mqtt/heimdall","topic3","topic4"];
var topic_o={"topic22":0,"topic33":1,"topic44":1};
client.subscribe(topic_s,{qos:1});
client.subscribe(topic_list,{qos:1});
client.subscribe(topic_o);

client.on('message',function(topic, message, packet){
    let m = JSON.parse(message);
    tratarTopicoMensagem(topic, m);
});

function sshMandarVoz(mensagemVoz){
    conn.on('ready', () => {
      console.log('Client :: ready');
      conn.exec(`sleep 1 && espeak -k -50 -vpt-br '${mensagemVoz}'`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
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
    /*if ( topico==="zigbee2mqtt/Cubo" ){
        if ( mensagem.action === "shake"){
            console.log("shake");
        }
    }*/
    if ( topico==="zigbee2mqtt/heimdall" ){
        if ( mensagem.action === "manual_unlock"){
        }
        if ( mensagem.action === "auto_lock"){
        }
        if ( mensagem.action === "unlock"){
            let usuario = "";
            let mensagemUnlok = "Olá: ";
            usuario = getValue(mensagem.action_user);
            sshMandarVoz(mensagemUnlok + usuario + "! " + getSaudacao() + " " + getSaudacaoFinal());
            console.log(mensagemUnlok + usuario + "! " + getSaudacao() + " " + getSaudacaoFinal());
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