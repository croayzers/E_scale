/* ─────────────────────────────────────────────────────────
   SCHEMA BUILDERS — master registry
   Imports category builders and maps them to schema keys.
   To add a new element: add its builder to the right category
   file in builders/, then register it here.
   ───────────────────────────────────────────────────────── */

import { buildRoundTable, buildChair, buildChairLine }      from './builders/tables.js';
import { buildBuffet, buildBuffetCarrito, buildBuffetCarro } from './builders/buffet.js';
import { buildStage }                                        from './builders/stage.js';
import { buildLighting }                                     from './builders/lighting.js';
import { buildSurface, buildArrow }                          from './builders/surfaces.js';
import { buildPerson }                                       from './builders/persons.js';
import { buildSofa }                                         from './builders/seating.js';
import { buildPergola }                                      from './builders/nature.js';
import { buildGenericRect, buildGenericRound }               from './builders/generic.js';

export const SCHEMA_BUILDERS = {
  roundTableBanquet: buildRoundTable,
  chairDining:       buildChair,
  chairLine:         buildChairLine,
  buffetStation:     buildBuffet,
  buffetCarrito:     buildBuffetCarrito,
  buffetCart:        buildBuffetCarro,
  stagePlatform:     buildStage,
  genericRectProp:   buildGenericRect,
  genericRoundProp:  buildGenericRound,
  genericSurface:    buildSurface,
  genericPerson:     buildPerson,
  arrow2D:           buildArrow,
  genericLighting:   buildLighting,
  sofaSeat:          buildSofa,
  pergola:           buildPergola,
};
