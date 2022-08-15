import { User } from '@prisma/client';
interface AuthToken {
    email: string;
    role: string;
    id: number;
    fullName: string;
}
declare const _default: {
    getHashedPassword: (password: string) => Promise<string>;
    generateAuthToken: (payload: AuthToken) => string;
    verifyPassword: (hash: {
        content: string;
        iv: string;
    }, password: string) => Promise<boolean>;
    encrypt: (text: string) => {
        iv: string;
        content: string;
    };
    decrypt: (hash: {
        iv: string;
        content: string;
    }) => string;
    generateRandomPassword: () => string;
    sendInvitationMail: (user: User, password: string) => Promise<void>;
    isAdmin: (userId: number) => Promise<boolean>;
    incrementNumberOfWorkingProjects: (adminId: number) => Promise<void>;
    decrementNumberOfWorkingProjects: (adminId: number) => Promise<void>;
    isAnnotator: (userId: number) => Promise<boolean>;
    isQA: (userId: number) => Promise<boolean>;
};
export default _default;
//# sourceMappingURL=service.d.ts.map