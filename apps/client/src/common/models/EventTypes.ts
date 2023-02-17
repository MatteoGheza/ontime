export enum SupportedEvent {
  Event = 'event',
  Delay = 'delay',
  Block = 'block'
}

export interface OntimeBaseEvent {
  type: SupportedEvent;
  id: string;
  after?: string; // used when creating an event to indicate its position in rundown
}

export type OntimeDelay = OntimeBaseEvent & {
  type: SupportedEvent.Delay;
  duration: number;
  revision: number;
}

export type OntimeBlock = OntimeBaseEvent & {
  type: SupportedEvent.Block;
}

export type OntimeEvent = OntimeBaseEvent & {
  type: SupportedEvent.Event;
  title: string,
  subtitle: string,
  presenter: string,
  note: string,
  timeType?: string,
  timeStart: number,
  timeEnd: number,
  duration: number,
  isPublic: boolean,
  skip: boolean,
  colour: string,
  user0: string,
  user1: string,
  user2: string,
  user3: string,
  user4: string,
  user5: string,
  user6: string,
  user7: string,
  user8: string,
  user9: string,
  revision: number,
}

export type OntimeRundownEntry = OntimeDelay | OntimeBlock | OntimeEvent;
export type OntimeRundown = OntimeRundownEntry[]