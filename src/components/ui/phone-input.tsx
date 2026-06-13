"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Mask: +38(0__)-___-__-__
// Digits positions (0-indexed in display string):
// +38(0 X X)-X X X-X X-X X
//       4 5   8 9 10  12 13  15 16

const MASK = "+38(0__)-___-__-__";
const PREFIX = "+38(0";
const DIGIT_POSITIONS = [5, 6, 9, 10, 11, 14, 15, 17, 18]; // positions of '_' in mask

function formatPhone(digits: string): string {
  const d = digits.slice(0, 9);
  let result = PREFIX;
  result += (d[0] ?? "_") + (d[1] ?? "_");
  result += ")-";
  result += (d[2] ?? "_") + (d[3] ?? "_") + (d[4] ?? "_");
  result += "-";
  result += (d[5] ?? "_") + (d[6] ?? "_");
  result += "-";
  result += (d[7] ?? "_") + (d[8] ?? "_");
  return result;
}

function extractDigits(masked: string): string {
  // Extract only the variable digits (after +380)
  let digits = "";
  for (const pos of DIGIT_POSITIONS) {
    const ch = masked[pos];
    if (ch && ch >= "0" && ch <= "9") {
      digits += ch;
    }
  }
  return digits;
}

function toRawPhone(digits: string): string {
  if (digits.length === 0) return "";
  return "+380" + digits;
}

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onRawChange?: (rawPhone: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  onRawChange,
  name,
  required,
  placeholder,
  className,
  disabled,
}: PhoneInputProps) {
  // Convert raw phone (+380XXXXXXXXX) to just variable digits
  function rawToDigits(raw: string | undefined): string {
    if (!raw) return "";
    const clean = raw.replace(/\D/g, "");
    // If starts with 380, strip it
    if (clean.startsWith("380")) return clean.slice(3, 12);
    // If starts with 0, strip leading 0
    if (clean.startsWith("0")) return clean.slice(1, 10);
    return clean.slice(0, 9);
  }

  const [digits, setDigits] = React.useState(() => rawToDigits(value));
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync external value changes
  React.useEffect(() => {
    const newDigits = rawToDigits(value);
    setDigits(newDigits);
  }, [value]);

  const displayValue = focused || digits.length > 0 ? formatPhone(digits) : "";

  function setCursorToNextDigit(input: HTMLInputElement, currentDigits: string) {
    const nextIndex = currentDigits.length;
    if (nextIndex < DIGIT_POSITIONS.length) {
      const pos = DIGIT_POSITIONS[nextIndex];
      requestAnimationFrame(() => input.setSelectionRange(pos, pos));
    } else {
      const pos = DIGIT_POSITIONS[DIGIT_POSITIONS.length - 1] + 1;
      requestAnimationFrame(() => input.setSelectionRange(pos, pos));
    }
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setFocused(true);
    setCursorToNextDigit(e.target, digits);
  }

  function handleBlur() {
    setFocused(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const input = e.currentTarget;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits.length > 0) {
        const newDigits = digits.slice(0, -1);
        updateDigits(newDigits);
        setCursorToNextDigit(input, newDigits);
      }
      return;
    }

    if (e.key === "Delete") {
      e.preventDefault();
      return;
    }

    // Allow tab, arrows etc
    if (e.key.length > 1) return;

    // Only allow digits
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      if (digits.length < 9) {
        const newDigits = digits + e.key;
        updateDigits(newDigits);
        setCursorToNextDigit(input, newDigits);
      }
      return;
    }

    // Block everything else
    e.preventDefault();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleaned = pasted.replace(/\D/g, "");
    let pastedDigits = "";

    // Smart parse pasted number
    if (cleaned.startsWith("380")) {
      pastedDigits = cleaned.slice(3);
    } else if (cleaned.startsWith("80")) {
      pastedDigits = cleaned.slice(2);
    } else if (cleaned.startsWith("0")) {
      pastedDigits = cleaned.slice(1);
    } else {
      pastedDigits = cleaned;
    }

    pastedDigits = pastedDigits.slice(0, 9);
    if (pastedDigits) {
      updateDigits(pastedDigits);
      setCursorToNextDigit(e.currentTarget, pastedDigits);
    }
  }

  function handleClick(e: React.MouseEvent<HTMLInputElement>) {
    setCursorToNextDigit(e.currentTarget, digits);
  }

  function updateDigits(newDigits: string) {
    setDigits(newDigits);
    const raw = toRawPhone(newDigits);
    onChange?.(raw);
    onRawChange?.(raw);
  }

  const isValid = digits.length === 9;
  const showInvalid = !focused && digits.length > 0 && !isValid;

  return (
    <>
      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={toRawPhone(digits)}
        />
      )}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        disabled={disabled}
        required={required}
        value={displayValue}
        placeholder={placeholder || "+38(0__)-___-__-__"}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleClick}
        onChange={() => {}} // controlled
        aria-invalid={showInvalid || undefined}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className
        )}
      />
    </>
  );
}
