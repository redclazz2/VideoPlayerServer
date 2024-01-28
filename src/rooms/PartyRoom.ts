import { Room, Client } from "@colyseus/core";
import { Player } from "./schema/PartyState";
import { PartyState } from "./schema/PartyState";

enum ColyseusMessagesTypes{
  SendPlayerUsernameRegistration,
  SendLobbyStartForce,
  SendVideoRegistration,
}

class Video{
  SenderId:string;
  VideoUrl:string;
  VideoDesc:string;

  constructor(SenderId:string,VideoUrl:string,VideoDesc:string){
    this.SenderId = SenderId;
    this.VideoUrl = VideoUrl;
    this.VideoDesc = VideoDesc;
  }
}

export class PartyRoom extends Room<PartyState> {
  maxClients = 4;
  partyReady = 0;
  hasStarted = false;
  videoList:Video[] = [];

  onCreate (options: any){
    this.setState(new PartyState());

    this.onMessage(ColyseusMessagesTypes.SendPlayerUsernameRegistration,(client,message)=>{
        var CurrentPlayer = this.state.players.get(client.sessionId);
        CurrentPlayer.username = message.RegisteredUsername;
    });

    this.onMessage(ColyseusMessagesTypes.SendLobbyStartForce,()=>{
      if(!this.hasStarted){
        this.broadcast(ColyseusMessagesTypes.SendLobbyStartForce);
        this.hasStarted = true; 
      }
    });

    this.onMessage(ColyseusMessagesTypes.SendVideoRegistration,(client,message)=>{
      this.videoList.push(new Video(client.sessionId,message.VideoUrl,message.VideoDesc));
      var OnlinePlayers = this.state.players.size;
      
      console.log(OnlinePlayers);
      console.log(this.partyReady);

      if(this.partyReady < OnlinePlayers){
        this.partyReady++;       
      }
      
      if(this.partyReady == OnlinePlayers){
        this.shuffle(this.videoList);
        this.broadcast(ColyseusMessagesTypes.SendVideoRegistration,this.videoList);
      }
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    this.state.players.set(client.sessionId,new Player());
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  //Function taken from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle(array:Video[]) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
}