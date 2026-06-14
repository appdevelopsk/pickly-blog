import json, os

DIR = "/tmp/pickly-deploy/site/src/articles/best-sunscreen-2026/messages"

# New product display names per locale
CERAVE = {
    "en": "CeraVe Hydrating Mineral Sunscreen SPF 50",
    "de": "CeraVe Hydrating Mineral Sunscreen SPF 50",
    "es": "CeraVe Hydrating Mineral Sunscreen SPF 50",
    "fr": "CeraVe Hydrating Mineral Sunscreen SPF 50",
    "it": "CeraVe Hydrating Mineral Sunscreen SPF 50",
    "ja": "セラヴィ ハイドレーティング ミネラル サンスクリーン SPF50",
    "ko": "세라비 하이드레이팅 미네랄 선크림 SPF 50",
    "pt-BR": "CeraVe Hydrating Mineral Sunscreen SPF 50",
}
LRP = {
    "en": "La Roche-Posay Anthelios Tinted Mineral Sunscreen SPF 50",
    "de": "La Roche-Posay Anthelios Getönte Mineralische Sonnencreme LSF 50",
    "es": "La Roche-Posay Anthelios Protector Solar Mineral con Color SPF 50",
    "fr": "La Roche-Posay Anthelios Crème Solaire Minérale Teintée SPF 50",
    "it": "La Roche-Posay Anthelios Crema Solare Minerale Colorata SPF 50",
    "ja": "ラ ロッシュ ポゼ アンテリオス ティンテッド ミネラル サンスクリーン SPF50",
    "ko": "라 로슈 포제 안텔리오스 틴티드 미네랄 선크림 SPF 50",
    "pt-BR": "La Roche-Posay Anthelios Protetor Solar Mineral com Cor FPS 50",
}

