# 东方琥珀录 ～ Ephemeral Amber Memory

浏览器本地可玩的东方整数作式纵版 STG 切片：**Stage 1–6 + Extra**（全 SVG 素材）。

剧本真相源：`SCRIPT.md`  
关卡表：`STAGE1_SLICE.md` … `STAGE6.md`、`STAGE_EX.md`  
难度/Treat：`DIFFICULTY_TREAT.md`  
素材清单：`assets/MANIFEST.md`

---

## 启动

```bash
cd /workspace/amber-memory
python3 -m http.server 8765
```

浏览器打开：http://localhost:8765/

> 请用本地静态服务打开（不要直接 `file://`），否则 SVG/模块可能加载失败。

---

## 操作

| 键 | 作用 |
|----|------|
| 方向键 / WASD | 移动 |
| Z | 射击 / 确认对话 |
| Shift | 低速（显示判定点） |
| X | 战斗中 Bomb 清弹 / 跳过对话行 |
| C | 战斗中 Bomb / 标题进入 Music Room |
| M | 切换合成 BGM 静音（Treat 不关；`?mute=1` 强制关） |

标题画面按 **Z** 开始（从 Stage 1 连贯推进至 Ex，视进度而定）。

---

## 调试 URL 参数

可组合，例如：`http://localhost:8765/?phase=kuon&god=1`

| 参数 | 作用 |
|------|------|
| `god=1` | 高伤 / 便于验收通关 |
| `simple=1` | Simple：敌弹速/密度 ×0.7、杂鱼等效伤/HP 侧 ×0.75；Ex 省略箭预警仍 **0.65s** |
| `treat=1` | Treat：无敌、残 99、弹速 ×0.55、密度 ×0.5、自机伤 ×1.5、常显判定、超时不罚残、开局 Bomb≥3 |
| `mute=1` | 关闭 Web Audio 合成 BGM |
| `phase=…` | 跳到指定段落（见下） |

### `phase` 一览

**Stage 1（雫）**

| 值 | 入口 |
|----|------|
| （无） | 标题 → 1 面 |
| `boss` / `spell1` / `ns2` / `spell2` | 雫各阶段 |

**Stage 2–6**

| 值 | 入口 |
|----|------|
| `stage2` / `kyouko` | 2 面道中 / 木灵响子 |
| `stage3` / `tama` | 3 面道中 / 算盘珠 |
| `stage4` / `akyuu` / `sumizome` | 4 面 / 阿求投影 / 墨染 |
| `stage5` / `kohaku` | 5 面 / 久远寺琥珀 |
| `stage6` / `kuon` / `last` | 6 面 / 天香久远 / 终符 |

**Extra**

| 值 | 入口 |
|----|------|
| `ex` | Ex 道中起 |
| `kohaku_ex` | 琥珀中 Boss（鬼剪） |
| `shoku` | 天逆烛（对话起） |
| `e1` … `e10` | 烛对应符卡（省略箭重点看 `e2`；因果看 `e7`） |

---

## 内容进度（策划收口）

| 块 | 状态 |
|----|------|
| Stage 1–6 Boss / 符卡 / 终符 | 可玩，已验收 |
| Extra 中 Boss + 烛 e1–e10 | 可玩，已验收 |
| 省略箭预警 | Normal **0.5s** / Simple **0.65s**（已锁） |
| Normal 残机经济 | 开局 **5 残 / 3 Bomb**；面清 +1 Bomb（上限 7）；中弹无敌 **2.0s** |
| 全局倍率 | Normal 弹速/密度 ×0.85；Simple ×0.7；Treat 覆盖（见 `DIFFICULTY_TREAT.md`） |
| Treat 余项 | 超时不罚残（本就仅切阶段）、道中伤 ×1.5、Bomb X/C、标题提示已对齐 |
| 道中波次丰度 / 手感打磨 | backlog |
| Music Room 薄列表 | 可浏览；Z 按 id 播合成曲；`?phase=music` |
| BGM | Web Audio 合成 17 曲（`bgm_*` id），首次按键起声；`M` / `?mute=1`；Treat 不关 |
| 标题 UX / 画布缩放 | backlog |
| 完整 Ending / Staff / 1CC 解锁门 | backlog（Ex 可 `?phase=ex` 强开） |

---

## 分工文件

| 角色 | 入口 |
|------|------|
| 策划 | `STAGE*.md`、`SCRIPT.md`、本 README |
| 美术 | `assets/*.svg`、`assets/MANIFEST.md` |
| 程序 | `index.html`、`js/`、`css/` |

硬规则：**正式可视素材只用 SVG**。

---

## 验收建议

1. 无参数：标题起玩，冒烟到 1 面 Spell1。  
2. `?phase=last&god=1`：终符凝固→碎裂。  
3. `?phase=e2&god=1`：省略箭预警可读。  
4. `?phase=ex&god=1`：中 Boss → 烛链 → Ex Clear。  
5. `?treat=1`：标题见 Treat 提示；可观关到 Clear（无敌/低密/常显判定）。  
