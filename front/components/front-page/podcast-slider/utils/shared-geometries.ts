import { PlaneGeometry } from "three";
import { GRID_PLANE_SIZE } from "../constants";

export const gridPlaneGeometry = new PlaneGeometry(GRID_PLANE_SIZE, GRID_PLANE_SIZE, 128, 128);
