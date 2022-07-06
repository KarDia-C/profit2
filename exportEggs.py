import json

nums = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

def loadjson(fn):
    with open(fn, 'r', encoding='utf-8') as f: return json.load(f)

monster_info = loadjson('monster_info.json')['datas']
gacha_machine = loadjson('gacha_machine.json')['datas']

result = {
    'maps': {},
    'eggs': {},
}

monlist = set()

def parseEggs(lst):
    global monlist
    cnt = {}
    for mon in lst:
        monlist.add(mon)
        if not mon in cnt: cnt[mon] = 0
        cnt[mon] += 1
    cnt[lst[0]] -= .5
    cnt[lst[-1]] -= .5
    return cnt

for gacha in gacha_machine:
    if gacha['id'][:7] == 'sc_city':
        result['maps'][gacha['id'][7:]] = {
            'name': nums[int(gacha['id'][7:])] + '图' + ' ' + gacha['name'][:-2],
            'price': gacha['money'],
            'weight': dict((key, parseEggs(gacha['eggs'][key])) for key in gacha['eggs'].keys()), # gacha['eggs'].keys() == ['1', '2', '3']
        }

for mid in monlist:
    mon = monster_info[str(mid)]
    result['eggs'][mid] = {
        'name': mon['name'],
        'star': mon['star'],
        'money': mon['sell_money'],
        'exp': mon['sell_exp'],
        'time': mon['time_1'] + mon['time_2'],
    }

with open('eggs.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, separators=(',', ':'))
