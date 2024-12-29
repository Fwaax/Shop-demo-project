import React from "react";
import { useEffect, useState } from "react";

interface NumericInputWithNumberValueProps {
    className?: string;
    id?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    onlyAllowIntegers?: boolean;
    value: number;
    setValue: (value: number) => void;
    disabled?: boolean;
    allowedMaxNumberOfCharacters?: number; // Maximum number of characters allowed
    allowedMaxNumberOfDecimalsAfterDot?: number; // New prop for limiting decimals
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Add this line
}


export const NumericInputWithNumberValue = React.forwardRef<
    HTMLInputElement,
    NumericInputWithNumberValueProps
>(
    (
        {
            className,
            id,
            placeholder = "0",
            min = Number.MIN_SAFE_INTEGER,
            max = Number.MAX_SAFE_INTEGER,
            onlyAllowIntegers = false,
            value,
            setValue,
            disabled = false,
            allowedMaxNumberOfCharacters = 20,
            allowedMaxNumberOfDecimalsAfterDot = 9, // Default is 9
            onKeyDown,
        },
        ref,
    ) => {
        const [inputValue, setInputValue] = useState<string>(value.toString());
        const [isEditing, setIsEditing] = useState(false);

        useEffect(() => {
            // Update input if external value changes and user is not editing
            if (!isEditing) {
                setInputValue(isNaN(value) ? "" : value.toString());
            }
        }, [value, isEditing]);

        function inputChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
            let newVal = e.target.value.trim();
            setIsEditing(true);

            if (disabled) {
                return;
            } // Ignore changes if input is disabled

            // Restrict input length if allowedMaxNumberOfCharacters is defined
            if (newVal.length > allowedMaxNumberOfCharacters) {
                return;
            }

            // Allow empty input to clear the value
            if (newVal === "") {
                setInputValue("");
                setValue(NaN);
                setIsEditing(false);
                return;
            }

            // Allow "-" as a valid input if min is less than 0
            if (newVal === "-" && (min ?? -Infinity) < 0) {
                setInputValue("-");
                setValue(NaN);
                return;
            }

            // Allow "." as a valid input if onlyAllowIntegers is false
            if (newVal === "." && !onlyAllowIntegers) {
                setInputValue("0.");
                setValue(NaN);
                return;
            }

            // Prevent multiple dots in the input
            if (newVal.split(".").length > 2) {
                return;
            }

            // Handle cases where only integers are allowed
            if (onlyAllowIntegers) {
                newVal = newVal.replace(/\..*/, ""); // Remove decimal part
            }

            // Limit the number of decimal places if necessary
            if (!onlyAllowIntegers && newVal.includes(".")) {
                const [integerPart, decimalPart] = newVal.split(".");
                if (decimalPart.length > allowedMaxNumberOfDecimalsAfterDot) {
                    newVal = `${integerPart}.${decimalPart.slice(0, allowedMaxNumberOfDecimalsAfterDot)}`;
                }
            }

            // Allow intermediate states that end with a dot or negative sign
            if (newVal.endsWith(".") || newVal === "-") {
                setInputValue(newVal);
                return;
            }

            // Validate if the input is a valid number
            const parsedNum = parseFloat(newVal);
            if (isNaN(parsedNum)) {
                return;
            } // Reject invalid numbers

            // If parsed number is valid, only set it after clamping
            if (!isNaN(parsedNum)) {
                if (parsedNum > (max ?? Infinity)) {
                    setInputValue(max.toString());
                    setValue(max);
                } else if (parsedNum < (min ?? -Infinity)) {
                    setInputValue(min.toString());
                    setValue(min);
                } else {
                    setInputValue(newVal); // Keep the original input to preserve decimals
                    setValue(parsedNum); // Update state with actual parsed number
                }
            }
        }

        function handleBlur() {
            setIsEditing(false);
        }

        return (
            <input
                id={id}
                ref={ref}
                className={className}
                value={inputValue}
                onChange={inputChangeHandler}
                placeholder={placeholder}
                disabled={disabled}
                onKeyDown={onKeyDown}
                onBlur={handleBlur}
            />
        );
    },
);