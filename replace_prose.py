import json, os, re

DIR = "/tmp/pickly-deploy/site/src/articles/best-sunscreen-2026/messages"
LOCALES = ["en","de","es","fr","it","ja","ko","pt-BR"]

def setp(d, path, val):
    o=d; parts=path.split('/')
    for part in parts[:-1]:
        m=re.match(r'(\w+)\[(\d+)\]$',part)
        if m: o=o[m.group(1)][int(m.group(2))]
        else: o=o[part]
    last=parts[-1]
    m=re.match(r'(\w+)\[(\d+)\]$',last)
    if m: o[m.group(1)][int(m.group(2))]=val
    else: o[last]=val

def getp(d, path):
    o=d
    for part in path.split('/'):
        m=re.match(r'(\w+)\[(\d+)\]$',part)
        if m: o=o[m.group(1)][int(m.group(2))]
        else: o=o[part]
    return o

# ============ FULL-REPLACEMENT product-centric paragraphs ============
# Keys: path -> {locale: text}
FULL = {
 "lede": {
  "en": "Five sunscreens — Anessa Perfect UV Sunscreen SPF50+ PA++++ (Japan's outdoor sports gold standard), La Roche-Posay Anthelios UVMune 400 (European formula blocking ultra-long UVA up to 400nm), CeraVe Hydrating Mineral Sunscreen SPF 50 (a fragrance-free daily mineral option), EltaMD UV Clear SPF46 (dermatologist-recommended, with niacinamide), La Roche-Posay Anthelios Tinted Mineral Sunscreen SPF 50 (a universal tint that evens skin tone). Ingredient concentration and formulation compatibility matter more than brand reputation.",
  "de": "Fünf Sonnenschutzmittel — Anessa Perfect UV Sunscreen SPF50+ PA++++ (Japans Gold-Standard für Outdoorsport), La Roche-Posay Anthelios UVMune 400 (europäische Formel mit ultra-langem UVA-Schutz bis 400nm), CeraVe Hydrating Mineral Sunscreen SPF 50 (eine parfümfreie tägliche Mineraloption), EltaMD UV Clear SPF46 (von Dermatologen empfohlen, mit Niacinamid), La Roche-Posay Anthelios Getönte Mineralische Sonnencreme LSF 50 (ein Universalton, der den Hautton ausgleicht). Wirkstoffkonzentration und Formulierungskompatibilität sind wichtiger als Markenbekanntheit.",
  "es": "Cinco protectores solares — Anessa Perfect UV Sunscreen SPF50+ PA++++ (el estándar de oro japonés para deportes al aire libre), La Roche-Posay Anthelios UVMune 400 (fórmula europea que bloquea UVA ultra-largo hasta 400nm), CeraVe Hydrating Mineral Sunscreen SPF 50 (una opción mineral diaria sin fragancia), EltaMD UV Clear SPF46 (recomendado por dermatólogos, con niacinamida), La Roche-Posay Anthelios Protector Solar Mineral con Color SPF 50 (un tono universal que unifica la piel). La concentración de ingredientes y la compatibilidad de la formulación importan más que la reputación de la marca.",
  "fr": "Cinq écrans solaires — Anessa Perfect UV Sunscreen SPF50+ PA++++ (l'étalon-or japonais pour le sport en plein air), La Roche-Posay Anthelios UVMune 400 (formule européenne bloquant les UVA ultra-longs jusqu'à 400nm), CeraVe Hydrating Mineral Sunscreen SPF 50 (une option minérale quotidienne sans parfum), EltaMD UV Clear SPF46 (recommandé par les dermatologues, avec niacinamide), La Roche-Posay Anthelios Crème Solaire Minérale Teintée SPF 50 (une teinte universelle qui unifie le teint). La concentration des ingrédients et la compatibilité de formulation comptent plus que la réputation de la marque.",
  "it": "Cinque solari — Anessa Perfect UV Sunscreen SPF50+ PA++++ (lo standard d'oro giapponese per gli sport all'aperto), La Roche-Posay Anthelios UVMune 400 (formula europea che blocca UVA ultra-lungo fino a 400nm), CeraVe Hydrating Mineral Sunscreen SPF 50 (un'opzione minerale quotidiana senza profumo), EltaMD UV Clear SPF46 (raccomandato dai dermatologi, con niacinamide), La Roche-Posay Anthelios Crema Solare Minerale Colorata SPF 50 (una tinta universale che uniforma l'incarnato). La concentrazione degli ingredienti e la compatibilita della formulazione contano piu della reputazione del marchio.",
  "ja": "5つの日焼け止め — アネッサ パーフェクトUV サンスクリーン SPF50+ PA++++（日本のアウトドアスポーツのゴールドスタンダード）、ラ ロッシュ ポゼ アンテリオス UVミューン400（超長波UVAを400nmまで遮断する欧州処方）、セラヴィ ハイドレーティング ミネラル サンスクリーン SPF50（無香料の毎日使えるミネラルタイプ）、EltaMD UV Clear SPF46（皮膚科医推奨、ナイアシンアミド配合）、ラ ロッシュ ポゼ アンテリオス ティンテッド ミネラル サンスクリーン SPF50（肌色を整えるユニバーサルティント）。成分濃度と配合の相性が、ブランド知名度より効果に直結する。",
  "ko": "5가지 선크림 — Anessa Perfect UV Sunscreen SPF50+ PA++++(일본의 야외 스포츠 표준), La Roche-Posay Anthelios UVMune 400(초장파 UVA를 400nm까지 차단하는 유럽 포뮬러), 세라비 하이드레이팅 미네랄 선크림 SPF 50(무향료 데일리 미네랄 옵션), EltaMD UV Clear SPF46(피부과 추천, 나이아신아마이드 함유), 라 로슈 포제 안텔리오스 틴티드 미네랄 선크림 SPF 50(피부 톤을 고르게 하는 유니버설 틴트) — 성분 농도와 포뮬러 호환성이 브랜드 명성보다 중요합니다.",
  "pt-BR": "Cinco protetores solares — Anessa Perfect UV Sunscreen SPF50+ PA++++ (padrão ouro japonês para esportes ao ar livre), La Roche-Posay Anthelios UVMune 400 (fórmula europeia com bloqueio ultralong UVA até 400nm), CeraVe Hydrating Mineral Sunscreen SPF 50 (uma opção mineral diária sem fragrância), EltaMD UV Clear SPF46 (recomendado por dermatologistas, com niacinamida), La Roche-Posay Anthelios Protetor Solar Mineral com Cor FPS 50 (um tom universal que uniformiza a pele). A concentração dos ingredientes e a compatibilidade da formulação importam mais do que a reputação da marca.",
 },
 "sections[6]/paragraphs[2]": {
  "en": "Sensitive skin, daily wear under makeup, barrier support, fragrance-free: CeraVe Hydrating Mineral Sunscreen SPF 50. The 100% mineral formula pairs zinc oxide and titanium dioxide with three essential ceramides and hyaluronic acid, so it protects while supporting the skin barrier. It can leave a slight white cast on deeper skin tones; water resistance is limited, so it is best for everyday wear rather than swimming or heavy outdoor sweating, with reapplication every two hours of sun exposure.",
  "de": "Empfindliche Haut, täglicher Gebrauch unter Make-up, Barrierepflege, parfümfrei: CeraVe Hydrating Mineral Sunscreen SPF 50. Die zu 100 % mineralische Formel kombiniert Zinkoxid und Titandioxid mit drei essenziellen Ceramiden und Hyaluronsäure, schützt also und stärkt zugleich die Hautbarriere. Auf dunkleren Hauttönen kann ein leichter Weißfilm zurückbleiben; die Wasserfestigkeit ist begrenzt, daher eignet er sich eher für den Alltag als zum Schwimmen oder bei starkem Schwitzen im Freien, mit Wiederauftragen alle zwei Stunden Sonneneinstrahlung.",
  "es": "Piel sensible, uso diario bajo maquillaje, apoyo a la barrera, sin fragancia: CeraVe Hydrating Mineral Sunscreen SPF 50. La fórmula 100 % mineral combina óxido de zinc y dióxido de titanio con tres ceramidas esenciales y ácido hialurónico, así que protege a la vez que refuerza la barrera cutánea. Puede dejar un ligero velo blanco en tonos de piel más oscuros; la resistencia al agua es limitada, por lo que es mejor para el uso diario que para nadar o sudar mucho al aire libre, reaplicando cada dos horas de exposición solar.",
  "fr": "Peau sensible, usage quotidien sous maquillage, soutien de la barrière, sans parfum : CeraVe Hydrating Mineral Sunscreen SPF 50. La formule 100 % minérale associe oxyde de zinc et dioxyde de titane à trois céramides essentiels et de l'acide hyaluronique, protégeant tout en soutenant la barrière cutanée. Elle peut laisser un léger voile blanc sur les carnations plus foncées ; la résistance à l'eau est limitée, elle convient donc mieux au quotidien qu'à la baignade ou à une forte transpiration en extérieur, avec réapplication toutes les deux heures d'exposition au soleil.",
  "it": "Pelle sensibile, uso quotidiano sotto il trucco, sostegno alla barriera, senza profumo: CeraVe Hydrating Mineral Sunscreen SPF 50. La formula 100 % minerale unisce ossido di zinco e biossido di titanio a tre ceramidi essenziali e acido ialuronico, quindi protegge sostenendo al contempo la barriera cutanea. Può lasciare un leggero velo bianco sui toni di pelle più scuri; la resistenza all'acqua è limitata, quindi è più adatta all'uso quotidiano che al nuoto o alla forte sudorazione all'aperto, con riapplicazione ogni due ore di esposizione al sole.",
  "ja": "敏感肌、メイク下の毎日使い、バリアサポート、無香料：セラヴィ ハイドレーティング ミネラル サンスクリーン SPF50。100%ミネラル処方で酸化亜鉛と酸化チタンに3種のセラミドとヒアルロン酸を組み合わせ、守りながら肌バリアを支える。濃い肌色ではわずかに白浮きすることがあり、耐水性は限定的なので、水泳や激しい屋外発汗よりも日常使いに向き、日光下では2時間ごとに塗り直すとよい。",
  "ko": "민감성 피부, 메이크업 아래 일상 착용, 장벽 보조, 무향료: 세라비 하이드레이팅 미네랄 선크림 SPF 50. 100% 미네랄 포뮬러는 산화아연과 이산화티타늄에 세 가지 필수 세라마이드와 히알루론산을 더해, 보호하면서 피부 장벽을 돕는다. 어두운 피부 톤에서는 약간의 백탁이 남을 수 있고, 내수성이 제한적이라 수영이나 심한 야외 발한보다 일상 착용에 적합하며 햇빛 아래에서는 두 시간마다 덧발라야 한다.",
  "pt-BR": "Pele sensível, uso diário sob maquiagem, apoio à barreira, sem fragrância: CeraVe Hydrating Mineral Sunscreen SPF 50. A fórmula 100 % mineral combina óxido de zinco e dióxido de titânio com três ceramidas essenciais e ácido hialurônico, protegendo enquanto apoia a barreira cutânea. Pode deixar um leve véu branco em tons de pele mais escuros; a resistência à água é limitada, por isso é melhor para o uso diário do que para natação ou transpiração intensa ao ar livre, reaplicando a cada duas horas de exposição solar.",
 },
 "sections[6]/paragraphs[4]": {
  "en": "Even skin tone, soft natural finish, base under or instead of makeup, daily commute: La Roche-Posay Anthelios Tinted Mineral Sunscreen SPF 50. A soft universal tint built on titanium dioxide blurs redness and evens skin tone for a natural finish. As a single universal shade it will not match every complexion; water resistance is limited and the tint provides no skincare treatment benefit, so use it over a moisturizer rather than instead of one.",
  "de": "Ebenmäßiger Hautton, sanftes natürliches Finish, Basis unter oder anstelle von Make-up, täglicher Arbeitsweg: La Roche-Posay Anthelios Getönte Mineralische Sonnencreme LSF 50. Ein sanfter Universalton auf Titandioxid-Basis kaschiert Rötungen und gleicht den Hautton für ein natürliches Finish aus. Als einzelner Universalton passt er nicht zu jeder Haut; die Wasserfestigkeit ist begrenzt und der Ton bietet keinen Pflegevorteil, daher über einer Feuchtigkeitspflege statt an deren Stelle verwenden.",
  "es": "Tono uniforme, acabado natural suave, base bajo o en lugar del maquillaje, trayecto diario: La Roche-Posay Anthelios Protector Solar Mineral con Color SPF 50. Un tono universal suave a base de dióxido de titanio difumina rojeces y unifica la piel para un acabado natural. Al ser un único tono universal no encaja en todas las pieles; la resistencia al agua es limitada y el color no aporta beneficio de tratamiento, así que úsalo sobre una hidratante en lugar de sustituirla.",
  "fr": "Teint unifié, fini naturel doux, base sous ou à la place du maquillage, trajet quotidien : La Roche-Posay Anthelios Crème Solaire Minérale Teintée SPF 50. Une teinte universelle douce à base de dioxyde de titane floute les rougeurs et unifie le teint pour un fini naturel. En tant que teinte universelle unique, elle ne convient pas à toutes les carnations ; la résistance à l'eau est limitée et la teinte n'apporte aucun bénéfice de soin, à utiliser donc sur une crème hydratante plutôt qu'à sa place.",
  "it": "Incarnato uniforme, finish naturale delicato, base sotto o al posto del trucco, pendolarismo quotidiano: La Roche-Posay Anthelios Crema Solare Minerale Colorata SPF 50. Una tinta universale delicata a base di biossido di titanio sfuma i rossori e uniforma l'incarnato per un finish naturale. Essendo un'unica tinta universale non si adatta a ogni incarnato; la resistenza all'acqua è limitata e la tinta non offre benefici di trattamento, quindi usala sopra una crema idratante anziché al suo posto.",
  "ja": "肌色を均一に、柔らかな自然な仕上がり、メイクの下地や単体で、毎日の通勤に：ラ ロッシュ ポゼ アンテリオス ティンテッド ミネラル サンスクリーン SPF50。二酸化チタンをベースにしたほんのりとしたユニバーサルティントが赤みをぼかし、肌色を整えて自然な仕上がりにする。単一のユニバーサルシェードのためすべての肌色には合わず、耐水性は限定的で、ティントにスキンケアのトリートメント効果はないため、保湿の代わりではなく上に重ねて使うとよい。",
  "ko": "고른 피부 톤, 부드러운 자연 마감, 메이크업 아래 또는 단독 베이스, 일상 통근: 라 로슈 포제 안텔리오스 틴티드 미네랄 선크림 SPF 50. 이산화티타늄 기반의 은은한 유니버설 틴트가 붉은기를 가리고 피부 톤을 고르게 해 자연스러운 마감을 준다. 단일 유니버설 색조라 모든 피부 톤에 맞지는 않으며, 내수성이 제한적이고 틴트에 스킨케어 트리트먼트 효과는 없으므로 보습 대신이 아니라 그 위에 사용하는 것이 좋다.",
  "pt-BR": "Pele uniforme, acabamento natural suave, base sob ou no lugar da maquiagem, deslocamento diário: La Roche-Posay Anthelios Protetor Solar Mineral com Cor FPS 50. Um tom universal suave à base de dióxido de titânio disfarça vermelhidões e uniformiza a pele para um acabamento natural. Por ser um único tom universal, não combina com todas as peles; a resistência à água é limitada e a cor não oferece benefício de tratamento, então use-o sobre um hidratante em vez de substituí-lo.",
 },
 "sections[7]/paragraphs[0]": {
  "en": "For most people with a daily commute or office-based lifestyle who want a sunscreen they will actually use every day, especially sensitive or reactive skin: CeraVe Hydrating Mineral Sunscreen SPF 50. The 100% mineral formula is fragrance-free and adds ceramides and hyaluronic acid, it layers under makeup, and broad-spectrum SPF50 covers the protection standard any dermatologist would recommend. The slight white cast and limited water resistance are real but minor for the daily use case it suits best.",
  "de": "Für die meisten Menschen mit täglichem Arbeitsweg oder bürobasiertem Lebensstil, die einen Sonnenschutz wollen, den sie wirklich jeden Tag verwenden, besonders bei empfindlicher oder reaktiver Haut: CeraVe Hydrating Mineral Sunscreen SPF 50. Die zu 100 % mineralische Formel ist parfümfrei und enthält Ceramide und Hyaluronsäure, lässt sich unter Make-up schichten, und Breitband-LSF 50 deckt den Schutzstandard ab, den jeder Dermatologe empfehlen würde. Der leichte Weißfilm und die begrenzte Wasserfestigkeit sind real, aber für den täglichen Einsatz, für den er am besten geeignet ist, nebensächlich.",
  "es": "Para la mayoría de las personas con un trayecto diario o estilo de vida de oficina que quieren un protector solar que realmente usen cada día, sobre todo piel sensible o reactiva: CeraVe Hydrating Mineral Sunscreen SPF 50. La fórmula 100 % mineral es sin fragancia y añade ceramidas y ácido hialurónico, se aplica bajo el maquillaje y el SPF50 de amplio espectro cubre el estándar de protección que recomendaría cualquier dermatólogo. El leve velo blanco y la resistencia al agua limitada son reales pero menores para el uso diario al que mejor se adapta.",
  "fr": "Pour la plupart des personnes ayant un trajet quotidien ou un mode de vie de bureau qui veulent un écran solaire qu'elles utiliseront vraiment tous les jours, surtout les peaux sensibles ou réactives : CeraVe Hydrating Mineral Sunscreen SPF 50. La formule 100 % minérale est sans parfum et ajoute des céramides et de l'acide hyaluronique, elle se superpose sous le maquillage, et le SPF50 à large spectre couvre le standard de protection que tout dermatologue recommanderait. Le léger voile blanc et la résistance à l'eau limitée sont réels mais mineurs pour l'usage quotidien auquel elle convient le mieux.",
  "it": "Per la maggior parte delle persone con un pendolarismo quotidiano o uno stile di vita da ufficio che vogliono un solare che useranno davvero ogni giorno, soprattutto pelli sensibili o reattive: CeraVe Hydrating Mineral Sunscreen SPF 50. La formula 100 % minerale è senza profumo e aggiunge ceramidi e acido ialuronico, si stratifica sotto il trucco, e l'SPF50 ad ampio spettro copre lo standard di protezione che qualsiasi dermatologo raccomanderebbe. Il leggero velo bianco e la resistenza all'acqua limitata sono reali ma secondari per l'uso quotidiano a cui è più adatta.",
  "ja": "毎日の通勤やオフィス中心のライフスタイルで、実際に毎日使える日焼け止めを求めるほとんどの方、とくに敏感肌や揺らぎ肌に：セラヴィ ハイドレーティング ミネラル サンスクリーン SPF50。100%ミネラル処方は無香料で、セラミドとヒアルロン酸を配合し、メイクの下にも重ねられ、ブロードスペクトラムSPF50はいかなる皮膚科医も推奨する防護基準をカバーする。わずかな白浮きと限定的な耐水性は事実だが、最も適した毎日使いの用途では小さな問題だ。",
  "ko": "일일 통근이나 사무실 기반 생활로 매일 실제로 쓸 선크림을 원하는 대부분의 사람들, 특히 민감하거나 예민한 피부에게: 세라비 하이드레이팅 미네랄 선크림 SPF 50. 100% 미네랄 포뮬러는 무향료이며 세라마이드와 히알루론산을 더했고, 메이크업 아래 레이어링되며, 광범위 차단 SPF50은 어느 피부과 의사라도 권장할 보호 기준을 충족한다. 약간의 백탁과 제한적인 내수성은 실재하지만, 가장 적합한 일상 사용에는 사소한 문제다.",
  "pt-BR": "Para a maioria das pessoas com deslocamento diário ou estilo de vida de escritório que querem um protetor solar que realmente usarão todos os dias, sobretudo pele sensível ou reativa: CeraVe Hydrating Mineral Sunscreen SPF 50. A fórmula 100 % mineral é sem fragrância e acrescenta ceramidas e ácido hialurônico, fica em camadas sob a maquiagem, e o FPS50 de amplo espectro cobre o padrão de proteção que qualquer dermatologista recomendaria. O leve véu branco e a resistência à água limitada são reais, mas menores para o uso diário ao qual melhor se adapta.",
 },
 "sections[7]/paragraphs[3]": {
  "en": "For anyone wanting a tinted SPF that evens skin tone and can replace foundation on low-effort days: La Roche-Posay Anthelios Tinted Mineral Sunscreen SPF 50. The soft universal tint blurs redness over mineral SPF50 protection. The single universal shade will not match every complexion, and water resistance is limited — for sustained sweat or swimming, reach for Anessa instead. For the daily-wear context it suits, it is genuinely good at what it does.",
  "de": "Für alle, die einen getönten SPF möchten, der den Hautton ausgleicht und an unkomplizierten Tagen die Foundation ersetzen kann: La Roche-Posay Anthelios Getönte Mineralische Sonnencreme LSF 50. Der sanfte Universalton kaschiert Rötungen über mineralischem LSF-50-Schutz. Der einzelne Universalton passt nicht zu jeder Haut, und die Wasserfestigkeit ist begrenzt — für anhaltenden Schweiß oder Schwimmen greifen Sie stattdessen zu Anessa. Für den Alltagseinsatz, für den er gedacht ist, macht er seine Sache wirklich gut.",
  "es": "Para quien quiere un SPF con color que unifique la piel y pueda sustituir al maquillaje en días de poco esfuerzo: La Roche-Posay Anthelios Protector Solar Mineral con Color SPF 50. El tono universal suave difumina rojeces sobre protección mineral SPF50. El único tono universal no encaja en todas las pieles y la resistencia al agua es limitada — para sudor prolongado o nadar, opta mejor por Anessa. Para el uso diario al que se adapta, es genuinamente bueno en lo que hace.",
  "fr": "Pour qui veut un SPF teinté qui unifie le teint et peut remplacer le fond de teint les jours sans : La Roche-Posay Anthelios Crème Solaire Minérale Teintée SPF 50. La teinte universelle douce floute les rougeurs sur une protection minérale SPF50. La teinte universelle unique ne convient pas à toutes les carnations, et la résistance à l'eau est limitée — pour une transpiration soutenue ou la baignade, tournez-vous plutôt vers Anessa. Pour l'usage quotidien auquel elle convient, elle fait vraiment bien son travail.",
  "it": "Per chi vuole un SPF colorato che uniformi l'incarnato e possa sostituire il fondotinta nei giorni più sbrigativi: La Roche-Posay Anthelios Crema Solare Minerale Colorata SPF 50. La tinta universale delicata sfuma i rossori sopra una protezione minerale SPF50. L'unica tinta universale non si adatta a ogni incarnato e la resistenza all'acqua è limitata — per sudore prolungato o nuoto, scegli piuttosto Anessa. Per l'uso quotidiano a cui è adatta, fa davvero bene il suo lavoro.",
  "ja": "肌色を整えてくれて、手軽な日にはファンデの代わりにもなるティント入りSPFを求める人に：ラ ロッシュ ポゼ アンテリオス ティンテッド ミネラル サンスクリーン SPF50。ほんのりとしたユニバーサルティントが、ミネラルSPF50の保護の上で赤みをぼかす。単一のユニバーサルシェードはすべての肌色には合わず、耐水性も限定的——持続的な発汗や水泳にはアネッサを選ぶとよい。適した毎日使いの用途では、その役割を本当によくこなす。",
  "ko": "피부 톤을 고르게 하고 가벼운 날에는 파운데이션을 대신할 수 있는 틴트 SPF를 원하는 사람에게: 라 로슈 포제 안텔리오스 틴티드 미네랄 선크림 SPF 50. 은은한 유니버설 틴트가 미네랄 SPF50 보호 위에서 붉은기를 가린다. 단일 유니버설 색조는 모든 피부 톤에 맞지 않고 내수성도 제한적이다 — 지속적인 땀이나 수영에는 Anessa를 선택하는 것이 낫다. 적합한 일상 사용에서는 제 역할을 정말 잘 해낸다.",
  "pt-BR": "Para quem quer um FPS com cor que uniformize a pele e possa substituir a base em dias mais práticos: La Roche-Posay Anthelios Protetor Solar Mineral com Cor FPS 50. O tom universal suave disfarça vermelhidões sobre proteção mineral FPS50. O único tom universal não combina com todas as peles, e a resistência à água é limitada — para suor prolongado ou natação, prefira o Anessa. Para o uso diário ao qual se adapta, é genuinamente bom no que faz.",
 },
}

