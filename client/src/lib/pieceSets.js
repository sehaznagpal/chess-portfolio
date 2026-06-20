// Geometric set
import g_wp from '../assets/pieces/geometric/piece-white-pawn.svg';
import g_wn from '../assets/pieces/geometric/piece-white-knight.svg';
import g_wb from '../assets/pieces/geometric/piece-white-bishop.svg';
import g_wr from '../assets/pieces/geometric/piece-white-rook.svg';
import g_wq from '../assets/pieces/geometric/piece-white-queen.svg';
import g_wk from '../assets/pieces/geometric/piece-white-king.svg';
import g_bp from '../assets/pieces/geometric/piece-black-pawn.svg';
import g_bn from '../assets/pieces/geometric/piece-black-knight.svg';
import g_bb from '../assets/pieces/geometric/piece-black-bishop.svg';
import g_br from '../assets/pieces/geometric/piece-black-rook.svg';
import g_bq from '../assets/pieces/geometric/piece-black-queen.svg';
import g_bk from '../assets/pieces/geometric/piece-black-king.svg';

// 3D set
import t3_wp from '../assets/pieces/3d/piece-white-pawn.svg';
import t3_wn from '../assets/pieces/3d/piece-white-knight.svg';
import t3_wb from '../assets/pieces/3d/piece-white-bishop.svg';
import t3_wr from '../assets/pieces/3d/piece-white-rook.svg';
import t3_wq from '../assets/pieces/3d/piece-white-queen.svg';
import t3_wk from '../assets/pieces/3d/piece-white-king.svg';
import t3_bp from '../assets/pieces/3d/piece-black-pawn.svg';
import t3_bn from '../assets/pieces/3d/piece-black-knight.svg';
import t3_bb from '../assets/pieces/3d/piece-black-bishop.svg';
import t3_br from '../assets/pieces/3d/piece-black-rook.svg';
import t3_bq from '../assets/pieces/3d/piece-black-queen.svg';
import t3_bk from '../assets/pieces/3d/piece-black-king.svg';

// 2D set
import t2_wp from '../assets/pieces/2d/piece-white-pawn.svg';
import t2_wn from '../assets/pieces/2d/piece-white-knight.svg';
import t2_wb from '../assets/pieces/2d/piece-white-bishop.svg';
import t2_wr from '../assets/pieces/2d/piece-white-rook.svg';
import t2_wq from '../assets/pieces/2d/piece-white-queen.svg';
import t2_wk from '../assets/pieces/2d/piece-white-king.svg';
import t2_bp from '../assets/pieces/2d/piece-black-pawn.svg';
import t2_bn from '../assets/pieces/2d/piece-black-knight.svg';
import t2_bb from '../assets/pieces/2d/piece-black-bishop.svg';
import t2_br from '../assets/pieces/2d/piece-black-rook.svg';
import t2_bq from '../assets/pieces/2d/piece-black-queen.svg';
import t2_bk from '../assets/pieces/2d/piece-black-king.svg';

export const PIECE_SETS = {
  geometric: {
    wp: g_wp, wn: g_wn, wb: g_wb, wr: g_wr, wq: g_wq, wk: g_wk,
    bp: g_bp, bn: g_bn, bb: g_bb, br: g_br, bq: g_bq, bk: g_bk,
  },
  '3d': {
    wp: t3_wp, wn: t3_wn, wb: t3_wb, wr: t3_wr, wq: t3_wq, wk: t3_wk,
    bp: t3_bp, bn: t3_bn, bb: t3_bb, br: t3_br, bq: t3_bq, bk: t3_bk,
  },
  '2d': {
    wp: t2_wp, wn: t2_wn, wb: t2_wb, wr: t2_wr, wq: t2_wq, wk: t2_wk,
    bp: t2_bp, bn: t2_bn, bb: t2_bb, br: t2_br, bq: t2_bq, bk: t2_bk,
  },
};

// Piece height as percentage of square size, tuned per style since each
// set's pieces have different relative proportions.
export const PIECE_HEIGHT_PCT = {
  geometric: { p: '52%', n: '75%', b: '75%', r: '75%', q: '89%', k: '94%' },
  '3d':      { p: '60%', n: '68%', b: '78%', r: '67%', q: '82%', k: '85%' },
  '2d':      { p: '64%', n: '70%', b: '68%', r: '70%', q: '70%', k: '70%' },
};

export const PIECE_STYLE_LABELS = {
  geometric: 'Geometric',
  '3d': '3D',
  '2d': '2D',
};

export const PIECE_STYLE_NAMES = ['geometric', '3d', '2d'];
