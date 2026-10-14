/* Asset loader — paths match STAGE1_SLICE.md / MANIFEST.md */
const ASSET_PATHS = {
  'player.reimu': 'assets/player_reimu.svg',
  'boss.shizuku': 'assets/boss_shizuku.svg',
  'boss.shizuku_spell': 'assets/boss_shizuku_spell.svg',
  'boss.shizuku_mirror': 'assets/boss_shizuku_mirror.svg',
  'enemy.fairy_amber': 'assets/enemy_fairy_amber.svg',
  'enemy.spirit_ripple': 'assets/enemy_spirit_ripple.svg',
  'bullet.amber_dot': 'assets/bullet_amber_dot.svg',
  'bullet.amber_rice': 'assets/bullet_amber_rice.svg',
  'bullet.water_ring': 'assets/bullet_water_ring.svg',
  'bullet.sand_grain': 'assets/bullet_sand_grain.svg',
  'bullet.amber_tear': 'assets/bullet_amber_tear.svg',
  'bullet.mirror_shard': 'assets/bullet_mirror_shard.svg',
  'bg.stage1': 'assets/bg_stage1_lake.svg',
  'ui.spell_banner': 'assets/ui_spell_banner.svg',
  'ui.hud': 'assets/ui_hud_basic.svg',
  'ui.title': 'assets/ui_title_logo.svg',
  'boss.kyouko': 'assets/boss_kyouko.svg',
  'boss.kyouko_spell': 'assets/boss_kyouko_spell.svg',
  'enemy.kodama_echo': 'assets/enemy_kodama_echo.svg',
  'enemy.shadow_self': 'assets/enemy_shadow_self.svg',
  'bullet.echo_orb': 'assets/bullet_echo_orb.svg',
  'bullet.echo_wave': 'assets/bullet_echo_wave.svg',
  'bullet.ring_year': 'assets/bullet_ring_year.svg',
  'bullet.duet_note': 'assets/bullet_duet_note.svg',
  'bg.stage2': 'assets/bg_stage2_forest.svg',
  'boss.tama': 'assets/boss_tama.svg',
  'boss.tama_spell': 'assets/boss_tama_spell.svg',
  'enemy.bead_sprite': 'assets/enemy_bead_sprite.svg',
  'enemy.ledger_slip': 'assets/enemy_ledger_slip.svg',
  'bullet.abacus_bead': 'assets/bullet_abacus_bead.svg',
  'bullet.tally_rod': 'assets/bullet_tally_rod.svg',
  'bullet.debt_seal': 'assets/bullet_debt_seal.svg',
  'bullet.gold_coin': 'assets/bullet_gold_coin.svg',
  'bg.stage3': 'assets/bg_stage3_stairs.svg',
  'enemy.ink_moth': 'assets/enemy_ink_moth.svg',
  'enemy.folio_bit': 'assets/enemy_folio_bit.svg',
  'mid.akyuu': 'assets/mid_akyuu.svg',
  'boss.sumizome': 'assets/boss_sumizome.svg',
  'boss.sumizome_spell': 'assets/boss_sumizome_spell.svg',
  'bullet.ink_drop': 'assets/bullet_ink_drop.svg',
  'bullet.brush_stroke': 'assets/bullet_brush_stroke.svg',
  'bullet.scroll_seal': 'assets/bullet_scroll_seal.svg',
  'bullet.char_glyph': 'assets/bullet_char_glyph.svg',
  'bullet.cart_wheel': 'assets/bullet_cart_wheel.svg',
  'bg.stage4': 'assets/bg_stage4_gallery.svg',
  'enemy.petal_drone': 'assets/enemy_petal_drone.svg',
  'enemy.resin_mite': 'assets/enemy_resin_mite.svg',
  'boss.kohaku': 'assets/boss_kohaku.svg',
  'boss.kohaku_spell': 'assets/boss_kohaku_spell.svg',
  'bullet.petal_slash': 'assets/bullet_petal_slash.svg',
  'bullet.silver_shear': 'assets/bullet_silver_shear.svg',
  'bullet.resin_blob': 'assets/bullet_resin_blob.svg',
  'bullet.amber_cage': 'assets/bullet_amber_cage.svg',
  'bullet.scythe_arc': 'assets/bullet_scythe_arc.svg',
  'bg.stage5': 'assets/bg_stage5_garden.svg',
  'enemy.chrono_wisp': 'assets/enemy_chrono_wisp.svg',
  'enemy.memory_orb': 'assets/enemy_memory_orb.svg',
  'boss.kuon': 'assets/boss_kuon.svg',
  'boss.kuon_spell': 'assets/boss_kuon_spell.svg',
  'boss.kuon_last': 'assets/boss_kuon_last.svg',
  'bullet.god_tear': 'assets/bullet_god_tear.svg',
  'bullet.feast_lantern': 'assets/bullet_feast_lantern.svg',
  'bullet.dusk_ray': 'assets/bullet_dusk_ray.svg',
  'bullet.amber_seal': 'assets/bullet_amber_seal.svg',
  'bullet.chrono_shard': 'assets/bullet_chrono_shard.svg',
  'bg.stage6': 'assets/bg_stage6_firmament.svg',
  'fx.amber_freeze': 'assets/fx_amber_freeze.svg',
  'enemy.crystal_gnaw': 'assets/enemy_crystal_gnaw.svg',
  'enemy.chrono_fang': 'assets/enemy_chrono_fang.svg',
  'boss.shoku': 'assets/boss_shoku.svg',
  'boss.shoku_spell': 'assets/boss_shoku_spell.svg',
  'boss.shoku_last': 'assets/boss_shoku_last.svg',
  'bullet.gnaw_tooth': 'assets/bullet_gnaw_tooth.svg',
  'bullet.blank_page': 'assets/bullet_blank_page.svg',
  'bullet.white_breath': 'assets/bullet_white_breath.svg',
  'bullet.skip_arrow': 'assets/bullet_skip_arrow.svg',
  'bullet.inverse_scale': 'assets/bullet_inverse_scale.svg',
  'bullet.chrono_bite': 'assets/bullet_chrono_bite.svg',
  'bg.stage_ex': 'assets/bg_stage_ex_cavern.svg',
};

