declare module 'liveperson-chat-api';

type LPChatState = 'resume'
  | 'initialised'
  | 'uninitialised'
  | 'waiting'
  | 'chatting'
  | 'ended'
  | 'notfound';

interface ILPCallbackOpts {
  /**
   * A method to run on completing a successful request
   */
  success?(data);

  /**
   * A method to run on a failed request or returned server error
   */
  error?(error);

  /**
   * The context in which to run these functions
   */
  context?: any;
}

interface ILPVisitorNameOpts extends ILPCallbackOpts {
  visitorName: string;
}

interface ILPRequestTranscriptOpts extends ILPCallbackOpts {
  email: string;
}

interface ILPSkillOpts extends ILPCallbackOpts {
  skill: string;
}

interface ILPAddLineOpts extends ILPCallbackOpts {
  text: string;
}

interface ILPSetCustomVariableOpts extends ILPCallbackOpts {
  customVariable: any;
}

interface ILPEndChatOpts extends ILPCallbackOpts {
  /**
   * Clears the chat session from memory, so on refresh it will not be automatically resumed.
   */
  disposeVisitor: boolean;
}

interface ILPVisitorTypingOpts extends ILPCallbackOpts {
  typing: boolean;
}

interface ILPEstimatedWaitTimeOpts extends ILPCallbackOpts {
  skill: string;

  /**
   * The queue type from which an agent is required.
   */
  serviceQueue: string;
}

interface ILPMessage {
  '@id'?: number;
  '@type'?: string;
  /**
   * Name of sender
   * Example: "Doggy McMittens"
   */
  by: string;
  source: 'visitor' | 'agent' | 'system';
  textType: 'plain' | 'html';
  /**
   * Example: "the bread is on fire"
   */
  text: string;
  /**
   * Example: "2016-12-20T11:27:56.280-05:00"
   */
  time: string;
}

interface ILPChat {

  chatStates: any;

  constructor(config: ILPChatConfig);

  /**
  * For getting agent availability
  */
  getAvailability(options: ILPSkillOpts);

  /**
  * For getting the visitor's name
  */
  getVisitorName();

  /**
   * Returns the estimated wait time in seconds before a chat starts
   * A few special cases:
   *   0 : At least one agent is available to chat immediately (the agent is online and has not exceeded his/her maximum number of chats).
   *  -1 : No agents are online and/or the chat service is unavailable.
   *  -2 : Chat service is available, however, there is not enough data to predict the estimated wait time.
   */
  getEstimatedWaitTime(options: ILPEstimatedWaitTimeOpts);

  /**
  * For setting the visitor's name
  */
  setVisitorName(options: ILPVisitorNameOpts);

  /**
  * For initiating a chat session by sending the appropriate skill
  */
  requestChat(options: ILPSkillOpts);

  /**
  * For setting if the visitor is typing
  */
  setVisitorTyping(options: ILPVisitorTypingOpts);

  /**
  * For requesting a transcript of this chat session
  */
  requestTranscript(options: ILPRequestTranscriptOpts);

  /**
  * Stop the chat
  */
  endChat(options: ILPEndChatOpts);

  /**
  * For setting things like visitor email etc
  */
  setCustomVariable(options: ILPSetCustomVariableOpts);

  /**
  * For sending a message
  */
  addLine(options: ILPAddLineOpts);

  onInit?(Function: (data: ILPOnInit) => any);
  onInfo?(Function: (data: ILPOnInfo) => any);
  onLine?(Function: (data: ILPOnLineData) => any);
  onState?(Function: (data: ILPOnStateData) => any);
  onStart?(Function: (data: ILPOnStateData) => any);
  onStop?(Function: (data: ILPOnStateData) => any);
  onAgentTyping?(Function: any);
}

interface ILPOnInit {
  account: string;
  domain: string;
  init: boolean;
}

interface ILPOnLineData {
  chatState: string;
  lines: ILPMessage[];
}

interface ILPOnStateData {
  state: LPChatState,
  /**
  * Example: "2013-05-23T20:00:11.250-04:00""
  */
  time: string;
}

interface ILPOnInfo {
  /**
  * The visitor tying state.
  */
  typing: Boolean;

  /**
  * The visitor name.
  */
  visitorName: String;

  /**
  * The agent name.
  */
  agentName: String;

  /**
  * The chat session identifier.
  */
  rtSessionId: String;

  /**
  * Chat initialization state. Depends on the onInit event having been triggered.
  */
  intialised: Boolean;

  /**
  * The agent typing state.
  */
  agentTyping: Boolean;

  /**
  * If a chat is currently in progress.
  */
  chatInProgress: Boolean;

  /**
  * The visitor identifier. *This should be passed in from monitoring on the chat request and also between chats if you re-start a new chat.
  */
  visitorId: String;

  /**
  * The agent identifier for this site.
  */
  agentId: String;

  /**
  * The chat session key.
  */
  chatSessionKey: String;

  /**
  * The last time the chat was updated. *The onInfo state event will not be triggered if this is the only change since the last onInfo event.
  */
  lastUpdate: String;

  /**
  * The current chat state
  */
  state: String;
}

interface ILPChatConfig {
  lpNumber: string;
  appKey: string;
  domain: string;

  /**
  * Upon initialisation of the chat instance
  */
  onInit?(data: ILPOnInit);

  /**
  * Published when there is a change in chat information.
  */
  onInfo?(data: ILPOnInfo);

  /**
  * On each message sent from either party, this callback is sent
  */
  onLine?(data: ILPOnLineData);
  onState?(data: ILPOnStateData);
  onStart?(data: ILPOnStateData);
  onStop?(data: ILPOnStateData);
  onAgentTyping?(data);
  onRequestChat?: any[];
}

interface ILPTaglets {
  /**
  * For creating a chat instance
  */
  ChatOverRestAPI: { new(options): ILPChat };
  jsonp: any;
  lpAjax: any;
  postmessage: any;
  rest2jsonp: any;
  xhr: any;
}

interface ILPUtils {
  Events(e);
  SessionDataAsyncWrapper(e);
  deleteProps(e, t);
  getErrorData(e, t, r, i);
  getResponseData(e, t, n, i);
  hasProperties(e);
  log();
  removeRels(e);
  runCallback(e, n, r);
  runErrorCallback(e, t);
  runSuccessCallback(e, t);
  sessionDataManager: any;
  trim(e);
}

interface ILPTag {
  CookieMethods(e);
  RelManager(e);
  SessionDataManager();
  StorageMethods();
  taglets: ILPTaglets;
  utils: ILPUtils;
}

interface Window {
  lpTag: ILPTag;
}
