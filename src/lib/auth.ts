// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import dbConnect from "./dbConnect";
import userModel from "@/models/User";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { v4 as uuidv4 } from "uuid";
import { NextAuthOptions } from "next-auth";
import { sendVerificationEmail } from "@/utils/sendEmailVerification";
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();

        const user = await userModel.findOne({
          email: credentials.email,
        }).select("+password");
        if (!user) {
          throw new Error("User not found");
        }
        if (user.provider === "google") {
          throw new Error("Please sign in with Google");
        }
        if (!user.emailVerified) {
          console.log("Your are not verified please sign up again");
          throw new Error("Your are not verified please sign up again");
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        try {
          const existingUser = await userModel.findOne({
            email: profile?.email,
          });

          if (!existingUser) {
           const user =  await userModel.create({
              name: profile?.name || "",
              email: profile?.email,
              phone: uuidv4(),
              image: profile?.picture,
              emailVerified: true,
              password: "google",
              provider: account.provider,
              role: "user",
            });
            if(!user){
              return false;
            }
            return true;
          }

          existingUser.emailVerified = true;
          await existingUser.save({validateBeforeSave:false});

          return true;
        } catch (err) {
          console.log("Google sign-in error:", err);
          return false;
        }
      }
      if (account?.provider === "credentials") {
        await dbConnect();
        const dbUser = await userModel.findOne({ email: user.email });
        if (!dbUser) {
          return false;
        }

        if (!dbUser.emailVerified) {
          if (
            !dbUser.verificationToken ||
            new Date(dbUser.verificationTokenExpires) < new Date()
          ) {
            const verificationToken = uuidv4();
            await userModel.updateOne(
              { email: user.email },
              {
                verificationToken,
                verificationTokenExpires: new Date(
                  Date.now() + 24 * 60 * 60 * 1000
                ),
              }
            );
            await sendVerificationEmail(user.email, verificationToken);
          }
        }

        return true;
      }
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
        token.image = user.image;
        token.role = user.role ?? "user";
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.phone = token.phone;
        session.user.image = token.image;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  // cookies: {
  //   sessionToken: {
  //     name:
  //       process.env.NODE_ENV === "production"
  //         ? "__Secure-auth.session-token"
  //         : "dev-auth.session-token",
  //     options: {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "strict",
  //       path: "/",
  //       maxAge: 24 * 60 * 60,
  //     },
  //   },
  // },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-email",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
