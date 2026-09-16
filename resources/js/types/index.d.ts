export type User = {
    id: number;
    name: string;
    username: string;
    email: string | null;
    email_verified_at?: string;
    role: 'admin' | 'cashier';
    is_active: boolean;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
