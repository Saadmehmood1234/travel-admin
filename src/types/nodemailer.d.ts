// types/nodemailer.d.ts
declare module 'nodemailer' {
  export interface Transporter {}
  export interface SendMailOptions {}
  export interface SentMessageInfo {}
  
  export function createTransport(options: any): any;
}