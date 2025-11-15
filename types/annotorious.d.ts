/**
 * Type declarations for @recogito/annotorious
 *
 * Annotorious doesn't ship with TypeScript definitions,
 * so we declare the module here.
 */
declare module '@recogito/annotorious' {
  export class Annotorious {
    constructor(config: {
      image: HTMLImageElement;
      readOnly?: boolean;
      allowEmpty?: boolean;
      drawOnSingleClick?: boolean;
    });

    destroy(): void;
    setDrawingEnabled(enabled: boolean): void;
    setAnnotations(annotations: any[]): void;
    getAnnotations(): any[];
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback?: (...args: any[]) => void): void;
    addAnnotation(annotation: any): void;
    removeAnnotation(annotation: any): void;
    updateSelected(annotation: any): void;
    selectAnnotation(annotation: any): void;
    cancelSelected(): void;
  }
}

declare module '@recogito/annotorious/dist/annotorious.min.css' {
  const content: string;
  export default content;
}
