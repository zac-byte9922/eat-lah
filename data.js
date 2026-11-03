/* Demo catalog. Prices and nutrition values are illustrative estimates, not verified retail offers. */
window.EATLAH_DATA = (() => {
  const ingredients = {
    rice:{zh:'大米',en:'Rice',unit:'g',kcal:3.6,storage:'dry',aisle:'Rice & Grains'},
    ricepack:{zh:'即食米饭',en:'Microwave rice',unit:'包',kcal:250,storage:'dry',aisle:'Ready Meals'},
    noodles:{zh:'干面条',en:'Dried noodles',unit:'g',kcal:3.5,storage:'dry',allergens:['gluten'],aisle:'Noodles'},
    instant:{zh:'方便面',en:'Instant noodles',unit:'包',kcal:420,storage:'dry',allergens:['gluten'],aisle:'Instant Food'},
    dumplings:{zh:'速冻水饺',en:'Frozen dumplings',unit:'个',kcal:50,storage:'frozen',allergens:['gluten','soy'],aisle:'Frozen Food'},
    pie:{zh:'速冻馅饼',en:'Frozen stuffed pancakes',unit:'个',kcal:230,storage:'frozen',allergens:['gluten'],aisle:'Frozen Food'},
    bread:{zh:'吐司',en:'Sliced bread',unit:'片',kcal:85,storage:'dry',allergens:['gluten'],aisle:'Bakery'},
    egg:{zh:'鸡蛋',en:'Eggs',unit:'个',kcal:72,storage:'chilled',allergens:['egg'],aisle:'Eggs'},
    tomato:{zh:'番茄',en:'Tomatoes',unit:'g',kcal:.18,storage:'chilled',aisle:'Vegetables'},
    greens:{zh:'青菜',en:'Leafy greens',unit:'g',kcal:.25,storage:'chilled',aisle:'Vegetables'},
    tofu:{zh:'豆腐',en:'Tofu',unit:'g',kcal:.8,storage:'chilled',allergens:['soy'],aisle:'Tofu & Soy'},
    mushroom:{zh:'蘑菇',en:'Mushrooms',unit:'g',kcal:.22,storage:'chilled',aisle:'Vegetables'},
    broccoli:{zh:'西兰花',en:'Broccoli',unit:'g',kcal:.34,storage:'chilled',aisle:'Vegetables'},
    chicken:{zh:'鸡胸肉',en:'Chicken breast',unit:'g',kcal:1.25,storage:'chilled',aisle:'Meat'},
    nuggets:{zh:'冷冻鸡块',en:'Frozen chicken nuggets',unit:'g',kcal:2.4,storage:'frozen',allergens:['gluten'],aisle:'Frozen Food'},
    fries:{zh:'冷冻薯条',en:'Frozen french fries',unit:'g',kcal:1.6,storage:'frozen',aisle:'Frozen Food'},
    banana:{zh:'香蕉',en:'Bananas',unit:'根',kcal:105,storage:'dry',aisle:'Fruit'},
    oil:{zh:'食用油',en:'Cooking oil',unit:'瓶',kcal:0,storage:'dry',pantry:true,aisle:'Oil & Condiments'},
    salt:{zh:'盐',en:'Salt',unit:'袋',kcal:0,storage:'dry',pantry:true,aisle:'Oil & Condiments'},
    soySauce:{zh:'酱油',en:'Soy sauce',unit:'瓶',kcal:0,storage:'dry',pantry:true,allergens:['soy','gluten'],aisle:'Oil & Condiments'},
    vinegar:{zh:'醋',en:'Vinegar',unit:'瓶',kcal:0,storage:'dry',pantry:true,aisle:'Oil & Condiments'},
    pepper:{zh:'胡椒粉',en:'Ground pepper',unit:'瓶',kcal:0,storage:'dry',pantry:true,aisle:'Oil & Condiments'}
  };
  const catalog = {
    rice:{pack:1000,label:'1kg 袋装 / 1kg bag',price:3.2},ricepack:{pack:1,label:'1包 / 1 pack',price:2.5},
    noodles:{pack:500,label:'500g 袋装 / 500g bag',price:2.8},instant:{pack:5,label:'5包 / 5-pack',price:4.5},
    dumplings:{pack:30,label:'30个装 / 30 pieces',price:9.9},pie:{pack:4,label:'4个装 / 4 pieces',price:7.2},
    bread:{pack:12,label:'12片 / 12 slices',price:2.6},egg:{pack:30,label:'30粒装 / 30 eggs',price:7.2},
    tomato:{pack:500,label:'500g 包装 / 500g pack',price:3.0},greens:{pack:200,label:'200g 包装 / 200g pack',price:2.0},
    tofu:{pack:300,label:'300g 包装 / 300g pack',price:1.7},mushroom:{pack:200,label:'200g 包装 / 200g pack',price:2.5},
    broccoli:{pack:300,label:'300g 包装 / 300g pack',price:3.2},chicken:{pack:400,label:'400g 包装 / 400g pack',price:5.6},
    nuggets:{pack:1000,label:'1kg 袋装 / 1kg bag',price:10.0},fries:{pack:1000,label:'1kg 袋装 / 1kg bag',price:6.5},
    banana:{pack:5,label:'5根 / 5 pcs',price:3.0},oil:{pack:1,label:'1瓶 / 1 bottle',price:4.5},
    salt:{pack:1,label:'1袋 / 1 bag',price:1.5},soySauce:{pack:1,label:'1瓶 / 1 bottle',price:2.8},
    vinegar:{pack:1,label:'1瓶 / 1 bottle',price:2.7},pepper:{pack:1,label:'1瓶 / 1 bottle',price:2.5}
  };
  const entries = {
    rice:{type:'base',zh:'一碗热米饭',en:'Simple rice',emoji:'🍚',minutes:25,effort:2,tier:'cook',tools:['rice-cooker','electric-pot','stove','induction'],ingredients:{rice:90},instructions:['淘洗大米，按电饭煲或锅具说明加入水。','用适合设备的程序将米饭煮熟，不要离开不安全的加热设备。','焖几分钟，盛出即可。'],tip:'用电煮锅煮饭前先确认说明书允许煮饭。'},
    noodles:{type:'base',zh:'清汤面',en:'Simple noodle soup',emoji:'🍜',minutes:12,effort:1,tier:'cook',tools:['electric-pot','stove','induction'],ingredients:{noodles:100,greens:60,salt:1},instructions:['锅内加入足量水，煮至沸腾。','放入面条，按照包装标示的时间煮熟。','最后加入青菜，充分煮熟后调味。'],tip:'有些干面条需要更长时间，按包装说明操作。'},
    porridge:{type:'base',zh:'暖胃米粥',en:'Rice porridge',emoji:'🥣',minutes:30,effort:1,tier:'cook',tools:['electric-pot','rice-cooker','stove','induction'],ingredients:{rice:70},instructions:['洗净大米，按设备说明加入足量水。','选择煮粥程序或小火煮至软烂，过程中注意防溢锅。','盛出后放凉到适口温度。']},
    instant:{type:'base',zh:'热乎乎的泡面',en:'Instant noodles',emoji:'🍲',minutes:6,effort:0,tier:'easy',tools:['electric-pot','stove','induction'],ingredients:{instant:1},instructions:['根据包装说明烧开适量水。','加入面饼和调料包，按包装规定时间煮熟。','小心烫伤，盛出即可。'],tip:'如果是杯面，不要将非微波炉安全容器直接放进微波炉。'},
    dumplings:{type:'base',zh:'速冻水饺',en:'Frozen dumplings',emoji:'🥟',minutes:12,effort:0,tier:'easy',tools:['electric-pot','stove','induction'],ingredients:{dumplings:8},instructions:['无需提前解冻（以产品包装说明为准）。','将水煮沸，加入水饺，按包装规定的方法和时间充分煮熟。','确保馅料中心彻底熟透后食用。'],tip:'不要只靠水饺浮起判断熟透，遵守包装说明。'},
    pie:{type:'base',zh:'空气炸锅馅饼',en:'Air-fryer stuffed pancakes',emoji:'🫓',minutes:12,effort:0,tier:'easy',tools:['air-fryer'],ingredients:{pie:2},instructions:['查看产品包装是否明确允许空气炸锅烹饪。','按包装给出的温度与时间设置空气炸锅。','确认中心充分加热后食用。'],tip:'温度和时间由产品包装决定。'},
    ricepack:{type:'base',zh:'微波炉即食米饭',en:'Microwave rice',emoji:'🍱',minutes:3,effort:0,tier:'easy',tools:['microwave'],ingredients:{ricepack:1},instructions:['检查包装是否标明可微波加热。','按包装步骤撕开或开启指定排气口。','按包装指定功率和时间加热，小心热蒸汽。']},
    toast:{type:'base',zh:'简单吐司',en:'Simple toast',emoji:'🍞',minutes:2,effort:0,tier:'easy',tools:[],ingredients:{bread:2},instructions:['取出吐司，搭配已有的食品食用。','如果需要加热，必须使用适合的安全设备。']},
    tomatoegg:{type:'dish',zh:'番茄蛋花汤',en:'Tomato & egg soup',emoji:'🍅',minutes:15,effort:1,tools:['electric-pot','stove','induction'],ingredients:{tomato:150,egg:1,salt:1},instructions:['番茄洗净切小块。','锅中加水煮沸，加入番茄煮软。','鸡蛋打散后缓缓倒入滚水中，充分煮熟后调味。'],tip:'生鸡蛋接触的器具要清洗。'},
    greensoup:{type:'dish',zh:'清爽青菜汤',en:'Leafy green soup',emoji:'🥬',minutes:8,effort:1,tools:['electric-pot','stove','induction'],ingredients:{greens:120,salt:1},instructions:['青菜彻底洗净。','锅中烧开水，加入青菜。','煮熟后按口味调味。']},
    tofusoup:{type:'dish',zh:'蘑菇豆腐汤',en:'Mushroom tofu soup',emoji:'🍄',minutes:15,effort:1,tools:['electric-pot','stove','induction'],ingredients:{tofu:150,mushroom:100,salt:1},instructions:['蘑菇洗净切片，豆腐切块。','锅中水煮沸后加入蘑菇，再加入豆腐。','充分加热后少量调味即可。']},
    tomatostir:{type:'dish',zh:'番茄炒蛋',en:'Tomato & eggs',emoji:'🍳',minutes:15,effort:2,tools:['stove','induction'],ingredients:{tomato:180,egg:2,oil:1,salt:1},instructions:['番茄切块，鸡蛋打散。','使用适合炒菜的平底锅，先把鸡蛋炒至熟透并盛出。','番茄炒软后加入鸡蛋，翻炒均匀。'],tip:'油和热锅注意防烫。'},
    chickenair:{type:'dish',zh:'空气炸锅鸡胸肉',en:'Air-fryer chicken breast',emoji:'🍗',minutes:25,effort:2,tools:['air-fryer'],ingredients:{chicken:150,broccoli:120,oil:1,salt:1},instructions:['鸡肉与即食蔬菜分开处理，避免交叉污染。','鸡胸肉按设备和厚度要求加热，直到中心温度至少达到 75°C。','西兰花单独按适合时间加热，确保充分熟透。'],tip:'鸡肉需要温度计核实熟度，不能只看表面颜色。'},
    eggboiled:{type:'dish',zh:'水煮鸡蛋',en:'Boiled egg',emoji:'🥚',minutes:10,effort:1,tools:['electric-pot','stove','induction'],ingredients:{egg:1},instructions:['锅中加适量水，轻放鸡蛋。','按偏好的全熟程度煮熟。','出锅降温后剥壳。']},
    nuggets:{type:'snack',zh:'空气炸锅鸡块',en:'Air-fryer nuggets',emoji:'🍗',minutes:12,effort:0,tools:['air-fryer'],ingredients:{nuggets:150},instructions:['确认产品包装允许空气炸锅烹饪。','按包装指定温度和时间加热。','确保中心充分加热，食用前小心烫。']},
    fries:{type:'snack',zh:'空气炸锅薯条',en:'Air-fryer fries',emoji:'🍟',minutes:15,effort:0,tools:['air-fryer'],ingredients:{fries:120},instructions:['薯条均匀铺在炸篮，不要堆得过满。','按照产品包装建议设置时间温度。','检查熟度，小心高温。']},
    banana:{type:'snack',zh:'来根香蕉',en:'A banana',emoji:'🍌',minutes:1,effort:0,tools:[],ingredients:{banana:1},instructions:['冲洗外皮、去皮后即可食用。']}
  };
  const tools=[{id:'electric-pot',name:'电煮锅',en:'Electric pot',icon:'♨'},{id:'microwave',name:'微波炉',en:'Microwave',icon:'▣'},{id:'air-fryer',name:'空气炸锅',en:'Air fryer',icon:'◈'},{id:'rice-cooker',name:'电饭煲',en:'Rice cooker',icon:'▤'},{id:'stove',name:'普通炉灶',en:'Stove',icon:'♧'},{id:'induction',name:'电磁炉',en:'Induction',icon:'◉'}];
  const allergens=[{id:'egg',name:'鸡蛋',en:'Egg'},{id:'soy',name:'大豆',en:'Soy'},{id:'gluten',name:'麸质',en:'Gluten'},{id:'dairy',name:'乳制品',en:'Dairy'},{id:'peanut',name:'花生',en:'Peanut'},{id:'seafood',name:'海鲜',en:'Seafood'}];
  return {ingredients,catalog,entries,tools,allergens,seasonings:['oil','salt','soySauce','vinegar','pepper']};
})();
