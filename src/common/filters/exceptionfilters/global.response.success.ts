import { ResponseSuccessInterface } from "./response.success.interface";

export const GlobalResponseSuccess: (statusCode: number, message: string) => ResponseSuccessInterface = (
    statusCode: number,
    message: string,
): ResponseSuccessInterface => {
    return {
        statusCode: statusCode,
        message,
    };
};