# ---- products[2] = CeraVe (replaces biore) ----
P2 = {
 "en": {
  "badge": "Best Daily Mineral",
  "review": "CeraVe Hydrating Mineral Sunscreen is an easy daily face SPF — 100% mineral filters (zinc oxide and titanium dioxide) with ceramides and hyaluronic acid, fragrance-free and built for sensitive skin. It can leave a slight white cast and is less water-resistant than a dedicated sport formula.",
  "pros": [
   "100% mineral filters plus ceramides and hyaluronic acid suit sensitive and reactive skin",
   "Fragrance-free and non-comedogenic, easy to wear under makeup every day",
   "Widely available and affordable for a daily face sunscreen"
  ],
  "cons": [
   "Can leave a slight white cast on deeper skin tones and is less water-resistant than sport formulas"
  ],
  "specs": {"SPF":"SPF50","PA rating":"Broad spectrum","Water resistance":"Limited","Formula type":"100% mineral (zinc + titanium)","Volume":"75 ml","White cast":"Slight on deeper tones","Price":"Affordable"},
  "scores": {"SPF protection":4.7,"Texture":4.5,"Water resistance":2.5,"Value":4.8,"Skin feel":4.5},
 },
 "de": {
  "badge": "Bestes mineralisches Tagesprodukt",
  "review": "CeraVe Hydrating Mineral Sunscreen ist ein unkomplizierter Gesichts-SPF für jeden Tag — 100 % mineralische Filter (Zinkoxid und Titandioxid) mit Ceramiden und Hyaluronsäure, parfümfrei und für empfindliche Haut entwickelt. Er kann einen leichten Weißfilm hinterlassen und ist weniger wasserfest als ein reines Sportprodukt.",
  "pros": [
   "100 % mineralische Filter plus Ceramide und Hyaluronsäure eignen sich für empfindliche, reaktive Haut",
   "Parfümfrei und nicht komedogen, gut täglich unter Make-up tragbar",
   "Breit verfügbar und erschwinglich für einen täglichen Gesichtssonnenschutz"
  ],
  "cons": [
   "Kann auf dunkleren Hauttönen einen leichten Weißfilm hinterlassen und ist weniger wasserfest als Sportformeln"
  ],
  "specs": {"SPF":"LSF 50","PA rating":"Breitband","Water resistance":"Begrenzt","Formula type":"100 % mineralisch (Zink + Titan)","Volume":"75 ml","White cast":"Leicht auf dunkleren Tönen","Price":"Erschwinglich"},
  "scores": {"SPF protection":4.7,"Texture":4.5,"Water resistance":2.5,"Value":4.8,"Skin feel":4.5},
 },
 "es": {
  "badge": "Mejor mineral diario",
  "review": "CeraVe Hydrating Mineral Sunscreen es un SPF facial sencillo para el día a día — filtros 100 % minerales (óxido de zinc y dióxido de titanio) con ceramidas y ácido hialurónico, sin fragancia y pensado para piel sensible. Puede dejar un ligero velo blanco y es menos resistente al agua que una fórmula deportiva.",
  "pros": [
   "Filtros 100 % minerales más ceramidas y ácido hialurónico, ideales para piel sensible y reactiva",
   "Sin fragancia y no comedogénico, cómodo bajo el maquillaje cada día",
   "Amplia disponibilidad y precio asequible para un protector facial diario"
  ],
  "cons": [
   "Puede dejar un ligero velo blanco en tonos de piel más oscuros y es menos resistente al agua que las fórmulas deportivas"
  ],
  "specs": {"SPF":"SPF50","PA rating":"Amplio espectro","Water resistance":"Limitada","Formula type":"100 % mineral (zinc + titanio)","Volume":"75 ml","White cast":"Leve en tonos oscuros","Price":"Asequible"},
  "scores": {"SPF protection":4.7,"Texture":4.5,"Water resistance":2.5,"Value":4.8,"Skin feel":4.5},
 },
 "fr": {
  "badge": "Meilleur minéral quotidien",
  "review": "CeraVe Hydrating Mineral Sunscreen est un SPF visage facile à porter au quotidien — filtres 100 % minéraux (oxyde de zinc et dioxyde de titane) avec céramides et acide hyaluronique, sans parfum et conçu pour les peaux sensibles. Il peut laisser un léger voile blanc et résiste moins à l'eau qu'une formule sport dédiée.",
  "pros": [
   "Filtres 100 % minéraux plus céramides et acide hyaluronique, adaptés aux peaux sensibles et réactives",
   "Sans parfum et non comédogène, facile à porter sous le maquillage chaque jour",
   "Largement disponible et abordable pour une protection solaire visage quotidienne"
  ],
  "cons": [
   "Peut laisser un léger voile blanc sur les carnations plus foncées et résiste moins à l'eau que les formules sport"
  ],
  "specs": {"SPF":"SPF50","PA rating":"Large spectre","Water resistance":"Limitée","Formula type":"100 % minéral (zinc + titane)","Volume":"75 ml","White cast":"Léger sur teints foncés","Price":"Abordable"},
  "scores": {"SPF protection":4.7,"Texture":4.5,"Water resistance":2.5,"Value":4.8,"Skin feel":4.5},
 },
 "it": {
  "badge": "Migliore minerale quotidiano",
  "review": "CeraVe Hydrating Mineral Sunscreen è un SPF viso semplice da usare ogni giorno — filtri 100 % minerali (ossido di zinco e biossido di titanio) con ceramidi e acido ialuronico, senza profumo e pensato per la pelle sensibile. Può lasciare un leggero velo bianco ed è meno resistente all'acqua di una formula sport dedicata.",
  "pros": [
   "Filtri 100 % minerali più ceramidi e acido ialuronico, adatti a pelli sensibili e reattive",
   "Senza profumo e non comedogenico, comodo sotto il trucco ogni giorno",
   "Ampiamente disponibile e accessibile per una protezione solare viso quotidiana"
  ],
  "cons": [
   "Può lasciare un leggero velo bianco sui toni di pelle più scuri ed è meno resistente all'acqua delle formule sport"
  ],
  "specs": {"SPF":"SPF50","PA rating":"Ampio spettro","Water resistance":"Limitata","Formula type":"100 % minerale (zinco + titanio)","Volume":"75 ml","White cast":"Lieve su toni scuri","Price":"Accessibile"},
  "scores": {"SPF protection":4.7,"Texture":4.5,"Water resistance":2.5,"Value":4.8,"Skin feel":4.5},
 },
 "ja": {
  "badge": "デイリーミネラル最高",
  "review": "セラヴィ ハイドレーティング ミネラル サンスクリーンは、毎日使いやすい顔用日焼け止め。酸化亜鉛と酸化チタンの100%ミネラルフィルターにセラミドとヒアルロン酸を配合し、無香料で敏感肌向けに作られている。濃い肌色ではわずかに白浮きすることがあり、スポーツ専用処方より耐水性は劣る。",
  "pros": [
   "100%ミネラルフィルターにセラミドとヒアルロン酸を配合、敏感肌や揺らぎ肌に向く",
   "無香料・ノンコメドジェニックで、毎日メイクの下にも使いやすい",
   "入手しやすく、毎日使う顔用日焼け止めとして手頃な価格"
  ],
  "cons": [
   "濃い肌色ではわずかに白浮きすることがあり、スポーツ処方より耐水性が劣る"
  ],
  "specs": {"SPF":"SPF50","PA rating":"ブロードスペクトラム","Water resistance":"限定的","Formula type":"100%ミネラル（亜鉛＋チタン）","Volume":"75 ml","White cast":"濃い肌色でわずかに","Price":"手頃"},
  "scores": {"SPF protection":4.7,"Texture":4.5,"Water resistance":2.5,"Value":4.8,"Skin feel":4.5},
 },
 "ko": {
  "badge": "데일리 미네랄 최고",
  "review": "세라비 하이드레이팅 미네랄 선크림은 매일 쓰기 편한 얼굴용 자외선 차단제다. 산화아연과 이산화티타늄의 100% 미네랄 필터에 세라마이드와 히알루론산을 더했고, 무향료로 민감성 피부를 위해 만들어졌다. 어두운 피부 톤에서는 약간의 백탁이 남을 수 있고 스포츠 전용 제형보다 내수성은 떨어진다.",
  "pros": [
   "100% 미네랄 필터에 세라마이드와 히알루론산을 더해 민감하고 예민한 피부에 적합",
   "무향료·논코메도제닉으로 매일 메이크업 아래 바르기 좋음",
   "구하기 쉽고 데일리 얼굴용 자외선 차단제로 가격이 합리적"
  ],
  "cons": [
   "어두운 피부 톤에서는 약간의 백탁이 남을 수 있고 스포츠 제형보다 내수성이 약함"
  ],
  "specs": {"SPF":"SPF50","PA rating":"광범위 차단","Water resistance":"제한적","Formula type":"100% 미네랄(아연 + 티타늄)","Volume":"75 ml","White cast":"어두운 톤에 약간","Price":"합리적"},
  "scores": {"SPF protection":4.7,"Texture":4.5,"Water resistance":2.5,"Value":4.8,"Skin feel":4.5},
 },
 "pt-BR": {
  "badge": "Melhor mineral diário",
  "review": "O CeraVe Hydrating Mineral Sunscreen é um FPS facial fácil para o dia a dia — filtros 100 % minerais (óxido de zinco e dióxido de titânio) com ceramidas e ácido hialurônico, sem fragrância e feito para pele sensível. Pode deixar um leve véu branco e é menos resistente à água do que uma fórmula esportiva.",
  "pros": [
   "Filtros 100 % minerais mais ceramidas e ácido hialurônico, ideais para pele sensível e reativa",
   "Sem fragrância e não comedogênico, confortável sob a maquiagem todos os dias",
   "Amplamente disponível e acessível para um protetor facial diário"
  ],
  "cons": [
   "Pode deixar um leve véu branco em tons de pele mais escuros e é menos resistente à água do que fórmulas esportivas"
  ],
  "specs": {"SPF":"FPS50","PA rating":"Amplo espectro","Water resistance":"Limitada","Formula type":"100 % mineral (zinco + titânio)","Volume":"75 ml","White cast":"Leve em tons escuros","Price":"Acessível"},
  "scores": {"SPF protection":4.7,"Texture":4.5,"Water resistance":2.5,"Value":4.8,"Skin feel":4.5},
 },
}

