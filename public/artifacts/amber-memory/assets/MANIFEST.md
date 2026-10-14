# Assets Manifest

> **v1.1 清晰重绘**（2026-10-14）：硬描边 + 实色/少量线性渐变；禁用 feGaussianBlur / 大面积雾滤镜；同名同 viewBox 覆盖。  
> 本轮改动：`player_reimu.svg`（P0），以及 `boss_shizuku(+_spell/_mirror)`、`boss_kyouko(+_spell)`、`boss_tama(+_spell)`、`boss_sumizome(+_spell)`、`boss_kohaku(+_spell)`、`boss_kuon(+_spell/_last)`、`boss_shoku(+_spell/_last)`、`mid_akyuu.svg`、`enemy_fairy_amber.svg`、`enemy_shadow_self.svg`；子弹清读：`bullet_amber_dot.svg`、`bullet_water_ring.svg`、`bullet_echo_orb.svg`。

色板：Stage1 见 `STAGE1_SLICE.md` §2；Stage2 林道追加见 `STAGE2.md` §1。  
状态：`final` = 美术正式稿（含 v1.1 清晰重绘）。

## Stage 1

| 实体 id | 文件 | viewBox | 状态 |
|---------|------|---------|------|
| `player.reimu` | `player_reimu.svg` | 48×64 | final · v1.1 |
| `boss.shizuku` | `boss_shizuku.svg` | 80×96 | final · v1.1 |
| `boss.shizuku_spell` | `boss_shizuku_spell.svg` | 80×96 | final · v1.1 |
| `boss.shizuku_mirror` | `boss_shizuku_mirror.svg` | 80×96 | final · v1.1 |
| `enemy.fairy_amber` | `enemy_fairy_amber.svg` | 32×32 | final · v1.1 |
| `enemy.spirit_ripple` | `enemy_spirit_ripple.svg` | 36×36 | final |
| `bullet.amber_dot` | `bullet_amber_dot.svg` | 16×16 | final · v1.1 |
| `bullet.amber_rice` | `bullet_amber_rice.svg` | 12×20 | final |
| `bullet.water_ring` | `bullet_water_ring.svg` | 24×24 | final · v1.1 |
| `bullet.sand_grain` | `bullet_sand_grain.svg` | 10×10 | final |
| `bullet.amber_tear` | `bullet_amber_tear.svg` | 14×22 | final |
| `bullet.mirror_shard` | `bullet_mirror_shard.svg` | 16×16 | final |
| (bg) | `bg_stage1_lake.svg` | 384×448 | final |
| (ui) | `ui_spell_banner.svg` | 360×56 | final |
| (ui) | `ui_hud_basic.svg` | 120×80 | final |
| (ui) | `ui_title_logo.svg` | 360×100 | final |

## Stage 2（本轮 P0 + P1 符卡姿）

| 实体 id | 文件 | viewBox | 状态 | 备注 |
|---------|------|---------|------|------|
| `boss.kyouko` | `boss_kyouko.svg` | 80×96 | final · v1.1 | 古杉木灵 idle |
| `boss.kyouko_spell` | `boss_kyouko_spell.svg` | 80×96 | final · v1.1 | P1：广播/声波姿 |
| `enemy.kodama_echo` | `enemy_kodama_echo.svg` | 32×32 | final | 回音木叶妖 |
| `enemy.shadow_self` | `enemy_shadow_self.svg` | 36×48 | final · v1.1 | 昨日残影（半透明伪自机） |
| `bullet.echo_orb` | `bullet_echo_orb.svg` | 16×16 | final · v1.1 | 青绿回声玉 |
| `bullet.echo_wave` | `bullet_echo_wave.svg` | 20×12 | final | 声波弧 |
| `bullet.ring_year` | `bullet_ring_year.svg` | 24×24 | final | 年轮环 |
| `bullet.duet_note` | `bullet_duet_note.svg` | 14×18 | final | 二重唱音符 |
| (bg) | `bg_stage2_forest.svg` | 384×448 | final | 杉林 + 残影雾 |

全部纯 SVG。程序覆盖同名即可。

## Stage3（程序占位，待美术 final）

