export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at?: string;
}

export interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}