const OPTIONAL_ASSETS = new Set([
  'boss.shizuku_spell', 'boss.shizuku_mirror',
  'bullet.amber_tear', 'bullet.mirror_shard',
  'boss.kyouko', 'boss.kyouko_spell',
  'enemy.kodama_echo', 'enemy.shadow_self',
  'bullet.echo_orb', 'bullet.echo_wave', 'bullet.ring_year', 'bullet.duet_note',
  'bg.stage2',
  'boss.tama', 'boss.tama_spell',
  'enemy.bead_sprite', 'enemy.ledger_slip',
  'bullet.abacus_bead', 'bullet.tally_rod', 'bullet.debt_seal', 'bullet.gold_coin',
  'bg.stage3',
  'enemy.ink_moth', 'enemy.folio_bit', 'mid.akyuu',
  'boss.sumizome', 'boss.sumizome_spell',
  'bullet.ink_drop', 'bullet.brush_stroke', 'bullet.scroll_seal',
  'bullet.char_glyph', 'bullet.cart_wheel',
  'bg.stage4',
  'enemy.petal_drone', 'enemy.resin_mite',
  'boss.kohaku', 'boss.kohaku_spell',
  'bullet.petal_slash', 'bullet.silver_shear', 'bullet.resin_blob',
  'bullet.amber_cage', 'bullet.scythe_arc',
  'bg.stage5',
  'enemy.chrono_wisp', 'enemy.memory_orb',
  'boss.kuon', 'boss.kuon_spell', 'boss.kuon_last',
  'bullet.god_tear', 'bullet.feast_lantern', 'bullet.dusk_ray',
  'bullet.amber_seal', 'bullet.chrono_shard',
  'bg.stage6', 'fx.amber_freeze',
  'enemy.crystal_gnaw', 'enemy.chrono_fang',
  'boss.shoku', 'boss.shoku_spell', 'boss.shoku_last',
  'bullet.gnaw_tooth', 'bullet.blank_page', 'bullet.white_breath',
  'bullet.skip_arrow', 'bullet.inverse_scale', 'bullet.chrono_bite',
  'bg.stage_ex',
]);

const Images = {};

function loadImage(key, src, optional) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { Images[key] = img; resolve(img); };
    img.onerror = () => {
      if (optional) resolve(null);
      else { console.warn('fail', src); resolve(null); }
    };
    img.src = src;
  });
}

