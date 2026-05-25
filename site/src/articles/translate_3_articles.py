#!/usr/bin/env python3
"""
Bulk translator for 3 pickly articles (smart-home-hub, smoothie-maker, snorkeling-mask)
into 15 locales (de, es, fr, it, ko, pt-BR, ar, hi, id, ru, th, tr, vi, zh-CN, zh-TW).

Uses translations derived from ja.json pattern (Option A: spec/score key translation).
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, List
from copy import deepcopy

# Translation mappings for spec/score keys per locale
# Format: {locale: {article_type: {en_key: locale_key}}}

TRANSLATIONS = {
    "de": {
        "smart-hub": {
            "Protocols": "Protokolle",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Lokale Verarbeitung",
            "Display": "Display",
            "Thread Border Router": "Thread Border Router",
            "Matter Version": "Matter-Version",
            "Protocol Coverage": "Protokollabdeckung",
            "Ease of Setup": "Einrichtungsleichtigkeit",
            "Device Ecosystem": "Geräte-Ökosystem",
            "Value": "Wert"
        },
        "smoothie": {
            "Motor": "Motor",
            "BladeType": "Klingentyp",
            "BPAFree": "BPA-frei",
            "Capacity": "Kapazität",
            "Dishwasher": "Spülmaschine",
            "Warranty": "Garantie",
            "power": "Leistung",
            "bladeQuality": "Klingenqualität",
            "portability": "Tragbarkeit",
            "cleanup": "Reinigung",
            "value": "Wert"
        },
        "snorkel": {
            "Lens": "Linse",
            "Design": "Design",
            "Volume": "Volumen",
            "Skirt": "Rock",
            "Anti-fog": "Beschlagfrei",
            "Price": "Preis",
            "Field of view": "Sichtfeld",
            "Optical clarity": "Optische Klarheit",
            "Seal quality": "Dichtungsqualität",
            "Value": "Wert"
        }
    },
    "es": {
        "smart-hub": {
            "Protocols": "Protocolos",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Procesamiento Local",
            "Display": "Pantalla",
            "Thread Border Router": "Enrutador de Frontera Thread",
            "Matter Version": "Versión Matter",
            "Protocol Coverage": "Cobertura de Protocolo",
            "Ease of Setup": "Facilidad de Configuración",
            "Device Ecosystem": "Ecosistema de Dispositivos",
            "Value": "Valor"
        },
        "smoothie": {
            "Motor": "Motor",
            "BladeType": "Tipo de Cuchilla",
            "BPAFree": "Sin BPA",
            "Capacity": "Capacidad",
            "Dishwasher": "Lavavajillas",
            "Warranty": "Garantía",
            "power": "Potencia",
            "bladeQuality": "Calidad de Cuchilla",
            "portability": "Portabilidad",
            "cleanup": "Limpieza",
            "value": "Valor"
        },
        "snorkel": {
            "Lens": "Lente",
            "Design": "Diseño",
            "Volume": "Volumen",
            "Skirt": "Falda",
            "Anti-fog": "Antivaho",
            "Price": "Precio",
            "Field of view": "Campo de Visión",
            "Optical clarity": "Claridad Óptica",
            "Seal quality": "Calidad de Sellado",
            "Value": "Valor"
        }
    },
    "fr": {
        "smart-hub": {
            "Protocols": "Protocoles",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Traitement Local",
            "Display": "Affichage",
            "Thread Border Router": "Routeur Frontalier Thread",
            "Matter Version": "Version Matter",
            "Protocol Coverage": "Couverture de Protocole",
            "Ease of Setup": "Facilité de Configuration",
            "Device Ecosystem": "Écosystème d'Appareils",
            "Value": "Valeur"
        },
        "smoothie": {
            "Motor": "Moteur",
            "BladeType": "Type de Lame",
            "BPAFree": "Sans BPA",
            "Capacity": "Capacité",
            "Dishwasher": "Lave-vaisselle",
            "Warranty": "Garantie",
            "power": "Puissance",
            "bladeQuality": "Qualité de Lame",
            "portability": "Portabilité",
            "cleanup": "Nettoyage",
            "value": "Valeur"
        },
        "snorkel": {
            "Lens": "Lentille",
            "Design": "Conception",
            "Volume": "Volume",
            "Skirt": "Jupe",
            "Anti-fog": "Antibuée",
            "Price": "Prix",
            "Field of view": "Champ de Vision",
            "Optical clarity": "Clarté Optique",
            "Seal quality": "Qualité d'Étanchéité",
            "Value": "Valeur"
        }
    },
    "it": {
        "smart-hub": {
            "Protocols": "Protocolli",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Elaborazione Locale",
            "Display": "Display",
            "Thread Border Router": "Router Borderline Thread",
            "Matter Version": "Versione Matter",
            "Protocol Coverage": "Copertura Protocollo",
            "Ease of Setup": "Facilità di Configurazione",
            "Device Ecosystem": "Ecosistema Dispositivi",
            "Value": "Valore"
        },
        "smoothie": {
            "Motor": "Motore",
            "BladeType": "Tipo di Lama",
            "BPAFree": "Senza BPA",
            "Capacity": "Capacità",
            "Dishwasher": "Lavastoviglie",
            "Warranty": "Garanzia",
            "power": "Potenza",
            "bladeQuality": "Qualità Lama",
            "portability": "Portabilità",
            "cleanup": "Pulizia",
            "value": "Valore"
        },
        "snorkel": {
            "Lens": "Lente",
            "Design": "Progettazione",
            "Volume": "Volume",
            "Skirt": "Gonna",
            "Anti-fog": "Antiappannante",
            "Price": "Prezzo",
            "Field of view": "Campo Visivo",
            "Optical clarity": "Chiarezza Ottica",
            "Seal quality": "Qualità Sigillo",
            "Value": "Valore"
        }
    },
    "ko": {
        "smart-hub": {
            "Protocols": "프로토콜",
            "Z-Wave": "Z-Wave",
            "Local Processing": "로컬 처리",
            "Display": "디스플레이",
            "Thread Border Router": "Thread 보더 라우터",
            "Matter Version": "Matter 버전",
            "Protocol Coverage": "프로토콜 커버리지",
            "Ease of Setup": "설치 용이성",
            "Device Ecosystem": "기기 에코시스템",
            "Value": "가치"
        },
        "smoothie": {
            "Motor": "모터",
            "BladeType": "블레이드 유형",
            "BPAFree": "BPA 프리",
            "Capacity": "용량",
            "Dishwasher": "식기세척기",
            "Warranty": "보증",
            "power": "성능",
            "bladeQuality": "블레이드 품질",
            "portability": "휴대성",
            "cleanup": "청소",
            "value": "가치"
        },
        "snorkel": {
            "Lens": "렌즈",
            "Design": "디자인",
            "Volume": "볼륨",
            "Skirt": "스커트",
            "Anti-fog": "김 방지",
            "Price": "가격",
            "Field of view": "시야각",
            "Optical clarity": "광학 선명도",
            "Seal quality": "밀봉 품질",
            "Value": "가치"
        }
    },
    "pt-BR": {
        "smart-hub": {
            "Protocols": "Protocolos",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Processamento Local",
            "Display": "Display",
            "Thread Border Router": "Roteador de Borda Thread",
            "Matter Version": "Versão Matter",
            "Protocol Coverage": "Cobertura de Protocolo",
            "Ease of Setup": "Facilidade de Configuração",
            "Device Ecosystem": "Ecossistema de Dispositivos",
            "Value": "Valor"
        },
        "smoothie": {
            "Motor": "Motor",
            "BladeType": "Tipo de Lâmina",
            "BPAFree": "Livre de BPA",
            "Capacity": "Capacidade",
            "Dishwasher": "Lava-louça",
            "Warranty": "Garantia",
            "power": "Potência",
            "bladeQuality": "Qualidade da Lâmina",
            "portability": "Portabilidade",
            "cleanup": "Limpeza",
            "value": "Valor"
        },
        "snorkel": {
            "Lens": "Lente",
            "Design": "Design",
            "Volume": "Volume",
            "Skirt": "Saia",
            "Anti-fog": "Antitérmico",
            "Price": "Preço",
            "Field of view": "Campo de Visão",
            "Optical clarity": "Clareza Óptica",
            "Seal quality": "Qualidade do Selado",
            "Value": "Valor"
        }
    },
    "ar": {
        "smart-hub": {
            "Protocols": "البروتوكولات",
            "Z-Wave": "Z-Wave",
            "Local Processing": "المعالجة المحلية",
            "Display": "العرض",
            "Thread Border Router": "جهاز التوجيه الحدودي",
            "Matter Version": "إصدار Matter",
            "Protocol Coverage": "تغطية البروتوكول",
            "Ease of Setup": "سهولة الإعداد",
            "Device Ecosystem": "النظام البيئي للأجهزة",
            "Value": "القيمة"
        },
        "smoothie": {
            "Motor": "المحرك",
            "BladeType": "نوع الشفرة",
            "BPAFree": "خالي من BPA",
            "Capacity": "السعة",
            "Dishwasher": "غسالة أطباق",
            "Warranty": "الضمان",
            "power": "القوة",
            "bladeQuality": "جودة الشفرة",
            "portability": "قابلية النقل",
            "cleanup": "التنظيف",
            "value": "القيمة"
        },
        "snorkel": {
            "Lens": "العدسة",
            "Design": "التصميم",
            "Volume": "الحجم",
            "Skirt": "التنورة",
            "Anti-fog": "مضاد للتضبيب",
            "Price": "السعر",
            "Field of view": "مجال الرؤية",
            "Optical clarity": "الوضوح البصري",
            "Seal quality": "جودة الختم",
            "Value": "القيمة"
        }
    },
    "hi": {
        "smart-hub": {
            "Protocols": "प्रोटोकॉल",
            "Z-Wave": "Z-Wave",
            "Local Processing": "स्थानीय प्रसंस्करण",
            "Display": "डिस्प्ले",
            "Thread Border Router": "थ्रेड सीमा राउटर",
            "Matter Version": "Matter संस्करण",
            "Protocol Coverage": "प्रोटोकॉल कवरेज",
            "Ease of Setup": "सेटअप में आसानी",
            "Device Ecosystem": "डिवाइस इकोसिस्टम",
            "Value": "मूल्य"
        },
        "smoothie": {
            "Motor": "मोटर",
            "BladeType": "ब्लेड प्रकार",
            "BPAFree": "बीपीए मुक्त",
            "Capacity": "क्षमता",
            "Dishwasher": "डिशवाशर",
            "Warranty": "वारंटी",
            "power": "शक्ति",
            "bladeQuality": "ब्लेड गुणवत्ता",
            "portability": "पोर्टेबिलिटी",
            "cleanup": "सफाई",
            "value": "मूल्य"
        },
        "snorkel": {
            "Lens": "लेंस",
            "Design": "डिजाइन",
            "Volume": "आयतन",
            "Skirt": "स्कर्ट",
            "Anti-fog": "एंटी-फॉग",
            "Price": "कीमत",
            "Field of view": "दृश्य क्षेत्र",
            "Optical clarity": "ऑप्टिकल स्पष्टता",
            "Seal quality": "सील गुणवत्ता",
            "Value": "मूल्य"
        }
    },
    "id": {
        "smart-hub": {
            "Protocols": "Protokol",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Pemrosesan Lokal",
            "Display": "Tampilan",
            "Thread Border Router": "Perutean Batas Thread",
            "Matter Version": "Versi Matter",
            "Protocol Coverage": "Cakupan Protokol",
            "Ease of Setup": "Kemudahan Pengaturan",
            "Device Ecosystem": "Ekosistem Perangkat",
            "Value": "Nilai"
        },
        "smoothie": {
            "Motor": "Motor",
            "BladeType": "Jenis Pisau",
            "BPAFree": "Bebas BPA",
            "Capacity": "Kapasitas",
            "Dishwasher": "Pencuci Piring",
            "Warranty": "Garansi",
            "power": "Daya",
            "bladeQuality": "Kualitas Pisau",
            "portability": "Portabilitas",
            "cleanup": "Pembersihan",
            "value": "Nilai"
        },
        "snorkel": {
            "Lens": "Lensa",
            "Design": "Desain",
            "Volume": "Volume",
            "Skirt": "Rok",
            "Anti-fog": "Anti Kabut",
            "Price": "Harga",
            "Field of view": "Bidang Pandang",
            "Optical clarity": "Kejelasan Optik",
            "Seal quality": "Kualitas Segel",
            "Value": "Nilai"
        }
    },
    "ru": {
        "smart-hub": {
            "Protocols": "Протоколы",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Локальная обработка",
            "Display": "Дисплей",
            "Thread Border Router": "Граничный маршрутизатор Thread",
            "Matter Version": "Версия Matter",
            "Protocol Coverage": "Охват протоколов",
            "Ease of Setup": "Простота установки",
            "Device Ecosystem": "Экосистема устройств",
            "Value": "Стоимость"
        },
        "smoothie": {
            "Motor": "Мотор",
            "BladeType": "Тип лезвия",
            "BPAFree": "Без БФА",
            "Capacity": "Вместимость",
            "Dishwasher": "Посудомоечная машина",
            "Warranty": "Гарантия",
            "power": "Мощность",
            "bladeQuality": "Качество лезвия",
            "portability": "Портативность",
            "cleanup": "Очистка",
            "value": "Стоимость"
        },
        "snorkel": {
            "Lens": "Линза",
            "Design": "Конструкция",
            "Volume": "Объем",
            "Skirt": "Юбка",
            "Anti-fog": "Антизапотевание",
            "Price": "Цена",
            "Field of view": "Поле зрения",
            "Optical clarity": "Оптическая прозрачность",
            "Seal quality": "Качество уплотнения",
            "Value": "Стоимость"
        }
    },
    "th": {
        "smart-hub": {
            "Protocols": "โปรโตคอล",
            "Z-Wave": "Z-Wave",
            "Local Processing": "การประมวลผลเฉพาะที่",
            "Display": "จอแสดงผล",
            "Thread Border Router": "เราเตอร์ชายแดน Thread",
            "Matter Version": "เวอร์ชัน Matter",
            "Protocol Coverage": "ความครอบคลุมโปรโตคอล",
            "Ease of Setup": "ความง่ายในการตั้งค่า",
            "Device Ecosystem": "ระบบนิเวศของอุปกรณ์",
            "Value": "มูลค่า"
        },
        "smoothie": {
            "Motor": "มอเตอร์",
            "BladeType": "ประเภทใบมีด",
            "BPAFree": "ปราศจาก BPA",
            "Capacity": "ความจุ",
            "Dishwasher": "เครื่องล้างจาน",
            "Warranty": "การรับประกัน",
            "power": "พลัง",
            "bladeQuality": "คุณภาพใบมีด",
            "portability": "ความพกพา",
            "cleanup": "การทำความสะอาด",
            "value": "มูลค่า"
        },
        "snorkel": {
            "Lens": "เลนส์",
            "Design": "การออกแบบ",
            "Volume": "ปริมาณ",
            "Skirt": "กระโปรง",
            "Anti-fog": "ป้องกันการควบแน่น",
            "Price": "ราคา",
            "Field of view": "มุมมองที่เห็น",
            "Optical clarity": "ความคมชัดของแสง",
            "Seal quality": "คุณภาพการปิดผนึก",
            "Value": "มูลค่า"
        }
    },
    "tr": {
        "smart-hub": {
            "Protocols": "Protokoller",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Yerel İşleme",
            "Display": "Ekran",
            "Thread Border Router": "Thread Sınır Yönlendiricisi",
            "Matter Version": "Matter Sürümü",
            "Protocol Coverage": "Protokol Kapsamı",
            "Ease of Setup": "Kurulum Kolaylığı",
            "Device Ecosystem": "Cihaz Ekosistemi",
            "Value": "Değer"
        },
        "smoothie": {
            "Motor": "Motor",
            "BladeType": "Bıçak Türü",
            "BPAFree": "BPA İçermez",
            "Capacity": "Kapasite",
            "Dishwasher": "Bulaşık Makinesi",
            "Warranty": "Garanti",
            "power": "Güç",
            "bladeQuality": "Bıçak Kalitesi",
            "portability": "Taşınabilirlik",
            "cleanup": "Temizlik",
            "value": "Değer"
        },
        "snorkel": {
            "Lens": "Lens",
            "Design": "Tasarım",
            "Volume": "Hacim",
            "Skirt": "Etek",
            "Anti-fog": "Buğu Karşıtı",
            "Price": "Fiyat",
            "Field of view": "Görüş Alanı",
            "Optical clarity": "Optik Açıklık",
            "Seal quality": "Sızdırmazlık Kalitesi",
            "Value": "Değer"
        }
    },
    "vi": {
        "smart-hub": {
            "Protocols": "Các Giao Thức",
            "Z-Wave": "Z-Wave",
            "Local Processing": "Xử Lý Cục Bộ",
            "Display": "Màn Hình",
            "Thread Border Router": "Bộ Định Tuyến Biên Giới Thread",
            "Matter Version": "Phiên Bản Matter",
            "Protocol Coverage": "Phạm Vi Giao Thức",
            "Ease of Setup": "Dễ Dàng Thiết Lập",
            "Device Ecosystem": "Hệ Sinh Thái Thiết Bị",
            "Value": "Giá Trị"
        },
        "smoothie": {
            "Motor": "Động Cơ",
            "BladeType": "Loại Lưỡi",
            "BPAFree": "Không Chứa BPA",
            "Capacity": "Dung Tích",
            "Dishwasher": "Máy Rửa Chén",
            "Warranty": "Bảo Hành",
            "power": "Công Suất",
            "bladeQuality": "Chất Lượng Lưỡi",
            "portability": "Tính Linh Động",
            "cleanup": "Vệ Sinh",
            "value": "Giá Trị"
        },
        "snorkel": {
            "Lens": "Kính Lúp",
            "Design": "Thiết Kế",
            "Volume": "Thể Tích",
            "Skirt": "Váy",
            "Anti-fog": "Chống Sương Mù",
            "Price": "Giá",
            "Field of view": "Góc Nhìn",
            "Optical clarity": "Độ Sáng Quang Học",
            "Seal quality": "Chất Lượng Kín Khít",
            "Value": "Giá Trị"
        }
    },
    "zh-CN": {
        "smart-hub": {
            "Protocols": "协议",
            "Z-Wave": "Z-Wave",
            "Local Processing": "本地处理",
            "Display": "显示器",
            "Thread Border Router": "Thread边界路由器",
            "Matter Version": "Matter版本",
            "Protocol Coverage": "协议覆盖范围",
            "Ease of Setup": "设置易用性",
            "Device Ecosystem": "设备生态系统",
            "Value": "价值"
        },
        "smoothie": {
            "Motor": "电机",
            "BladeType": "刀片类型",
            "BPAFree": "不含BPA",
            "Capacity": "容量",
            "Dishwasher": "洗碗机",
            "Warranty": "保修",
            "power": "功率",
            "bladeQuality": "刀片质量",
            "portability": "便携性",
            "cleanup": "清洁",
            "value": "价值"
        },
        "snorkel": {
            "Lens": "镜片",
            "Design": "设计",
            "Volume": "体积",
            "Skirt": "裙子",
            "Anti-fog": "防雾",
            "Price": "价格",
            "Field of view": "视野",
            "Optical clarity": "光学清晰度",
            "Seal quality": "密封质量",
            "Value": "价值"
        }
    },
    "zh-TW": {
        "smart-hub": {
            "Protocols": "協議",
            "Z-Wave": "Z-Wave",
            "Local Processing": "本地處理",
            "Display": "顯示器",
            "Thread Border Router": "Thread邊界路由器",
            "Matter Version": "Matter版本",
            "Protocol Coverage": "協議覆蓋範圍",
            "Ease of Setup": "設置易用性",
            "Device Ecosystem": "設備生態系統",
            "Value": "價值"
        },
        "smoothie": {
            "Motor": "電機",
            "BladeType": "刀片類型",
            "BPAFree": "不含BPA",
            "Capacity": "容量",
            "Dishwasher": "洗碗機",
            "Warranty": "保修",
            "power": "功率",
            "bladeQuality": "刀片質量",
            "portability": "便攜性",
            "cleanup": "清潔",
            "value": "價值"
        },
        "snorkel": {
            "Lens": "鏡片",
            "Design": "設計",
            "Volume": "體積",
            "Skirt": "裙子",
            "Anti-fog": "防霧",
            "Price": "價格",
            "Field of view": "視野",
            "Optical clarity": "光學清晰度",
            "Seal quality": "密封質量",
            "Value": "價值"
        }
    }
}

# Currency per locale
CURRENCIES = {
    "de": "€",
    "es": "€",
    "fr": "€",
    "it": "€",
    "ko": "₩",
    "pt-BR": "R$",
    "ar": "﷼",
    "hi": "₹",
    "id": "Rp",
    "ru": "₽",
    "th": "฿",
    "tr": "₺",
    "vi": "₫",
    "zh-CN": "¥",
    "zh-TW": "NT$"
}

# Pin descriptions per locale (culturally adapted)
PIN_DESCRIPTIONS = {
    "de": {
        "smart-hub": "Intelligente Smart-Home-Hubs 2026 verglichen — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Protokollanforderungen, lokale Verarbeitung, Einrichtung erklärt.",
        "smoothie": "Beste Smoothie-Mixer 2026 verglichen — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Motor-Wattage, Klingenqualität, gefrorene Früchte erklärt.",
        "snorkel": "Beste Schnorchel-Masken 2026 verglichen — Cressi Big Eyes vs Ocean Reef Aria Vollgesicht vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Gehärtetes Glas vs Polycarbonat, Sichtfeld, Beschlagfreiheit erklärt."
    },
    "es": {
        "smart-hub": "Centros inteligentes para el hogar 2026 comparados — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Requisitos de protocolo, procesamiento local, configuración explicada.",
        "smoothie": "Mejores batidoras de batidos 2026 comparadas — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Vatios del motor, calidad de la cuchilla, fruta congelada explicada.",
        "snorkel": "Mejores máscaras de buceo 2026 comparadas — Cressi Big Eyes vs Ocean Reef Aria cara completa vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Vidrio templado vs policarbonato, campo de visión, desempañante explicado."
    },
    "fr": {
        "smart-hub": "Hubs intelligents pour la maison 2026 comparés — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Exigences de protocole, traitement local, configuration expliquée.",
        "smoothie": "Meilleurs mélangeurs à smoothies 2026 comparés — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Watts du moteur, qualité des lames, fruits surgelés expliqués.",
        "snorkel": "Meilleurs masques de plongée 2026 comparés — Cressi Big Eyes vs Ocean Reef Aria face complète vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Verre trempé vs polycarbonate, champ de vision, antibuée expliqué."
    },
    "it": {
        "smart-hub": "Hub intelligenti per la casa 2026 confrontati — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Requisiti di protocollo, elaborazione locale, configurazione spiegata.",
        "smoothie": "Migliori frullatori per frullati 2026 confrontati — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Watt del motore, qualità delle lame, frutta congelata spiegata.",
        "snorkel": "Migliori maschere da snorkel 2026 confrontate — Cressi Big Eyes vs Ocean Reef Aria viso completo vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Vetro temperato vs policarbonato, campo visivo, antiappannante spiegato."
    },
    "ko": {
        "smart-hub": "스마트 홈 허브 2026 비교 — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. 프로토콜 요구사항, 로컬 처리, 설치 설명.",
        "smoothie": "최고의 스무디 믹서 2026 비교 — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. 모터 와트, 블레이드 품질, 냉동 과일 설명.",
        "snorkel": "최고의 스노클링 마스크 2026 비교 — Cressi Big Eyes vs Ocean Reef Aria 풀페이스 vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. 강화 유리 vs 폴리카보네이트, 시야각, 김 방지 설명."
    },
    "pt-BR": {
        "smart-hub": "Hubs inteligentes de casa 2026 comparados — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Requisitos de protocolo, processamento local, configuração explicada.",
        "smoothie": "Melhores liquidificadores de smoothie 2026 comparados — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Watts do motor, qualidade da lâmina, frutas congeladas explicadas.",
        "snorkel": "Melhores máscaras de snorkel 2026 comparadas — Cressi Big Eyes vs Ocean Reef Aria face completa vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Vidro temperado vs policarbonato, campo de visão, antiembaçante explicado."
    },
    "ar": {
        "smart-hub": "أجهزة المنزل الذكية 2026 مقارنة — Home Assistant مقابل Apple Home مقابل Google Home مقابل Samsung SmartThings مقابل Amazon Alexa. متطلبات البروتوكول والمعالجة المحلية والإعداد موضح.",
        "smoothie": "أفضل خلاطات العصائر 2026 مقارنة — NutriBullet Pro 900 مقابل Ninja QB3001SS مقابل BlendJet 2 مقابل Vitamix S30 مقابل Breville Easy Blend. قوة المحرك وجودة الشفرة والفاكهة المجمدة موضحة.",
        "snorkel": "أفضل أقنعة الغوص 2026 مقارنة — Cressi Big Eyes مقابل Ocean Reef Aria وجه كامل مقابل Aqua Lung Linea مقابل TUSA Freedom One مقابل Mares X-Vision. الزجاج المقسى مقابل البولي كربونات ومجال الرؤية ومضاد للتضبيب موضح."
    },
    "hi": {
        "smart-hub": "स्मार्ट होम हब 2026 की तुलना — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa। प्रोटोकॉल आवश्यकताएं, स्थानीय प्रसंस्करण, सेटअप समझाया।",
        "smoothie": "सर्वश्रेष्ठ स्मूदी मिक्सर 2026 की तुलना — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend। मोटर वाट, ब्लेड गुणवत्ता, जमी हुई फल समझाई।",
        "snorkel": "सर्वश्रेष्ठ स्नॉर्केलिंग मास्क 2026 की तुलना — Cressi Big Eyes vs Ocean Reef Aria फुल-फेस vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision। कठोर कांच vs पॉली कार्बोनेट, दृश्य क्षेत्र, एंटी-फॉग समझाया।"
    },
    "id": {
        "smart-hub": "Hub rumah pintar 2026 dibandingkan — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Persyaratan protokol, pemrosesan lokal, penyiapan dijelaskan.",
        "smoothie": "Blender smoothie terbaik 2026 dibandingkan — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Watt motor, kualitas pisau, buah beku dijelaskan.",
        "snorkel": "Masker snorkel terbaik 2026 dibandingkan — Cressi Big Eyes vs Ocean Reef Aria wajah penuh vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Kaca keras vs polikarbonat, bidang pandang, anti kabut dijelaskan."
    },
    "ru": {
        "smart-hub": "Умные хабы дома 2026 сравнены — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Требования к протоколам, локальная обработка, объяснение установки.",
        "smoothie": "Лучшие блендеры для смузи 2026 сравнены — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Мощность двигателя, качество лезвия, замороженные фрукты объяснены.",
        "snorkel": "Лучшие маски для подводного плавания 2026 сравнены — Cressi Big Eyes vs Ocean Reef Aria полное лицо vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Закаленное стекло vs поликарбонат, поле зрения, защита от запотевания объяснены."
    },
    "th": {
        "smart-hub": "ศูนย์บ้านอัจฉริยะ 2026 เปรียบเทียบ — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa। ข้อกำหนดโปรโตคอล การประมวลผลเฉพาะที่ การตั้งค่าอธิบาย",
        "smoothie": "เครื่องปั่นสมูทตี้ที่ดีที่สุด 2026 เปรียบเทียบ — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend। วัตต์มอเตอร์ คุณภาพใบมีด ผลไม้แช่แข็งอธิบาย",
        "snorkel": "หน้ากากว่ายน้ำที่ดีที่สุด 2026 เปรียบเทียบ — Cressi Big Eyes vs Ocean Reef Aria ใบหน้าเต็ม vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision। แก้วดูดกระบบ vs โพลีคาร์บอเนต มุมมองที่เห็น ป้องกันการควบแน่นอธิบาย"
    },
    "tr": {
        "smart-hub": "Akıllı ev hub'ları 2026 karşılaştırıldı — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Protokol gereksinimleri, yerel işleme, kurulum açıklandı.",
        "smoothie": "En iyi smoothie blenderler 2026 karşılaştırıldı — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Motor gücü, bıçak kalitesi, dondurulmuş meyve açıklandı.",
        "snorkel": "En iyi dalış maskeleri 2026 karşılaştırıldı — Cressi Big Eyes vs Ocean Reef Aria tam yüz vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Sertleştirilmiş cam vs polikarbonat, görüş alanı, buğu karşıtı açıklandı."
    },
    "vi": {
        "smart-hub": "Trung tâm nhà thông minh 2026 so sánh — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa. Yêu cầu giao thức, xử lý cục bộ, thiết lập được giải thích.",
        "smoothie": "Máy xay sinh tố tốt nhất 2026 so sánh — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend. Công suất động cơ, chất lượng lưỡi, trái cây đông lạnh được giải thích.",
        "snorkel": "Kính lặn tốt nhất 2026 so sánh — Cressi Big Eyes vs Ocean Reef Aria mặt đầy đủ vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision. Kính cứng vs polycarbonate, góc nhìn, chống sương mù được giải thích."
    },
    "zh-CN": {
        "smart-hub": "2026智能家居枢纽对比 — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa。协议要求、本地处理、设置说明。",
        "smoothie": "2026最佳果汁机对比 — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend。电机功率、刀片质量、冷冻水果说明。",
        "snorkel": "2026最佳浮潜面罩对比 — Cressi Big Eyes vs Ocean Reef Aria全脸 vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision。强化玻璃 vs 聚碳酸酯、视野、防雾说明。"
    },
    "zh-TW": {
        "smart-hub": "2026智能家居樞紐對比 — Home Assistant vs Apple Home vs Google Home vs Samsung SmartThings vs Amazon Alexa。協議要求、本地處理、設置說明。",
        "smoothie": "2026最佳果汁機對比 — NutriBullet Pro 900 vs Ninja QB3001SS vs BlendJet 2 vs Vitamix S30 vs Breville Easy Blend。電機功率、刀片質量、冷凍水果說明。",
        "snorkel": "2026最佳浮潛面罩對比 — Cressi Big Eyes vs Ocean Reef Aria全臉 vs Aqua Lung Linea vs TUSA Freedom One vs Mares X-Vision。強化玻璃 vs 聚碳酸酯、視野、防霧說明。"
    }
}

def get_article_type(article_slug: str) -> str:
    """Map article slug to article type for translation lookups."""
    if "smart-home" in article_slug:
        return "smart-hub"
    elif "smoothie" in article_slug:
        return "smoothie"
    elif "snorkel" in article_slug:
        return "snorkel"
    return "unknown"

def translate_text(text: str, locale: str, glossary: Dict[str, str]) -> str:
    """Translate text using glossary, preserving unmatched keys."""
    result = text
    for en_key, locale_key in glossary.items():
        result = result.replace(en_key, locale_key)
    return result

def translate_object_keys(obj: Any, locale: str, translation_map: Dict[str, str]) -> Any:
    """Recursively translate object keys based on translation map."""
    if isinstance(obj, dict):
        new_dict = {}
        for key, value in obj.items():
            new_key = translation_map.get(key, key)
            new_dict[new_key] = translate_object_keys(value, locale, translation_map)
        return new_dict
    elif isinstance(obj, list):
        return [translate_object_keys(item, locale, translation_map) for item in obj]
    else:
        return obj

def escape_json_string(s: str) -> str:
    """Escape string for JSON output."""
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    s = s.replace("\n", "\\n")
    s = s.replace("\r", "\\r")
    s = s.replace("\t", "\\t")
    return s

def create_locale_file(en_data: Dict[str, Any], article_slug: str, locale: str) -> str:
    """Create a locale-specific JSON file content."""
    article_type = get_article_type(article_slug)

    # Deep copy to avoid mutating original
    locale_data = deepcopy(en_data)

    # Get translation mappings for this locale and article type
    if locale not in TRANSLATIONS or article_type not in TRANSLATIONS[locale]:
        return json.dumps(en_data, ensure_ascii=False, indent=2)

    translation_map = TRANSLATIONS[locale][article_type]

    # Update currency in price specs BEFORE translating keys (if applicable)
    if locale in CURRENCIES and locale != "en":
        currency = CURRENCIES[locale]
        for product in locale_data.get("products", []):
            if "specs" in product and "Price" in product["specs"]:
                # Keep just the price value if it starts with $, or preserve existing format
                old_price = product["specs"]["Price"]
                if old_price.startswith("$"):
                    amount = old_price.replace("$", "")
                    product["specs"]["Price"] = f"{currency}{amount}"

    # Translate product specs and scores
    for product in locale_data.get("products", []):
        if "specs" in product:
            product["specs"] = translate_object_keys(product["specs"], locale, translation_map)
        if "scores" in product:
            product["scores"] = translate_object_keys(product["scores"], locale, translation_map)

    # Update pinDescription (cultural adaptation) - always apply if available
    if locale in PIN_DESCRIPTIONS and article_type in PIN_DESCRIPTIONS[locale]:
        locale_data["pinDescription"] = PIN_DESCRIPTIONS[locale][article_type]

    return json.dumps(locale_data, ensure_ascii=False, indent=2)

def main():
    articles = [
        "best-smart-home-hub-2026",
        "best-smoothie-maker-2026",
        "best-snorkeling-mask-2026"
    ]

    locales = ["de", "es", "fr", "it", "ko", "pt-BR", "ar", "hi", "id", "ru", "th", "tr", "vi", "zh-CN", "zh-TW"]

    base_path = Path("/Users/ken/Library/CloudStorage/Dropbox/pickly/site/src/articles")

    total_created = 0

    for article_slug in articles:
        article_path = base_path / article_slug / "messages"

        # Load en.json
        en_file = article_path / "en.json"
        with open(en_file, 'r', encoding='utf-8') as f:
            en_data = json.load(f)

        print(f"\nProcessing {article_slug}...")

        for locale in locales:
            locale_content = create_locale_file(en_data, article_slug, locale)

            output_file = article_path / f"{locale}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(locale_content)

            total_created += 1
            print(f"  ✓ {locale}.json")

    print(f"\n✓ Successfully created {total_created} locale files")

if __name__ == "__main__":
    main()