| 实体 id | 文件 | 状态 |
|---------|------|------|
| `enemy.bead_sprite` | `enemy_bead_sprite.svg` | placeholder |
| `enemy.ledger_slip` | `enemy_ledger_slip.svg` | placeholder |
| `boss.tama` | `boss_tama.svg` | placeholder |
| `boss.tama_spell` | `boss_tama_spell.svg` | placeholder |
| `bullet.abacus_bead` | `bullet_abacus_bead.svg` | placeholder |
| `bullet.tally_rod` | `bullet_tally_rod.svg` | placeholder |
| `bullet.debt_seal` | `bullet_debt_seal.svg` | placeholder |
| `bullet.gold_coin` | `bullet_gold_coin.svg` | placeholder |
| (bg) | `bg_stage3_stairs.svg` | placeholder |

## Stage 3（本轮 P0 + P1）

| 实体 id | 文件 | viewBox | 状态 | 备注 |
|---------|------|---------|------|------|
| `boss.tama` | `boss_tama.svg` | 80×96 | final · v1.1 | 紫檀算盘付丧神 |
| `boss.tama_spell` | `boss_tama_spell.svg` | 80×96 | final · v1.1 | P1：拨珠/债印姿 |
| `enemy.bead_sprite` | `enemy_bead_sprite.svg` | 28×28 | final | 算珠小妖 |
| `enemy.ledger_slip` | `enemy_ledger_slip.svg` | 24×32 | final | 飞账纸 |
| `bullet.abacus_bead` | `bullet_abacus_bead.svg` | 14×14 | final | 算珠弹 |
| `bullet.tally_rod` | `bullet_tally_rod.svg` | 8×22 | final | 算筹弹 |
| `bullet.debt_seal` | `bullet_debt_seal.svg` | 16×16 | final | 朱砂债印 |
| `bullet.gold_coin` | `bullet_gold_coin.svg` | 16×16 | final | 金算币 |
| (bg) | `bg_stage3_stairs.svg` | 384×448 | final | 旧参道石阶+山门 |

## Stage 4（本轮 P0 + P1）

| 实体 id | 文件 | viewBox | 状态 | 备注 |
|---------|------|---------|------|------|
| `mid.akyuu` | `mid_akyuu.svg` | 80×96 | final · v1.1 | 阿求投影（紫和服+眼镜+笔记） |
| `boss.sumizome` | `boss_sumizome.svg` | 80×96 | final · v1.1 | 纪伊墨染 idle |
| `boss.sumizome_spell` | `boss_sumizome_spell.svg` | 80×96 | final · v1.1 | P1：笔+朱印姿 |
| `enemy.ink_moth` | `enemy_ink_moth.svg` | 32×32 | final | 墨蛾 |
| `enemy.folio_bit` | `enemy_folio_bit.svg` | 24×32 | final | 散页 |
| `bullet.ink_drop` | `bullet_ink_drop.svg` | 12×16 | final | 墨滴 |
| `bullet.brush_stroke` | `bullet_brush_stroke.svg` | 28×8 | final | 笔触 |
| `bullet.scroll_seal` | `bullet_scroll_seal.svg` | 16×16 | final | 朱印卷印 |
| `bullet.char_glyph` | `bullet_char_glyph.svg` | 16×16 | final | 字碑（笔画「史」意象） |
| `bullet.cart_wheel` | `bullet_cart_wheel.svg` | 20×20 | final | 文车轮 |
| (bg) | `bg_stage4_gallery.svg` | 384×448 | final | 琥珀长廊云海 |

## Stage 5（本轮 P0 + P1）

