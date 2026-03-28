/** Evenimentul trimis când un utilizator desenează o linie pe canvas */
export interface DrawEvent {
  posterId: string;
  teamId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}
