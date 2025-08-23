import NextAuth from "next-auth";
declare module "next-auth"{
    interface User{
        id?:string;
        role?:string
        phone?:string
        emailVerified?:Boolean | null
    }
    interface Profile {
        picture?: string; 
        phone?: string; 
      }
    interface Session{
        user:{
            id?:string;
            email?:string;
            phone?:string
            role?:string;
            emailVerified?:Boolean | null
        } & DefaultSession["user"]
    }
}