# ---- products[4] = La Roche-Posay Tinted (replaces skin-aqua) ----
P4 = {
 "en": {
  "badge": "Best Tinted Finish",
  "review": "La Roche-Posay Anthelios Tinted Mineral Sunscreen adds a soft universal tint that evens skin tone while protecting against UVA and UVB with titanium dioxide. Lightweight and fragrance-free for sensitive skin. The single tint will not match every complexion and water resistance is limited.",
  "pros": [
   "Universal tint evens skin tone and blurs redness for a natural finish",
   "Mineral filters and fragrance-free formula suit sensitive skin",
   "Lightweight, works as a final base step under or instead of makeup"
  ],
  "cons": [
   "A single universal tint will not match every complexion, and water resistance is limited"
  ],
  "specs": {"SPF":"SPF50","PA rating":"Broad spectrum","Water resistance":"Limited","Formula type":"Tinted mineral (titanium dioxide)","Volume":"50 ml","White cast":"None (universal tint)","Price":"Mid-range"},
  "scores": {"SPF protection":4.7,"Texture":4.6,"Water resistance":2.5,"Value":4.3,"Skin feel":4.6},
 },
 "de": {
  "badge": "Bester getönter Finish",
  "review": "La Roche-Posay Anthelios Getönte Mineralische Sonnencreme verleiht einen sanften Universalton, der den Hautton ausgleicht, und schützt mit Titandioxid vor UVA und UVB. Leicht und parfümfrei für empfindliche Haut. Der einzelne Ton passt nicht zu jeder Haut, und die Wasserfestigkeit ist begrenzt.",
  "pros": [
   "Universalton gleicht den Hautton aus und kaschiert Rötungen für ein natürliches Finish",
   "Mineralfilter und parfümfreie Formel eignen sich für empfindliche Haut",
   "Leicht, als letzter Basisschritt unter oder anstelle von Make-up nutzbar"
  ],
  "cons": [
   "Ein einzelner Universalton passt nicht zu jeder Haut, und die Wasserfestigkeit ist begrenzt"
  ],
  "specs": {"SPF":"LSF 50","PA rating":"Breitband","Water resistance":"Begrenzt","Formula type":"Getönt mineralisch (Titandioxid)","Volume":"50 ml","White cast":"Keiner (Universalton)","Price":"Mittelklasse"},
  "scores": {"SPF protection":4.7,"Texture":4.6,"Water resistance":2.5,"Value":4.3,"Skin feel":4.6},
 },
 "es": {
  "badge": "Mejor acabado con color",
  "review": "La Roche-Posay Anthelios Protector Solar Mineral con Color aporta un tono universal suave que unifica la piel y protege frente a UVA y UVB con dióxido de titanio. Ligero y sin fragancia para piel sensible. El tono único no encaja en todas las pieles y la resistencia al agua es limitada.",
  "pros": [
   "El tono universal unifica la piel y difumina rojeces para un acabado natural",
   "Filtros minerales y fórmula sin fragancia, aptos para piel sensible",
   "Ligero, funciona como último paso base bajo o en lugar del maquillaje"
  ],
  "cons": [
   "Un único tono universal no encaja en todas las pieles y la resistencia al agua es limitada"
  ],
  "specs": {"SPF":"SPF50","PA rating":"Amplio espectro","Water resistance":"Limitada","Formula type":"Mineral con color (dióxido de titanio)","Volume":"50 ml","White cast":"Ninguno (tono universal)","Price":"Gama media"},
  "scores": {"SPF protection":4.7,"Texture":4.6,"Water resistance":2.5,"Value":4.3,"Skin feel":4.6},
 },
 "fr": {
  "badge": "Meilleur fini teinté",
  "review": "La Roche-Posay Anthelios Crème Solaire Minérale Teintée apporte une teinte universelle douce qui unifie le teint et protège des UVA et UVB grâce au dioxyde de titane. Légère et sans parfum pour les peaux sensibles. La teinte unique ne convient pas à toutes les carnations et la résistance à l'eau est limitée.",
  "pros": [
   "La teinte universelle unifie le teint et floute les rougeurs pour un fini naturel",
   "Filtres minéraux et formule sans parfum, adaptés aux peaux sensibles",
   "Légère, s'utilise en dernière étape de base sous ou à la place du maquillage"
  ],
  "cons": [
   "Une teinte universelle unique ne convient pas à toutes les carnations et la résistance à l'eau est limitée"
  ],
  "specs": {"SPF":"SPF50","PA rating":"Large spectre","Water resistance":"Limitée","Formula type":"Minéral teinté (dioxyde de titane)","Volume":"50 ml","White cast":"Aucun (teinte universelle)","Price":"Milieu de gamme"},
  "scores": {"SPF protection":4.7,"Texture":4.6,"Water resistance":2.5,"Value":4.3,"Skin feel":4.6},
 },
 "it": {
  "badge": "Miglior finish colorato",
  "review": "La Roche-Posay Anthelios Crema Solare Minerale Colorata dona una tinta universale delicata che uniforma l'incarnato e protegge da UVA e UVB con biossido di titanio. Leggera e senza profumo per la pelle sensibile. La tinta unica non si adatta a ogni incarnato e la resistenza all'acqua è limitata.",
  "pros": [
   "La tinta universale uniforma l'incarnato e sfuma i rossori per un finish naturale",
   "Filtri minerali e formula senza profumo, adatti alla pelle sensibile",
   "Leggera, utile come ultimo passaggio base sotto o al posto del trucco"
  ],
  "cons": [
   "Una tinta universale unica non si adatta a ogni incarnato e la resistenza all'acqua è limitata"
  ],
  "specs": {"SPF":"SPF50","PA rating":"Ampio spettro","Water resistance":"Limitata","Formula type":"Minerale colorato (biossido di titanio)","Volume":"50 ml","White cast":"Nessuno (tinta universale)","Price":"Fascia media"},
  "scores": {"SPF protection":4.7,"Texture":4.6,"Water resistance":2.5,"Value":4.3,"Skin feel":4.6},
 },
 "ja": {
  "badge": "ティント仕上げ最高",
  "review": "ラ ロッシュ ポゼ アンテリオス ティンテッド ミネラル サンスクリーンは、ほんのりとしたユニバーサルティントで肌色を均一に整えながら、二酸化チタンでUVA・UVBから守る。軽いつけ心地で無香料、敏感肌にも向く。単一ティントのためすべての肌色には合わず、耐水性は限定的。",
  "pros": [
   "ユニバーサルティントが肌色を整え、赤みをぼかして自然な仕上がりに",
   "ミネラルフィルターと無香料処方で敏感肌に向く",
   "軽くて、メイクの下地としても単体でも最後の仕上げに使える"
  ],
  "cons": [
   "単一のユニバーサルティントはすべての肌色には合わず、耐水性も限定的"
  ],
  "specs": {"SPF":"SPF50","PA rating":"ブロードスペクトラム","Water resistance":"限定的","Formula type":"ティント入りミネラル（二酸化チタン）","Volume":"50 ml","White cast":"なし（ユニバーサルティント）","Price":"ミドルレンジ"},
  "scores": {"SPF protection":4.7,"Texture":4.6,"Water resistance":2.5,"Value":4.3,"Skin feel":4.6},
 },
 "ko": {
  "badge": "틴트 마무리 최고",
  "review": "라 로슈 포제 안텔리오스 틴티드 미네랄 선크림은 은은한 유니버설 틴트로 피부 톤을 고르게 정돈하면서 이산화티타늄으로 UVA와 UVB를 차단한다. 가볍고 무향료라 민감성 피부에도 적합하다. 단일 틴트라 모든 피부 톤에 맞지는 않으며 내수성은 제한적이다.",
  "pros": [
   "유니버설 틴트가 피부 톤을 고르게 하고 붉은기를 가려 자연스러운 마무리",
   "미네랄 필터와 무향료 제형으로 민감성 피부에 적합",
   "가벼워서 메이크업 아래 또는 단독으로 마지막 베이스 단계로 사용 가능"
  ],
  "cons": [
   "단일 유니버설 틴트는 모든 피부 톤에 맞지 않으며 내수성이 제한적임"
  ],
  "specs": {"SPF":"SPF50","PA rating":"광범위 차단","Water resistance":"제한적","Formula type":"틴티드 미네랄(이산화티타늄)","Volume":"50 ml","White cast":"없음(유니버설 틴트)","Price":"중간대"},
  "scores": {"SPF protection":4.7,"Texture":4.6,"Water resistance":2.5,"Value":4.3,"Skin feel":4.6},
 },
 "pt-BR": {
  "badge": "Melhor acabamento com cor",
  "review": "O La Roche-Posay Anthelios Protetor Solar Mineral com Cor traz um tom universal suave que uniformiza a pele e protege contra UVA e UVB com dióxido de titânio. Leve e sem fragrância para pele sensível. O tom único não combina com todas as peles e a resistência à água é limitada.",
  "pros": [
   "O tom universal uniformiza a pele e disfarça vermelhidões para um acabamento natural",
   "Filtros minerais e fórmula sem fragrância, adequados à pele sensível",
   "Leve, funciona como última etapa de base sob ou no lugar da maquiagem"
  ],
  "cons": [
   "Um único tom universal não combina com todas as peles e a resistência à água é limitada"
  ],
  "specs": {"SPF":"FPS50","PA rating":"Amplo espectro","Water resistance":"Limitada","Formula type":"Mineral com cor (dióxido de titânio)","Volume":"50 ml","White cast":"Nenhum (tom universal)","Price":"Intermediário"},
  "scores": {"SPF protection":4.7,"Texture":4.6,"Water resistance":2.5,"Value":4.3,"Skin feel":4.6},
 },
}

