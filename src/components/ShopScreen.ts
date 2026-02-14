import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { ITEMS, ItemData } from '../data/items';
import { soundSystem } from '../systems/SoundSystem';
import { PlayerState } from '../entities/Player';

export class ShopScreen {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible = false;
  private onClose: (() => void) | null = null;

  // State
  private playerState!: PlayerState;
  private shopStock: string[] = [];
  private mode: 'main' | 'buy_list' | 'buy_qty' | 'sell_list' | 'sell_qty' = 'main';

  // Main menu (BUY / SELL / CANCEL)
  private mainContainer!: Phaser.GameObjects.Container;
  private mainCursor!: Phaser.GameObjects.Text;
  private mainIndex = 0;
  private readonly mainLabels = ['BUY', 'SELL', 'CANCEL'];

  // Buy list
  private buyContainer!: Phaser.GameObjects.Container;
  private buyTexts: Phaser.GameObjects.Text[] = [];
  private buyCursor!: Phaser.GameObjects.Text;
  private buyIndex = 0;
  private buyScroll = 0;
  private readonly buyVisibleRows = 7;

  // Sell list
  private sellContainer!: Phaser.GameObjects.Container;
  private sellTexts: Phaser.GameObjects.Text[] = [];
  private sellCursor!: Phaser.GameObjects.Text;
  private sellIndex = 0;
  private sellScroll = 0;
  private sellItems: { id: string; count: number }[] = [];

  // Quantity picker (shared by buy/sell)
  private qtyContainer!: Phaser.GameObjects.Container;
  private qtyText!: Phaser.GameObjects.Text;
  private qtyCostText!: Phaser.GameObjects.Text;
  private qty = 1;

  // Money display
  private moneyText!: Phaser.GameObjects.Text;

  // Message
  private messageContainer!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private messageVisible = false;

