declare const _default: {
    application: {
        port: string;
        env: string | undefined;
        isTest: boolean;
        isDev: boolean;
        isHeroku: boolean;
        workers: string | number;
    };
    logs: {
        level: string;
    };
    api: {
        prefix: string;
    };
    databaseURL: string;
    clientURL: string;
    jwtSecret: string;
    encryptSecret: string;
    gmailAppPassword: string;
    gmailEmail: string;
    mongoDatabaseURL: string;
    sqlDatabaseURL: string;
    aws: {
        keyId: string;
        secretAccessKey: string;
        s3: {
            bucket: string;
            region: string;
        };
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map