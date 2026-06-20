import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    messId?: string;
    rollNumber?: string;
    token: string;
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      userId?: string;
      messId?: string;
      rollNumber?: string;
      accessToken?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    userId?: string;
    messId?: string;
    rollNumber?: string;
    accessToken?: string;
  }
}