  // Input
  private inputBound = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Background
    const bg = scene.add.graphics();
    bg.fillStyle(0xf8f8f8, 1);
    bg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    bg.lineStyle(2, 0x383838, 1);
    bg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    const title = scene.add.text(GAME_WIDTH / 2, 4, 'POKeMON MART', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(0.5, 0);

    this.moneyText = scene.add.text(GAME_WIDTH - 6, GAME_HEIGHT - 12, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(1, 0);

    // Main menu
    const mainBg = scene.add.graphics();
    mainBg.fillStyle(0xf8f8f8, 1);
    mainBg.fillRoundedRect(0, 0, 56, 46, 2);
    mainBg.lineStyle(1, 0x383838, 1);
    mainBg.strokeRoundedRect(0, 0, 56, 46, 2);

    const mainTexts = this.mainLabels.map((label, i) =>
      scene.add.text(14, 4 + i * 14, label, {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      })
    );
    this.mainCursor = scene.add.text(4, 4, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.mainContainer = scene.add.container(
      (GAME_WIDTH - 56) / 2, (GAME_HEIGHT - 46) / 2,
      [mainBg, ...mainTexts, this.mainCursor]
    );

    // Buy list
    const buyBg = scene.add.graphics();
    buyBg.fillStyle(0xf8f8f8, 1);
    buyBg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    buyBg.lineStyle(2, 0x383838, 1);
    buyBg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    const buyTitle = scene.add.text(6, 4, 'BUY', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    });
    const buyMoney = scene.add.text(GAME_WIDTH - 6, 4, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(1, 0);
    buyMoney.setName('buyMoney');

    for (let i = 0; i < this.buyVisibleRows; i++) {
      const t = scene.add.text(16, 18 + i * 13, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.buyTexts.push(t);
    }
    this.buyCursor = scene.add.text(6, 18, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.buyContainer = scene.add.container(0, 0, [buyBg, buyTitle, buyMoney, ...this.buyTexts, this.buyCursor]);
    this.buyContainer.setVisible(false);

    // Sell list (same layout)
    const sellBg = scene.add.graphics();
    sellBg.fillStyle(0xf8f8f8, 1);
    sellBg.fillRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 2);
    sellBg.lineStyle(2, 0x383838, 1);
    sellBg.strokeRoundedRect(1, 1, GAME_WIDTH - 2, GAME_HEIGHT - 2, 2);

    const sellTitle = scene.add.text(6, 4, 'SELL', {
      fontSize: '8px', color: '#383838', fontFamily: 'monospace',
    });
    const sellMoney = scene.add.text(GAME_WIDTH - 6, 4, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    }).setOrigin(1, 0);
    sellMoney.setName('sellMoney');

    for (let i = 0; i < this.buyVisibleRows; i++) {
      const t = scene.add.text(16, 18 + i * 13, '', {
        fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      });
      this.sellTexts.push(t);
    }
    this.sellCursor = scene.add.text(6, 18, '>', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.sellContainer = scene.add.container(0, 0, [sellBg, sellTitle, sellMoney, ...this.sellTexts, this.sellCursor]);
    this.sellContainer.setVisible(false);

    // Quantity picker
    const qtyBg = scene.add.graphics();
    qtyBg.fillStyle(0xf8f8f8, 1);
    qtyBg.fillRoundedRect(0, 0, 90, 34, 2);
    qtyBg.lineStyle(1, 0x383838, 1);
    qtyBg.strokeRoundedRect(0, 0, 90, 34, 2);

    const qtyLabel = scene.add.text(6, 4, 'How many?', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });
    this.qtyText = scene.add.text(6, 18, 'x1', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });
    this.qtyCostText = scene.add.text(50, 18, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
    });

    this.qtyContainer = scene.add.container(35, 55, [qtyBg, qtyLabel, this.qtyText, this.qtyCostText]);
    this.qtyContainer.setVisible(false);

    // Message overlay
    const msgBg = scene.add.graphics();
    msgBg.fillStyle(0xf8f8f8, 1);
    msgBg.fillRoundedRect(2, GAME_HEIGHT - 30, GAME_WIDTH - 4, 28, 2);
    msgBg.lineStyle(1, 0x383838, 1);
    msgBg.strokeRoundedRect(2, GAME_HEIGHT - 30, GAME_WIDTH - 4, 28, 2);

    this.messageText = scene.add.text(8, GAME_HEIGHT - 26, '', {
      fontSize: '7px', color: '#383838', fontFamily: 'monospace',
      wordWrap: { width: GAME_WIDTH - 16 },
    });

    this.messageContainer = scene.add.container(0, 0, [msgBg, this.messageText]);
    this.messageContainer.setVisible(false);

    this.container = scene.add.container(0, 0, [
      bg, title, this.moneyText,
      this.mainContainer, this.buyContainer, this.sellContainer,
      this.qtyContainer, this.messageContainer,
    ]);
    this.container.setDepth(950);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(playerState: PlayerState, shopStock: string[], onClose: () => void): void {
    this.playerState = playerState;
    this.shopStock = shopStock;
    this.onClose = onClose;
    this.visible = true;
    this.mode = 'main';
    this.mainIndex = 0;
    this.mainCursor.setY(4);
    this.messageVisible = false;
    this.container.setVisible(true);
    this.mainContainer.setVisible(true);
    this.buyContainer.setVisible(false);
    this.sellContainer.setVisible(false);
    this.qtyContainer.setVisible(false);
    this.messageContainer.setVisible(false);
    this.updateMoney();
    this.setupInput();
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
  }

  private setupInput(): void {
    if (this.inputBound) return;
    this.inputBound = true;

    const kb = this.scene.input.keyboard!;
    const up = kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const down = kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const z = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    const enter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const x = kb.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    up.on('down', () => { if (this.visible) this.navigate(-1); });
    down.on('down', () => { if (this.visible) this.navigate(1); });
    z.on('down', () => { if (this.visible) this.confirm(); });
    enter.on('down', () => { if (this.visible) this.confirm(); });
    x.on('down', () => { if (this.visible) this.back(); });
  }

  private navigate(dir: number): void {
    if (this.messageVisible) return;
    soundSystem.menuMove();

    if (this.mode === 'main') {
      this.mainIndex += dir;
      if (this.mainIndex < 0) this.mainIndex = 0;
      if (this.mainIndex >= this.mainLabels.length) this.mainIndex = this.mainLabels.length - 1;
      this.mainCursor.setY(4 + this.mainIndex * 14);
    } else if (this.mode === 'buy_list') {
      this.buyIndex += dir;
      if (this.buyIndex < 0) this.buyIndex = 0;
      if (this.buyIndex >= this.shopStock.length) this.buyIndex = this.shopStock.length - 1;
      if (this.buyIndex < this.buyScroll) this.buyScroll = this.buyIndex;
      if (this.buyIndex >= this.buyScroll + this.buyVisibleRows) {
        this.buyScroll = this.buyIndex - this.buyVisibleRows + 1;
      }
      this.updateBuyList();
    } else if (this.mode === 'sell_list') {
      this.sellIndex += dir;
      if (this.sellIndex < 0) this.sellIndex = 0;
      if (this.sellIndex >= this.sellItems.length) this.sellIndex = this.sellItems.length - 1;
      if (this.sellIndex < this.sellScroll) this.sellScroll = this.sellIndex;
      if (this.sellIndex >= this.sellScroll + this.buyVisibleRows) {
        this.sellScroll = this.sellIndex - this.buyVisibleRows + 1;
      }
      this.updateSellList();
    } else if (this.mode === 'buy_qty' || this.mode === 'sell_qty') {
      this.qty += dir;
      if (this.qty < 1) this.qty = 1;
      this.clampQty();
      this.updateQtyDisplay();
    }
  }

  private confirm(): void {
    if (this.messageVisible) {
      this.messageVisible = false;
      this.messageContainer.setVisible(false);
      return;
    }

    soundSystem.menuSelect();

    if (this.mode === 'main') {
      const option = this.mainLabels[this.mainIndex];
      if (option === 'BUY') {
        this.mode = 'buy_list';
        this.buyIndex = 0;
        this.buyScroll = 0;
        this.mainContainer.setVisible(false);
        this.buyContainer.setVisible(true);
        this.updateBuyList();
      } else if (option === 'SELL') {
        this.rebuildSellItems();
        if (this.sellItems.length === 0) {
          this.showMessage('You have nothing\nto sell!');
          return;
        }
        this.mode = 'sell_list';
        this.sellIndex = 0;
        this.sellScroll = 0;
        this.mainContainer.setVisible(false);
        this.sellContainer.setVisible(true);
        this.updateSellList();
      } else {
        this.hide();
        if (this.onClose) this.onClose();
      }
    } else if (this.mode === 'buy_list') {
      const itemId = this.shopStock[this.buyIndex];
      const itemData = ITEMS[itemId];
      if (!itemData || itemData.price <= 0) return;
      this.mode = 'buy_qty';
      this.qty = 1;
      this.clampQty();
      this.updateQtyDisplay();
      this.qtyContainer.setVisible(true);
    } else if (this.mode === 'buy_qty') {
      this.doBuy();
    } else if (this.mode === 'sell_list') {
      const item = this.sellItems[this.sellIndex];
      const itemData = ITEMS[item.id];
      if (!itemData || itemData.price <= 0) {
        this.showMessage("Can't sell that!");
        return;
      }
      this.mode = 'sell_qty';
      this.qty = 1;
      this.clampQty();
      this.updateQtyDisplay();
      this.qtyContainer.setVisible(true);
    } else if (this.mode === 'sell_qty') {
      this.doSell();
    }
  }

  private back(): void {
    if (this.messageVisible) {
      this.messageVisible = false;
      this.messageContainer.setVisible(false);
      return;
    }

    soundSystem.menuMove();

    if (this.mode === 'buy_list') {
      this.mode = 'main';
      this.buyContainer.setVisible(false);
      this.mainContainer.setVisible(true);
    } else if (this.mode === 'sell_list') {
      this.mode = 'main';
      this.sellContainer.setVisible(false);
      this.mainContainer.setVisible(true);
    } else if (this.mode === 'buy_qty') {
      this.mode = 'buy_list';
      this.qtyContainer.setVisible(false);
    } else if (this.mode === 'sell_qty') {
      this.mode = 'sell_list';
      this.qtyContainer.setVisible(false);
    } else {
      this.hide();
      if (this.onClose) this.onClose();
    }
  }

  private doBuy(): void {
    const itemId = this.shopStock[this.buyIndex];
    const itemData = ITEMS[itemId];
    const totalCost = itemData.price * this.qty;

    if (this.playerState.money < totalCost) {
      this.showMessage("You don't have\nenough money!");
      this.qtyContainer.setVisible(false);
      this.mode = 'buy_list';
      return;
    }

    this.playerState.money -= totalCost;
    this.playerState.addItem(itemId, this.qty);
    this.qtyContainer.setVisible(false);
    this.mode = 'buy_list';
    this.updateMoney();
    this.updateBuyList();
    soundSystem.menuSelect();
    this.showMessage(`Bought ${itemData.name}\nx${this.qty}!`);
  }

  private doSell(): void {
    const item = this.sellItems[this.sellIndex];
    const itemData = ITEMS[item.id];
    const sellPrice = Math.floor(itemData.price / 2);
    const totalGain = sellPrice * this.qty;

    for (let i = 0; i < this.qty; i++) {
      this.playerState.useItem(item.id);
    }
    this.playerState.money += totalGain;

    this.qtyContainer.setVisible(false);
    this.rebuildSellItems();
    if (this.sellItems.length === 0) {
      this.mode = 'main';
      this.sellContainer.setVisible(false);
      this.mainContainer.setVisible(true);
    } else {
      this.mode = 'sell_list';
      if (this.sellIndex >= this.sellItems.length) this.sellIndex = this.sellItems.length - 1;
      this.updateSellList();
    }
    this.updateMoney();
    soundSystem.menuSelect();
    this.showMessage(`Sold for $${totalGain}!`);
  }

  private clampQty(): void {
    if (this.mode === 'buy_qty') {
      const itemId = this.shopStock[this.buyIndex];
      const itemData = ITEMS[itemId];
      const maxBuy = Math.floor(this.playerState.money / itemData.price);
      if (this.qty > maxBuy) this.qty = Math.max(1, maxBuy);
      if (this.qty > 99) this.qty = 99;
    } else if (this.mode === 'sell_qty') {
      const item = this.sellItems[this.sellIndex];
      if (this.qty > item.count) this.qty = item.count;
    }
  }

  private updateQtyDisplay(): void {
    this.qtyText.setText(`x${this.qty}`);
    if (this.mode === 'buy_qty') {
      const itemId = this.shopStock[this.buyIndex];
      const itemData = ITEMS[itemId];
      this.qtyCostText.setText(`$${itemData.price * this.qty}`);
    } else {
      const item = this.sellItems[this.sellIndex];
      const itemData = ITEMS[item.id];
      this.qtyCostText.setText(`$${Math.floor(itemData.price / 2) * this.qty}`);
    }
  }

  private updateBuyList(): void {
    const buyMoney = this.buyContainer.getByName('buyMoney') as Phaser.GameObjects.Text;
    buyMoney.setText(`$${this.playerState.money}`);

    for (let i = 0; i < this.buyVisibleRows; i++) {
      const idx = this.buyScroll + i;
      if (idx >= this.shopStock.length) {
        this.buyTexts[i].setText('');
        continue;
      }
      const itemId = this.shopStock[idx];
      const itemData = ITEMS[itemId];
      const name = itemData?.name || itemId;
      const price = itemData?.price || 0;
      this.buyTexts[i].setText(`${name.padEnd(13)}$${price}`);
    }

    const cursorRow = this.buyIndex - this.buyScroll;
    this.buyCursor.setY(18 + cursorRow * 13);
  }

  private updateSellList(): void {
    const sellMoney = this.sellContainer.getByName('sellMoney') as Phaser.GameObjects.Text;
    sellMoney.setText(`$${this.playerState.money}`);

    for (let i = 0; i < this.buyVisibleRows; i++) {
      const idx = this.sellScroll + i;
      if (idx >= this.sellItems.length) {
        this.sellTexts[i].setText('');
        continue;
      }
      const item = this.sellItems[idx];
      const itemData = ITEMS[item.id];
      const name = itemData?.name || item.id;
      const sell = Math.floor((itemData?.price || 0) / 2);
      this.sellTexts[i].setText(`${name.padEnd(10)}x${item.count} $${sell}`);
    }

    const cursorRow = this.sellIndex - this.sellScroll;
    this.sellCursor.setY(18 + cursorRow * 13);
  }

  private rebuildSellItems(): void {
    this.sellItems = Object.entries(this.playerState.bag)
      .filter(([id]) => {
        const itemData = ITEMS[id];
        return itemData && itemData.price > 0;
      })
      .map(([id, count]) => ({ id, count }));
  }

  private updateMoney(): void {
    this.moneyText.setText(`$${this.playerState.money}`);
  }

  private showMessage(msg: string): void {
    this.messageText.setText(msg);
    this.messageContainer.setVisible(true);
    this.messageVisible = true;
  }

  destroy(): void {
    this.container.destroy();
  }
}
