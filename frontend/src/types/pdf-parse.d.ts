declare module 'pdf-parse' {
  // Minimal typing for pdf-parse module
  type PdfParseResult = {
    numpages?: number;
    numrender?: number;
    info?: any;
    metadata?: any;
    text?: string;
    version?: string;
  };

  function pdfParse(
    data: Buffer | Uint8Array | ArrayBuffer | string,
    options?: any
  ): Promise<PdfParseResult>;

  export default pdfParse;
}