# ---- offerNotes ----
ON_CERAVE = {
 "en": "A lightweight 100% mineral face sunscreen from CeraVe with zinc oxide and titanium dioxide, plus three essential ceramides and hyaluronic acid to support the skin barrier. Broad-spectrum SPF50, fragrance-free, non-comedogenic and developed with dermatologists for sensitive skin. It can leave a slight white cast on deeper skin tones and offers only limited water resistance, so it is best for everyday wear rather than swimming or heavy sweating; reapply every two hours of sun exposure.",
 "de": "Ein leichter, zu 100 % mineralischer Gesichtssonnenschutz von CeraVe mit Zinkoxid und Titandioxid sowie drei essenziellen Ceramiden und Hyaluronsäure zur Stärkung der Hautbarriere. Breitband-LSF 50, parfümfrei, nicht komedogen und mit Dermatologen für empfindliche Haut entwickelt. Auf dunkleren Hauttönen kann ein leichter Weißfilm zurückbleiben, und die Wasserfestigkeit ist begrenzt, daher eignet er sich eher für den Alltag als zum Schwimmen oder bei starkem Schwitzen; bei Sonneneinstrahlung alle zwei Stunden erneut auftragen.",
 "es": "Un protector solar facial 100 % mineral y ligero de CeraVe con óxido de zinc y dióxido de titanio, más tres ceramidas esenciales y ácido hialurónico para reforzar la barrera cutánea. SPF50 de amplio espectro, sin fragancia, no comedogénico y desarrollado con dermatólogos para piel sensible. Puede dejar un ligero velo blanco en tonos de piel más oscuros y ofrece una resistencia al agua limitada, por lo que es mejor para el uso diario que para nadar o sudar mucho; reaplica cada dos horas de exposición solar.",
 "fr": "Une protection solaire visage 100 % minérale et légère de CeraVe avec oxyde de zinc et dioxyde de titane, plus trois céramides essentiels et de l'acide hyaluronique pour soutenir la barrière cutanée. SPF50 à large spectre, sans parfum, non comédogène et développée avec des dermatologues pour les peaux sensibles. Elle peut laisser un léger voile blanc sur les carnations plus foncées et offre une résistance à l'eau limitée ; elle convient donc mieux au quotidien qu'à la baignade ou à une forte transpiration ; réappliquer toutes les deux heures d'exposition au soleil.",
 "it": "Una protezione solare viso 100 % minerale e leggera di CeraVe con ossido di zinco e biossido di titanio, più tre ceramidi essenziali e acido ialuronico per sostenere la barriera cutanea. SPF50 ad ampio spettro, senza profumo, non comedogenica e sviluppata con dermatologi per la pelle sensibile. Può lasciare un leggero velo bianco sui toni di pelle più scuri e offre una resistenza all'acqua limitata, quindi è più adatta all'uso quotidiano che al nuoto o alla forte sudorazione; riapplicare ogni due ore di esposizione al sole.",
 "ja": "CeraVeの軽いつけ心地の100%ミネラル顔用日焼け止め。酸化亜鉛と酸化チタンに加え、3種のセラミドとヒアルロン酸を配合して肌バリアを支える。ブロードスペクトラムSPF50、無香料、ノンコメドジェニックで、皮膚科医と共同開発され敏感肌向け。濃い肌色ではわずかに白浮きすることがあり、耐水性は限定的なので、水泳や大量の発汗よりも日常使いに向く。日光下では2時間ごとに塗り直すこと。",
 "ko": "CeraVe의 가벼운 100% 미네랄 얼굴용 자외선 차단제. 산화아연과 이산화티타늄에 세 가지 필수 세라마이드와 히알루론산을 더해 피부 장벽을 돕는다. 광범위 차단 SPF50, 무향료, 논코메도제닉으로 피부과 전문의와 함께 민감성 피부를 위해 개발했다. 어두운 피부 톤에서는 약간의 백탁이 남을 수 있고 내수성은 제한적이라 수영이나 많은 땀보다는 일상 사용에 적합하다. 햇빛 아래에서는 두 시간마다 덧발라야 한다.",
 "pt-BR": "Um protetor solar facial 100 % mineral e leve da CeraVe com óxido de zinco e dióxido de titânio, além de três ceramidas essenciais e ácido hialurônico para apoiar a barreira cutânea. FPS50 de amplo espectro, sem fragrância, não comedogênico e desenvolvido com dermatologistas para pele sensível. Pode deixar um leve véu branco em tons de pele mais escuros e oferece resistência à água limitada, por isso é melhor para o uso diário do que para nadar ou suar muito; reaplique a cada duas horas de exposição solar.",
}
ON_LRP = {
 "en": "La Roche-Posay's Anthelios tinted mineral face sunscreen uses titanium dioxide for broad-spectrum SPF50 protection and adds a soft universal tint that evens out skin tone and blurs redness. Fragrance-free and formulated for sensitive skin, it works as a final base step under makeup or on its own. As a single universal shade it will not match every complexion, and water resistance is limited, so reapply during prolonged sun exposure and treat it as a daily-wear rather than a beach or sport sunscreen.",
 "de": "Der getönte mineralische Gesichtssonnenschutz Anthelios von La Roche-Posay nutzt Titandioxid für Breitband-LSF-50-Schutz und fügt einen sanften Universalton hinzu, der den Hautton ausgleicht und Rötungen kaschiert. Parfümfrei und für empfindliche Haut formuliert, eignet er sich als letzter Basisschritt unter Make-up oder allein. Als einzelner Universalton passt er nicht zu jeder Haut, und die Wasserfestigkeit ist begrenzt, daher bei längerer Sonneneinstrahlung erneut auftragen und ihn eher als Alltags- denn als Strand- oder Sportprodukt verwenden.",
 "es": "El protector solar facial mineral con color Anthelios de La Roche-Posay usa dióxido de titanio para una protección SPF50 de amplio espectro y añade un tono universal suave que unifica la piel y difumina rojeces. Sin fragancia y formulado para piel sensible, funciona como último paso base bajo el maquillaje o solo. Al ser un único tono universal no encaja en todas las pieles, y la resistencia al agua es limitada, así que reaplícalo durante una exposición solar prolongada y trátalo como un producto de uso diario, no de playa o deporte.",
 "fr": "La protection solaire visage minérale teintée Anthelios de La Roche-Posay utilise le dioxyde de titane pour une protection SPF50 à large spectre et ajoute une teinte universelle douce qui unifie le teint et floute les rougeurs. Sans parfum et formulée pour les peaux sensibles, elle s'utilise en dernière étape de base sous le maquillage ou seule. En tant que teinte universelle unique, elle ne convient pas à toutes les carnations, et la résistance à l'eau est limitée : réappliquer lors d'une exposition prolongée et la considérer comme un produit du quotidien plutôt que pour la plage ou le sport.",
 "it": "La protezione solare viso minerale colorata Anthelios di La Roche-Posay usa il biossido di titanio per una protezione SPF50 ad ampio spettro e aggiunge una tinta universale delicata che uniforma l'incarnato e sfuma i rossori. Senza profumo e formulata per la pelle sensibile, funziona come ultimo passaggio base sotto il trucco o da sola. Essendo un'unica tinta universale non si adatta a ogni incarnato, e la resistenza all'acqua è limitata, quindi riapplicare durante l'esposizione prolungata al sole e usarla come prodotto da tutti i giorni più che da spiaggia o sport.",
 "ja": "ラ ロッシュ ポゼのアンテリオス ティンテッド ミネラル顔用日焼け止めは、二酸化チタンでブロードスペクトラムSPF50を実現し、ほんのりとしたユニバーサルティントで肌色を均一に整え赤みをぼかす。無香料で敏感肌向けに処方され、メイクの下地としても単体でも最後の仕上げに使える。単一のユニバーサルシェードのためすべての肌色には合わず、耐水性も限定的なので、長時間の日光下では塗り直し、ビーチやスポーツ用ではなく日常使いとして扱うのがよい。",
 "ko": "라 로슈 포제의 안텔리오스 틴티드 미네랄 얼굴용 자외선 차단제는 이산화티타늄으로 광범위 차단 SPF50을 제공하고, 은은한 유니버설 틴트로 피부 톤을 고르게 하고 붉은기를 가린다. 무향료에 민감성 피부를 위해 만들어져 메이크업 아래 또는 단독으로 마지막 베이스 단계로 쓴다. 단일 유니버설 색조라 모든 피부 톤에 맞지는 않고 내수성도 제한적이므로, 장시간 햇빛 노출 시 덧바르고 해변·스포츠용보다는 데일리용으로 쓰는 것이 좋다.",
 "pt-BR": "O protetor solar facial mineral com cor Anthelios da La Roche-Posay usa dióxido de titânio para proteção FPS50 de amplo espectro e acrescenta um tom universal suave que uniformiza a pele e disfarça vermelhidões. Sem fragrância e formulado para pele sensível, funciona como última etapa de base sob a maquiagem ou sozinho. Por ser um único tom universal, não combina com todas as peles, e a resistência à água é limitada, então reaplique durante exposição solar prolongada e use-o como produto do dia a dia, não de praia ou esporte.",
}

