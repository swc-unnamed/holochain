export interface Character {
  version: string;
  timestamp: number;
  resource: string;
  request: string;
  swcapi: Swcapi;
}

export interface Swcapi {
  character: CharacterClass;
}

export interface CharacterClass {
  uid: string;
  name: string;
  image: string;
  attributes: CharacterAttributes;
  lastlogin: Lastlogin;
  gender: string;
  shortdescription: string;
  biography: string;
  race: RaceClass;
  force: Creditlog;
  faction: RaceClass;
  factions: FactionElement[];
  skills: Creditlog;
  inventories: Creditlog;
  privileges: Creditlog;
  credits: Creditlog;
  events: Creditlog;
}

export interface CharacterAttributes {
  isprivate: string;
  isbasic: string;
}

// TODO: This is a placeholder for the time being.
export interface Creditlog {
  // Placeholder
  uid: string;
}

export interface RaceClass {
  attributes: FactionAttributes;
  value: string;
}

export interface FactionAttributes {
  uid: string;
  href: string;
}

export interface FactionElement {
  attributes: FactionAttributes;
  value: string;
  primary: boolean;
}

export interface Lastlogin {
  years: number;
  days: number;
  hours: number;
  mins: number;
  secs: number;
  timestamp: string;
}

export interface AuthenticatedCharacter {
  character: Character;
  tokens: {
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    scopes: string[];
  };
};