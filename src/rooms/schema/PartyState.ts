import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema{
    @type("string") public username:string = "Player";
    @type("number") public score:number = 0;
}

export class PartyState extends Schema {
  @type({map:Player}) players = new MapSchema<Player>();
  @type("number") registrationReport: number;
}