# ============ TARGETED substring fixes for passing mentions ============
# locale -> list of (old, new) pairs applied across the whole file (string fields)
SUBS = {
 "en": [
   ("Biore UV Aqua Rich and Anessa Perfect UV feel like water when applied but still pass PA++++ and SPF50+ testing: they use high-performance filter combinations that US formulators cannot legally use in FDA-regulated products.",
    "Anessa Perfect UV feels like water when applied but still passes PA++++ and SPF50+ testing: it uses high-performance filter combinations that US formulators cannot legally use in FDA-regulated products."),
   ("Biore UV Aqua Rich Watery Essence and Anessa Perfect UV both use predominantly chemical filter systems that produce minimal to no white cast on most skin tones — though Anessa's smart-response formula leaves a slight brightening finish that can look slightly cool on very warm undertones.",
    "Anessa Perfect UV uses a predominantly chemical filter system that produces minimal to no white cast on most skin tones — though its smart-response formula leaves a slight brightening finish that can look slightly cool on very warm undertones. CeraVe Hydrating Mineral Sunscreen, being 100% mineral, can leave a slight white cast on deeper skin tones that needs blending."),
   ("Skin Aqua Tone Up in Lavender is designed to leave a visible tint: the lavender pigment is the point for its skin-brightening function, and on deeper skin tones the tint reads as purple-grey rather than the brightening effect intended for lighter East Asian complexions. This is the starkest skin-tone limitation in the comparison and the brand does not address it prominently.",
    "La Roche-Posay Anthelios Tinted Mineral Sunscreen is designed to leave a soft universal tint: it evens skin tone and blurs redness rather than match every complexion exactly, so a single shade will read slightly differently across skin tones. This is the clearest fit limitation in the comparison and is worth a quick swatch test before committing."),
   ("Biore UV Aqua Rich has received some flash photography ghosting reports in international beauty communities despite its low cast in standard conditions.",
    "Mineral formulas like CeraVe Hydrating Mineral Sunscreen can show a faint flashback in photos because zinc oxide and titanium dioxide reflect light, despite a low cast in standard daylight."),
   ("The smart-response formula and genuine water resistance make it appropriate for contexts where Biore UV Aqua Rich falls short.",
    "The smart-response formula and genuine water resistance make it appropriate for contexts where CeraVe Hydrating Mineral Sunscreen falls short."),
   ("and both Biore UV Aqua Rich and EltaMD UV Clear are more suitable for a full skin tone range",
    "and both CeraVe Hydrating Mineral Sunscreen and EltaMD UV Clear are more suitable when you do not want any tint"),
 ],
 "de": [
   ("Deshalb fühlen sich Biore UV Aqua Rich und Anessa Perfect UV wie Wasser an, bestehen aber dennoch PA++++ und SPF50+-Tests: Sie verwenden Hochleistungs-Filterkombinationen, die US-Formulierer in FDA-regulierten Produkten nicht legal einsetzen können.",
    "Deshalb fühlt sich Anessa Perfect UV wie Wasser an, besteht aber dennoch PA++++ und SPF50+-Tests: Es verwendet Hochleistungs-Filterkombinationen, die US-Formulierer in FDA-regulierten Produkten nicht legal einsetzen können."),
   ("Biore UV Aqua Rich Watery Essence und Anessa Perfect UV verwenden vorwiegend chemische Filtersysteme, die auf den meisten Hauttonen minimalen bis keinen Weißschleier erzeugen.",
    "Anessa Perfect UV verwendet ein vorwiegend chemisches Filtersystem, das auf den meisten Hauttonen minimalen bis keinen Weißschleier erzeugt; CeraVe Hydrating Mineral Sunscreen ist zu 100 % mineralisch und kann auf dunkleren Hauttonen einen leichten Weißfilm hinterlassen, der eingearbeitet werden muss."),
   ("Skin Aqua Tone Up in Lavendel ist so konzipiert, dass es einen sichtbaren Töner hinterlässt: Das Lavendelpigment erscheint auf dunklen Hauttonen purpurgrau statt des beabsichtigten Aufhellungseffekts für hellere ostasiatische Teints.",
    "La Roche-Posay Anthelios Getönte Mineralische Sonnencreme ist so konzipiert, dass sie einen sanften Universalton hinterlässt: Sie gleicht den Hautton aus und kaschiert Rötungen, anstatt jede Haut exakt zu treffen, sodass ein einzelner Ton auf verschiedenen Hauttonen leicht unterschiedlich wirkt."),
   ("Biore UV Aqua Rich hat trotz seines geringen Schleiers unter Standardbedingungen in internationalen Beauty-Communitys einige Berichte über Blitzlicht-Ghosting erhalten.",
    "Mineralische Formeln wie CeraVe Hydrating Mineral Sunscreen können auf Fotos einen leichten Rückstrahl zeigen, da Zinkoxid und Titandioxid Licht reflektieren, trotz geringen Schleiers bei normalem Tageslicht."),
   ("Die Smart-Response-Formel und echte Wasserfestigkeit machen es für Kontexte geeignet, in denen Biore UV Aqua Rich nicht ausreicht.",
    "Die Smart-Response-Formel und echte Wasserfestigkeit machen es für Kontexte geeignet, in denen CeraVe Hydrating Mineral Sunscreen nicht ausreicht."),
 ],
 "es": [
   ("La textura de esencia acuosa genuinamente se siente como agua en la aplicación",
    "La textura de esencia acuosa genuinamente se siente como agua en la aplicación"),
 ],
 "fr": [
   ("Deshalb",
    "Deshalb"),
 ],
 "ja": [
   ("これがビオレUV アクア リッチやアネッサ パーフェクトUVが塗布時に水のように感じられながらPA++++とSPF50+試験に合格する理由です：米国フォーミュラーが合法的にFDA規制製品に使用できないハイパフォーマンスフィルターの組み合わせを使用しています。",
    "これがアネッサ パーフェクトUVが塗布時に水のように感じられながらPA++++とSPF50+試験に合格する理由です：米国フォーミュラーが合法的にFDA規制製品に使用できないハイパフォーマンスフィルターの組み合わせを使用しています。"),
   ("その結果、最高の日本のドラッグストア日焼け止めは多くの米国プレミアム価格帯の日焼け止めをテクスチャーで上回り、UVAカバレッジでも上回ることが多い — 日本ブランドのR&D投資が多いからではなく、より広い承認成分パレットにアクセスできるためです。",
    "その結果、こうした日本承認の日焼け止めはテクスチャーで多くの米国プレミアム価格帯の製品を上回り、UVAカバレッジでも上回ることが多い — 日本ブランドのR&D投資が多いからではなく、より広い承認成分パレットにアクセスできるためです。"),
   ("この比較では：ビオレUV アクア リッチ ウォータリーエッセンスとアネッサ パーフェクトUVはどちらも主にケミカルフィルターシステムを使用し、ほとんどの肌色で最小限から白浮きなしを実現しています — ただしアネッサのスマートレスポンス処方は軽い明るさの仕上がりを残すため、とても温かみのある色調では若干クールに見える場合があります。",
    "この比較では：アネッサ パーフェクトUVは主にケミカルフィルターシステムを使用し、ほとんどの肌色で最小限から白浮きなしを実現しています — ただしスマートレスポンス処方は軽い明るさの仕上がりを残すため、とても温かみのある色調では若干クールに見える場合があります。一方セラヴィ ハイドレーティング ミネラル サンスクリーンは100%ミネラルのため、濃い肌色ではなじませる必要のあるわずかな白浮きが出ることがあります。"),
   ("スキンアクア トーンアップ ラベンダーは可視的なティントが残るよう設計されています：ラベンダー顔料は肌の明るさ補正機能のための設計であり、深い肌色ではティントが意図する明るさ効果の代わりに紫がかったグレーに見えます。これは比較の中で最も明確な肌色別の制限であり、ブランドはこれを目立つ形で伝えていません。",
    "ラ ロッシュ ポゼ アンテリオス ティンテッド ミネラル サンスクリーンは、ほんのりとしたユニバーサルティントが残るよう設計されています：すべての肌色に完全に一致させるのではなく、肌色を整え赤みをぼかすため、単一シェードは肌色によって見え方が少し変わります。これは比較の中で最も明確なフィット上の注意点で、購入前にスウォッチで確認するとよいでしょう。"),
   ("ビオレUV アクア リッチは通常条件での低い白浮きにもかかわらず、国際ビューティーコミュニティで軽度のフラッシュ写真ゴースティング報告があります。",
    "セラヴィ ハイドレーティング ミネラル サンスクリーンのようなミネラル処方は、通常の日中の低い白浮きにもかかわらず、酸化亜鉛と酸化チタンが光を反射するため写真でわずかなフラッシュバックが出ることがあります。"),
   ("この行動変容は、屋外スポーツの耐水性が関係ない室内毎日使いに適したビオレUV アクア リッチやスキンアクア トーンアップのような軽量でよれないメイク対応処方の主要な成長ドライバーです。",
    "この行動変容は、屋外スポーツの耐水性が関係ない室内毎日使いに適したセラヴィ ハイドレーティング ミネラル サンスクリーンやラ ロッシュ ポゼ アンテリオス ティンテッド ミネラルのような軽量でメイク対応の処方の主要な成長ドライバーです。"),
   ("深い肌色（フィッツパトリックIV〜VI）に白浮きが生じ、同条件ではビオレUV アクア リッチやラロッシュポゼ アンテリオスより目立つ",
    "深い肌色（フィッツパトリックIV〜VI）に白浮きが生じ、同条件ではセラヴィ ハイドレーティング ミネラルやラ ロッシュ ポゼ アンテリオスより目立つ"),
   ("同等の毎日の使用量でビオレUV アクア リッチより使用あたりコストが3〜4倍",
    "同等の毎日の使用量でセラヴィ ハイドレーティング ミネラルより使用あたりコストが高い"),
   ("スマートレスポンス処方と本物の耐水性が、ビオレUV アクア リッチが不十分な状況に適したものにします。",
    "スマートレスポンス処方と本物の耐水性が、セラヴィ ハイドレーティング ミネラルが不十分な状況に適したものにします。"),
   ("最大防護が優先事項であれば、アネッサまたはビオレが技術的に上回ります。",
    "最大防護が優先事項であれば、アネッサが技術的に上回ります。"),
   ("ビオレUV アクア リッチとEltaMD UV Clearどちらも全肌色範囲でより適しています。適した肌色のために、行うことを本当に得意としています。",
    "セラヴィ ハイドレーティング ミネラルとEltaMD UV Clearどちらもティントを望まない場合により適しています。適した毎日使いの用途では、その役割を本当によくこなします。"),
   ("アネッサのスクイーズチューブ形式とビオレのチューブパッケージはジャーやポンプ形式より酸化に強い",
    "アネッサのスクイーズチューブ形式とCeraVeのチューブパッケージはジャーやポンプ形式より酸化に強い"),
 ],
 "ko": [
   ("이 행동 변화는 야외 스포츠 내수성이 관계없는 실내 일상 사용에 적합한 Biore UV Aqua Rich나 Skin Aqua Tone Up 같은 가볍고 뭉치지 않는 메이크업 호환 포뮬러의 주요 성장 동력입니다.",
    "이 행동 변화는 야외 스포츠 내수성이 관계없는 실내 일상 사용에 적합한 세라비 하이드레이팅 미네랄이나 라 로슈 포제 안텔리오스 틴티드 미네랄 같은 가볍고 메이크업 호환 포뮬러의 주요 성장 동력입니다."),
 ],
 "it": [
   ("placeholder-no-op","placeholder-no-op"),
 ],
 "pt-BR": [
   ("placeholder-no-op","placeholder-no-op"),
 ],
}

def apply_subs(obj, pairs):
    if isinstance(obj, dict):
        return {k: apply_subs(v, pairs) for k,v in obj.items()}
    if isinstance(obj, list):
        return [apply_subs(v, pairs) for v in obj]
    if isinstance(obj, str):
        s=obj
        for a,b in pairs:
            s=s.replace(a,b)
        return s
    return obj

for loc in LOCALES:
    fp=os.path.join(DIR, loc+".json")
    d=json.load(open(fp, encoding="utf-8"))
    # full replacements
    for path, perloc in FULL.items():
        if loc in perloc:
            try:
                setp(d, path, perloc[loc])
            except Exception as e:
                print("WARN set", loc, path, e)
    # substring fixes
    if loc in SUBS:
        d=apply_subs(d, SUBS[loc])
    json.dump(d, open(fp,"w",encoding="utf-8"), ensure_ascii=False, indent=2)
    print("prose written:", loc)
