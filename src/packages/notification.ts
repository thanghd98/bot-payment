import { Client, Message } from 'paho-mqtt';

interface InitMqtt {
    clientId: string, 
    requestUrl: string, 
    username?: string, 
    password?: string
}

export class MqttService {
  private clientId?: string;
  private requestUrl?: string;
  private mqttClient?: Client;
  static instance: MqttService

  constructor(params : InitMqtt) {
    const {clientId, requestUrl, username, password} = params
    
    if(MqttService.instance){
        return MqttService.instance
    }

    this.clientId = clientId,
    this.requestUrl = requestUrl
    this.mqttClient = new Client(this.requestUrl, this.clientId);
    this.mqttClient.onConnectionLost = this.onConnectionLost;

    const options = {
      userName: username || 'username',
      password: password ||  'password',
      onSuccess: this.onConnect,
      onFailure: this.onFailure,
      useSSL: true,
      reconnect: true,
      keepAliveInterval: 30,
      timeout: 10,
    };

    this.mqttClient.connect(options);

    MqttService.instance = this
    return this
  }

  onConnect = () => {
    console.log('🔥 ~ Connected to AWS IoT Core');
  };

  onFailure = (error: unknown) => {
    console.error('🔥 ~ MqttService ~ onFailure ~ error:', error);
  };

  onConnectionLost(error: unknown) {
    console.log('🔥 ~ MqttService ~ onConnectionLost ~ e:', error);
    // this.mqttClient.connect({ onSuccess: this.onConnect, onFailure: this.onFailure, useSSL: true, timeout: 3 })
  }

  async sendMessage(topic: string, message: string) {
    try {
      const messageObj = new Message(JSON.stringify(message));
      messageObj.destinationName = topic;
      messageObj.qos = 1;
      messageObj.retained = false;
      this.mqttClient?.send(messageObj);
    } catch (error) {
      console.log(
        'MqttService ~ sendMessage ~ error',
        JSON.stringify({ topic, message })
      );
    }
  }
}
