import { IResponseError } from "./response.error.interface";

export const GlobalResponseError: (statusCode: number, message: string, code: string) => IResponseError = (
    statusCode: number,
    message: string,
    error: string,
): IResponseError => {
    return {
        statusCode: statusCode,
        message,
        error,
    };
};

