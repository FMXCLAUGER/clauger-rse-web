import "next-auth";

/**
 * NextAuth Type Extensions
 *
 * Extend NextAuth session and JWT types to include custom user fields.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    image?: string;
  }
}
