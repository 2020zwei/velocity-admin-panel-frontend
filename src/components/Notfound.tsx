
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

interface Props {
    message?: string;
    status?: number;
    showHomeButton?: boolean;
    showStatus?: boolean;
    buttonText?: string;
    url?: string;
    classNames?: {
        container?: string;
        status?: string;
        button?: string;
        message?: string;
    };
}

const NotFound = ({
    message = "Page not found",
    status = 404,
    showHomeButton = false,
    url = "/",
    showStatus = false,
    buttonText,
    classNames
}: Props) => {
    const navigate = useNavigate();

    return (
        <div className={clsx("flex flex-col items-center justify-center w-full p-4 col-span-12", classNames?.container)}>
            {showStatus && <h1 className={clsx("text-6xl font-bold text-red-500 ", classNames?.status)}>{status}</h1>}
            <p className={clsx("text-[#1D2530] font-semibold text-sm dark:text-white", classNames?.message)}>{message}</p>
            {showHomeButton && (
                <button
                    onClick={() => navigate(url)}
                    className={clsx("px-4 text-xs py-1 mt-1 bg-blue-500 text-white rounded dark:text-white hover:bg-blue-600 transition", classNames?.button)}
                >
                    {showHomeButton && buttonText ? buttonText : "Go to Home"}
                </button>
            )}
        </div>
    );
};

export default NotFound;
