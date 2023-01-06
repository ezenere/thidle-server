export type DefaultResponseObject =
  | {
      success: false;
      code: string;
      error: string;
    }
  | {
      success: true;
      data: any;
    };
