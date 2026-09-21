export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // 1. Prototype Chain ကို မှန်ကန်အောင် ပြန်ညှိခြင်း (instanceof စစ်လို့ရအောင်)
    Object.setPrototypeOf(this, new.target.prototype);

    // 2. Stack trace ထဲမှ AppError constructor ကို ဖယ်ထုတ်ပြီး Error ဖြစ်သည့်နေရာအစစ်ကို ပြပေးခြင်း
    Error.captureStackTrace?.(this, this.constructor);
  }
}