| 实体 id | 文件 | viewBox | 状态 | 备注 |
|---------|------|---------|------|------|
| `boss.kohaku` | `boss_kohaku.svg` | 80×96 | final · v1.1 | 久远寺琥珀 idle（镰收） |
| `boss.kohaku_spell` | `boss_kohaku_spell.svg` | 80×96 | final · v1.1 | P1：双镰张开 |
| `enemy.petal_drone` | `enemy_petal_drone.svg` | 32×32 | final | 金瓣仆 |
| `enemy.resin_mite` | `enemy_resin_mite.svg` | 28×28 | final | 松脂虫 |
| `bullet.petal_slash` | `bullet_petal_slash.svg` | 20×12 | final | 花瓣斩 |
| `bullet.silver_shear` | `bullet_silver_shear.svg` | 18×18 | final | 银剪 |
| `bullet.resin_blob` | `bullet_resin_blob.svg` | 16×16 | final | 松脂滴 |
| `bullet.amber_cage` | `bullet_amber_cage.svg` | 16×16 | final | 琥珀槛 |
| `bullet.scythe_arc` | `bullet_scythe_arc.svg` | 24×14 | final | 镰弧 |
| (bg) | `bg_stage5_garden.svg` | 384×448 | final | 久远庭+神木 |

## Stage 6（本轮 P0 + P1 + P2 freeze）

| 实体 id | 文件 | viewBox | 状态 | 备注 |
|---------|------|---------|------|------|
| `boss.kuon` | `boss_kuon.svg` | 80×96 | final · v1.1 | 天香久远 idle |
| `boss.kuon_spell` | `boss_kuon_spell.svg` | 80×96 | final · v1.1 | P1 符卡姿 |
| `boss.kuon_last` | `boss_kuon_last.svg` | 80×96 | final · v1.1 | P1 终符姿（凝固碎裂感） |
| `enemy.chrono_wisp` | `enemy_chrono_wisp.svg` | 28×28 | final | 光阴萤 |
| `enemy.memory_orb` | `enemy_memory_orb.svg` | 36×36 | final | 记忆球 |
| `bullet.god_tear` | `bullet_god_tear.svg` | 16×22 | final | 神脂泪 |
| `bullet.feast_lantern` | `bullet_feast_lantern.svg` | 14×18 | final | 宴灯 |
| `bullet.dusk_ray` | `bullet_dusk_ray.svg` | 24×8 | final | 黄昏射线段 |
| `bullet.amber_seal` | `bullet_amber_seal.svg` | 16×16 | final | 六角封存印 |
| `bullet.chrono_shard` | `bullet_chrono_shard.svg` | 12×12 | final | 时晶碎片 |
| `fx.amber_freeze` | `fx_amber_freeze.svg` | 64×64 | final | P2 凝固障示意 |
| (bg) | `bg_stage6_firmament.svg` | 384×448 | final | 悠久天球 |

## Extra（本轮 P0 + P1；琥珀中Boss复用 Stage5）

| 实体 id | 文件 | viewBox | 状态 | 备注 |
|---------|------|---------|------|------|
| `mid.kohaku_ex` | `boss_kohaku.svg` (+ spell) | 80×96 | reuse | 程序可加伤/滤镜 |
| `boss.shoku` | `boss_shoku.svg` | 80×96 | final · v1.1 | 天逆烛 idle |
| `boss.shoku_spell` | `boss_shoku_spell.svg` | 80×96 | final · v1.1 | P1 符卡姿 |
| `boss.shoku_last` | `boss_shoku_last.svg` | 80×96 | final · v1.1 | P1 终符巨颚 |
| `enemy.crystal_gnaw` | `enemy_crystal_gnaw.svg` | 32×28 | final | 噬晶蛆 |
| `enemy.chrono_fang` | `enemy_chrono_fang.svg` | 32×32 | final | 时牙崽 |
| `bullet.gnaw_tooth` | `bullet_gnaw_tooth.svg` | 12×16 | final | 噬齿 |
| `bullet.blank_page` | `bullet_blank_page.svg` | 18×22 | final | 空白页 |
| `bullet.white_breath` | `bullet_white_breath.svg` | 28×10 | final | 白龙息 |
| `bullet.skip_arrow` | `bullet_skip_arrow.svg` | 20×12 | final | 省略箭 |
| `bullet.inverse_scale` | `bullet_inverse_scale.svg` | 14×16 | final | 逆鳞片 |
| `bullet.chrono_bite` | `bullet_chrono_bite.svg` | 18×18 | final | 时咬痕 |
| (bg) | `bg_stage_ex_cavern.svg` | 384×448 | final | 地底晶洞 |

