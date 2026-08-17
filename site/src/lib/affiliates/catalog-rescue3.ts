/**
 * 公開済みだが商品カードが欠けていた38記事の穴埋め (2026-08-14).
 * 「5製品を比較」と書いておきながら1枚しかカードが出ていない記事があった。
 * 名前と説明は記事本文(自分たちが書いた review)から機械的に起こしている。
 * finance / 保険 は Amazon フォールバックが効かないので対象外(実提携が要る)。
 *
 * 生成: site/scripts/_rescue-offers2.py
 */
import type { AffiliateOffer } from "./types";

export const CATALOG_RESCUE3: AffiliateOffer[] = [
  {
    "id": "coldcard-mk4",
    "imageUrl": "",
    "priceMin": "",
    "priceMax": "",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Coldcard Mk4",
      "ja": "Coldcard Mk4"
    },
    "description": {
      "en": "Coldcard Mk4 is the reference device for Bitcoin self-custody specialists: it signs transactions entirely via QR or microSD with no USB data connection, supports native multisig coordination with PSBT, and runs fully ope",
      "ja": "Coldcard Mk4 is the reference device for Bitcoin self-custody specialists: it signs transactions entirely via QR or microSD with no USB data connection, supports native multisig coordination with PSBT, and runs fully ope"
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Coldcard+Mk4",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "keystone-3-pro",
    "imageUrl": "https://m.media-amazon.com/images/I/8108b1BpC-L._AC_SL1500_.jpg",
    "priceMin": "",
    "priceMax": "",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Keystone 3 Pro",
      "ja": "Keystone 3 Pro"
    },
    "description": {
      "en": "Keystone 3 Pro brings a 4-inch touchscreen and a removable 1200mAh battery to the air-gapped wallet category, making it the most approachable offline signing device available.",
      "ja": "Keystone 3 Pro brings a 4-inch touchscreen and a removable 1200mAh battery to the air-gapped wallet category, making it the most approachable offline signing device available."
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Keystone+3+Pro",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  },
  {
    "id": "bitbox02-hardware-wallet",
    "imageUrl": "https://m.media-amazon.com/images/I/51EM01uieNL.jpg",
    "priceMin": "$118",
    "priceMax": "$118",
    "category": "tech",
    "badge": "💻",
    "name": {
      "en": "Bitbox02 Hardware Wallet",
      "ja": "Bitbox02 Hardware Wallet"
    },
    "description": {
      "en": "The BitBox02 Bitcoin Edition packs a complete self-custody stack into a thumb-drive-sized device: ATSAMD51 microcontroller, secure chip, touch sliders for input, and a companion desktop app (BitBoxApp) that consistently ",
      "ja": "The BitBox02 Bitcoin Edition packs a complete self-custody stack into a thumb-drive-sized device: ATSAMD51 microcontroller, secure chip, touch sliders for input, and a companion desktop app (BitBoxApp) that consistently "
    },
    "links": [
      {
        "network": "direct",
        "productId": "https://www.amazon.com/s?k=Bitbox02+Hardware+Wallet",
        "markets": [
          "global"
        ],
        "approved": false
      }
    ]
  }
] as unknown as AffiliateOffer[];
