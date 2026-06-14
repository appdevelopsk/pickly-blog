import json, re, sys

DIR = 'site/src/articles/best-electric-shaver-2026/messages/'

def set_path(d, p, val):
    toks = re.findall(r'/([^/\[]+)(?:\[(\d+)\])?', p)
    cur = d
    for i,(key,idx) in enumerate(toks):
        last = (i == len(toks)-1)
        if idx != '':
            if last:
                cur[key][int(idx)] = val
            else:
                cur = cur[key][int(idx)]
        else:
            if last:
                cur[key] = val
            else:
                cur = cur[key]

def apply(locale, mapping):
    f = DIR + locale + '.json'
    d = json.load(open(f, encoding='utf-8'))
    for p, val in mapping.items():
        set_path(d, p, val)
    json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    json.load(open(f, encoding='utf-8'))  # validate
    print('OK', locale, len(mapping), 'paths')