async function loadAllAssets() {
  const entries = Object.entries(ASSET_PATHS);
  await Promise.all(entries.map(([k, p]) => loadImage(k, p, OPTIONAL_ASSETS.has(k))));
  // fallbacks
  if (!Images['boss.shizuku_spell'] && Images['boss.shizuku']) Images['boss.shizuku_spell'] = Images['boss.shizuku'];
  if (!Images['boss.shizuku_mirror'] && Images['boss.shizuku']) Images['boss.shizuku_mirror'] = Images['boss.shizuku'];
  if (!Images['bullet.amber_tear'] && Images['bullet.amber_rice']) Images['bullet.amber_tear'] = Images['bullet.amber_rice'];
  if (!Images['bullet.mirror_shard'] && Images['bullet.amber_dot']) Images['bullet.mirror_shard'] = Images['bullet.amber_dot'];
  if (!Images['boss.kyouko_spell'] && Images['boss.kyouko']) Images['boss.kyouko_spell'] = Images['boss.kyouko'];
  if (!Images['bg.stage2'] && Images['bg.stage1']) Images['bg.stage2'] = Images['bg.stage1'];
  if (!Images['boss.tama_spell'] && Images['boss.tama']) Images['boss.tama_spell'] = Images['boss.tama'];
  if (!Images['bg.stage3'] && Images['bg.stage1']) Images['bg.stage3'] = Images['bg.stage1'];
  if (!Images['boss.sumizome_spell'] && Images['boss.sumizome']) Images['boss.sumizome_spell'] = Images['boss.sumizome'];
  if (!Images['bg.stage4'] && Images['bg.stage1']) Images['bg.stage4'] = Images['bg.stage1'];
  if (!Images['boss.kohaku_spell'] && Images['boss.kohaku']) Images['boss.kohaku_spell'] = Images['boss.kohaku'];
  if (!Images['bg.stage5'] && Images['bg.stage1']) Images['bg.stage5'] = Images['bg.stage1'];
  if (!Images['boss.kuon_spell'] && Images['boss.kuon']) Images['boss.kuon_spell'] = Images['boss.kuon'];
  if (!Images['boss.kuon_last'] && Images['boss.kuon']) Images['boss.kuon_last'] = Images['boss.kuon'];
  if (!Images['bg.stage6'] && Images['bg.stage1']) Images['bg.stage6'] = Images['bg.stage1'];
  if (!Images['boss.shoku_spell'] && Images['boss.shoku']) Images['boss.shoku_spell'] = Images['boss.shoku'];
  if (!Images['boss.shoku_last'] && Images['boss.shoku']) Images['boss.shoku_last'] = Images['boss.shoku'];
  if (!Images['bg.stage_ex'] && Images['bg.stage1']) Images['bg.stage_ex'] = Images['bg.stage1'];
  if (!Images['bullet.skip_arrow'] && Images['bullet.amber_dot']) Images['bullet.skip_arrow'] = Images['bullet.amber_dot'];
  if (!Images['bullet.gnaw_tooth'] && Images['bullet.amber_dot']) Images['bullet.gnaw_tooth'] = Images['bullet.amber_dot'];
  if (!Images['bullet.inverse_scale'] && Images['bullet.amber_dot']) Images['bullet.inverse_scale'] = Images['bullet.amber_dot'];
  if (!Images['bullet.blank_page'] && Images['bullet.amber_dot']) Images['bullet.blank_page'] = Images['bullet.amber_dot'];
  if (!Images['bullet.white_breath'] && Images['bullet.amber_dot']) Images['bullet.white_breath'] = Images['bullet.amber_dot'];
  if (!Images['bullet.chrono_bite'] && Images['bullet.chrono_shard']) Images['bullet.chrono_bite'] = Images['bullet.chrono_shard'];
  if (!Images['enemy.crystal_gnaw'] && Images['enemy.chrono_wisp']) Images['enemy.crystal_gnaw'] = Images['enemy.chrono_wisp'];
  if (!Images['enemy.chrono_fang'] && Images['enemy.resin_mite']) Images['enemy.chrono_fang'] = Images['enemy.resin_mite'];
  return Images;
}

function drawSprite(ctx, key, x, y, w, h, rot, alpha) {
  const img = Images[key];
  if (!img) return;
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  if (alpha != null) ctx.globalAlpha = alpha;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}