# ---- recommendedFor[2] (CeraVe) and [4] (LRP) ----
RF2 = {
 "en": {"label":"For sensitive skin wanting a daily mineral SPF","reason":"100% mineral filters with ceramides and hyaluronic acid protect and support the barrier without fragrance — an easy daily choice for reactive skin."},
 "de": {"label":"Für empfindliche Haut, die einen täglichen mineralischen LSF sucht","reason":"100 % mineralische Filter mit Ceramiden und Hyaluronsäure schützen und stärken die Barriere ohne Parfüm — eine unkomplizierte tägliche Wahl für reaktive Haut."},
 "es": {"label":"Para piel sensible que quiere un SPF mineral diario","reason":"Los filtros 100 % minerales con ceramidas y ácido hialurónico protegen y refuerzan la barrera sin fragancia — una opción diaria sencilla para piel reactiva."},
 "fr": {"label":"Pour les peaux sensibles cherchant un SPF minéral quotidien","reason":"Des filtres 100 % minéraux avec céramides et acide hyaluronique protègent et renforcent la barrière sans parfum — un choix quotidien simple pour les peaux réactives."},
 "it": {"label":"Per la pelle sensibile che vuole un SPF minerale quotidiano","reason":"Filtri 100 % minerali con ceramidi e acido ialuronico proteggono e sostengono la barriera senza profumo — una scelta quotidiana semplice per la pelle reattiva."},
 "ja": {"label":"毎日使えるミネラルSPFを求める敏感肌に","reason":"100%ミネラルフィルターにセラミドとヒアルロン酸を配合し、無香料で肌バリアを守り支える。揺らぎ肌の毎日使いに選びやすい。"},
 "ko": {"label":"데일리 미네랄 SPF를 원하는 민감성 피부에","reason":"100% 미네랄 필터에 세라마이드와 히알루론산을 더해 무향료로 장벽을 보호하고 돕는다 — 예민한 피부의 손쉬운 데일리 선택."},
 "pt-BR": {"label":"Para pele sensível que quer um FPS mineral diário","reason":"Filtros 100 % minerais com ceramidas e ácido hialurônico protegem e apoiam a barreira sem fragrância — uma escolha diária simples para pele reativa."},
}
RF4 = {
 "en": {"label":"For anyone wanting a tinted SPF that evens skin tone","reason":"A soft universal tint blurs redness and unifies skin tone over mineral SPF50 protection — a natural-finish base that often replaces foundation."},
 "de": {"label":"Für alle, die einen getönten SPF zum Ausgleich des Hauttons möchten","reason":"Ein sanfter Universalton kaschiert Rötungen und vereinheitlicht den Hautton über mineralischem LSF-50-Schutz — eine natürliche Basis, die oft die Foundation ersetzt."},
 "es": {"label":"Para quien quiere un SPF con color que unifique la piel","reason":"Un tono universal suave difumina rojeces y unifica la piel sobre protección mineral SPF50 — una base de acabado natural que suele sustituir al maquillaje."},
 "fr": {"label":"Pour qui veut un SPF teinté qui unifie le teint","reason":"Une teinte universelle douce floute les rougeurs et unifie le teint sur une protection minérale SPF50 — une base au fini naturel qui remplace souvent le fond de teint."},
 "it": {"label":"Per chi vuole un SPF colorato che uniformi l'incarnato","reason":"Una tinta universale delicata sfuma i rossori e uniforma l'incarnato sopra una protezione minerale SPF50 — una base dal finish naturale che spesso sostituisce il fondotinta."},
 "ja": {"label":"肌色を整えるティント入りSPFを求める人に","reason":"ほんのりとしたユニバーサルティントが赤みをぼかし、ミネラルSPF50の保護の上で肌色を均一に整える。ファンデの代わりにもなる自然な仕上がりの下地。"},
 "ko": {"label":"피부 톤을 고르게 하는 틴트 SPF를 원하는 사람에게","reason":"은은한 유니버설 틴트가 붉은기를 가리고 미네랄 SPF50 보호 위에서 피부 톤을 고르게 한다 — 파운데이션을 대신하기도 하는 자연스러운 마무리의 베이스."},
 "pt-BR": {"label":"Para quem quer um FPS com cor que uniformize a pele","reason":"Um tom universal suave disfarça vermelhidões e uniformiza a pele sobre proteção mineral FPS50 — uma base de acabamento natural que muitas vezes substitui a base."},
}

# ---- prose mentions: full-replacement strings keyed by (locale, path) ----
# lede: replace the "Biore UV" fragment with the CeraVe product. We rewrite whole lede per locale.
LEDE = {
 "en": "Five sunscreens — Anessa Perfect UV Sunscreen SPF50+ PA++++ (Japan's outdoor sports gold standard), La Roche-Posay Anthelios UVMune 400 (European formula blocking ultra-long UVA up to 400nm), CeraVe Hydrating Mineral Sunscreen SPF 50. Ingredient concentration and formulation compatibility matter more than brand reputation.",
}

def set_path(d, ks, val):
    o=d
    for k in ks[:-1]:
        o=o[k]
    o[ks[-1]]=val

LOCALES = ["en","de","es","fr","it","ja","ko","pt-BR"]

for loc in LOCALES:
    fp=os.path.join(DIR, loc+".json")
    d=json.load(open(fp, encoding="utf-8"))
    # products[2]
    p2=d["products"][2]
    p2["badge"]=P2[loc]["badge"]; p2["review"]=P2[loc]["review"]
    p2["pros"]=P2[loc]["pros"]; p2["cons"]=P2[loc]["cons"]
    p2["specs"]=P2[loc]["specs"]; p2["scores"]=P2[loc]["scores"]
    # products[4]
    p4=d["products"][4]
    p4["badge"]=P4[loc]["badge"]; p4["review"]=P4[loc]["review"]
    p4["pros"]=P4[loc]["pros"]; p4["cons"]=P4[loc]["cons"]
    p4["specs"]=P4[loc]["specs"]; p4["scores"]=P4[loc]["scores"]
    # offerNotes
    d["offerNotes"]["biore-uv-aqua-rich-essence"]=ON_CERAVE[loc]
    d["offerNotes"]["skin-aqua-tone-up-lavender"]=ON_LRP[loc]
    # recommendedFor
    d["recommendedFor"][2]["label"]=RF2[loc]["label"]; d["recommendedFor"][2]["reason"]=RF2[loc]["reason"]
    d["recommendedFor"][4]["label"]=RF4[loc]["label"]; d["recommendedFor"][4]["reason"]=RF4[loc]["reason"]
    json.dump(d, open(fp,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
    print("base fields written:", loc)
